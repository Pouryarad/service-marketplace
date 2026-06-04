export async function uploadFileDirect(
  file: File,
  bucket: string,
  userId: string,
  prefix: string
): Promise<string | null> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const res = await fetch("/api/storage/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket, path }),
  });

  if (!res.ok) return null;

  const { signedUrl, token, publicUrl } = await res.json();

  const upload = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!upload.ok) return null;

  return publicUrl;
}