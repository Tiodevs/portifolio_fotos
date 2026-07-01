export default function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line px-6 py-16 md:px-10">
      <p className="mb-8 text-sm tracking-[0.2em] text-neutral-500">
        ENTRE EM CONTATO PARA MAIS
      </p>
      <h2 className="display mb-12 text-5xl md:text-8xl">Felipe Santos</h2>
      <div className="flex flex-col justify-between gap-8 text-sm md:flex-row">
        <div className="space-y-1">
          <p>santospefelipe@gmail.com</p>
          <p>Brasil, Curitiba</p>
          <p>+55 (41) 987208843</p>
        </div>
        <div className="flex flex-wrap gap-6">
          <a href="#" className="hover:opacity-60">Instagram</a>
          <a href="#" className="hover:opacity-60">Facebook</a>
          <a href="#" className="hover:opacity-60">X/Twitter</a>
          <a href="#" className="hover:opacity-60">Youtube</a>
        </div>
      </div>
    </footer>
  );
}
