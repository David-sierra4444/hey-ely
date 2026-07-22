import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useSession, useProfile } from "@/lib/session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Shield, User, Clock, Search, CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/alertas")({ component: Alerts });

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-destructive/15 text-destructive border border-destructive/20",
  in_progress: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  attended: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
  closed: "bg-muted text-muted-foreground border border-border",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En proceso",
  attended: "Atendida",
  closed: "Cerrada",
};

function Alerts() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // 1. Consulta optimizada y robusta de alertas junto con perfiles
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alerts-full", profile?.institution_id],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (profile?.institution_id) {
        query = query.eq("institution_id", profile.institution_id);
      }

      const { data: alertsData, error } = await query;
      if (error) {
        console.error("Error cargando alertas:", error.message);
        return [];
      }

      if (!alertsData || alertsData.length === 0) return [];

      // Extraer IDs únicos de estudiantes para traer sus perfiles de forma segura
      const studentIds = [...new Set(alertsData.map((a: any) => a.student_user_id).filter(Boolean))];

      let profilesMap: Record<string, any> = {};
      if (studentIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, grade, course, email")
          .in("id", studentIds);

        if (profilesData) {
          profilesMap = profilesData.reduce((acc: any, p: any) => {
            acc[p.id] = p;
            return acc;
          }, {});
        }
      }

      // Combinar la alerta con los datos del estudiante
      return alertsData.map((a: any) => ({
        ...a,
        student: profilesMap[a.student_user_id] || null,
      }));
    },
  });

  // 2. Escuchar nuevas alertas en TIEMPO REAL
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime-alerts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => {
          qc.invalidateQueries({ queryKey: ["alerts-full"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, qc]);

  // 3. Función para actualizar el estado de la alerta
  async function changeStatus(id: string, status: string) {
    await supabase
      .from("alerts")
      .update({ status: status as any, updated_at: new Date().toISOString() })
      .eq("id", id);
    qc.invalidateQueries({ queryKey: ["alerts-full"] });
  }

  // Filtrar alertas según búsqueda y estado seleccionado
  const filteredAlerts = alerts?.filter((a: any) => {
    const studentName = a.student?.full_name?.toLowerCase() || "";
    const notes = a.notes?.toLowerCase() || "";
    const category = a.category?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch = studentName.includes(search) || notes.includes(search) || category.includes(search);
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = alerts?.filter((a: any) => a.status === "pending").length ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
              Seguridad y Bienestar
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2">
            Panel de Alertas
            {pendingCount > 0 && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-destructive text-destructive-foreground animate-pulse font-bold">
                {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
              </span>
            )}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Monitoreo de situaciones de riesgo detectadas por la IA en la institución.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            placeholder="Buscar por estudiante, nota..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border bg-card pl-10 pr-4 py-2 text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Aviso de Privacidad */}
      <div className="card-soft p-4 rounded-2xl text-xs text-muted-foreground flex items-center gap-3 bg-secondary/40 border border-border/60 shadow-xs">
        <Shield className="h-5 w-5 text-primary shrink-0" /> 
        <span>
          Las alertas se generan de forma automatizada cuando la IA detecta indicadores de riesgo emocional. Por estricta privacidad, las transcripciones de las conversaciones privadas del chat nunca se exponen.
        </span>
      </div>

      {/* Filtros rápidos por estado */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { key: "all", label: "Todas" },
          { key: "pending", label: "Pendientes" },
          { key: "in_progress", label: "En proceso" },
          { key: "attended", label: "Atendidas" },
          { key: "closed", label: "Cerradas" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 ${
              statusFilter === f.key
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-card text-muted-foreground border-border hover:bg-muted/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Listado de Alertas */}
      <div className="space-y-3">
        {isLoading && (
          <div className="card-soft p-12 text-center text-xs text-muted-foreground animate-pulse font-medium">
            Cargando alertas institucionales...
          </div>
        )}

        {!isLoading && filteredAlerts?.length === 0 && (
          <div className="card-soft p-12 text-center text-muted-foreground space-y-2 rounded-3xl bg-card border border-border/60">
            <CheckCircle2 className="w-8 h-8 mx-auto opacity-40 text-emerald-500" />
            <p className="text-sm font-medium">No hay alertas registradas que coincidan con los filtros.</p>
          </div>
        )}

        {filteredAlerts?.map((a: any) => {
          const studentName = a.student?.full_name || "Estudiante no identificado";
          const studentDetails = [a.student?.grade, a.student?.course].filter(Boolean).join(" - ");

          return (
            <div key={a.id} className="card-soft p-5 rounded-3xl bg-card border border-border/60 shadow-xs hover:shadow-md transition-all space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-destructive/10 p-3 text-destructive shrink-0 border border-destructive/20 mt-0.5">
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 font-bold text-base text-foreground">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{studentName}</span>
                      {studentDetails && (
                        <span className="text-[11px] font-semibold text-muted-foreground bg-secondary px-2.5 py-0.5 rounded-lg border border-border/50">
                          {studentDetails}
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-2 pt-0.5">
                      <span className="capitalize">Categoría: <strong className="text-foreground">{a.category ? a.category.replace(/_/g, " ") : "General"}</strong></span>
                      <span>•</span>
                      <span className={a.risk_level === "critical" ? "text-destructive font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>
                        Nivel de riesgo: {a.risk_level || "Alto"}
                      </span>
                    </div>

                    {a.notes && (
                      <div className="text-xs bg-muted/50 p-3 rounded-2xl text-foreground/80 mt-2 border border-border/40 italic">
                        "{a.notes}"
                      </div>
                    )}

                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                      <Clock className="h-3 w-3" />
                      Generada el {new Date(a.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-bold shrink-0 ${STATUS_COLORS[a.status] || STATUS_COLORS.pending}`}>
                  {STATUS_LABEL[a.status] || a.status}
                </span>
              </div>

              {/* Botones de acción del directivo */}
              <div className="pt-3 border-t border-border/60 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-muted-foreground mr-1">Cambiar estado:</span>
                {["pending", "in_progress", "attended", "closed"].map((s) => (
                  <button
                    key={s}
                    disabled={a.status === s}
                    onClick={() => changeStatus(a.id, s)}
                    className={`rounded-xl px-3 py-1 text-xs font-semibold transition-all ${
                      a.status === s
                        ? "bg-primary text-primary-foreground shadow-xs cursor-default"
                        : "border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}