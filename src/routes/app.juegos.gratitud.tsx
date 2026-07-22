import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { toast } from "sonner";
import { Sparkles, Trophy, RotateCcw, Heart } from "lucide-react";

export const Route = createFileRoute("/app/juegos/gratitud")({
  component: GratitudGame,
});

const PREGUNTAS_GRATITUD = [
  {
    id: 1,
    pregunta: "¿Qué detalle pequeño te hizo sonreír hoy?",
    opciones: [
      { texto: "Un mensaje agradable o una buena comida.", esValida: true },
      { texto: "Nada, todo el día estuvo aburrido.", esValida: false },
      { texto: "Que a alguien le fuera mal.", esValida: false },
    ],
  },
  {
    id: 2,
    pregunta: "¿A qué persona agradeces tener cerca esta semana?",
    opciones: [
      { texto: "A nadie en particular.", esValida: false },
      { texto: "A un amigo o familiar que me apoya y escucha.", esValida: true },
      { texto: "A quienes me critican.", esValida: false },
    ],
  },
  {
    id: 3,
    pregunta: "¿Qué habilidad personal valoras más de ti mismo?",
    opciones: [
      { texto: "Mi resiliencia y capacidad de seguir adelante.", esValida: true },
      { texto: "No tengo ninguna habilidad destacable.", esValida: false },
      { texto: "Que puedo ganarle a los demás fácilmente.", esValida: false },
    ],
  },
];

function GratitudGame() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctos, setCorrectos] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  async function handleOption(esValida: boolean) {
    if (esValida) {
      setCorrectos((c) => c + 1);
      toast.success("¡Hermosa perspectiva de gratitud!");
    } else {
      toast.error("Intenta conectar con un enfoque más positivo.");
    }

    const siguiente = currentIndex + 1;
    if (siguiente < PREGUNTAS_GRATITUD.length) {
      setCurrentIndex(siguiente);
    } else {
      finishGame(correctos + (esValida ? 1 : 0));
    }
  }

  async function finishGame(scoreFinal: number) {
    setGameOver(true);
    const xp = scoreFinal * 10; // Hasta 30 XP
    setXpEarned(xp);

    if (user && profile && xp > 0) {
      await supabase.from("game_sessions").insert({
        user_id: user.id,
        game_key: "gratitud",
        score: scoreFinal,
        xp_earned: xp,
      });

      await supabase
        .from("profiles")
        .update({ xp: profile.xp + xp })
        .eq("id", user.id);

      toast.success(`✨ ¡Espíritu de gratitud expandido! +${xp} XP ganados.`);
    }
  }

  function resetGame() {
    setCurrentIndex(0);
    setCorrectos(0);
    setGameOver(false);
    setXpEarned(0);
  }

  const item = PREGUNTAS_GRATITUD[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Link to="/app/juegos" className="text-xs text-muted-foreground hover:underline">
        ← Volver a juegos
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          Círculo de Gratitud 🌟
        </h1>
        <p className="text-muted-foreground text-sm">
          Entrena tu mente para reconocer las cosas buenas que te rodean.
        </p>
      </div>

      {!gameOver ? (
        <div className="card-soft p-6 border rounded-2xl bg-card space-y-6">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
            <span>Reflexión {currentIndex + 1} de {PREGUNTAS_GRATITUD.length}</span>
            <span>Aciertos: {correctos}</span>
          </div>

          <div className="p-5 bg-secondary/50 rounded-2xl border font-bold text-base text-foreground flex items-start gap-3">
            <Heart className="w-6 h-6 text-pink-400 shrink-0 mt-0.5" />
            <span>{item.pregunta}</span>
          </div>

          <div className="space-y-2">
            {item.opciones.map((op, idx) => (
              <button
                key={idx}
                onClick={() => handleOption(op.esValida)}
                className="w-full text-left p-3.5 rounded-xl border border-border bg-background hover:bg-secondary/80 text-xs font-semibold transition"
              >
                {op.texto}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-soft p-8 text-center border rounded-2xl bg-card space-y-3">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-extrabold">¡Corazón Agradecido!</h2>
          <p className="text-sm text-muted-foreground">
            Completaste el circuito de gratitud reflexionando en <span className="font-bold text-foreground">{correctos}/{PREGUNTAS_GRATITUD.length}</span> aspectos clave.
          </p>
          <div className="text-lg font-bold text-purple-400">+{xpEarned} XP Obtendidos</div>
          <button
            onClick={resetGame}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 font-bold text-xs"
          >
            <RotateCcw className="w-4 h-4" /> Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}