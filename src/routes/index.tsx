import { createFileRoute, Link } from "@tanstack/react-router";
import { LogoMark, ElyMascot } from "@/components/brand";
import { Heart, Shield, MessageSquare, GraduationCap, Users2, Sparkles } from "lucide-react";

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
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <LogoMark />
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
          <Link to="/auth" className="rounded-full bg-primary px-5 py-2 text-primary-foreground font-semibold shadow-soft">Entrar</Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 pt-12 pb-20 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5" /> Bienestar emocional con IA empática
          </div>
          <h1 className="mt-4 text-5xl md:text-6xl font-extrabold leading-[1.05]">
            Hola, soy <span className="text-gradient-ely">Ely</span>.<br /> Estoy aquí para ti.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-lg">
            Hey Ely acompaña a adolescentes y jóvenes en su bienestar emocional con inteligencia artificial cercana,
            actividades, recursos y prevención. También ofrece herramientas para instituciones educativas.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/auth" className="rounded-full bg-primary px-6 py-3 text-primary-foreground font-bold shadow-soft hover:opacity-90">
              Empezar gratis
            </Link>
            <Link to="/web/que-es" className="rounded-full border bg-background px-6 py-3 font-bold hover:bg-secondary">
              Conocer más
            </Link>
          </div>
          <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Chat privado</div>
            <div className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> IA empática</div>
            <div className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> Para colegios</div>
          </div>
        </div>
        <div className="relative flex justify-center">
          <div className="absolute inset-0 gradient-hero opacity-30 blur-3xl rounded-full" />
          <ElyMascot className="relative w-full max-w-md" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-extrabold text-center">Todo lo que necesitas para florecer</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {[
            { icon: MessageSquare, title: "Chat con Ely", desc: "IA empática que te llama por tu nombre y te acompaña sin juzgar." },
            { icon: Sparkles, title: "Avatar y mascota", desc: "Personaliza tu avatar y desbloquea mascotas con XP." },
            { icon: Heart, title: "Juegos y misiones", desc: "Aprende habilidades socioemocionales jugando." },
            { icon: Shield, title: "100% privado", desc: "Tus conversaciones son solo tuyas. La institución nunca las ve." },
            { icon: Users2, title: "Para instituciones", desc: "Panel con estadísticas y alertas de riesgo respetando la privacidad." },
            { icon: GraduationCap, title: "Recursos educativos", desc: "Artículos, videos y ejercicios sobre bienestar." },
          ].map((f) => (
            <div key={f.title} className="card-soft p-6">
              <div className="inline-flex items-center justify-center rounded-2xl gradient-mint p-3 text-white"><f.icon className="h-5 w-5" /></div>
              <div className="mt-3 font-bold text-lg">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="card-soft p-8 md:p-12 gradient-hero text-white text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold">Previene · Orienta · Acompaña</h2>
          <p className="mt-3 max-w-2xl mx-auto opacity-95">
            Únete a Hey Ely y descubre una nueva forma de cuidar tu bienestar emocional.
          </p>
          <Link to="/auth" className="mt-6 inline-block rounded-full bg-white text-primary px-8 py-3 font-bold shadow-soft">
            Crear mi cuenta
          </Link>
        </div>
      </section>

      <footer className="border-t mt-8">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-wrap gap-4 items-center justify-between text-sm text-muted-foreground">
          <LogoMark size={28} />
          <div className="flex gap-4">
            <Link to="/web/que-es">Qué es</Link>
            <Link to="/web/instituciones">Instituciones</Link>
            <Link to="/web/faq">FAQ</Link>
            <Link to="/web/contacto">Contacto</Link>
          </div>
          <div>© {new Date().getFullYear()} Hey Ely</div>
        </div>
      </footer>
    </div>
  );
}
