import { createFileRoute } from "@tanstack/react-router";
import { useSession, useProfile, computeLevel } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AvatarSVG } from "@/components/avatar-svg";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { LogOut, Save, UserCheck, Trophy, Gamepad2, Zap } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/perfil")({ component: ProfilePage });

function ProfilePage() {
  const { user } = useSession(); 
  const { profile, setProfile } = useProfile(user?.id);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");

  // Sincronizar el input con el nombre actual del perfil al cargar
  useEffect(() => {
    if (profile?.full_name) {
      setName(profile.full_name);
    }
  }, [profile?.full_name]);

  const { data: avatar } = useQuery({
    queryKey: ["avatar", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("avatars").select("config").eq("user_id", user!.id).maybeSingle()).data,
  });

  const { data: sessions } = useQuery({
    queryKey: ["sessions", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("game_sessions").select("*").eq("user_id", user!.id)).data ?? [],
  });

  const { data: doneMissions } = useQuery({
    queryKey: ["donem", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("mission_progress").select("*").eq("user_id", user!.id)).data ?? [],
  });

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground text-sm font-medium animate-pulse">
        Cargando perfil...
      </div>
    );
  }

  const { level, xpIntoLevel, nextLevelXp } = computeLevel(profile.xp);
  const pct = Math.min(100, Math.max(0, (xpIntoLevel / nextLevelXp) * 100));

  async function saveName() {
    if (!name.trim() || !user) {
      toast.error("El nombre no puede estar vacío.");
      return;
    }
    
    try {
      const { error } = await supabase.from("profiles").update({ full_name: name.trim() }).eq("id", user.id);
      if (error) throw error;

      setProfile({ ...profile, full_name: name.trim() });
      toast.success("¡Nombre actualizado con éxito!");
      qc.invalidateQueries();
    } catch (err: any) {
      toast.error("Error al actualizar el nombre.");
    }
  }

  async function logout() { 
    await supabase.auth.signOut(); 
    navigate({ to: "/auth" }); 
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12 animate-in fade-in duration-500">
      
      {/* Tarjeta de Rango y Avatar */}
      <div className="card-soft p-5 md:p-6 gradient-hero text-white flex flex-col sm:flex-row items-center gap-5 rounded-3xl shadow-md">
        <div className="rounded-3xl bg-white/20 p-3 shadow-inner shrink-0 border border-white/30 backdrop-blur-xs">
          <AvatarSVG config={(avatar?.config as any) ?? {}} size={90} />
        </div>
        <div className="flex-1 text-center sm:text-left w-full">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
              Nivel {level}
            </span>
            <span className="text-xs opacity-90 font-medium">· Racha de {profile.streak_days} días 🔥</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-1 truncate">{profile.full_name}</h1>
          <div className="text-xs md:text-sm opacity-90 mt-0.5 font-medium">{profile.xp} XP acumulados</div>
          
          {/* Barra de Progreso XP */}
          <div className="mt-3.5 space-y-1">
            <div className="flex justify-between text-[11px] opacity-90 font-semibold">
              <span>Progreso al Nivel {level + 1}</span>
              <span>{Math.round(pct)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/25 overflow-hidden p-0.5 border border-white/20">
              <div className="h-full bg-white rounded-full transition-all duration-500 shadow-sm" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <Stat icon={Trophy} title="Misiones" value={doneMissions?.length ?? 0} />
        <Stat icon={Gamepad2} title="Juegos" value={sessions?.length ?? 0} />
        <Stat icon={Zap} title="XP Total" value={profile.xp} />
      </div>

      {/* Configuración de Cuenta */}
      <div className="card-soft p-5 md:p-6 space-y-4 rounded-3xl bg-card border border-border/60 shadow-xs">
        <div className="flex items-center gap-2 border-b pb-3">
          <UserCheck className="w-5 h-5 text-primary" />
          <h2 className="text-base md:text-lg font-bold">Configuración de Cuenta</h2>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tu Nombre</label>
          <div className="flex gap-2 items-center">
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Escribe tu nombre..."
              className="flex-1 rounded-2xl border bg-background px-4 py-3 text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
            />
            <button 
              onClick={saveName} 
              disabled={!name.trim() || name === profile.full_name}
              className="rounded-2xl bg-primary text-primary-foreground px-4 py-3 font-bold disabled:opacity-50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-md shrink-0 cursor-pointer"
              title="Guardar cambios"
            >
              <Save className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button 
            onClick={logout} 
            className="w-full rounded-2xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive py-3.5 px-4 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer active:scale-98"
          >
            <LogOut className="h-4 w-4" /> 
            Cerrar sesión de forma segura
          </button>
        </div>
      </div>

    </div>
  );
}

function Stat({ icon: Icon, title, value }: { icon: any; title: string; value: number }) {
  return (
    <div className="card-soft p-4 text-center rounded-2xl bg-card border border-border/60 shadow-2xs flex flex-col items-center justify-center space-y-1">
      <Icon className="w-4 h-4 text-primary opacity-80" />
      <div className="text-xl md:text-2xl font-black text-foreground">{value}</div>
      <div className="text-[11px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</div>
    </div>
  );
}