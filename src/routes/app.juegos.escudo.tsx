import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { toast } from "sonner";
import { ShieldCheck, XCircle, Trophy, RotateCcw } from "lucide-react";
import { completarMisionPorTitulo } from "@/lib/missions"; // 👈 Importación integrada

export const Route = createFileRoute("/app/juegos/escudo")({
  component: EscudoGame,
});

const ALL_FRASES = [
  { id: 1, texto: "Puedo aprender de mis errores y mejorar cada día.", esPositivo: true },
  { id: 2, texto: "Nunca me sale nada bien, soy un fracaso.", esPositivo: false },
  { id: 3, texto: "Merezco respeto y tengo derecho a poner límites.", esPositivo: true },
  { id: 4, texto: "A los demás no les importa lo que siento.", esPositivo: false },
  { id: 5, texto: "Tengo fortalezas y habilidades valiosas.", esPositivo: true },
  { id: 6, texto: "Seguro haré el ridículo si lo intento.", esPositivo: false },
  { id: 7, texto: "Está bien sentirme mal a veces, es parte de ser humano.", esPositivo: true },
  { id: 8, texto: "Nadie me quiere y siempre estaré solo/a.", esPositivo: false },
  { id: 9, texto: "Soy capaz de superar este reto paso a paso.", esPositivo: true },
  { id: 10, texto: "Debo ser perfecto en todo para que me acepten.", esPositivo: false },
  { id: 11, texto: "Mi opinión vale tanto como la de los demás.", esPositivo: true },
  { id: 12, texto: "Si pido ayuda, significa que soy débil.", esPositivo: false },
];

function getRandomFrases() {
  const shuffled = [...ALL_FRASES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
}

function EscudoGame() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const [activeFrases, setActiveFrases] = useState<typeof ALL_FRASES>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctos, setCorrectos] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    setActiveFrases(getRandomFrases());
  }, []);

  async function handleAnswer(decision: boolean) {
    const fraseActual = activeFrases[currentIndex];
    const esAcerto = decision === fraseActual.esPositivo;

    if (esAcerto) {
      setCorrectos((c) => c + 1);
      toast.success("¡Excelente elección para tu bienestar!");
    } else {
      toast.error("Ese pensamiento no fortalece tu salud emocional.");
    }

    const siguiente = currentIndex + 1;
    if (siguiente < activeFrases.length) {
      setCurrentIndex(siguiente);
    } else {
      finishGame(correctos + (esAcerto ? 1 : 0));
    }
  }

  async function finishGame(scoreFinal: number) {
    setGameOver(true);
    const xp = scoreFinal * 5;
    setXpEarned(xp);

    if (user && profile) {
      if (xp > 0) {
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
      }

      // 🎯 COMPLETAR LA MISIÓN DEL ESCUDO
      await completarMisionPorTitulo(user.id, profile.xp, "Escudo");

      toast.success(`✨ ¡Escudo fortalecido! +${xp} XP ganados.`);
    }
  }

  function resetGame() {
    setActiveFrases(getRandomFrases());
    setCurrentIndex(0);
    setCorrectos(0);
    setGameOver(false);
    setXpEarned(0);
  }

  if (activeFrases.length === 0) return null;

  const frase = activeFrases[currentIndex];

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
            <span>Afirmación {currentIndex + 1} de {activeFrases.length}</span>
            <span>Aciertos: {correctos}</span>
          </div>

          <div className="p-6 bg-secondary/50 rounded-2xl border text-center font-bold text-lg text-foreground">
            "{frase.texto}"
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(true)}
              className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs flex flex-col items-center gap-2 transition cursor-pointer"
            >
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <span>Pensamiento Sanador (Aceptar)</span>
            </button>

            <button
              onClick={() => handleAnswer(false)}
              className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs flex flex-col items-center gap-2 transition cursor-pointer"
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
            Clasificaste correctamente <span className="font-bold text-foreground">{correctos}/{activeFrases.length}</span> pensamientos.
          </p>
          <div className="text-lg font-bold text-purple-400">+{xpEarned} XP Obtendidos</div>
          <button
            onClick={resetGame}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 font-bold text-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}