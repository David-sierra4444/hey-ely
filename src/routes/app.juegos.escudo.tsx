import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { toast } from "sonner";
import { ShieldCheck, XCircle, Trophy, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/app/juegos/escudo")({
  component: EscudoGame,
});

const FRASES = [
  { id: 1, texto: "Puedo aprender de mis errores y mejorar cada día.", esPositivo: true },
  { id: 2, texto: "Nunca me sale nada bien, soy un fracaso.", esPositivo: false },
  { id: 3, texto: "Merezco respeto y tengo derecho a poner límites.", esPositivo: true },
  { id: 4, texto: "A los demás no les importa lo que siento.", esPositivo: false },
  { id: 5, texto: "Tengo fortalezas y habilidades valiosas.", esPositivo: true },
  { id: 6, texto: "Seguro haré el ridículo si lo intento.", esPositivo: false },
];

function EscudoGame() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctos, setCorrectos] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  async function handleAnswer(decision: boolean) {
    const fraseActual = FRASES[currentIndex];
    const esAcerto = decision === fraseActual.esPositivo;

    if (esAcerto) {
      setCorrectos((c) => c + 1);
      toast.success("¡Excelente elección para tu bienestar!");
    } else {
    }

    const siguiente = currentIndex + 1;
    if (siguiente < FRASES.length) {
      setCurrentIndex(siguiente);
    } else {
      finishGame(correctos + (esAcerto ? 1 : 0));
    }
  }

  async function finishGame(scoreFinal: number) {
    setGameOver(true);
    const xp = scoreFinal * 5; // Hasta 30 XP
    setXpEarned(xp);

    if (user && profile && xp > 0) {
      await supabase.from("game_sessions").insert({
        user_id: user.id,
        game_key: "escudo",
        score: scoreFinal,
        xp_earned: xp,
      });

      await supabase
        .from("profiles")
        .update({ xp: profile.xp + xp })
        .eq("id", user.id);

      toast.success(`✨ ¡Escudo fortalecido! +${xp} XP ganados.`);
    }
  }

  function resetGame() {
    setCurrentIndex(0);
    setCorrectos(0);
    setGameOver(false);
    setXpEarned(0);
  }

  const frase = FRASES[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Link to="/app/juegos" className="text-xs text-muted-foreground hover:underline">
        ← Volver a juegos
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          Escudo de Afirmaciones 🛡️
        </h1>
        <p className="text-muted-foreground text-sm">
          Identifica qué pensamientos fortalecen tu autoestima y cuáles debes rechazar.
        </p>
      </div>

      {!gameOver ? (
        <div className="card-soft p-6 border rounded-2xl bg-card space-y-6">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
            <span>Afirmación {currentIndex + 1} de {FRASES.length}</span>
            <span>Aciertos: {correctos}</span>
          </div>

          <div className="p-6 bg-secondary/50 rounded-2xl border text-center font-bold text-lg text-foreground">
            "{frase.texto}"
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(true)}
              className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs flex flex-col items-center gap-2 transition"
            >
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>Pensamiento Sanador (Aceptar)</span>
            </button>

            <button
              onClick={() => handleAnswer(false)}
              className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs flex flex-col items-center gap-2 transition"
            >
              <XCircle className="w-6 h-6 text-red-400" />
              <span>Pensamiento Nocivo (Rechazar)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="card-soft p-8 text-center border rounded-2xl bg-card space-y-3">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-extrabold">¡Escudo Activo!</h2>
          <p className="text-sm text-muted-foreground">
            Clasificaste correctamente <span className="font-bold text-foreground">{correctos}/{FRASES.length}</span> pensamientos.
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