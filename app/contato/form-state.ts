export type ContactFormState = {
  ok: boolean;
  message: string;
  sentAt?: number;
};

export const contactFormInitialState: ContactFormState = {
  ok: false,
  message: "Preencha os campos para enviar o pedido.",
};
