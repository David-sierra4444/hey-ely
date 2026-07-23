import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { toast } from "sonner";
import { completarMisionPorTitulo } from "@/lib/missions"; // 👈 Importación correcta arriba

export const Route = createFileRoute("/app/juegos/respira")({ component: Breath });

const PHASES = [
  { label: "Inhala", secs: 4 },
  { label: "Sostén", secs: 7 },
  { label: "Exhala", secs: 8 },
];

function Breath() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    if (count <= 0) {
      const next = (phaseIdx + 1) % 3;
      if (next === 0) setCycles((c) => c + 1);
      setPhaseIdx(next);
      setCount(PHASES[next].secs);
      return;
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, running, phaseIdx]);

  async function finish() {
    setRunning(false);
    if (!user || !profile || cycles === 0) return;

    const xp = Math.min(20, cycles * 5);
    
    // 1. Guardar sesión en base de datos
    await supabase
      .from("game_sessions")
      .insert({ user_id: user.id, game_key: "respira", score: cycles, xp_earned: xp });

    // 2. Sumar XP al perfil
    await supabase
      .from("profiles")
      .update({ xp: profile.xp + xp })
      .eq("id", user.id);

    // 🎯 3. COMPLETAR LA MISIÓN (Aquí es donde debe ir)
    await completarMisionPorTitulo(user.id, profile.xp, "Respira");

    toast.success(`+${xp} XP · ¡Bien hecho!`);
    setCycles(0);
  }

  const phase = PHASES[phaseIdx];
  const scale = phase.label === "Inhala" ? 1.2 : phase.label === "Exhala" ? 0.7 : 1.1;

  return (
    <div className="max-w-md mx-auto text-center">
      <Link to="/app/juegos" className="text-xs text-muted-foreground">
        ← Volver
      </Link>
      <h1 className="mt-1 text-3xl font-extrabold">Respiración 4-7-8</h1>
      <p className="text-muted-foreground text-sm">Sigue el ritmo. Ciclos: {cycles}</p>

      <div className="mt-8 flex justify-center">
        <div
          className="rounded-full gradient-hero text-white flex items-center justify-center transition-all duration-1000"
          style={{ width: 200, height: 200, transform: `scale(${running ? scale : 1})` }}
        >
          <div>
            <div className="text-xl font-bold">{running ? phase.label : "Listo/a"}</div>
            <div className="text-4xl font-black">{running ? count : "•"}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2 justify-center">
        {!running ? (
          <button
            onClick={() => {
              setRunning(true);
              setPhaseIdx(0);
              setCount(4);
            }}
            className="rounded-full bg-primary text-primary-foreground px-6 py-3 font-bold"
          >
            Empezar
          </button>
        ) : (
          <button
            onClick={finish}
            className="rounded-full bg-primary text-primary-foreground px-6 py-3 font-bold"
          >
            Terminar
          </button>
        )}
      </div>
    </div>
  );
}