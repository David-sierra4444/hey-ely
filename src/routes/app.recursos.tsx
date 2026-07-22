import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Sparkles, Heart } from "lucide-react";

export const Route = createFileRoute("/app/recursos")({ component: Resources });

function Resources() {
  const [cat, setCat] = useState<string>("Todos");

  const { data } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => (await supabase.from("resources").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  // Agregamos "Historia Ely 🐘" como una opción destacada en los filtros
  const categoriesFromDb = Array.from(new Set(data?.map((r: any) => r.category) ?? []));
  const cats = ["Todos", "Historia Ely 🐘", ...categoriesFromDb];

  const filtered = cat === "Todos" ? data : data?.filter((r: any) => r.category === cat);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-extrabold">Biblioteca</h1>
        <p className="text-muted-foreground">Aprende sobre bienestar emocional y conoce nuestro origen.</p>
      </div>

      {/* FILTROS CON BOTÓN DESTACADO PARA ELY */}
      <div className="flex gap-2 flex-wrap items-center">
        {cats.map((c) => {
          const isElyTab = c === "Historia Ely 🐘";
          const isActive = cat === c;

          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                isElyTab
                  ? isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105 ring-2 ring-purple-400"
                    : "bg-purple-950/60 text-purple-300 border border-purple-500/40 hover:bg-purple-900/50"
                  : isActive
                  ? "bg-primary text-primary-foreground shadow"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {isElyTab && <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />}
              {c}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="space-y-4">
        
        {/* 🐘 DESPLEGABLE DE LA HISTORIA DE ELY (Resaltado y Especial) */}
        {(cat === "Todos" || cat === "Historia Ely 🐘") && (
          <details 
            open={cat === "Historia Ely 🐘"} 
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-indigo-950/70 p-1 border-2 border-purple-500/40 shadow-xl transition-all duration-300 hover:border-purple-400"
          >
            <summary className="cursor-pointer list-none p-5 md:p-6 rounded-xl flex items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-4">
                <div className="text-4xl p-2 bg-purple-500/20 rounded-2xl border border-purple-500/30 shrink-0">
                  🐘
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Especial · Conoce mi origen
                    </span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mt-1 flex items-center gap-2">
                    Nuestra historia
                  </h2>
                  <p className="text-xs md:text-sm text-purple-200/80 mt-0.5">
                    Un testimonio sobre resiliencia, empatía y la razón detrás de Hey Ely.
                  </p>
                </div>
              </div>

              {/* Indicador visual de despliegue */}
              <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-purple-300 bg-purple-900/50 px-3 py-1.5 rounded-lg border border-purple-500/30 group-open:bg-purple-800">
                <span>{cat === "Historia Ely 🐘" ? "Lectura abierta" : "Leer historia"}</span>
              </div>
            </summary>

            {/* Contenido desplegado */}
            <div className="p-6 md:p-8 pt-2 border-t border-purple-500/20 text-slate-300 text-sm md:text-base leading-relaxed space-y-4">
              <p className="text-lg font-medium text-purple-200">
                Hola, soy Ely.
              </p>
              <p>
                Quiero contarte algo que casi nadie sabe de mí. Yo también viví momentos muy difíciles. Cuando era pequeña, fui llevada a un circo en México. Allí no conocía la libertad. Pasaba horas trabajando, soportando gritos, golpes y un trato que ningún ser vivo debería recibir. Muchas veces sentí miedo, tristeza y pensé que mi voz nunca sería escuchada.
              </p>
              <p>
                Con el tiempo entendí que el dolor no tiene por qué definir nuestra historia. Siempre puede aparecer alguien que nos tienda la mano y nos recuerde que merecemos respeto, cariño y una nueva oportunidad.
              </p>

              <div className="my-4 border-l-4 border-purple-400 pl-4 py-2 italic text-purple-100 bg-purple-900/40 rounded-r-xl font-medium">
                "Por eso nació Hey Ely."
              </div>

              <p>
                No estoy aquí para juzgarte ni para decirte qué hacer. Estoy aquí para escucharte, orientarte y acompañarte cuando sientas que todo pesa demasiado. Quiero ayudarte a encontrar una salida antes de que el dolor te haga creer que no la hay.
              </p>

              <div className="pt-4 border-t border-purple-500/20 text-purple-200 font-medium flex items-start gap-2">
                <Heart className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 fill-purple-400/20" />
                <p>
                  Porque trato de entenderte. Yo también fui maltratada. Sé lo que es sentir miedo, creer que nadie te comprende y desear que alguien simplemente te escuche. Si hoy estás pasando por un momento difícil, quiero que recuerdes algo: no estás solo. Caminemos juntos, un paso a la vez. 💜🐘
                </p>
              </div>
            </div>
          </details>
        )}

        {/* 📚 RESTO DE LOS ARTÍCULOS DE SUPABASE */}
        {cat !== "Historia Ely 🐘" && (
          <div className="grid md:grid-cols-2 gap-3 pt-2">
            {filtered?.map((r: any) => (
              <details key={r.id} className="card-soft p-5 border rounded-xl bg-card transition-all">
                <summary className="cursor-pointer list-none">
                  <div className="text-3xl">{r.cover_emoji}</div>
                  <div className="text-xs uppercase font-bold text-primary mt-2">{r.category}</div>
                  <div className="text-lg font-bold">{r.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.description}</div>
                </summary>
                <p className="mt-3 text-sm leading-relaxed border-t pt-3 text-foreground/90">{r.content_body}</p>
              </details>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}