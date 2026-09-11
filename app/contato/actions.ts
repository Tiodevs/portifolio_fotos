"use server";

import { revalidatePath } from "next/cache";
import { EVENT_TYPES, SHIFTS, createContactInquiry } from "@/lib/contacts";
import { digitsOnly, formatPhone } from "@/lib/utils";
import type { ContactFormState } from "@/app/contato/form-state";

function isEventType(value: string): boolean {
  return (EVENT_TYPES as readonly string[]).includes(value);
}

function isShift(value: string): boolean {
  return (SHIFTS as readonly string[]).includes(value);
}

function parseEventDate(value: string): string | { error: string } {
  if (!value) return { error: "Informe a data do evento." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { error: "Data do evento inválida." };
  }
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return { error: "Data do evento inválida." };

  const limit = new Date();
  limit.setHours(0, 0, 0, 0);
  limit.setDate(limit.getDate() - 1);
  if (date < limit) return { error: "A data do evento precisa ser a partir de hoje." };
  return value;
}

export async function submitContactInquiry(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const honeypot = String(formData.get("company") || "").trim();
  if (honeypot) {
    return {
      ok: true,
      message: "Pedido enviado. Em breve entro em contato.",
      sentAt: Date.now(),
    };
  }

  const name = String(formData.get("name") || "").trim();
  const eventType = String(formData.get("event_type") || "").trim();
  const eventTypeOther = String(formData.get("event_type_other") || "").trim();
  const shift = String(formData.get("shift") || "").trim();
  const phoneRaw = String(formData.get("phone") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const eventDateResult = parseEventDate(String(formData.get("event_date") || "").trim());

  if (name.length < 2 || name.length > 80) {
    return { ok: false, message: "Informe seu nome completo." };
  }
  if (!isEventType(eventType)) {
    return { ok: false, message: "Escolha o tipo de evento." };
  }
  const resolvedEventType =
    eventType === "Outro" && eventTypeOther
      ? `Outro: ${eventTypeOther.slice(0, 80)}`
      : eventType;
  if (eventType === "Outro" && eventTypeOther.length < 2) {
    return { ok: false, message: "Descreva o tipo de evento." };
  }
  if (typeof eventDateResult !== "string") {
    return { ok: false, message: eventDateResult.error };
  }
  if (!isShift(shift)) {
    return { ok: false, message: "Escolha o turno do evento." };
  }

  const phoneDigits = digitsOnly(phoneRaw);
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    return { ok: false, message: "Informe um telefone com DDD." };
  }
  if (notes.length > 1000) {
    return { ok: false, message: "A mensagem está longa demais." };
  }

  const result = await createContactInquiry({
    name,
    event_type: resolvedEventType,
    event_date: eventDateResult,
    shift,
    phone: formatPhone(phoneDigits),
    notes: notes || null,
  });

  if (result.error || !result.id) {
    return {
      ok: false,
      message: result.error || "Não foi possível enviar. Tente de novo.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/contatos");

  return {
    ok: true,
    message: "Pedido enviado. Em breve eu falo com você.",
    sentAt: Date.now(),
  };
}
