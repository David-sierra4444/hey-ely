import { createFileRoute } from "@tanstack/react-router";
import { useSession, useProfile } from "@/lib/session";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, ClipboardList, Bell, Gamepad2, BookOpen, TrendingUp, ShieldAlert, Building2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export const Route = createFileRoute("/admin/")({ component: AdminHome });

const COLORS = ["#8FB4E8", "#F3B4C6", "#B0DFC9", "#C7B4EA", "#F5D488", "#F19B84"];

function AdminHome() {
  const { user } = useSession(); 
  const { profile } = useProfile(user?.id);

  // Obtener institución del admin
  const { data: inst, isLoading: loadingInst } = useQuery({
    queryKey: ["my-inst", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("institutions").select("*").eq("admin_user_id", user!.id).maybeSingle()).data,
  });

  // Obtener estudiantes de la institución
  const { data: students } = useQuery({
    queryKey: ["students", inst?.id],
    enabled: !!inst,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("institution_id", inst!.id).eq("user_type", "student")).data ?? [],
  });

  // Obtener alertas de la institución
  const { data: alerts } = useQuery({
    queryKey: ["alerts-count", inst?.id],
    enabled: !!inst,
    queryFn: async () => (await supabase.from("alerts").select("id,status").eq("institution_id", inst!.id)).data ?? [],
  });

  // Obtener encuestas
  const { data: surveys } = useQuery({
    queryKey: ["surveys-count", inst?.id],
    enabled: !!inst,
    queryFn: async () => (await supabase.from("surveys").select("id").eq("institution_id", inst!.id)).data ?? [],
  });

  // Obtener sesiones de juego de los estudiantes de la institución de manera segura
  const { data: games } = useQuery({
    queryKey: ["adm-games", inst?.id, students?.length],
    enabled: !!inst && Array.isArray(students),
    queryFn: async () => {
      if (!students || students.length === 0) return [];
      const studentIds = students.map((s: any) => s.id);
      const { data } = await supabase
        .from("game_sessions")
        .select("game_key, xp_earned")
        .in("user_id", studentIds);
      return data ?? [];
    },
  });

  if (loadingInst) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground text-sm font-medium animate-pulse">
        Cargando panel de administración...
      </div>
    );
  }

  const byGrade = Object.entries((students ?? []).reduce<Record<string, number>>((acc, s: any) => {
    const g = s.grade ?? "S/G"; acc[g] = (acc[g] ?? 0) + 1; return acc;
  }, {})).map(([k, v]) => ({ name: k, value: v }));

  const byAge = Object.entries((students ?? []).reduce<Record<string, number>>((acc, s: any) => {
    const g = String(s.age ?? "?"); acc[g] = (acc[g] ?? 0) + 1; return acc;
  }, {})).map(([k, v]) => ({ name: k, value: v }));

  const avgXp = students?.length ? Math.round(students.reduce((a: number, s: any) => a + (s.xp ?? 0), 0) / students.length) : 0;
  const activeAlertsCount = alerts?.filter((a: any) => a.status !== "closed" && a.status !== "attended").length ?? 0;
  const activeStudentsCount = students?.filter((s: any) => s.xp > 0).length ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Encabezado del Panel */}
      <div className="card-soft p-5 md:p-6 bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 rounded-3xl shadow-sm flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              {profile?.position || "Administrador"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">{inst?.name ?? "Tu Institución"}</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            {inst?.city ? `${inst.city}, ${inst.department}` : "Panel de control institucional"}
          </p>
        </div>
      </div>

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat icon={Users} label="Estudiantes" value={students?.length ?? 0} color="var(--primary)" />
        <Stat icon={Bell} label="Alertas Activas" value={activeAlertsCount} color="#f43f5e" />
        <Stat icon={ClipboardList} label="Encuestas" value={surveys?.length ?? 0} color="#10b981" />
        <Stat icon={TrendingUp} label="XP Promedio" value={avgXp} color="#8b5cf6" />
      </div>

      {/* Gráficas Estadísticas */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-soft p-5 rounded-3xl bg-card border border-border/60 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-foreground">Estudiantes por Grado</h3>
          <div className="h-56 w-full">
            {byGrade.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byGrade}>
                  <XAxis dataKey="name" fontSize={11} stroke="currentColor" opacity={0.7} />
                  <YAxis fontSize={11} stroke="currentColor" opacity={0.7} />
                  <Tooltip contentStyle={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }} />
                  <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Sin datos de grados registrados</div>
            )}
          </div>
        </div>

        <div className="card-soft p-5 rounded-3xl bg-card border border-border/60 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-foreground">Distribución por Edad</h3>
          <div className="h-56 w-full flex items-center justify-center">
            {byAge.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byAge} dataKey="value" nameKey="name" outerRadius={70} label fontSize={11}>
                    {byAge.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">Sin datos de edades registrados</div>
            )}
          </div>
        </div>
      </div>

      {/* Métricas Secundarias de Actividad */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card-soft p-5 rounded-3xl bg-card border border-border/60 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Actividad de Juegos</h3>
            <div className="text-2xl font-black text-foreground mt-0.5">{games?.length ?? 0}</div>
            <div className="text-xs text-muted-foreground">Partidas jugadas totales en la institución</div>
          </div>
        </div>

        <div className="card-soft p-5 rounded-3xl bg-card border border-border/60 shadow-xs flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Cobertura Estudiantil</h3>
            <div className="text-sm font-bold text-foreground mt-1">
              Activos con XP &gt; 0: <strong className="text-primary">{activeStudentsCount}</strong> de {students?.length ?? 0}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Estudiantes interactuando activamente</div>
          </div>
        </div>
      </div>

    </div>
  );
}

function Stat({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="card-soft p-4 rounded-2xl bg-card border border-border/60 shadow-2xs flex flex-col justify-between space-y-2">
      <div className="rounded-xl inline-flex p-2 w-fit text-white shadow-xs" style={{ background: color }}>
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-2xl md:text-3xl font-black text-foreground">{value}</div>
        <div className="text-[11px] md:text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-0.5">{label}</div>
      </div>
    </div>
  );
}