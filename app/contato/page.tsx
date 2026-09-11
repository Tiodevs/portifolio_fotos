import type { Metadata } from "next";
import ContactForm from "@/app/contato/contact-form";

export const metadata: Metadata = {
  title: "Contato — Portfólio",
  description:
    "Peça um orçamento para casamento, ensaio, aniversário e outros eventos.",
};

export default function ContatoPage() {
  return (
    <div className="min-w-0 px-6 py-10 md:px-10">
      <header className="mb-12 max-w-2xl md:mb-16">
        <p className="mb-3 text-xs uppercase tracking-[0.3em] text-neutral-500">
          Vamos conversar
        </p>
        <h1 className="display mb-6 text-5xl md:text-8xl">Contato</h1>
        <p className="text-lg leading-relaxed">
          Conte um pouco do evento que você quer registrar. Eu leio cada pedido
          e retorno com disponibilidade e valores.
        </p>
      </header>

      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
        <ContactForm />

        <aside className="space-y-8 border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
              Direto comigo
            </p>
            <div className="space-y-1 text-sm uppercase tracking-wide">
              <p>santospefelipe@gmail.com</p>
              <p>Brasil, Curitiba</p>
              <p>+55 (41) 98720-8843</p>
            </div>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-neutral-600">
            Casamentos, pré-wedding, aniversários e ensaios. Se a data ainda
            não estiver fechada, escolha um dia aproximado e o turno que mais
            combina.
          </p>
        </aside>
      </div>
    </div>
  );
}
