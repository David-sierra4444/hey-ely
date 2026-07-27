import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { ElyMascot } from "@/components/brand";

export const Route = createFileRoute("/cuenta-verificada")({
  component: CuentaVerificadaPage,
});

function CuentaVerificadaPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full card-soft p-8 text-center space-y-6 bg-card border border-border/80 rounded-3xl shadow-xl relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Icono de verificación y Mascota */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative">
            <ElyMascot className="w-28 h-28 drop-shadow-md" />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full border-4 border-card shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Textos */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> ¡Correo Confirmado!
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            ¡Tu cuenta está lista!
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
            Hemos verificado tu identidad correctamente. Ya puedes acceder a todas las misiones, juegos y herramientas de Ely.
          </p>
        </div>

        {/* Botón de acción */}
        <div className="pt-2">
          <Link
            to="/app"
            className="w-full rounded-2xl bg-primary text-primary-foreground py-3.5 px-4 font-bold text-sm shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <span>Ir al Inicio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}