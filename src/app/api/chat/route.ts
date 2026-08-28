import { GoogleGenAI, ApiError } from "@google/genai";
import { buildSystemPrompt } from "@/lib/assistant-prompt";
import type { Lang } from "@/content/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Gemini. Claude'un aksine ücretsiz katmanı var: kredi kartı ya da bakiye
 * gerekmiyor, sadece dakika/gün başına bir istek sınırı var.
 * İstersen .env üzerinden başka bir modele geçebilirsin.
 */
const MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

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
 * Gemini hatalarını ziyaretçiye gösterilebilir bir cümleye çevirir.
 *
 * Ziyaretçiye teknik detay ya da hesap bilgisi sızdırmıyoruz; ama sunucu
 * günlüğüne sebebi net yazıyoruz ki siteyi kuran kişi ne yapacağını bilsin.
 */
function describeError(err: unknown): {
  log: string;
  message: Record<Lang, string>;
} {
  const status = err instanceof ApiError ? err.status : undefined;
  const text = err instanceof Error ? err.message : String(err);

  if (status === 429 || /quota|resource_exhausted/i.test(text)) {
    return {
      log: "KOTA DOLDU: Gemini ücretsiz katmanının dakika/gün sınırına takıldı.",
      message: {
        tr: "Şu an çok yoğunum. Bir dakika sonra tekrar dener misin?",
        en: "Things are busy right now. Mind trying again in a minute?",
      },
    };
  }

  if (status === 400 || status === 403 || /api key not valid|api_key_invalid/i.test(text)) {
    return {
      log: "ANAHTAR GEÇERSİZ: .env.local içindeki GEMINI_API_KEY'i kontrol edin (aistudio.google.com/apikey).",
      message: {
        tr: "Asistan şu anda kullanılamıyor. Sorunu doğrudan e-postayla iletebilirsin.",
        en: "The assistant is unavailable right now. Feel free to email him directly.",
      },
    };
  }

  if (status && status >= 500) {
    return {
      log: `SUNUCU HATASI (${status}): Gemini tarafında geçici sorun.`,
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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error: "missing_key",
        message:
          "Asistan yapılandırılmamış. .env.local dosyasına GEMINI_API_KEY ekle.",
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

  // Sohbet penceresinde bekleyen biri var: varsayılan zaman aşımı burada
  // anlamsız. 45 saniyede cevap gelmediyse hata göstermek daha dürüst.
  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 45_000 } });

  // Gemini "user" / "model" rolü kullanıyor; istemciden gelen "assistant"ı
  // buna çeviriyoruz. Sistem promptu ayrı bir alanda (config.systemInstruction),
  // konuşma geçmişine karışmıyor.
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const result = await ai.models.generateContentStream({
          model: MODEL,
          contents,
          config: {
            systemInstruction: buildSystemPrompt(lang),
          },
        });

        let sawText = false;
        let finishReason: string | undefined;

        for await (const chunk of result) {
          if (chunk.text) {
            sawText = true;
            controller.enqueue(encoder.encode(chunk.text));
          }
          finishReason = chunk.candidates?.[0]?.finishReason ?? finishReason;
        }

        // Güvenlik filtresi ya da benzeri bir sebeple tek karakter bile
        // gelmediyse ziyaretçiyi sessizlikte bırakmayalım.
        if (!sawText && finishReason && finishReason !== "STOP") {
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
        // önemli: "kota doldu" ile "internet gitti" farklı şeyler ve ikisine
        // de "bağlantı koptu" demek kimseye yardımcı olmuyor.
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
