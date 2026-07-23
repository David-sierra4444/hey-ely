import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { toast } from "sonner";
import { Trophy, RotateCcw, Heart } from "lucide-react";

export const Route = createFileRoute("/app/juegos/gratitud")({
  component: GratitudGame,
});

const ALL_PREGUNTAS_GRATITUD = [
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
      { texto: "A quienes me critican desconstructivamente.", esValida: false },
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
  {
    id: 4,
    pregunta: "¿Qué espacio físico o lugar te hace sentir seguro y tranquilo?",
    opciones: [
      { texto: "Ningún lugar me hace sentir bien.", esValida: false },
      { texto: "Mi habitación, un parque o un rincón acogedor.", esValida: true },
      { texto: "Lugares donde pueda esconderme de todos.", esValida: false },
    ],
  },
  {
    id: 5,
    pregunta: "¿Qué oportunidad reciente valoras mucho haber tenido?",
    opciones: [
      { texto: "Aprender algo nuevo o compartir tiempo con amigos.", esValida: true },
      { texto: "Desperdiciar el tiempo sin hacer nada útil.", esValida: false },
      { texto: "Ninguna, la vida no da oportunidades.", esValida: false },
    ],
  },
  {
    id: 6,
    pregunta: "¿Qué aspecto de tu salud o cuerpo agradeces hoy?",
    opciones: [
      { texto: "Estar con energía y que mi cuerpo me permita moverme.", esValida: true },
      { texto: "Solo me enfoco en las cosas que no me gustan.", esValida: false },
      { texto: "Nada, mi cuerpo no hace nada especial.", esValida: false },
    ],
  },
  {
    id: 7,
    pregunta: "¿Qué enseñanza valiosa te dejó un momento difícil del pasado?",
    opciones: [
      { texto: "Que soy más fuerte de lo que creía y puedo adaptarme.", esValida: true },
      { texto: "Que nunca debo confiar en nadie jamás.", esValida: false },
      { texto: "Que los problemas nunca se superan.", esValida: false },
    ],
  },
  {
    id: 8,
    pregunta: "¿Qué expresión de amabilidad recibiste o diste recientemente?",
    opciones: [
      { texto: "Un saludo cordial, un abrazo o un 'gracias'.", esValida: true },
      { texto: "Exigirle a los demás que hagan cosas por mí.", esValida: false },
      { texto: "Ignorar a los demás cuando intentan ayudar.", esValida: false },
    ],
  },
  {
    id: 9,
    pregunta: "¿Qué elemento de la naturaleza disfrutaste o puedes apreciar hoy?",
    opciones: [
      { texto: "La luz del sol, la lluvia, el aire fresco o los árboles.", esValida: true },
      { texto: "La naturaleza me da totalmente igual.", esValida: false },
      { texto: "Nada de eso genera ningún impacto en mi bienestar.", esValida: false },
    ],
  },
  {
    id: 10,
    pregunta: "¿Qué pasatiempo o actividad te reconecta con tu alegría?",
    opciones: [
      { texto: "Escuchar música, dibujar, hacer deporte o leer.", esValida: true },
      { texto: "Quejarme continuamente de las actividades que hago.", esValida: false },
      { texto: "No hay nada en absoluto que me entretenga.", esValida: false },
    ],
  },
  {
    id: 11,
    pregunta: "¿Por qué recurso diario te sientes afortunado de tener?",
    opciones: [
      { texto: "Comida caliente, agua limpia y un techo donde descansar.", esValida: true },
      { texto: "Tener cosas costosas para presumir.", esValida: false },
      { texto: "No hay nada básico que sea digno de agradecer.", esValida: false },
    ],
  },
  {
    id: 12,
    pregunta: "¿Qué recuerdo feliz te llena de nostalgia positiva al recordarlo?",
    opciones: [
      { texto: "Una salida divertida, una risa compartida o una meta lograda.", esValida: true },
      { texto: "Prefiero no recordar ningún momento pasado.", esValida: false },
      { texto: "Los recuerdos bonitos no sirven para nada.", esValida: false },
    ],
  },
];

// Función para obtener 6 preguntas aleatorias
function getRandomPreguntas() {
  const shuffled = [...ALL_PREGUNTAS_GRATITUD].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
}

function GratitudGame() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const [activePreguntas, setActivePreguntas] = useState<typeof ALL_PREGUNTAS_GRATITUD>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctos, setCorrectos] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Cargar 6 preguntas aleatorias al montar el componente
  useEffect(() => {
    setActivePreguntas(getRandomPreguntas());
  }, []);

  async function handleOption(esValida: boolean) {
    if (esValida) {
      setCorrectos((c) => c + 1);
      toast.success("¡Hermosa perspectiva de gratitud!");
    } else {
      toast.error("Intenta conectar con un enfoque más positivo.");
    }

    const siguiente = currentIndex + 1;
    if (siguiente < activePreguntas.length) {
      setCurrentIndex(siguiente);
    } else {
      finishGame(correctos + (esValida ? 1 : 0));
    }
  }

  async function finishGame(scoreFinal: number) {
    setGameOver(true);
    const xp = scoreFinal * 5; // Hasta 30 XP (5 XP por acierto)
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
    setActivePreguntas(getRandomPreguntas());
    setCurrentIndex(0);
    setCorrectos(0);
    setGameOver(false);
    setXpEarned(0);
  }

  if (activePreguntas.length === 0) return null;

  const item = activePreguntas[currentIndex];

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
            <span>Reflexión {currentIndex + 1} de {activePreguntas.length}</span>
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
            Completaste el circuito de gratitud reflexionando en <span className="font-bold text-foreground">{correctos}/{activePreguntas.length}</span> aspectos clave.
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