/** Client-safe CSV helpers (no server imports). */

export function toCsv<T extends object>(
  rows: T[],
  columns: (keyof T)[]
): string {
  const header = columns.map((c) => escapeCell(String(c))).join(",");
  const body = rows
    .map((row) =>
      columns
        .map((c) => escapeCell(formatCell((row as Record<string, unknown>)[c as string])))
        .join(",")
    )
    .join("\n");
  return `${header}\n${body}`;
}

function formatCell(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join("|");
  return String(value);
}

function escapeCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** Trigger a browser download of a CSV string. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Minimal CSV parser for the import flow (handles quoted cells). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}
