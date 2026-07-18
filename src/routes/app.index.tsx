import { createFileRoute, Link } from "@tanstack/react-router";
import { ElyMascot } from "@/components/brand";
import { useSession, useProfile, computeLevel } from "@/lib/session";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Target, Gamepad2, BookOpen, Sparkles, Newspaper, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/app/")({ component: Home });

function Home() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const { data: missions } = useQuery({
    queryKey: ["home-missions"],
    queryFn: async () => (await supabase.from("missions").select("*").eq("active", true).limit(4)).data ?? [],
  });

  if (!profile) return <div className="text-center py-20">Cargando...</div>;
  const { level, xpIntoLevel, nextLevelXp } = computeLevel(profile.xp);
  const first = profile.full_name.split(" ")[0];
  const pct = Math.min(100, (xpIntoLevel / nextLevelXp) * 100);

  return (
    // CAMBIO 1: Aseguramos que el contenedor base de la app no permita desbordes horizontales (w-full max-w-full overflow-x-hidden)
    <div className="space-y-6 w-full max-w-full overflow-x-hidden px-1 pb-4">
      
      {/* CAMBIO 2: Cambiamos flex-row a flex-col en celulares pequeños para que la mascota y el texto no se aplasten */}
      <div className="card-soft p-5 md:p-6 gradient-hero text-white flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        {/* Mascota un poco más pequeña en móvil para que no empuje el layout */}
        <ElyMascot className="w-20 sm:w-28 md:w-36 shrink-0" />
        <div className="flex-1 w-full min-w-0"> {/* min-w-0 evita que los textos rompan el flex */}
          <div className="text-xs md:text-sm opacity-90">Nivel {level}</div>
          <h1 className="text-2xl md:text-4xl font-extrabold truncate">Hola, {first} 👋</h1>
          <p className="opacity-95 text-xs md:text-sm">Qué bueno verte hoy. ¿Cómo te sientes?</p>
          <div className="mt-3">
            <div className="h-2.5 rounded-full bg-white/25 overflow-hidden">
              <div className="h-full bg-white" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-[10px] sm:text-xs mt-1 opacity-90">{xpIntoLevel} / {nextLevelXp} XP para el próximo nivel</div>
          </div>
        </div>
      </div>

      {/* 
        CAMBIO 3: EL PROBLEMA PRINCIPAL. 
        Cambiamos 'grid-cols-2' a 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'. 
        En celulares irá una tarjeta debajo de otra de forma limpia y 100% responsiva sin estirar la pantalla.
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <QuickCard to="/app/chat" icon={MessageCircle} title="Hablar con Ely" desc="Estoy aquí para escucharte" />
        <QuickCard to="/app/misiones" icon={Target} title="Misiones" desc="Suma XP hoy" />
        <QuickCard to="/app/juegos" icon={Gamepad2} title="Jugar" desc="Aprende jugando" />
        <QuickCard to="/app/recursos" icon={BookOpen} title="Recursos" desc="Aprende algo nuevo" />
        <QuickCard to="/app/avatar" icon={Sparkles} title="Personaliza tu avatar" desc="Hazlo tuyo" />
        <QuickCard to="/app/noticias" icon={Newspaper} title="Noticias" desc="Tu institución" />
      </div>

      <div className="card-soft p-5 md:p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg md:text-xl font-bold">Misiones sugeridas hoy</h2>
        </div>
        {/* CAMBIO 4: Aseguramos grid de misiones limpio */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
          {missions?.map((m: any) => (
            <Link key={m.id} to="/app/misiones" className="rounded-2xl border p-3 hover:bg-secondary block min-w-0">
              <div className="font-bold text-sm truncate">{m.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-2">{m.description}</div>
              <div className="mt-1 text-xs font-bold text-primary">+{m.xp_reward} XP</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickCard({ to, icon: Icon, title, desc }: any) {
  return (
    // CAMBIO 5: Agregamos 'min-w-0' y quitamos desbordes de texto internos
    <Link to={to} className="card-soft p-4 hover:scale-[1.02] transition block min-w-0">
      <div className="rounded-xl gradient-mint inline-flex p-2 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-2 font-bold text-sm md:text-base break-words">{title}</div>
      <div className="text-xs text-muted-foreground line-clamp-2">{desc}</div>
    </Link>
  );
}