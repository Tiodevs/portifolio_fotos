import { sql } from "@/lib/db";
import type { ContactInquiry } from "@/lib/types";

export { EVENT_TYPES, SHIFTS } from "@/lib/contact-options";
export type { EventType, Shift } from "@/lib/contact-options";

let tableReady = false;

async function ensureTable() {
  if (tableReady) return;
  await sql`
    create table if not exists public.contact_inquiries (
      id uuid primary key default gen_random_uuid(),
      name text not null,
      event_type text not null,
      event_date date,
      shift text not null,
      phone text not null,
      notes text,
      read_at timestamptz,
      created_at timestamptz not null default now()
    )
  `;
  await sql`
    create index if not exists contact_inquiries_created_at_idx
    on public.contact_inquiries (created_at desc)
  `;
  tableReady = true;
}

export async function getContactInquiries(): Promise<ContactInquiry[]> {
  try {
    await ensureTable();
    return await sql<ContactInquiry[]>`
      select * from contact_inquiries
      order by created_at desc
    `;
  } catch (err) {
    console.error("getContactInquiries:", err);
    return [];
  }
}

export async function getContactInquiryCounts(): Promise<{
  total: number;
  unread: number;
}> {
  try {
    await ensureTable();
    const rows = await sql<{ total: number; unread: number }[]>`
      select
        count(*)::int as total,
        count(*) filter (where read_at is null)::int as unread
      from contact_inquiries
    `;
    return rows[0] ?? { total: 0, unread: 0 };
  } catch (err) {
    console.error("getContactInquiryCounts:", err);
    return { total: 0, unread: 0 };
  }
}

export async function createContactInquiry(input: {
  name: string;
  event_type: string;
  event_date: string | null;
  shift: string;
  phone: string;
  notes: string | null;
}): Promise<{ id?: string; error?: string }> {
  try {
    await ensureTable();
    const rows = await sql<{ id: string }[]>`
      insert into contact_inquiries (
        name, event_type, event_date, shift, phone, notes
      )
      values (
        ${input.name},
        ${input.event_type},
        ${input.event_date},
        ${input.shift},
        ${input.phone},
        ${input.notes}
      )
      returning id
    `;
    const id = rows[0]?.id;
    if (!id) return { error: "Não foi possível enviar o pedido." };
    return { id };
  } catch (err) {
    console.error("createContactInquiry:", err);
    return { error: err instanceof Error ? err.message : "Erro inesperado." };
  }
}

export async function markContactInquiryRead(id: string, read: boolean) {
  await ensureTable();
  if (read) {
    await sql`
      update contact_inquiries
      set read_at = now()
      where id = ${id}::uuid and read_at is null
    `;
    return;
  }
  await sql`
    update contact_inquiries
    set read_at = null
    where id = ${id}::uuid
  `;
}

export async function deleteContactInquiry(id: string) {
  await ensureTable();
  await sql`delete from contact_inquiries where id = ${id}::uuid`;
}
