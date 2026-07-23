import { createFileRoute, Link } from "@tanstack/react-router";
import { ElyMascot } from "@/components/brand";
import { useSession, useProfile, computeLevel } from "@/lib/session";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageCircle, 
  Target, 
  Gamepad2, 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Dog,
  User,
  FileText 
} from "lucide-react";

export const Route = createFileRoute("/app/")({ component: Home });

function getDailyPeriodKey() {
  const d = new Date();
  return `d-${d.toISOString().slice(0, 10)}`;
}

function Home() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const currentDailyKey = getDailyPeriodKey();

  const { data: missions } = useQuery({
    queryKey: ["home-missions"],
    queryFn: async () => (await supabase.from("missions").select("*").eq("active", true)).data ?? [],
  });

  const { data: userProgress } = useQuery({
    queryKey: ["home-mission-progress", user?.id, currentDailyKey],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("mission_progress")
        .select("mission_id")
        .eq("user_id", user!.id)
        .eq("period_key", currentDailyKey);
      return data ?? [];
    },
  });

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

  const completedIds = new Set(userProgress?.map((p: any) => p.mission_id) || []);
  const pendingMissions = missions?.filter((m: any) => !completedIds.has(m.id)).slice(0, 3) || [];

  // 🔒 Verificar si el usuario es estudiante
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
          
          {/* 🔒 Tarjeta de Encuestas condicional: Solo visible para estudiantes */}
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

      {/* Misiones sugeridas */}
      <div className="card-soft p-5 md:p-6 bg-card border shadow-sm rounded-3xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold">Misiones sugeridas hoy</h2>
              <p className="text-xs text-muted-foreground">Completa estas tareas para potenciar tu día</p>
            </div>
          </div>
          <Link to="/app/misiones" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pendingMissions.length === 0 ? (
            <div className="col-span-full py-6 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <div className="font-bold text-sm">¡Estás al día con todo!</div>
              <p className="text-xs text-muted-foreground">Has completado tus misiones sugeridas por hoy.</p>
            </div>
          ) : (
            pendingMissions.map((m: any) => (
              <Link 
                key={m.id} 
                to="/app/misiones" 
                className="group rounded-2xl border p-4 bg-background/50 hover:bg-secondary/60 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      +{m.xp_reward} XP
                    </span>
                  </div>
                  <div className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">{m.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{m.description}</div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary">
                  <span>Empezar misión</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))
          )}
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