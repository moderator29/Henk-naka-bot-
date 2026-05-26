/**
 * Renders light-markdown legal content: lines beginning with "## " become
 * headings; blank lines separate paragraphs. Plain text only (no HTML), so an
 * admin-edited document can't inject markup.
 */
export function LegalContent({ content }: { content: string }) {
  const blocks: { type: "h2" | "p"; text: string }[] = [];
  let para: string[] = [];

  const flush = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };

  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
    } else if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "h2", text: line.slice(3) });
    } else {
      para.push(line);
    }
  }
  flush();

  return (
    <>
      {blocks.map((b, i) =>
        b.type === "h2" ? (
          <h2 key={i}>{b.text}</h2>
        ) : (
          <p key={i}>{b.text}</p>
        )
      )}
    </>
  );
}
