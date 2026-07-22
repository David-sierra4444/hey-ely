import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { toast } from "sonner";
import { Trophy, RotateCcw } from "lucide-react";

export const Route = createFileRoute('/app/juegos/cazadores')({
  component: RouteComponent,
});

const NEGATIVE_THOUGHTS = [
  "Estrés", "Miedo", "Ansiedad", "Dudas", "Cansancio", 
  "Frustración", "Enojo", "Preocupación", "Presión"
];

type Bubble = {
  id: number;
  word: string;
  x: number;
  speed: number;
  y: number;
};

function RouteComponent() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  function startGame() {
    setScore(0);
    setTimeLeft(20);
    setBubbles([]);
    setIsPlaying(true);
    setGameOver(false);
    setXpEarned(0);
  }

  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const newBubble: Bubble = {
        id: Date.now() + Math.random(),
        word: NEGATIVE_THOUGHTS[Math.floor(Math.random() * NEGATIVE_THOUGHTS.length)],
        x: Math.floor(Math.random() * 75) + 10,
        speed: Math.random() * 1.5 + 1,
        y: 100,
      };
      setBubbles((prev) => [...prev.slice(-8), newBubble]);
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const moveInterval = setInterval(() => {
      setBubbles((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - b.speed }))
          .filter((b) => b.y > -10)
      );
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isPlaying]);

  function popBubble(id: number) {
    if (!isPlaying) return;
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    setScore((s) => s + 1);
  }

  async function endGame() {
    setIsPlaying(false);
    setGameOver(true);

    const xp = Math.min(30, score * 3);
    setXpEarned(xp);

    if (user && profile && xp > 0) {
      await supabase.from("game_sessions").insert({
        user_id: user.id,
        game_key: "cazadores",
        score: score,
        xp_earned: xp,
      });

      await supabase
        .from("profiles")
        .update({ xp: profile.xp + xp })
        .eq("id", user.id);

      toast.success(`🎉 ¡Tiempo agotado! +${xp} XP ganados.`);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Link to="/app/juegos" className="text-xs text-muted-foreground hover:underline">
        ← Volver a juegos
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          Cazador de Calma 🎈
        </h1>
        <p className="text-muted-foreground text-sm">
          Toca las burbujas de pensamientos negativos para reventarlas antes de que suban.
        </p>
      </div>

      {!isPlaying && !gameOver && (
        <div className="card-soft p-8 text-center border rounded-2xl bg-card space-y-4">
          <div className="text-6xl">🎈💥</div>
          <h2 className="text-xl font-bold">¿Listo/a para liberar tensión?</h2>
          <p className="text-xs text-muted-foreground">
            Tienes 20 segundos para reventar todas las cargas que veas en pantalla.
          </p>
          <button
            onClick={startGame}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-8 py-3 text-sm shadow-md hover:scale-105 transition"
          >
            ¡Empezar a Reventar!
          </button>
        </div>
      )}

      {isPlaying && (
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-card p-3 rounded-xl border text-sm font-bold">
            <span className="text-purple-400">Puntos: {score}</span>
            <span className="text-amber-400">⏱️ Tiempo: {timeLeft}s</span>
          </div>

          <div className="relative w-full h-80 bg-slate-950/40 border border-slate-800 rounded-2xl overflow-hidden touch-none select-none">
            {bubbles.map((b) => (
              <button
                key={b.id}
                onClick={() => popBubble(b.id)}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 bg-purple-600/30 hover:bg-purple-500/50 border border-purple-400/50 backdrop-blur-sm text-purple-200 text-xs font-bold px-3 py-2 rounded-full shadow-lg transition-transform active:scale-90 animate-pulse"
              >
                🎈 {b.word}
              </button>
            ))}
          </div>
        </div>
      )}

      {gameOver && (
        <div className="card-soft p-8 text-center border rounded-2xl bg-card space-y-3">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-extrabold">¡Mente Liberada!</h2>
          <p className="text-sm text-muted-foreground">
            Lograste reventar <span className="font-bold text-foreground">{score}</span> cargas emocionales.
          </p>
          <div className="text-lg font-bold text-purple-400">+{xpEarned} XP Obtendidos</div>
          <button
            onClick={startGame}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 font-bold text-xs"
          >
            <RotateCcw className="w-4 h-4" /> Jugar otra vez
          </button>
        </div>
      )}
    </div>
  );
}