import Image from "next/image";

export default function SobrePage() {
  return (
    <div className="px-6 py-10 md:px-10">
      <h1 className="display mb-10 text-6xl md:text-8xl">Sobre mim</h1>
      <div className="grid items-start gap-10 md:grid-cols-2">
        <div className="relative aspect-[3/4] w-full max-w-md bg-neutral-200">
          <Image
            src="/minha_foto.jpg"
            alt="Minha foto"
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover grayscale"
          />
        </div>
        <div className="space-y-6 text-lg leading-relaxed">
          <p>
          Olá, muito prazer! Eu sou o Felipe Santos.

Para mim, a fotografia vai muito além de um simples clique: é a arte de congelar o tempo e eternizar os maiores e mais bonitos momentos da vida das pessoas. Eu acredito que cada história de amor e cada celebração merecem ser contadas com verdade, sensibilidade e poesia.
          </p>
          <p>
          Meu trabalho é capturar a essência real de cada capítulo da sua vida. Estou presente na expectativa e na conexão de um ensaio pré-wedding, na explosão de sentimentos e no frio na barriga do grande dia do casamento, e também na alegria genuína de celebrar a vida em um aniversário inesquecível.
          </p>
        </div>
      </div>
    </div>
  );
}
