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
    // Formato diario: d-2026-07-21
    return `d-${d.toISOString().slice(0, 10)}`;
  }
  if (freq === "weekly") {
    // Formato semanal: lunes de la semana actual
    const first = new Date(d);
    const day = first.getDay();
    const diff = first.getDate() - day + (day === 0 ? -6 : 1); // Ajuste a Lunes
    first.setDate(diff);
    return `w-${first.toISOString().slice(0, 10)}`;
  }
  // Formato mensual: m-2026-7
  return `m-${d.getFullYear()}-${d.getMonth() + 1}`;
}

function MissionsPage() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"daily" | "weekly" | "monthly">("daily");

  // 1. Obtener todas las misiones activas
  const { data: missions } = useQuery({
    queryKey: ["missions"],
    queryFn: async () => (await supabase.from("missions").select("*").eq("active", true).order("frequency")).data ?? [],
  });

  // Claves actuales para consultar progreso del día/semana/mes
  const currentDailyKey = getPeriodKey("daily");
  const currentWeeklyKey = getPeriodKey("weekly");
  const currentMonthlyKey = getPeriodKey("monthly");

  // 2. Traer solo el progreso del periodo actual para mayor eficiencia
  const { data: done } = useQuery({
    queryKey: ["mission-progress", user?.id, currentDailyKey, currentWeeklyKey],
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

    // Si ya fue completada hoy/esta semana, solo navegamos a la pantalla
    if (isDone) {
      redirigirAUbicacion(m);
      return;
    }

    try {
      // Registrar el progreso con la clave del ciclo actual (ej: d-2026-07-21)
      const { error: insertError } = await supabase
        .from("mission_progress")
        .insert({ user_id: user.id, mission_id: m.id, period_key: pk });

      if (insertError) throw insertError;

      // Sumar XP al perfil
      const nuevoXp = (profile.xp || 0) + m.xp_reward;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ xp: nuevoXp })
        .eq("id", user.id);

      if (updateError) throw updateError;

      toast.success(`✨ ¡Misión Diaria Completada! +${m.xp_reward} XP`);
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

  // Filtrar misiones según la pestaña seleccionada
  const filteredMissions = missions?.filter((m: any) => m.frequency === activeTab) ?? [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <Sparkles className="text-purple-500 fill-purple-500/20" /> Misiones
        </h1>
        <p className="text-muted-foreground text-sm">
          Completa misiones diarias para acumular XP y mantener tu racha activa.
        </p>
      </div>

      {/* Selector de Frecuencia (Diarias / Semanales / Especiales) */}
      <div className="flex gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "daily"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <Clock className="w-4 h-4" /> Diarias
        </button>
        <button
          onClick={() => setActiveTab("weekly")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "weekly"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <Calendar className="w-4 h-4" /> Semanales
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === "monthly"
              ? "bg-primary text-primary-foreground shadow"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <Star className="w-4 h-4" /> Especiales
        </button>
      </div>

      {/* Indicador de reinicio */}
      <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3 flex items-center justify-between text-xs text-purple-300">
        <span>
          {activeTab === "daily" && "⏳ Las misiones diarias se reinician cada medianoche."}
          {activeTab === "weekly" && "🗓️ Las misiones semanales se reinician los lunes."}
          {activeTab === "monthly" && "🏆 Misiones especiales de temporada."}
        </span>
        <span className="font-semibold text-purple-400">
          Fecha de hoy: {new Date().toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
        </span>
      </div>

      {/* Lista de Misiones */}
      <div className="grid md:grid-cols-2 gap-3">
        {filteredMissions.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground text-sm">
            No hay misiones disponibles en esta categoría por hoy.
          </div>
        ) : (
          filteredMissions.map((m: any) => {
            const pk = getPeriodKey(m.frequency);
            const isDone = done?.some((d: any) => d.mission_id === m.id && d.period_key === pk);

            return (
              <div
                key={m.id}
                className={`card-soft p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                  isDone ? "bg-muted/40 border-slate-800 opacity-75" : "bg-card border-border hover:shadow-md"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold text-purple-400 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
                      +{m.xp_reward} XP
                    </span>
                    {isDone && (
                      <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Completado hoy
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-sm text-foreground">{m.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.description}</div>
                </div>

                <button
                  onClick={() => handleMissionClick(m)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                    isDone
                      ? "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      : "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md hover:scale-105 active:scale-95"
                  }`}
                >
                  {isDone ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Ir
                    </>
                  ) : (
                    <>
                      Empezar <ArrowRight className="h-3.5 w-3.5" />
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