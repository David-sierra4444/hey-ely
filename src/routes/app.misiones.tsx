import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { Check, Sparkles, ArrowRight, Clock, Calendar, Star } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/app/misiones")({ component: MissionsPage });

// Función para calcular las llaves de tiempo actuales
function getPeriodKey(freq: string) {
  const d = new Date();
  if (freq === "daily") {
    return `d-${d.toISOString().slice(0, 10)}`;
  }
  if (freq === "weekly") {
    const first = new Date(d);
    const day = first.getDay();
    const diff = first.getDate() - day + (day === 0 ? -6 : 1);
    first.setDate(diff);
    return `w-${first.toISOString().slice(0, 10)}`;
  }
  return `m-${d.getFullYear()}-${d.getMonth() + 1}`;
}

function MissionsPage() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");

  // 1. Obtener misiones activas
  const { data: missions } = useQuery({
    queryKey: ["missions"],
    queryFn: async () => (await supabase.from("missions").select("*").eq("active", true).order("frequency")).data ?? [],
  });

  const currentDailyKey = getPeriodKey("daily");
  const currentWeeklyKey = getPeriodKey("weekly");
  const currentMonthlyKey = getPeriodKey("monthly");

  // 2. Traer el progreso del periodo actual
  const { data: done } = useQuery({
    queryKey: ["mission-progress", user?.id, currentDailyKey, currentWeeklyKey, currentMonthlyKey],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("mission_progress")
        .select("mission_id, period_key")
        .eq("user_id", user!.id)
        .in("period_key", [currentDailyKey, currentWeeklyKey, currentMonthlyKey]);
      return data ?? [];
    },
  });

  async function handleMissionClick(m: any) {
    if (!user || !profile) return;

    const pk = getPeriodKey(m.frequency);
    const isDone = done?.some((d: any) => d.mission_id === m.id && d.period_key === pk);

    if (isDone) {
      redirigirAUbicacion(m);
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("mission_progress")
        .insert({ user_id: user.id, mission_id: m.id, period_key: pk });

      if (insertError) throw insertError;

      const nuevoXp = (profile.xp || 0) + m.xp_reward;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ xp: nuevoXp })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success(`✨ ¡Misión completada! +${m.xp_reward} XP`);
      qc.invalidateQueries();
      redirigirAUbicacion(m);

    } catch (error: any) {
      console.error("Error al completar la misión:", error.message);
      toast.error("No se pudo procesar la recompensa.");
    }
  }

  function redirigirAUbicacion(m: any) {
    let ruta = m.route || "";

    if (!ruta) {
      const title = (m.title || "").toLowerCase();

      if (title.includes("chat") || title.includes("ely")) ruta = "/app/chat";
      else if (title.includes("trivia")) ruta = "/app/juegos/trivia";
      else if (title.includes("memorama") || title.includes("emocion")) ruta = "/app/juegos/memorama";
      else if (title.includes("respira")) ruta = "/app/juegos/respira";
      else if (title.includes("cazador") || title.includes("calma")) ruta = "/app/juegos/cazadores";
      else if (title.includes("semáforo") || title.includes("semaforo")) ruta = "/app/juegos/semaforo";
      else if (title.includes("escudo") || title.includes("afirmacion")) ruta = "/app/juegos/escudo";
      else if (title.includes("conexión") || title.includes("conexion") || title.includes("empatía")) ruta = "/app/juegos/conexion";
      else if (title.includes("gratitud") || title.includes("círculo")) ruta = "/app/juegos/gratitud";
      else if (title.includes("juego")) ruta = "/app/juegos";
      else if (title.includes("avatar")) ruta = "/app/avatar";
      else if (title.includes("recurso") || title.includes("lee")) ruta = "/app/recursos";
      else ruta = "/app";
    }

    navigate({ to: ruta });
  }

  const filteredMissions = missions?.filter((m: any) => m.frequency === activeTab) ?? [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Encabezado */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2 text-foreground tracking-tight">
          <Sparkles className="text-primary h-7 w-7 fill-primary/20 animate-pulse" /> Misiones
        </h1>
        <p className="text-muted-foreground text-sm font-medium">
          Completa misiones periódicas para acumular XP y fortalecer tu hábito diario.
        </p>
      </div>

      {/* Selector de Frecuencia */}
      <div className="flex gap-2 border-b border-border/60 pb-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
            activeTab === "daily"
              ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
              : "bg-secondary/70 text-secondary-foreground hover:bg-secondary font-bold"
          }`}
        >
          <Clock className="w-4 h-4" /> Diarias
        </button>
        <button
          onClick={() => setActiveTab("weekly")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
            activeTab === "weekly"
              ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
              : "bg-secondary/70 text-secondary-foreground hover:bg-secondary font-bold"
          }`}
        >
          <Calendar className="w-4 h-4" /> Semanales
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all ${
            activeTab === "monthly"
              ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
              : "bg-secondary/70 text-secondary-foreground hover:bg-secondary font-bold"
          }`}
        >
          <Star className="w-4 h-4" /> Especiales
        </button>
      </div>

      {/* Indicador de reinicio con tipografía y contraste mejorados */}
      <div className="glass-panel p-3.5 rounded-2xl border border-primary/20 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-foreground bg-primary/5">
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          {activeTab === "daily" && "⏳ Las misiones diarias se reinician cada medianoche."}
          {activeTab === "weekly" && "🗓️ Las misiones semanales se reinician los lunes."}
          {activeTab === "monthly" && "🏆 Misiones especiales de temporada."}
        </div>
        
        {/* Fecha con máxima visibilidad */}
        <div className="px-3 py-1 rounded-lg bg-background border border-border/80 shadow-xs text-foreground font-extrabold flex items-center gap-1.5">
          <span className="text-muted-foreground font-normal">Hoy:</span>
          <span>{new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}</span>
        </div>
      </div>

      {/* Lista de Misiones */}
      <div className="grid md:grid-cols-2 gap-3.5">
        {filteredMissions.length === 0 ? (
          <div className="col-span-full text-center py-12 glass-panel rounded-2xl border border-dashed border-border text-muted-foreground text-sm font-medium">
            No hay misiones disponibles en esta categoría por el momento.
          </div>
        ) : (
          filteredMissions.map((m: any) => {
            const pk = getPeriodKey(m.frequency);
            const isDone = done?.some((d: any) => d.mission_id === m.id && d.period_key === pk);

            return (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
                  isDone 
                    ? "bg-muted/30 border-border/50 opacity-80" 
                    : "glass-panel border-border/80 hover:border-primary/40 hover:shadow-md"
                }`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                      +{m.xp_reward} XP
                    </span>
                    {isDone && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Completada
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-sm text-foreground leading-snug">{m.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{m.description}</p>
                </div>

                <button
                  onClick={() => handleMissionClick(m)}
                  className={`rounded-xl px-4 py-2.5 text-xs font-black flex items-center gap-1.5 transition-all shrink-0 active:scale-95 ${
                    isDone
                      ? "bg-secondary text-foreground hover:bg-secondary/80 border border-border/60"
                      : "bg-primary text-primary-foreground shadow-sm hover:scale-[1.03] hover:shadow-glow"
                  }`}
                >
                  {isDone ? (
                    <>
                      <span>Ir</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      <span>Empezar</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}