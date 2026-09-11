import Link from "next/link";
import { getContactInquiries } from "@/lib/contacts";
import {
  deleteInquiry,
  markInquiryRead,
  markInquiryUnread,
} from "@/app/admin/contact-actions";
import ConfirmForm from "@/app/admin/confirm-form";
import { formatDateTime, formatFullDate, toWhatsAppUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminContatosPage() {
  const inquiries = await getContactInquiries();
  const unread = inquiries.filter((item) => !item.read_at).length;

  return (
    <div className="min-w-0 px-6 py-12 md:px-10 md:py-16">
      <header className="mb-12 border-b border-line pb-10 md:mb-16">
        <Link
          href="/admin"
          className="mb-4 inline-block text-xs uppercase tracking-[0.2em] underline underline-offset-4 hover:opacity-60"
        >
          Voltar
        </Link>
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
          Painel de controle
        </p>
        <h1 className="display text-5xl md:text-8xl">Contatos</h1>
        <p className="mt-6 max-w-md text-neutral-600">
          {inquiries.length === 0
            ? "Nenhum pedido ainda."
            : `${inquiries.length} pedido(s) — ${unread} novo(s).`}
        </p>
      </header>

      {inquiries.length === 0 ? (
        <p className="border border-dashed border-line px-6 py-16 text-center text-neutral-500">
          Quando alguém preencher a página de contato, o pedido aparece aqui.
        </p>
      ) : (
        <ul className="border-t border-line">
          {inquiries.map((inquiry) => {
            const unreadItem = !inquiry.read_at;
            const whatsapp = toWhatsAppUrl(inquiry.phone);
            const tel = inquiry.phone.replace(/\D/g, "");

            return (
              <li
                key={inquiry.id}
                className={`border-b border-line py-6 md:py-8 ${
                  unreadItem ? "bg-black/[0.03]" : ""
                }`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {unreadItem && (
                        <span className="inline-flex border border-ink bg-ink px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-paper">
                          Novo
                        </span>
                      )}
                      <span className="inline-flex border border-ink px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]">
                        {inquiry.event_type}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {formatDateTime(inquiry.created_at)}
                      </span>
                    </div>
                    <p className="break-words text-2xl font-medium md:text-3xl">
                      {inquiry.name}
                    </p>
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                          Data do evento
                        </dt>
                        <dd className="mt-1">
                          {formatFullDate(inquiry.event_date) || "Não informada"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                          Turno
                        </dt>
                        <dd className="mt-1">{inquiry.shift}</dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                          Telefone
                        </dt>
                        <dd className="mt-1">{inquiry.phone}</dd>
                      </div>
                    </dl>
                    {inquiry.notes && (
                      <p className="max-w-2xl text-sm leading-relaxed text-neutral-700">
                        {inquiry.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-3 text-xs uppercase tracking-wide lg:max-w-[12rem] lg:flex-col lg:items-end lg:text-right">
                    {tel && (
                      <a
                        href={`tel:+55${tel.startsWith("55") ? tel.slice(2) : tel}`}
                        className="underline underline-offset-4 hover:opacity-60"
                      >
                        Ligar
                      </a>
                    )}
                    {whatsapp && (
                      <a
                        href={whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:opacity-60"
                      >
                        WhatsApp
                      </a>
                    )}
                    {unreadItem ? (
                      <form action={markInquiryRead}>
                        <input type="hidden" name="id" value={inquiry.id} />
                        <button
                          type="submit"
                          className="underline underline-offset-4 hover:opacity-60"
                        >
                          Marcar lido
                        </button>
                      </form>
                    ) : (
                      <form action={markInquiryUnread}>
                        <input type="hidden" name="id" value={inquiry.id} />
                        <button
                          type="submit"
                          className="underline underline-offset-4 hover:opacity-60"
                        >
                          Marcar não lido
                        </button>
                      </form>
                    )}
                    <ConfirmForm
                      action={deleteInquiry}
                      message={`Excluir o pedido de ${inquiry.name}?`}
                    >
                      <input type="hidden" name="id" value={inquiry.id} />
                      <button
                        type="submit"
                        className="text-red-700 underline underline-offset-4 hover:opacity-60"
                      >
                        Excluir
                      </button>
                    </ConfirmForm>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
