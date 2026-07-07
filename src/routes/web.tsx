import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { LogoMark } from "@/components/brand";

export const Route = createFileRoute("/web")({ component: WebLayout });

function WebLayout() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur bg-background/80 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link to="/"><LogoMark /></Link>
          <nav className="hidden md:flex gap-5 text-sm font-semibold items-center">
            <Link to="/web/inicio">Inicio</Link>
            <Link to="/web/que-es">Qué es</Link>
            <Link to="/web/instituciones">Instituciones</Link>
            <Link to="/web/familias">Familias</Link>
            <Link to="/web/recursos">Recursos</Link>
            <Link to="/web/noticias">Noticias</Link>
            <Link to="/web/faq">FAQ</Link>
            <Link to="/web/contacto">Contacto</Link>
            <a href="https://hey-ely-ears-to-you.lovable.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Sitio Web ↗</a>
          </nav>
          <Link to="/auth" className="rounded-full bg-primary px-4 py-2 text-primary-foreground text-sm font-bold">Entrar</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-10">
        <Outlet />
      </main>
      <footer className="border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-muted-foreground text-center">
          © {new Date().getFullYear()} Hey Ely · Previene · Orienta · Acompaña
        </div>
      </footer>
    </div>
  );
}
