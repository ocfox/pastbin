const imageTypes = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export function isImage(type: string): boolean {
  return imageTypes.includes(type);
}

export function generateKey(length: number): string {
  return Array.from({ length }, () => {
    const base36 = "0123456789abcdefghijklmnopqrstuvwxyz";
    const index = Math.floor(Math.random() * base36.length);
    return base36[index];
  }).join("");
}

export function IsFormData(contentType: string): boolean {
  return contentType.includes("multipart/form-data");
}
