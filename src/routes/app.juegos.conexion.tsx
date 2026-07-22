import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { toast } from "sonner";
import { HeartHandshake, Trophy, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/app/juegos/conexion")({
  component: ConexionGame,
});

const DILEMAS = [
  {
    id: 1,
    situacion: "Un compañero está solo en el descanso y se ve triste.",
    opciones: [
      { texto: "Ignorarlo, seguro quiere estar solo.", esCorrecta: false },
      { texto: "Acercarte y preguntarle amablemente si quiere unirse a conversar.", esCorrecta: true },
      { texto: "Decirle a los demás que se ve raro.", esCorrecta: false },
    ],
  },
  {
    id: 2,
    situacion: "Te molesta algo que hizo un amigo cercano.",
    opciones: [
      { texto: "Hablar con él de forma calmada y explicarle cómo te sentiste.", esCorrecta: true },
      { texto: "Dejar de hablarle para siempre sin explicarle nada.", esCorrecta: false },
      { texto: "Hablar mal de él a sus espaldas.", esCorrecta: false },
    ],
  },
  {
    id: 3,
    situacion: "Notas que están excluyendo a alguien en un trabajo de equipo.",
    opciones: [
      { texto: "Unirte a la exclusión para encajar.", esCorrecta: false },
      { texto: "Invitarlo a integrarse y participar con ustedes.", esCorrecta: true },
      { texto: "No hacer nada porque no es tu problema.", esCorrecta: false },
    ],
  },
];

function ConexionGame() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctos, setCorrectos] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  async function handleOption(esCorrecta: boolean) {
    if (esCorrecta) {
      setCorrectos((c) => c + 1);
      toast.success("¡Gran respuesta empática!");
    } else {
      toast.error("Hay una opción más empática para esta situación.");
    }

    const siguiente = currentIndex + 1;
    if (siguiente < DILEMAS.length) {
      setCurrentIndex(siguiente);
    } else {
      finishGame(correctos + (esCorrecta ? 1 : 0));
    }
  }

  async function finishGame(scoreFinal: number) {
    setGameOver(true);
    const xp = scoreFinal * 10; // Hasta 30 XP
    setXpEarned(xp);

    if (user && profile && xp > 0) {
      await supabase.from("game_sessions").insert({
        user_id: user.id,
        game_key: "conexion",
        score: scoreFinal,
        xp_earned: xp,
      });

      await supabase
        .from("profiles")
        .update({ xp: profile.xp + xp })
        .eq("id", user.id);

      toast.success(`✨ ¡Empatía demostrada! +${xp} XP ganados.`);
    }
  }

  function resetGame() {
    setCurrentIndex(0);
    setCorrectos(0);
    setGameOver(false);
    setXpEarned(0);
  }

  const dilema = DILEMAS[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Link to="/app/juegos" className="text-xs text-muted-foreground hover:underline">
        ← Volver a juegos
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          Conexión Segura 🤝
        </h1>
        <p className="text-muted-foreground text-sm">
          Elige la mejor forma de actuar ante situaciones sociales y demuestra tu empatía.
        </p>
      </div>

      {!gameOver ? (
        <div className="card-soft p-6 border rounded-2xl bg-card space-y-6">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
            <span>Dilema {currentIndex + 1} de {DILEMAS.length}</span>
            <span>Aciertos: {correctos}</span>
          </div>

          <div className="p-5 bg-secondary/50 rounded-2xl border font-bold text-base text-foreground flex items-start gap-3">
            <HeartHandshake className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
            <span>{dilema.situacion}</span>
          </div>

          <div className="space-y-2">
            {dilema.opciones.map((op, idx) => (
              <button
                key={idx}
                onClick={() => handleOption(op.esCorrecta)}
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
          <h2 className="text-2xl font-extrabold">¡Líder Empático!</h2>
          <p className="text-sm text-muted-foreground">
            Resolviste correctamente <span className="font-bold text-foreground">{correctos}/{DILEMAS.length}</span> dilemas sociales.
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