import { NextRequest } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM = `You are the StealthConnect AI support assistant — friendly, concise, and precise.

ONLY answer questions about these topics:
• Pricing: Email contacts $0.20 each · Phone numbers $1.00 each · Email+Phone $1.20 each · AI Email Draft add-on +$1.00/profile
• Credits: New users get 1 free credit. Credits never expire. Buy more via PayPal.
• How it works: User pastes LinkedIn profile URLs → our team manually researches and delivers verified contact info within 30 minutes.
• Order process: Submit URL(s) → choose contact type → optional AI draft add-on → pay via PayPal or use free credit → receive results.
• Delivery time: 30 minutes guaranteed during business hours. Off-hours may take until next morning.
• Supported inputs: Single LinkedIn URL, bulk paste (one per line), or CSV file upload.
• Refunds: If we can't find contact info for a profile, that credit/payment is refunded.
• Data: We do not store LinkedIn URLs beyond order fulfillment. All contact data is delivered privately.
• AI Email Draft: We write a personalised cold outreach email for each profile using the contact's LinkedIn info.

RULES:
- Be helpful and warm but brief — 1–3 sentences max per reply.
- If asked something outside these topics, say: "I can only help with questions about StealthConnect AI. For anything else, email navneetprasad1709@gmail.com"
- Never make up pricing, features, or policies not listed above.
- Use plain language, no markdown formatting in responses.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json() as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: "No messages" }), { status: 400 });
    }

    // Streaming response
    const stream = await client.chat.completions.create({
      model:       "llama-3.1-8b-instant",
      max_tokens:  512,
      stream:      true,
      messages:    [
        { role: "system", content: SYSTEM },
        ...messages,
      ],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type":  "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("Chatbot error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500 }
    );
  }
}
