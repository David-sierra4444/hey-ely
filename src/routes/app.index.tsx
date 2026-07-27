import { createFileRoute, Link } from "@tanstack/react-router";
import { ElyMascot } from "@/components/brand";
import { useSession, useProfile, computeLevel } from "@/lib/session";
import { useState } from "react";
import { 
  MessageCircle, 
  Target, 
  Gamepad2, 
  BookOpen, 
  Sparkles, 
  Dog,
  User,
  FileText,
  Smile,
  Meh,
  Frown,
  Quote,
  RefreshCw,
  Heart,
  BatteryCharging,
  Zap,
  Coffee
} from "lucide-react";

export const Route = createFileRoute("/app/")({ component: Home });

const DAILY_QUOTES = [
  "No tienes que resolver toda tu vida hoy, solo dar el siguiente paso.",
  "Tus sentimientos son válidos, dales espacio para ser escuchados.",
  "Incluso los días nublados ayudan a crecer a los árboles más fuertes.",
  "Cuidar tu paz mental es la mejor decisión que puedes tomar hoy.",
  "Eres más fuerte y resiliente de lo que te das crédito."
];

const QUICK_PAUSES = [
  "Bebe un vaso de agua despacio sintiendo la temperatura.",
  "Mira por la ventana y busca 3 cosas de color verde.",
  "Estira los brazos hacia el techo durante 10 segundos.",
  "Cierra los ojos y haz 3 respiraciones profundas.",
  "Sube y baja los hombros para liberar la tensión acumulada."
];

export function Home() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  // Estados interactivos locales
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [pauseIndex, setPauseIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Preparando tu espacio...</p>
      </div>
    );
  }

  const { level, xpIntoLevel, nextLevelXp } = computeLevel(profile.xp);
  const first = profile.full_name ? profile.full_name.split(" ")[0] : "Amigo";
  const pct = Math.min(100, (xpIntoLevel / nextLevelXp) * 100);

  const isStudentRole = profile.user_type === "estudiante" || profile.user_type === "student";

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Hero Card */}
      <div className="card-soft p-6 md:p-8 gradient-hero text-white flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left relative overflow-hidden shadow-xl rounded-3xl">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative">
          <ElyMascot className="w-24 sm:w-32 md:w-36 shrink-0 drop-shadow-md" />
        </div>

        <div className="flex-1 w-full min-w-0 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Nivel {level}
          </div>
          
          <h1 className="text-2xl md:text-4xl font-extrabold truncate tracking-tight">Hola, {first} 👋</h1>
          <p className="opacity-90 text-xs md:text-sm mt-1">Qué bueno verte hoy. ¿Cómo late tu corazón?</p>
          
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold opacity-90">
              <span>Progreso de Nivel</span>
              <span>{xpIntoLevel} / {nextLevelXp} XP</span>
            </div>
            <div className="h-3 rounded-full bg-black/20 backdrop-blur-sm overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-amber-300 to-yellow-400 rounded-full transition-all duration-1000 shadow-sm" 
                style={{ width: `${pct}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Acceso Rápido */}
      <div>
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground mb-3 px-1">Exploración Rápida</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <QuickCard to="/app/chat" icon={MessageCircle} title="Hablar con Ely" desc="Estoy aquí para escucharte" color="from-purple-500 to-indigo-600" />
          <QuickCard to="/app/misiones" icon={Target} title="Misiones" desc="Suma XP hoy" color="from-emerald-500 to-teal-600" />
          
          {isStudentRole && (
            <QuickCard to="/app/encuestas" icon={FileText} title="Encuestas" desc="Queremos saber cómo estás" color="from-teal-500 to-emerald-600" />
          )}

          <QuickCard to="/app/juegos" icon={Gamepad2} title="Jugar" desc="Aprende jugando" color="from-blue-500 to-cyan-600" />
          <QuickCard to="/app/mascota" icon={Dog} title="Mascota" desc="Cuida de tu compañero" color="from-amber-500 to-orange-500" />
          <QuickCard to="/app/recursos" icon={BookOpen} title="Recursos" desc="Herramientas de apoyo" color="from-yellow-500 to-amber-600" />
          <QuickCard to="/app/avatar" icon={Sparkles} title="Avatar" desc="Personaliza tu estilo" color="from-pink-500 to-rose-600" />
          <QuickCard to="/app/perfil" icon={User} title="Perfil" desc="Tus logros y datos" color="from-indigo-500 to-purple-600" />
        </div>
      </div>

      {/* 🌟 Rincón de Bienestar Interactivo */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground px-1">Refugio Diario de Calma</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Semáforo Emocional Exprés */}
          <div className="p-5 bg-card border border-border/60 rounded-3xl shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1">
                <Heart className="w-4 h-4 fill-primary/20" />
                <span>¿Cómo te sientes ahora?</span>
              </div>
              <p className="text-xs text-muted-foreground">Toca una opción para recibir un abrazo virtual.</p>
            </div>

            <div className="flex justify-around items-center py-2">
              <button 
                onClick={() => setSelectedMood("bien")}
                className={`p-3 rounded-2xl transition-all flex flex-col items-center gap-1 cursor-pointer ${selectedMood === "bien" ? "bg-emerald-500/20 text-emerald-500 scale-110 ring-2 ring-emerald-500" : "hover:bg-secondary"}`}
              >
                <Smile className="w-7 h-7" />
                <span className="text-[10px] font-bold">Bien</span>
              </button>
              <button 
                onClick={() => setSelectedMood("neutral")}
                className={`p-3 rounded-2xl transition-all flex flex-col items-center gap-1 cursor-pointer ${selectedMood === "neutral" ? "bg-amber-500/20 text-amber-500 scale-110 ring-2 ring-amber-500" : "hover:bg-secondary"}`}
              >
                <Meh className="w-7 h-7" />
                <span className="text-[10px] font-bold">Pasable</span>
              </button>
              <button 
                onClick={() => setSelectedMood("mal")}
                className={`p-3 rounded-2xl transition-all flex flex-col items-center gap-1 cursor-pointer ${selectedMood === "mal" ? "bg-rose-500/20 text-rose-500 scale-110 ring-2 ring-rose-500" : "hover:bg-secondary"}`}
              >
                <Frown className="w-7 h-7" />
                <span className="text-[10px] font-bold">Abrumado</span>
              </button>
            </div>

            <div className="text-xs font-medium text-center bg-secondary/50 p-2.5 rounded-xl text-foreground/80 min-h-[42px] flex items-center justify-center">
              {selectedMood === "bien" && "¡Qué alegría! Aprovecha esa buena energía hoy. ✨"}
              {selectedMood === "neutral" && "Tener días tranquilos o normales está completamente bien. 🌿"}
              {selectedMood === "mal" && "Recuerda que no estás solo. Ely está aquí en el chat para ti. 💜"}
              {!selectedMood && "Haz clic en una carita para registrar tu momento."}
            </div>
          </div>

          {/* 2. Medidor de Batería Emocional / Energía */}
          <div className="p-5 bg-card border border-border/60 rounded-3xl shadow-xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-blue-500 font-bold text-sm mb-1">
                <BatteryCharging className="w-4 h-4" />
                <span>Nivel de Energía</span>
              </div>
              <p className="text-xs text-muted-foreground">¿Cuánta batería tienes para rendir hoy?</p>
            </div>

            <div className="flex justify-between items-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                    energyLevel === level
                      ? "bg-blue-600 text-white scale-105 shadow-md"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {level * 20}%
                </button>
              ))}
            </div>

            <div className="text-xs font-medium text-center bg-secondary/50 p-2.5 rounded-xl text-foreground/80 min-h-[42px] flex items-center justify-center">
              {energyLevel === 1 && "Batería baja. Prioriza descansar y no te exijas demasiado hoy. 🪫"}
              {energyLevel === 2 && "Un poco cansado. Tómate las cosas con calma y a tu ritmo. ☕"}
              {energyLevel === 3 && "Energía moderada. Buen balance para completar tus actividades. 🌱"}
              {energyLevel === 4 && "¡Buena energía! Es un gran momento para avanzar tus pendientes. 🚀"}
              {energyLevel === 5 && "¡Carga al 100%! Estás listo para romperla hoy. ⚡"}
              {!energyLevel && "Selecciona tu % de energía para ver un consejo."}
            </div>
          </div>

          {/* 3. Micro-Pausa de Desconexión */}
          <div className="p-5 bg-card border border-border/60 rounded-3xl shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                <Coffee className="w-4 h-4" />
                <span>Micro-Pausa Activa</span>
              </div>
              <button 
                onClick={() => setPauseIndex((prev) => (prev + 1) % QUICK_PAUSES.length)}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Sugerir otra pausa"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-xs md:text-sm text-foreground/90 font-medium bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10 flex-1 flex items-center">
              "{QUICK_PAUSES[pauseIndex]}"
            </div>

            <div className="text-[10px] text-muted-foreground text-right font-medium">
              Tómate 2 minutos sin pantallas 🌿
            </div>
          </div>

        </div>

        {/* Cita / Frase del día */}
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
              <Quote className="w-4 h-4" />
            </div>
            <p className="text-xs md:text-sm font-semibold italic text-foreground/90">
              "{DAILY_QUOTES[quoteIndex]}"
            </p>
          </div>
          <button 
            onClick={() => setQuoteIndex((prev) => (prev + 1) % DAILY_QUOTES.length)}
            className="p-2 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}

function QuickCard({ to, icon: Icon, title, desc, color }: any) {
  return (
    <Link 
      to={to} 
      className="card-soft p-4 hover:scale-[1.02] active:scale-[0.98] transition-all block border bg-card shadow-xs group rounded-2xl"
    >
      <div className={`rounded-xl bg-gradient-to-br ${color} inline-flex p-2.5 text-white shadow-md group-hover:rotate-3 transition-transform`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 font-bold text-sm md:text-base text-foreground group-hover:text-primary transition-colors truncate">{title}</div>
      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{desc}</div>
    </Link>
  );
}