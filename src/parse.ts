// code from https://github.com/SharzyL/pastebin-worker
const contentDispositionPrefix: string = "Content-Disposition: form-data";

interface Part {
  fields: { [key: string]: string };
  content: Uint8Array | null;
}

export function parseFormdata(
  Uint8Array: Uint8Array,
  boundary: string
): Map<string, Part> {
  boundary = "--" + boundary;

  function readLine(idx: number): number {
    for (let i = idx; i < Uint8Array.length - 1; i++) {
      if (Uint8Array[i] === 0x0d) {
        i++;
        if (Uint8Array[i] === 0x0a) {
          return i - 1;
        }
      }
    }
    return Uint8Array.length;
  }

  function parseFields(line: Uint8Array): { [key: string]: string } {
    let fields: { [key: string]: string } = {};
    for (const match of decoder.decode(line).matchAll(/\b(\w+)="(.+?)"/g)) {
      fields[match[1]] = match[2];
    }
    return fields;
  }

  function isContentDisposition(line: Uint8Array): boolean {
    for (let i = 0; i < contentDispositionPrefix.length; i++) {
      if (line[i] !== contentDispositionPrefix.charCodeAt(i)) return false;
    }
    return true;
  }

  function getLineType(line: Uint8Array): number {
    if (line.length === 0) return 0;
    if (line.length === boundary.length) {
      for (let i = 0; i < boundary.length; i++) {
        if (line[i] !== boundary.charCodeAt(i)) return 0;
      }
      return 1;
    } else if (line.length === boundary.length + 2) {
      for (let i = 0; i < boundary.length; i++) {
        if (line[i] !== boundary.charCodeAt(i)) return 0;
      }
      if (
        line[boundary.length] === 0x2d &&
        line[boundary.length + 1] === 0x2d
      ) {
        return 2;
      }
    }
    return 0;
  }

  let decoder: TextDecoder = new TextDecoder();

  let status: number = 0;
  let parts: Map<string, Part> = new Map();
  let lineStart: number = readLine(0) + 2;
  if (isNaN(lineStart)) return parts;
  let bodyStartIdx: number = 0;
  let currentPart: Part = { fields: {}, content: null };

  while (true) {
    const lineEnd: number = readLine(lineStart);
    const line: Uint8Array = Uint8Array.subarray(lineStart, lineEnd);

    if (status === 0) {
      if (line.length === 0) {
        status = 1;
        bodyStartIdx = lineEnd + 2;
      } else if (isContentDisposition(line)) {
        currentPart.fields = parseFields(line);
      }
    } else {
      const lineType: number = getLineType(line);
      if (lineType !== 0) {
        currentPart.content = Uint8Array.subarray(bodyStartIdx, lineStart - 2);
        parts.set(currentPart.fields.name, currentPart);
        currentPart = { fields: {}, content: null };
        status = 0;
      }
      if (lineType === 2 || lineEnd === Uint8Array.length) break;
    }
    lineStart = lineEnd + 2;
  }

  return parts;
}

export function getBoundary(contentType: string): string {
  return contentType.split("=")[1];
}
