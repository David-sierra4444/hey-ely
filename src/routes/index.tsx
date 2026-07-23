import { createFileRoute, Link } from "@tanstack/react-router";
import { LogoMark, ElyMascot } from "@/components/brand";
import { Heart, Shield, GraduationCap, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      
      {/* Luz Ambiental de Fondo */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-hero opacity-25 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-ely-mint/20 blur-[150px] rounded-full" />
      </div>

      {/* Header Flotante Premium */}
      <header className="sticky top-0 z-50 glass-panel !rounded-none border-b border-border/50 transition-colors backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-3.5">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
            <LogoMark />
          </Link>
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs sm:text-sm font-black text-primary-foreground shadow-soft hover:shadow-glow transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <span>Entrar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section IMPACTANTE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-10 pb-16 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          <div className="order-2 md:order-1 md:col-span-7 space-y-8 text-center md:text-left">
            
            {/* Titulares Masivos con Estilo Top */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-[1.08] tracking-tight text-foreground">
                ¿Alguna vez has sentido que <span className="text-gradient-ely">ya no puedes más?</span>
              </h1>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight text-muted-foreground">
                ¿Has sentido que nadie te escucha o que nadie entiende lo que estás viviendo?
              </h2>
              
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight text-gradient-ely">
                ¿Solo necesitas un lugar donde puedas ser tú, sin miedo a ser juzgado?
              </h2>
            </div>
            
            {/* Tarjeta de Presentación / Historia de Ely */}
            <div className="glass-panel p-6 space-y-3 text-left border border-border/60 shadow-lg">
              <p className="text-foreground font-black text-lg flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ely-mint opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-ely-mint"></span>
                </span>
                Hola, soy Ely.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                Mi historia está inspirada en una elefanta que conoció el miedo y el dolor antes de encontrar una nueva oportunidad.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
                No voy a decirte que entiendo exactamente cómo te sientes, porque cada historia es diferente. Pero sí puedo escucharte, acompañarte y ayudarte a encontrar un camino cuando todo parezca demasiado difícil.
              </p>
            </div>

            {/* Badges estilizados */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 pt-2 text-xs font-bold text-muted-foreground">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border shadow-xs">
                <Shield className="h-4 w-4 text-ely-mint" />
                <span>Chat privado</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border shadow-xs">
                <Heart className="h-4 w-4 text-rose-500" />
                <span>IA empática</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border shadow-xs">
                <GraduationCap className="h-4 w-4 text-ely-blue" />
                <span>Para colegios</span>
              </div>
            </div>
          </div>

          {/* Mascota con Marco Flotante */}
          <div className="relative flex justify-center order-1 md:order-2 md:col-span-5">
            <div className="relative p-8 rounded-3xl glass-panel shadow-soft flex items-center justify-center w-full max-w-sm md:max-w-none group border border-border/80">
              <ElyMascot className="w-full max-w-[260px] sm:max-w-[300px] h-auto drop-shadow-2xl animate-bob group-hover:scale-[1.04] transition-transform duration-500" />
            </div>
          </div>
        </section>

        {/* Sección de Bienvenida Destacada */}
        <section className="max-w-5xl mx-auto px-4 sm:px-8 py-8 text-center">
          <div className="glass-panel p-8 md:p-12 shadow-md border border-border/60">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight leading-tight text-foreground">
              Bienvenido a Hey Ely. Aquí siempre habrá alguien dispuesto a escucharte. 💙
            </h2>
          </div>
        </section>

        {/* Banner de Cierre (CTA) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
          <div className="relative overflow-hidden p-8 md:p-14 card-soft gradient-hero text-white text-center space-y-6 shadow-soft rounded-3xl">
            <div className="relative z-10 max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                Previene · Orienta · Acompaña
              </h2>
              <p className="text-base sm:text-lg opacity-90 font-medium">
                Únete a Hey Ely y descubre una nueva forma de cuidar tu bienestar emocional.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Limpio y Profesional */}
      <footer className="border-t border-border/50 bg-card/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col md:flex-row gap-6 items-center justify-between text-xs md:text-sm font-bold text-muted-foreground">
          <LogoMark size={26} />
          
          <div className="font-semibold">
            Copyright (c) 2026 Vanesa Martin (YVMC). All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
}