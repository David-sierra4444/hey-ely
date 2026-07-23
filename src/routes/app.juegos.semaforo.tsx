import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { toast } from "sonner";
import { ShieldAlert, AlertTriangle, CheckCircle2, Trophy, RotateCcw } from "lucide-react";

export const Route = createFileRoute("/app/juegos/semaforo")({
  component: SemaforoGame,
});

const ALL_CASOS = [
  { id: 1, texto: "Sientes un impulso de gritarle a alguien por coraje.", tipo: "rojo" },
  { id: 2, texto: "Te sientes abrumado/a por tantas tareas pendientes.", tipo: "amarillo" },
  { id: 3, texto: "Estás respirando con calma y concentrado/a en tu clase.", tipo: "verde" },
  { id: 4, texto: "Tienes miedo intenso antes de pasar a exponer frente a todos.", tipo: "rojo" },
  { id: 5, texto: "Dudas sobre si hiciste bien un ejercicio, pero quieres revisarlo.", tipo: "amarillo" },
  { id: 6, texto: "Disfrutas un momento agradable conversando con un amigo.", tipo: "verde" },
  { id: 7, texto: "Sientes rabia porque perdiste un juego importante.", tipo: "rojo" },
  { id: 8, texto: "Estás inseguro/a sobre cómo expresarle algo a un compañero.", tipo: "amarillo" },
  { id: 9, texto: "Te sientes motivado/a y alegre haciendo algo que te apasiona.", tipo: "verde" },
  { id: 10, texto: "Estás a punto de reaccionar agresivamente a un comentario ofensivo.", tipo: "rojo" },
  { id: 11, texto: "Te da nervios hablar con alguien nuevo pero quieres intentarlo.", tipo: "amarillo" },
  { id: 12, texto: "Estás relajado/a escuchando música o leyendo un libro.", tipo: "verde" },
];

// Función para seleccionar 6 casos aleatorios
function getRandomCasos() {
  const shuffled = [...ALL_CASOS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
}

function SemaforoGame() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const [activeCasos, setActiveCasos] = useState<typeof ALL_CASOS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctos, setCorrectos] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Cargar 6 casos aleatorios al montar el componente
  useEffect(() => {
    setActiveCasos(getRandomCasos());
  }, []);

  async function handleChoice(categoriaElegida: string) {
    const casoActual = activeCasos[currentIndex];
    const esAcerto = categoriaElegida === casoActual.tipo;

    if (esAcerto) {
      setCorrectos((c) => c + 1);
      toast.success("¡Correcto! Buena clasificación.");
    } else {
      toast.error("Ups, esa categoría no era la ideal.");
    }

    const siguiente = currentIndex + 1;
    if (siguiente < activeCasos.length) {
      setCurrentIndex(siguiente);
    } else {
      finishGame(correctos + (esAcerto ? 1 : 0));
    }
  }

  async function finishGame(scoreFinal: number) {
    setGameOver(true);
    const xp = scoreFinal * 5; // Hasta 30 XP (5 XP por acierto)
    setXpEarned(xp);

    if (user && profile && xp > 0) {
      await supabase.from("game_sessions").insert({
        user_id: user.id,
        game_key: "semaforo",
        score: scoreFinal,
        xp_earned: xp,
      });

      await supabase
        .from("profiles")
        .update({ xp: profile.xp + xp })
        .eq("id", user.id);

      toast.success(`✨ ¡Juego completado! +${xp} XP ganados.`);
    }
  }

  function resetGame() {
    setActiveCasos(getRandomCasos());
    setCurrentIndex(0);
    setCorrectos(0);
    setGameOver(false);
    setXpEarned(0);
  }

  if (activeCasos.length === 0) return null;

  const caso = activeCasos[currentIndex];

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Link to="/app/juegos" className="text-xs text-muted-foreground hover:underline">
        ← Volver a juegos
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          El Semáforo de las Emociones 🚦
        </h1>
        <p className="text-muted-foreground text-sm">
          Clasifica cada situación socioemocional según el color de control que le corresponda.
        </p>
      </div>

      {!gameOver ? (
        <div className="card-soft p-6 border rounded-2xl bg-card space-y-6">
          <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
            <span>Caso {currentIndex + 1} de {activeCasos.length}</span>
            <span>Aciertos: {correctos}</span>
          </div>

          <div className="p-6 bg-secondary/55 rounded-2xl border text-center font-bold text-lg text-foreground">
            "{caso.texto}"
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleChoice("rojo")}
              className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold text-xs flex flex-col items-center gap-2 transition"
            >
              <ShieldAlert className="w-6 h-6 text-red-400" />
              <span>Rojo (Alto / Pausa)</span>
            </button>

            <button
              onClick={() => handleChoice("amarillo")}
              className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs flex flex-col items-center gap-2 transition"
            >
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span>Amarillo (Precaución)</span>
            </button>

            <button
              onClick={() => handleChoice("verde")}
              className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs flex flex-col items-center gap-2 transition"
            >
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <span>Verde (Avanzar / Fluir)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="card-soft p-8 text-center border rounded-2xl bg-card space-y-3">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-2xl font-extrabold">¡Semáforo Dominado!</h2>
          <p className="text-sm text-muted-foreground">
            Clasificaste correctamente <span className="font-bold text-foreground">{correctos}/{activeCasos.length}</span> situaciones.
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