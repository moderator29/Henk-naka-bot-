import type Anthropic from "@anthropic-ai/sdk";

/**
 * Wraps an Anthropic streaming message into a Server-Sent Events response the
 * browser can render progressively. Emits `data: <json>` per event and a final
 * `data: [DONE]`. Errors are surfaced as a typed event rather than tearing the
 * stream down silently.
 */
export function streamToSSE(
  stream: ReturnType<Anthropic["messages"]["stream"]>
): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "text", text: event.delta.text })}\n\n`
              )
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: (err as Error).message })}\n\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
