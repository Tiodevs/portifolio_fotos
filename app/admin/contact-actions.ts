"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteContactInquiry,
  markContactInquiryRead,
} from "@/lib/contacts";

function revalidateContacts() {
  revalidatePath("/admin");
  revalidatePath("/admin/contatos");
}

export async function markInquiryRead(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await markContactInquiryRead(id, true);
  revalidateContacts();
  redirect("/admin/contatos");
}

export async function markInquiryUnread(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await markContactInquiryRead(id, false);
  revalidateContacts();
  redirect("/admin/contatos");
}

export async function deleteInquiry(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  await deleteContactInquiry(id);
  revalidateContacts();
  redirect("/admin/contatos");
}
