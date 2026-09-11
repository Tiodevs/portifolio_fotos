export function formatDate(value: string | Date | null): string {
  if (!value) return "";
  const date = parseDate(value);
  if (!date) return typeof value === "string" ? value : "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function formatFullDate(value: string | Date | null): string {
  if (!value) return "";
  const date = parseDate(value);
  if (!date) return typeof value === "string" ? value : "";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(value: string | Date | null): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return typeof value === "string" ? value : "";
  }
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatPhone(value: string): string {
  const digits = digitsOnly(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function toWhatsAppUrl(phone: string): string | null {
  const digits = digitsOnly(phone);
  if (digits.length < 10) return null;
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

function parseDate(value: string | Date): Date | null {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return new Date(
      value.getUTCFullYear(),
      value.getUTCMonth(),
      value.getUTCDate(),
      12,
      0,
      0,
    );
  }
  const raw = String(value);
  const date = raw.includes("T") ? new Date(raw) : new Date(`${raw}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateInputValue(value: string | Date | null | undefined): string {
  if (!value) return "";
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const date = parseDate(value);
  if (!date) return value.slice(0, 10);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
