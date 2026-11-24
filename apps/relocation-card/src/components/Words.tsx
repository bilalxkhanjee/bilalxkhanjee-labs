// Splits a line into word spans for the reveal; the spaces stay as text between them.
export function Words({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          <span data-word className={className}>
            {w}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}
