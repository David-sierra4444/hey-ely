import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Sparkles, Heart, Users, ShieldCheck, Compass, Smile } from "lucide-react";

export const Route = createFileRoute("/app/recursos")({ component: Resources });

const ELY_WISDOM_FACTS = [
  {
    icon: Users,
    title: "La fuerza de la manada",
    fact: "En la naturaleza, las elefantas adultas cuidan y protegen a las crías de todo el grupo por igual. Jamás dejan a nadie atrás.",
    lesson: "Nunca estás solo o sola; tu comunidad escolar y este espacio están aquí para sostenerte cuando más pesa el día.",
  },
  {
    icon: Heart,
    title: "Memoria y empatía profunda",
    fact: "Los elefantes tienen zonas cerebrales asociadas a la empatía mucho más grandes que los humanos. Pueden consolarse mutuamente con caricias en la trompa.",
    lesson: "Sentir tus emociones intensamente no es una debilidad, es una prueba de tu enorme capacidad humana para conectar.",
  },
  {
    icon: ShieldCheck,
    title: "El círculo de protección",
    fact: "Cuando hay peligro, las elefantas adultas forman un círculo impenetrable alrededor de los más jóvenes para que nada los dañe.",
    lesson: "Desarrollar límites sanos y cuidar tu paz mental es construir tu propio escudo protector ante situaciones difíciles.",
  },
  {
    icon: Compass,
    title: "Paso a paso ante la tormenta",
    fact: "Ante una tormenta o sequía, las manadas caminan lento pero sin detenerse, guiadas por la matriarca más experimentada.",
    lesson: "No tienes que resolver toda tu vida hoy. Da un solo paso a la vez, respira hondo y confía en tu proceso.",
  },
];

function Resources() {
  const [cat, setCat] = useState<string>("Todos");
  const [activeFact, setActiveFact] = useState<number>(0);

  const { data } = useQuery({
    queryKey: ["resources"],
    queryFn: async () => (await supabase.from("resources").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const categoriesFromDb = Array.from(new Set(data?.map((r: any) => r.category) ?? []));
  const cats = ["Todos", "Historia Ely 🐘", "Sabiduría de la Manada 🧠", ...categoriesFromDb];

  const filtered = cat === "Todos" ? data : data?.filter((r: any) => r.category === cat);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Biblioteca y Origen</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">Aprende sobre bienestar emocional, conoce nuestra historia y descubre lecciones de vida.</p>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 flex-wrap items-center">
        {cats.map((c) => {
          const isSpecialTab = c === "Historia Ely 🐘" || c === "Sabiduría de la Manada 🧠";
          const isActive = cat === c;

          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`rounded-2xl px-4 py-2 text-xs md:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                isSpecialTab
                  ? isActive
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 scale-105 ring-2 ring-purple-400"
                    : "bg-purple-950/40 text-purple-300 border border-purple-500/30 hover:bg-purple-900/40"
                  : isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50"
              }`}
            >
              {isSpecialTab && <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />}
              {c}
            </button>
          );
        })}
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="space-y-4">
        
        {/* 🐘 DESPLEGABLE: HISTORIA DE ELY */}
        {(cat === "Todos" || cat === "Historia Ely 🐘") && (
          <details 
            open={cat === "Historia Ely 🐘"} 
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/70 via-slate-900 to-indigo-950/70 p-1 border-2 border-purple-500/40 shadow-xl transition-all duration-300 hover:border-purple-400"
          >
            <summary className="cursor-pointer list-none p-5 md:p-6 rounded-2xl flex items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-4">
                <div className="text-3xl md:text-4xl p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30 shrink-0">
                  🐘
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/25 text-purple-300 border border-purple-500/30">
                    Especial · Conoce mi origen
                  </span>
                  <h2 className="text-lg md:text-2xl font-bold text-white mt-1">
                    La verdadera historia de Ely
                  </h2>
                  <p className="text-xs md:text-sm text-purple-200/80 mt-0.5">
                    Un testimonio sobre resiliencia, empatía y la razón detrás de este espacio.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-purple-300 bg-purple-900/50 px-3.5 py-2 rounded-xl border border-purple-500/30">
                <span>{cat === "Historia Ely 🐘" ? "Lectura abierta" : "Leer historia"}</span>
              </div>
            </summary>

            <div className="p-6 md:p-8 pt-2 border-t border-purple-500/20 text-slate-300 text-sm md:text-base leading-relaxed space-y-4">
              <p className="text-base md:text-lg font-medium text-purple-200">
                Hola, soy Ely.
              </p>
              <p>
                Quiero contarte algo que casi nadie sabe de mí. Yo también viví momentos muy difíciles. Cuando era pequeña, fui llevada a un circo. Allí no conocía la libertad; pasaba horas trabajando, soportando gritos y un trato que ningún ser vivo debería recibir. Muchas veces sentí miedo, tristeza y pensé que mi voz nunca sería escuchada.
              </p>
              <p>
                Con el tiempo entendí que el dolor no tiene por qué definir nuestra historia. Siempre puede aparecer alguien que nos tienda la mano y nos recuerde que merecemos respeto, cariño y una nueva oportunidad.
              </p>
              <div className="my-4 border-l-4 border-purple-400 pl-4 py-2.5 italic text-purple-100 bg-purple-900/40 rounded-r-2xl font-medium shadow-xs">
                "Por eso nació Hey Ely: para ser ese refugio seguro que yo hubiera querido tener."
              </div>
              <p>
                No estoy aquí para juzgarte ni para decirte qué hacer. Estoy aquí para escucharte, orientarte y acompañarte cuando sientas que todo pesa demasiado. Quiero ayudarte a encontrar una salida antes de que el agobio te haga creer que no la hay.
              </p>
              <div className="pt-4 border-t border-purple-500/20 text-purple-200 font-medium flex items-start gap-3 bg-purple-950/30 p-4 rounded-2xl border border-purple-500/20">
                <Heart className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 fill-purple-400/20" />
                <p className="text-xs md:text-sm">
                  Porque trato de entenderte. Yo también sufrí y sé lo que es sentirse solo. Si hoy estás pasando por un momento gris, recuerda que no estás solo/a. Caminemos juntos, un paso a la vez. 💜🐘
                </p>
              </div>
            </div>
          </details>
        )}

        {/* 🧠 DESPLEGABLE: SABIDURÍA DE LA MANADA (Mismo Estilo) */}
        {(cat === "Todos" || cat === "Sabiduría de la Manada 🧠") && (
          <details 
            open={cat === "Sabiduría de la Manada 🧠"} 
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/70 p-1 border-2 border-indigo-500/40 shadow-xl transition-all duration-300 hover:border-indigo-400"
          >
            <summary className="cursor-pointer list-none p-5 md:p-6 rounded-2xl flex items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-4">
                <div className="text-3xl md:text-4xl p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30 shrink-0">
                  🧠
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-500/25 text-indigo-300 border border-indigo-500/30">
                    Dato Curioso & Bienestar
                  </span>
                  <h2 className="text-lg md:text-2xl font-bold text-white mt-1">
                    Sabiduría de la Manada
                  </h2>
                  <p className="text-xs md:text-sm text-indigo-200/80 mt-0.5">
                    Secretos y lecciones de los elefantes aplicados a tu salud mental diaria.
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-indigo-300 bg-indigo-900/50 px-3.5 py-2 rounded-xl border border-indigo-500/30">
                <span>{cat === "Sabiduría de la Manada 🧠" ? "Lectura abierta" : "Explorar datos"}</span>
              </div>
            </summary>

            <div className="p-6 md:p-8 pt-2 border-t border-indigo-500/20 text-slate-300 text-sm md:text-base leading-relaxed space-y-4">
              <p className="text-xs md:text-sm text-indigo-200/90">
                Toca cada tarjeta para descubrir cómo el comportamiento de los elefantes en la naturaleza nos enseña herramientas poderosas de resiliencia:
              </p>

              {/* Selector interactivo */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ELY_WISDOM_FACTS.map((item, idx) => {
                  const IconComponent = item.icon;
                  const isSelected = activeFact === idx;
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.preventDefault(); // Evita cerrar el details al hacer clic
                        setActiveFact(idx);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-600 text-white border-indigo-400 shadow-md scale-[1.02]" 
                          : "bg-indigo-950/50 hover:bg-indigo-900/50 border-indigo-500/30 text-indigo-200"
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 mb-2 ${isSelected ? "text-white" : "text-indigo-400"}`} />
                      <span className="text-xs font-bold line-clamp-1">{item.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tarjeta activa */}
              <div className="p-4 md:p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
                <div className="text-xs font-semibold text-indigo-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {ELY_WISDOM_FACTS[activeFact].title}
                </div>
                <div className="text-xs md:text-sm text-slate-200 font-medium leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-indigo-500/20">
                  <strong className="text-indigo-400">En la naturaleza:</strong> {ELY_WISDOM_FACTS[activeFact].fact}
                </div>
                <div className="text-xs md:text-sm text-slate-300 leading-relaxed pl-1">
                  <strong className="text-purple-300">Para ti hoy:</strong> {ELY_WISDOM_FACTS[activeFact].lesson}
                </div>
              </div>
            </div>
          </details>
        )}

        {/* 📚 ARTÍCULOS DE SUPABASE (Filtrados correctamente sin duplicarse arriba) */}
        <div className="grid md:grid-cols-2 gap-3 pt-2">
          {filtered?.map((r: any) => (
            <details key={r.id} className="card-soft p-5 border rounded-2xl bg-card transition-all shadow-xs group">
              <summary className="cursor-pointer list-none">
                <div className="text-3xl mb-1">{r.cover_emoji}</div>
                <div className="text-[10px] uppercase font-bold text-primary mt-1 px-2 py-0.5 rounded-md bg-primary/10 inline-block">{r.category}</div>
                <div className="text-base font-bold mt-1.5 group-hover:text-primary transition-colors">{r.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{r.description}</div>
              </summary>
              <p className="mt-3 text-xs md:text-sm leading-relaxed border-t pt-3 text-foreground/90 whitespace-pre-line">{r.content_body}</p>
            </details>
          ))}
        </div>

      </div>
    </div>
  );
}