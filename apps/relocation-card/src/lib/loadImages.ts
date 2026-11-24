// Fetches images with byte progress (counted against Content-Length; without one on
// every file, finished files are counted instead), turns each into an object URL and
// decodes it before handing it back.
export async function loadImages(urls: string[], onProgress: (p: number) => void, signal: AbortSignal): Promise<string[]> {
  const responses = await Promise.all(urls.map((u) => fetch(u, { signal })));
  for (const r of responses) if (!r.ok) throw new Error(`Failed to load ${r.url}: ${r.status}`);
  const lengths = responses.map((r) => Number(r.headers.get("Content-Length")) || 0);
  const byBytes = lengths.every((l) => l > 0);
  const total = lengths.reduce((a, b) => a + b, 0);
  const loaded = urls.map(() => 0);
  let done = 0;
  const report = () => onProgress(byBytes ? Math.min(1, loaded.reduce((a, b) => a + b, 0) / total) : done / urls.length);

  const blobs = await Promise.all(
    responses.map(async (res, i) => {
      const reader = res.body!.getReader();
      const chunks: Uint8Array<ArrayBuffer>[] = [];
      for (;;) {
        const { done: end, value } = await reader.read();
        if (end) break;
        chunks.push(value as Uint8Array<ArrayBuffer>);
        loaded[i] += value.length;
        report();
      }
      done++;
      report();
      return new Blob(chunks, { type: res.headers.get("Content-Type") ?? "" });
    }),
  );

  const objectUrls = blobs.map((b) => URL.createObjectURL(b));
  await Promise.all(
    objectUrls.map((u) => {
      const img = new Image();
      img.src = u;
      return img.decode();
    }),
  );
  return objectUrls;
}
