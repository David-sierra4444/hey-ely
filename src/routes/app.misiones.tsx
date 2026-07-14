import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/misiones")({ component: MissionsPage });

function periodKey(freq: string) {
  const d = new Date();
  if (freq === "daily") return `d-${d.toISOString().slice(0, 10)}`;
  if (freq === "weekly") {
    const first = new Date(d); first.setDate(d.getDate() - d.getDay());
    return `w-${first.toISOString().slice(0, 10)}`;
  }
  return `m-${d.getFullYear()}-${d.getMonth() + 1}`;
}

function MissionsPage() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: missions } = useQuery({
    queryKey: ["missions"],
    queryFn: async () => (await supabase.from("missions").select("*").eq("active", true).order("frequency")).data ?? [],
  });

  const { data: done } = useQuery({
    queryKey: ["mission-progress", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("mission_progress").select("mission_id,period_key").eq("user_id", user!.id)).data ?? [],
  });

  async function handleMissionClick(m: any) {
    if (!user || !profile) return;

    const pk = periodKey(m.frequency);
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

      toast.success(`✨ ¡Misión Completada! +${m.xp_reward} XP obtenidos.`);
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
      const desc = (m.description || "").toLowerCase();

      // Mapeo inteligente con el nombre exacto corregido
      if (title.includes("chat con ely") || title.includes("habla con ely") || title.includes("ely")) {
        ruta = "/app/chat";
      } else if (title.includes("trivia") || title.includes("bienestar")) {
        ruta = "/app/juegos/trivia";
      } else if (title.includes("identifica") || title.includes("emocion") || title.includes("memorama")) {
        ruta = "/app/juegos/memorama";
      } else if (title.includes("respira") || title.includes("respiración")) {
        ruta = "/app/juegos/respira";
      } else if (title.includes("juega") || title.includes("juego")) {
        ruta = "/app/juegos";
      } else if (title.includes("cambiar aspecto") || title.includes("avatar")) {
        ruta = "/app/avatar";
      } else if (title.includes("abrir misiones") || title.includes("misiones")) {
        ruta = "/app/misiones";
      } else if (title.includes("recurso") || title.includes("lee")) {
        ruta = "/app/recursos";
      } else {
        ruta = "/app";
      }
    }

    let modulo = "Actividad";
    if (ruta.includes("chat")) modulo = "Chat AI";
    else if (ruta.includes("trivia")) modulo = "Trivia";
    else if (ruta.includes("memorama")) modulo = "Memorama";
    else if (ruta.includes("avatar")) modulo = "Avatar";
    else if (ruta.includes("juegos")) modulo = "Juegos";
    else if (ruta.includes("recursos")) modulo = "Recursos";

    toast.info(`Cargando "${m.title}" en ${modulo}...`, { duration: 2000 });
    navigate({ to: ruta });
  }

  return (
    <div>
      <h1 className="text-3xl font-extrabold flex items-center gap-2"><Sparkles className="text-primary" /> Misiones</h1>
      <p className="text-muted-foreground">Completa misiones para subir de nivel.</p>
      
      <div className="mt-6 grid md:grid-cols-2 gap-3">
        {missions?.map((m: any) => {
          const pk = periodKey(m.frequency);
          const isDone = done?.some((d: any) => d.mission_id === m.id && d.period_key === pk);
          return (
            <div key={m.id} className={`card-soft p-4 flex items-center gap-3 transition-all ${isDone ? "opacity-60" : "hover:shadow-md"}`}>
              <div className="flex-1">
                <div className="text-[10px] uppercase font-bold text-primary">{m.frequency} · +{m.xp_reward} XP</div>
                <div className="font-bold">{m.title}</div>
                <div className="text-xs text-muted-foreground">{m.description}</div>
              </div>
              
              <button 
                onClick={() => handleMissionClick(m)} 
                className={`rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1 transition-all ${
                  isDone 
                    ? "bg-secondary text-muted-foreground hover:bg-secondary/80" 
                    : "bg-primary text-primary-foreground shadow-soft hover:scale-105 active:scale-95"
                }`}
              >
                {isDone ? (
                  <>
                    <Check className="h-4 w-4" /> Ir de nuevo
                  </>
                ) : (
                  <>
                    Empezar <ArrowRight className="h-3 w-3" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}