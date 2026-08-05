import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/assistant-prompt";
import type { Lang } from "@/content/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** İstersen .env üzerinden başka bir modele geçebilirsin (örn. claude-sonnet-5). */
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";

const MAX_MESSAGES = 24;
const MAX_CHARS = 1200;

/* --------------------------------------------------------------------------
   Basit hız sınırı: tek sunucu örneği için yeterli.
   Birden fazla örnek/edge dağıtımında Upstash gibi harici bir sayaç kullan.
   -------------------------------------------------------------------------- */
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Sızıntıyı önlemek için ara sıra eski kayıtları temizle
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_REQUESTS;
}

type ClientMessage = { role: "user" | "assistant"; content: string };

/**
 * Anthropic hatalarını ziyaretçiye gösterilebilir bir cümleye çevirir.
 *
 * Ziyaretçiye teknik detay ya da hesap bilgisi sızdırmıyoruz; ama sunucu
 * günlüğüne sebebi net yazıyoruz ki siteyi kuran kişi ne yapacağını bilsin.
 */
function describeError(err: unknown): {
  log: string;
  message: Record<Lang, string>;
} {
  const status = err instanceof Anthropic.APIError ? err.status : undefined;
  const text = err instanceof Error ? err.message : String(err);

  if (/credit balance is too low/i.test(text)) {
    return {
      log: "KREDİ YETERSİZ: console.anthropic.com > Plans & Billing üzerinden kredi yükleyin.",
      message: {
        tr: "Asistan şu anda kullanılamıyor. Sorunu doğrudan e-postayla iletebilirsin.",
        en: "The assistant is unavailable right now. Feel free to email him directly.",
      },
    };
  }

  if (status === 401 || status === 403) {
    return {
      log: "ANAHTAR GEÇERSİZ: .env.local içindeki ANTHROPIC_API_KEY'i kontrol edin.",
      message: {
        tr: "Asistan şu anda kullanılamıyor. Sorunu doğrudan e-postayla iletebilirsin.",
        en: "The assistant is unavailable right now. Feel free to email him directly.",
      },
    };
  }

  if (status === 429) {
    return {
      log: "HIZ SINIRI: Anthropic tarafında istek sınırına takıldı.",
      message: {
        tr: "Şu an çok yoğunum. Bir dakika sonra tekrar dener misin?",
        en: "Things are busy right now. Mind trying again in a minute?",
      },
    };
  }

  if (status && status >= 500) {
    return {
      log: `SUNUCU HATASI (${status}): Anthropic tarafında geçici sorun.`,
      message: {
        tr: "Geçici bir aksaklık oldu. Birazdan tekrar dener misin?",
        en: "That was a temporary hiccup. Mind trying again shortly?",
      },
    };
  }

  return {
    log: `BEKLENMEYEN HATA${status ? ` (${status})` : ""}: ${text}`,
    message: {
      tr: "Bir şeyler ters gitti. Tekrar dener misin?",
      en: "Something went wrong. Mind trying again?",
    },
  };
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error: "missing_key",
        message:
          "Asistan yapılandırılmamış. .env.local dosyasına ANTHROPIC_API_KEY ekle.",
      },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local";

  if (rateLimited(ip)) {
    return Response.json(
      { error: "rate_limited", message: "Biraz yavaş. Bir dakika sonra tekrar dene." },
      { status: 429 },
    );
  }

  let body: { messages?: ClientMessage[]; lang?: Lang };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const lang: Lang = body.lang === "en" ? "en" : "tr";

  const messages = (body.messages ?? [])
    .filter(
      (m): m is ClientMessage =>
        !!m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (!messages.length || messages[messages.length - 1].role !== "user") {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  // Sohbet penceresinde bekleyen biri var: varsayılan 10 dakikalık zaman aşımı
  // burada anlamsız. 45 saniyede cevap gelmediyse hata göstermek daha dürüst.
  const client = new Anthropic({ apiKey, timeout: 45_000, maxRetries: 1 });

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const run = client.messages.stream({
          model: MODEL,
          max_tokens: 2048,
          system: [
            {
              type: "text",
              text: buildSystemPrompt(lang),
              // Sistem promptu her istekte aynı: önbelleğe alınca
              // hem ucuzluyor hem ilk token daha hızlı geliyor.
              cache_control: { type: "ephemeral" },
            },
          ],
          output_config: { effort: "low" },
          messages,
        });

        for await (const event of run) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }

        const final = await run.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(
              lang === "tr"
                ? "\n\nBu soruya yanıt veremiyorum."
                : "\n\nI can't answer that one.",
            ),
          );
        }
      } catch (err) {
        // Akış başladıktan sonra HTTP durum kodunu değiştiremeyiz, o yüzden
        // hata metin olarak gönderiliyor. Ama hangi hata olduğunu ayırt etmek
        // önemli: "kredi yetersiz" ile "internet gitti" farklı şeyler ve
        // ikisine de "bağlantı koptu" demek kimseye yardımcı olmuyor.
        const reason = describeError(err);
        console.error(`[chat] ${reason.log}`, err);
        controller.enqueue(encoder.encode(`\n\n(${reason.message[lang]})`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
