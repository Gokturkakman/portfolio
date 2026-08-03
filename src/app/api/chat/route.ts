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
   Basit hız sınırı — tek sunucu örneği için yeterli.
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

  const client = new Anthropic({ apiKey });

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
              // Sistem promptu her istekte aynı — önbelleğe alınca
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
        console.error("[chat]", err);
        controller.enqueue(
          encoder.encode(
            lang === "tr"
              ? "\n\n(Bağlantı koptu. Tekrar dener misin?)"
              : "\n\n(The connection dropped. Mind trying again?)",
          ),
        );
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
