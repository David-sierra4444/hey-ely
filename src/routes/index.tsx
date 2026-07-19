import { createFileRoute, Link } from "@tanstack/react-router";
import { LogoMark, ElyMascot } from "@/components/brand";
import { Heart, Shield, GraduationCap, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hey Ely — Bienestar emocional para adolescentes y jóvenes" },
      { name: "description", content: "Plataforma con IA empática, actividades, recursos y prevención para el bienestar emocional de adolescentes, familias e instituciones educativas." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    // Aseguramos que no haya scroll lateral fantasma en la APK
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <LogoMark />
          
          {/* Menú de navegación para computadoras */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link to="/web/que-es" className="hover:text-primary">¿Qué es?</Link>
            <Link to="/web/instituciones" className="hover:text-primary">Instituciones</Link>
            <Link to="/web/familias" className="hover:text-primary">Familias</Link>
            <Link to="/web/faq" className="hover:text-primary">FAQ</Link>
            <Link to="/web/contacto" className="hover:text-primary">Contacto</Link>
            <a href="https://hey-ely-ears-to-you.lovable.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
              <Sparkles className="h-3.5 w-3.5" /> Sitio Web
            </a>
          </nav>
          
          {/* Zona derecha de botones */}
          <div className="flex items-center gap-4">
            <a 
              href="https://hey-ely-ears-to-you.lovable.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="md:hidden flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
            >
              <Sparkles className="h-3.5 w-3.5" /> Sitio Web
            </a>
            <Link to="/auth" className="rounded-full bg-primary px-4 py-1.5 text-xs sm:text-sm text-primary-foreground font-semibold shadow-soft">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section adaptada para móviles (grid-cols-1) y PC (md:grid-cols-2) */}
      <section className="max-w-6xl mx-auto px-4 pt-8 pb-16 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1 text-center md:text-left">
          
          {/* Preguntas principales optimizadas para no romper la pantalla móvil */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight md:leading-[1.05] tracking-tight text-foreground break-words">
            ¿Alguna vez has sentido que ya no puedes más?
          </h1>
          <h2 className="mt-4 text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-muted-foreground break-words">
            ¿Has sentido que nadie te escucha o que nadie entiende lo que estás viviendo?
          </h2>
          <h2 className="mt-4 text-xl sm:text-2xl md:text-3xl font-bold leading-tight text-primary break-words">
            ¿Solo necesitas un lugar donde puedas ser tú, sin miedo a ser juzgado?
          </h2>
          
          {/* Sección de texto corregida (sin divs ni p anidados incorrectamente) */}
          <div className="mt-6 text-base md:text-lg text-muted-foreground max-w-lg mx-auto md:mx-0 space-y-3 font-medium">
            <p className="text-foreground font-bold text-lg">Hola, soy Ely.</p>
            <p>
              Mi historia está inspirada en una elefanta que conoció el miedo y el dolor antes de encontrar una nueva oportunidad.
            </p>
            <p>
              No voy a decirte que entiendo exactamente cómo te sientes, porque cada historia es diferente. Pero sí puedo escucharte, acompañarte y ayudarte a encontrar un camino cuando todo parezca demasiado difícil.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-500" /> Chat privado</div>
            <div className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-rose-500" /> IA empática</div>
            <div className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4 text-blue-500" /> Para colegios</div>
          </div>
        </div>

        {/* Mascota con contenedor seguro para que no empuje el diseño */}
        <div className="relative flex justify-center order-1 md:order-2">
          <div className="absolute inset-0 gradient-hero opacity-20 blur-3xl rounded-full" />
          <ElyMascot className="relative w-full max-w-[240px] sm:max-w-xs md:max-w-md h-auto transition-transform duration-500 hover:scale-105" />
        </div>
      </section>

      {/* Sección intermedia de bienvenida */}
      <section className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
          Bienvenido a Hey Ely. Aquí siempre habrá alguien dispuesto a escucharte. 💙
        </h2>
      </section>

      {/* Banner de cierre */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="card-soft p-6 md:p-12 gradient-hero text-white text-center rounded-2xl md:rounded-3xl shadow-xl">
          <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight">Previene · Orienta · Acompaña</h2>
          <p className="mt-3 text-sm md:text-base max-w-2xl mx-auto opacity-90">
            Únete a Hey Ely y descubre una nueva forma de cuidar tu bienestar emocional.
          </p>
          <div className="mt-6">
            <Link to="/auth" className="inline-block rounded-full bg-white text-primary px-6 py-2.5 md:px-8 md:py-3 text-sm md:text-base font-bold shadow-soft transition-transform hover:scale-105">
              Comenzar ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer responsivo */}
      <footer className="border-t mt-8">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-4 items-center justify-between text-xs md:text-sm text-muted-foreground text-center md:text-left">
          <LogoMark size={24} />
          <div className="flex flex-wrap justify-center gap-4 font-medium">
            <Link to="/web/que-es" className="hover:text-foreground">Qué es</Link>
            <Link to="/web/instituciones" className="hover:text-foreground">Instituciones</Link>
            <Link to="/web/faq" className="hover:text-foreground">FAQ</Link>
            <Link to="/web/contacto" className="hover:text-foreground">Contacto</Link>
          </div>
          <div>© {new Date().getFullYear()} Hey Ely</div>
        </div>
      </footer>
    </div>
  );
}