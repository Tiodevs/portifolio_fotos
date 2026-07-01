export type Compressed = { blob: Blob; width: number; height: number };

const MAX_DIMENSION = 2560;
const QUALITY = 0.92;

export async function compressImage(file: File): Promise<Compressed> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  let width = bitmap.width;
  let height = bitmap.height;
  const largest = Math.max(width, height);
  if (largest > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / largest;
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Canvas nao disponivel.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", QUALITY)
  );
  if (!blob) throw new Error("Falha ao comprimir a imagem.");
  return { blob, width, height };
}
