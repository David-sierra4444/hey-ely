import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession, useProfile } from "@/lib/session";
import { completarMisionPorTitulo } from "@/lib/missions"; // 👈 Importación integrada

export const Route = createFileRoute("/app/juegos/")({ component: GamesIndex });

const games = [
  { key: "memorama", title: "Memorama de emociones", desc: "Encuentra las parejas de emociones.", emoji: "🎴", xp: 30 },
  { key: "respira", title: "Respiración guiada", desc: "4-7-8: inhala, sostén, exhala.", emoji: "🌬️", xp: 20 },
  { key: "trivia", title: "Trivia de bienestar", desc: "Preguntas sobre emociones y hábitos.", emoji: "🧠", xp: 25 },
  { key: "cazadores", title: "Cazador de Calma", desc: "Revienta las burbujas de estrés a toda velocidad.", emoji: "🎈", xp: 30 },
  { key: "semaforo", title: "Semáforo Emocional", desc: "Clasifica situaciones según la intensidad.", emoji: "🚦", xp: 30 },
  { key: "escudo", title: "Escudo de Afirmaciones", desc: "Separa los pensamientos sanadores de los nocivos.", emoji: "🛡️", xp: 30 },
  { key: "conexion", title: "Conexión Segura", desc: "Resuelve dilemas sociales aplicando empatía.", emoji: "🤝", xp: 30 },
  { key: "gratitud", title: "Círculo de Gratitud", desc: "Reflexiona sobre los pequeños detalles positivos del día.", emoji: "🌟", xp: 30 },
];

function GamesIndex() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  // 🎯 MARCAR MISIÓN "Aprende jugando"
  useEffect(() => {
    if (user && profile) {
      completarMisionPorTitulo(user.id, profile.xp, "Aprende jugando");
    }
  }, [user, profile]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold">Juegos</h1>
        <p className="text-muted-foreground text-sm">Aprende habilidades socioemocionales jugando.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {games.map((g) => (
          <Link
            key={g.key}
            to={`/app/juegos/${g.key}` as any}
            onClick={() => {
              if (user && profile) {
                completarMisionPorTitulo(user.id, profile.xp, "Aprende jugando");
              }
            }}
            className="card-soft p-5 hover:scale-[1.02] transition border rounded-2xl bg-card block cursor-pointer"
          >
            <div className="text-4xl">{g.emoji}</div>
            <div className="mt-2 font-bold">{g.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{g.desc}</div>
            <div className="mt-3 text-xs font-bold text-primary">Hasta +{g.xp} XP</div>
          </Link>
        ))}
      </div>
    </div>
  );
}