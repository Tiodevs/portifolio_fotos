"use client";

import { useActionState, useState } from "react";
import { EVENT_TYPES, SHIFTS } from "@/lib/contact-options";
import { formatPhone } from "@/lib/utils";
import { submitContactInquiry } from "@/app/contato/actions";
import { contactFormInitialState } from "@/app/contato/form-state";

const labelClass =
  "mb-2 block text-xs uppercase tracking-[0.2em] text-neutral-500";
const inputClass =
  "w-full min-h-12 rounded-none border border-line bg-transparent px-4 py-3 text-base outline-none transition-colors focus:border-ink";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContactInquiry,
    contactFormInitialState,
  );
  const [eventType, setEventType] = useState("");
  const [phone, setPhone] = useState("");

  if (state.ok) {
    return (
      <div className="border border-ink px-6 py-10 text-center md:px-10 md:py-14">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
          Pedido enviado
        </p>
        <p className="display mb-6 text-4xl md:text-5xl">Obrigado</p>
        <p className="mx-auto max-w-md text-base leading-relaxed text-neutral-700 md:text-lg">
          {state.message} Vou responder pelo WhatsApp ou telefone que você
          deixou.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-8 text-xs uppercase tracking-[0.2em] underline underline-offset-4 hover:opacity-60"
        >
          Enviar outro pedido
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="relative space-y-6">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Empresa</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="name" className={labelClass}>
          Seu nome
        </label>
        <input
          id="name"
          name="name"
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          autoCapitalize="words"
          className={inputClass}
          placeholder="Nome e sobrenome"
        />
      </div>

      <div>
        <label htmlFor="event_type" className={labelClass}>
          Tipo de evento
        </label>
        <div className="relative">
          <select
            id="event_type"
            name="event_type"
            required
            value={eventType}
            onChange={(event) => setEventType(event.target.value)}
            className={`${inputClass} appearance-none pr-10`}
          >
            <option value="" disabled>
              Selecione
            </option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
            ⌄
          </span>
        </div>
      </div>

      {eventType === "Outro" && (
        <div>
          <label htmlFor="event_type_other" className={labelClass}>
            Qual evento?
          </label>
          <input
            id="event_type_other"
            name="event_type_other"
            required
            minLength={2}
            maxLength={80}
            className={inputClass}
            placeholder="Ex.: chá de bebê, batizado"
          />
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="event_date" className={labelClass}>
            Data
          </label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Telefone / WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
            value={phone}
            onChange={(event) => setPhone(formatPhone(event.target.value))}
            className={inputClass}
            placeholder="(41) 98765-4321"
          />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Turno</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SHIFTS.map((shift) => (
            <label
              key={shift}
              className="flex min-h-12 cursor-pointer items-center justify-center border border-line px-3 py-3 text-center text-xs uppercase tracking-[0.15em] transition-colors has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper"
            >
              <input
                type="radio"
                name="shift"
                value={shift}
                required
                className="sr-only"
              />
              {shift}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="notes" className={labelClass}>
          Observações (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          maxLength={1000}
          className={inputClass}
          placeholder="Local, quantidade de pessoas ou qualquer detalhe importante"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full min-h-12 bg-ink px-6 py-4 text-xs uppercase tracking-[0.2em] text-paper transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar pedido"}
      </button>

      {state.message !== contactFormInitialState.message && (
        <p
          aria-live="polite"
          className={`border px-4 py-3 text-sm ${
            state.ok
              ? "border-green-700 text-green-700"
              : "border-red-700 text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
