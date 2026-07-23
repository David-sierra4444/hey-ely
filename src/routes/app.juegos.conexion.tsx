import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { toast } from "sonner";
import { HeartHandshake, Trophy, RotateCcw } from "lucide-react";
import { completarMisionPorTitulo } from "@/lib/missions"; // 👈 Importación integrada

export const Route = createFileRoute("/app/juegos/conexion")({
  component: ConexionGame,
});

const ALL_DILEMAS = [
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
  {
    id: 4,
    situacion: "Alguien en clase comete un error al responder una pregunta y todos se ríen.",
    opciones: [
      { texto: "Reírte también para no quedar como el único serio.", esCorrecta: false },
      { texto: "No reírte y hacerle un gesto de apoyo o cambiar el tema.", esCorrecta: true },
      { texto: "Grabar la situación para compartirla.", esCorrecta: false },
    ],
  },
  {
    id: 5,
    situacion: "Un amigo te cuenta un secreto sobre algo que lo tiene sufriendo mucho.",
    opciones: [
      { texto: "Escucharlo con atención y sugerirle buscar ayuda de un adulto de confianza.", esCorrecta: true },
      { texto: "Contárselo inmediatamente a todos los demás.", esCorrecta: false },
      { texto: "Decirle que exagerado y no prestarle atención.", esCorrecta: false },
    ],
  },
  {
    id: 6,
    situacion: "Ves que a un compañero se le cayeron todos sus cuadernos al suelo.",
    opciones: [
      { texto: "Pasarle por encima e ignorarlo.", esCorrecta: false },
      { texto: "Ayudarlo a recogerlos de inmediato.", esCorrecta: true },
      { texto: "Tomarle una foto para hacer un meme.", esCorrecta: false },
    ],
  },
  {
    id: 7,
    situacion: "Alguien tiene una opinión totalmente diferente a la tuya sobre un tema.",
    opciones: [
      { texto: "Insultarlo por pensar distinto.", esCorrecta: false },
      { texto: "Escuchar su punto de vista con respeto aunque no estés de acuerdo.", esCorrecta: true },
      { texto: "Obligarlo a cambiar de opinión.", esCorrecta: false },
    ],
  },
  {
    id: 8,
    situacion: "Un integrante de tu grupo está teniendo dificultades para entender su parte del proyecto.",
    opciones: [
      { texto: "Ofrecerte a explicarle o ayudarle a repasarlo juntos.", esCorrecta: true },
      { texto: "Sacarlo del grupo sin avisarle al profesor.", esCorrecta: false },
      { texto: "Burlarte de él por no entender.", esCorrecta: false },
    ],
  },
  {
    id: 9,
    situacion: "Te das cuenta de que dijiste un comentario que hirió los sentimientos de alguien.",
    opciones: [
      { texto: "Decirle que es demasiado sensible y no darle importancia.", esCorrecta: false },
      { texto: "Disculparte sinceramente y asegurarte de no repetirlo.", esCorrecta: true },
      { texto: "Fingir que nunca dijiste nada.", esCorrecta: false },
    ],
  },
  {
    id: 10,
    situacion: "Un compañero nuevo acaba de llegar al colegio y no conoce a nadie.",
    opciones: [
      { texto: "Esperar a que él hable primero con alguien.", esCorrecta: false },
      { texto: "Presentarte y mostrarle las instalaciones del colegio.", esCorrecta: true },
      { texto: "Evitar hablarle porque no lo conoces.", esCorrecta: false },
    ],
  },
  {
    id: 11,
    situacion: "Tu mejor amigo ganó un premio que tú también querías ganar.",
    opciones: [
      { texto: "Felicitarlo de corazón y reconocer su esfuerzo.", esCorrecta: true },
      { texto: "Enojarte con él y dejar de hablarle.", esCorrecta: false },
      { texto: "Decir que el concurso estuvo arreglado.", esCorrecta: false },
    ],
  },
  {
    id: 12,
    situacion: "Alguien en el grupo de chat está enviando mensajes agresivos a un compañero.",
    opciones: [
      { texto: "Seguir la corriente y enviar emojis de risa.", esCorrecta: false },
      { texto: "Pedir que se detenga el trato agresivo o avisar a un moderador/adulto.", esCorrecta: true },
      { texto: "Salirte del grupo y no decir nada a nadie.", esCorrecta: false },
    ],
  },
];

function getRandomDilemas() {
  const shuffled = [...ALL_DILEMAS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 6);
}

function ConexionGame() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const [activeDilemas, setActiveDilemas] = useState<typeof ALL_DILEMAS>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctos, setCorrectos] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    setActiveDilemas(getRandomDilemas());
  }, []);

  async function handleOption(esCorrecta: boolean) {
    if (esCorrecta) {
      setCorrectos((c) => c + 1);
      toast.success("¡Gran respuesta empática!");
    } else {
      toast.error("Hay una opción más empática para esta situación.");
    }

    const siguiente = currentIndex + 1;
    if (siguiente < activeDilemas.length) {
      setCurrentIndex(siguiente);
    } else {
      finishGame(correctos + (esCorrecta ? 1 : 0));
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
          game_key: "conexion",
          score: scoreFinal,
          xp_earned: xp,
        });

        await supabase
          .from("profiles")
          .update({ xp: profile.xp + xp })
          .eq("id", user.id);
      }

      // 🎯 COMPLETAR LA MISIÓN DE CONEXIÓN
      await completarMisionPorTitulo(user.id, profile.xp, "Conexión");

      toast.success(`✨ ¡Empatía demostrada! +${xp} XP ganados.`);
    }
  }

  function resetGame() {
    setActiveDilemas(getRandomDilemas());
    setCurrentIndex(0);
    setCorrectos(0);
    setGameOver(false);
    setXpEarned(0);
  }

  if (activeDilemas.length === 0) return null;

  const dilema = activeDilemas[currentIndex];

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
            <span>Dilema {currentIndex + 1} de {activeDilemas.length}</span>
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
                className="w-full text-left p-3.5 rounded-xl border border-border bg-background hover:bg-secondary/80 text-xs font-semibold transition cursor-pointer"
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
            Resolviste correctamente <span className="font-bold text-foreground">{correctos}/{activeDilemas.length}</span> dilemas sociales.
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