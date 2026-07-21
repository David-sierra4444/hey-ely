import { AlertCircle, Phone } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const CONTACTS = [
  { name: "Línea 106 - Salud mental Bogotá", phone: "106", desc: "Atención emocional 24/7" },
  { name: "Línea Nacional de Prevención del Suicidio", phone: "192", desc: "Ministerio de Salud - Colombia" },
  { name: "ICBF — Bienestar Familiar", phone: "141", desc: "Protección de niños, niñas y adolescentes" },
  { name: "Línea Púrpura Distrital", phone: "018000112137", desc: "Violencia contra la mujer" },
  { name: "Policía Nacional", phone: "123", desc: "Emergencias" },
  { name: "Salud mental Boyacá", phone: "+57 608 7420150", desc: "Secretaría de Salud de Boyacá" },
  { name: "Hospital Valle de Tenza", phone: "+57 608 7500123", desc: "Urgencias regionales" },
];

export function EmergencyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón flotante Dorado / Ámbar */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 px-4 py-3 text-slate-950 font-black shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all md:bottom-6 md:right-6"
        aria-label="Botón de emergencia"
      >
        <AlertCircle className="h-6 w-6 text-slate-950" />
        <span className="inline font-black text-sm tracking-wide">Emergencia</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[95vw] max-w-lg rounded-3xl p-5 sm:p-6 max-h-[90vh] flex flex-col justify-between overflow-hidden border-none shadow-2xl">
          
          {/* Cabecera limpia */}
          <DialogHeader className="border-b pb-3 text-left pr-6">
            <DialogTitle className="text-xl sm:text-2xl font-black text-amber-600 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-500" /> Estás en un lugar seguro
            </DialogTitle>
          </DialogHeader>

          {/* Lista de contactos e información */}
          <div className="flex-1 overflow-y-auto my-3 pr-1 space-y-3">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Si tú o alguien que conoces está en riesgo, toca cualquiera de estas líneas para llamar directamente. No estás solo/a.
            </p>

            <div className="space-y-2">
              {CONTACTS.map((c) => (
                <a
                  key={c.phone}
                  href={`tel:${c.phone.replace(/\s/g, "")}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border bg-card p-3 shadow-xs hover:bg-amber-50/50 dark:hover:bg-amber-950/20 active:scale-[0.98] transition"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="rounded-full bg-amber-500/15 p-2 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm leading-tight">{c.name}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{c.desc}</div>
                    </div>
                  </div>
                  <span className="font-mono font-extrabold text-xs bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 px-2.5 py-1 rounded-full shrink-0">
                    {c.phone}
                  </span>
                </a>
              ))}
            </div>

            {/* Consejos */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 p-4 text-white space-y-1 shadow-md">
              <div className="font-extrabold text-sm">¿Qué hacer en una crisis?</div>
              <ul className="text-xs list-disc list-inside space-y-1 opacity-95 font-medium">
                <li>Busca un lugar tranquilo y seguro.</li>
                <li>Habla con un adulto de confianza.</li>
                <li>Llama a una línea de ayuda oficial.</li>
                <li>Si hay riesgo inmediato, marca el <strong>123</strong>.</li>
              </ul>
            </div>
          </div>

        </DialogContent>
      </Dialog>
    </>
  );
}