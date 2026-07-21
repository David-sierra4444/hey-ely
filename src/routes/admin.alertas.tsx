import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession, useProfile } from "@/lib/session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Shield, User, Clock } from "lucide-react";

export const Route = createFileRoute("/admin/alertas")({ component: Alerts });

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-destructive/15 text-destructive border border-destructive/20",
  in_progress: "bg-amber-100 text-amber-800 border border-amber-200",
  attended: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  closed: "bg-slate-100 text-slate-700 border border-slate-200",
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

  // 1. Consulta optimizada para traer los datos de la alerta + perfil del estudiante
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alerts", profile?.institution_id],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("alerts")
        .select(`
          *,
          student:profiles!student_user_id (
            full_name,
            grade,
            course,
            email
          )
        `)
        .order("created_at", { ascending: false });

      // Si el directivo pertenece a una institución, filtramos solo sus alertas
      if (profile?.institution_id) {
        query = query.eq("institution_id", profile.institution_id);
      }

      const { data, error } = await query;
      if (error) console.error("Error cargando alertas:", error.message);
      return data ?? [];
    },
  });

  // 2. Escuchar nuevas alertas en TIEMPO REAL (Realtime Supabase)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime-alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => {
          qc.invalidateQueries({ queryKey: ["alerts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, qc]);

  // 3. Función para actualizar el estado de la alerta
  async function changeStatus(id: string, status: string) {
    await supabase.from("alerts").update({ status: status as any, updated_at: new Date().toISOString() }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["alerts"] });
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <AlertCircle className="text-destructive h-8 w-8" /> 
          Panel de Alertas Emocionales
        </h1>
      </div>

      <div className="card-soft p-3 text-xs text-muted-foreground flex items-center gap-2 bg-slate-50 border">
        <Shield className="h-4 w-4 text-primary shrink-0" /> 
        <span>
          Las alertas son generadas automáticamente cuando la IA detecta situaciones de riesgo. Las conversaciones nunca se muestran por privacidad.
        </span>
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="card-soft p-8 text-center text-muted-foreground animate-pulse">
            Cargando alertas...
          </div>
        )}

        {!isLoading && alerts?.length === 0 && (
          <div className="card-soft p-8 text-center text-muted-foreground">
            No hay alertas registradas por ahora.
          </div>
        )}

        {alerts?.map((a: any) => {
          const studentName = a.student?.full_name || "Estudiante no identificado";
          const studentDetails = [a.student?.grade, a.student?.course].filter(Boolean).join(" - ");

          return (
            <div key={a.id} className="card-soft p-5 border shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-destructive/10 p-2.5 text-destructive shrink-0 mt-1">
                    <AlertCircle className="h-6 w-6" />
                  </div>

                  <div>
                    {/* Nombre e información del estudiante */}
                    <div className="flex items-center gap-2 font-bold text-base text-slate-900">
                      <User className="h-4 w-4 text-slate-500" />
                      {studentName}
                      {studentDetails && (
                        <span className="text-xs font-normal text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-md">
                          {studentDetails}
                        </span>
                      )}
                    </div>

                    {/* Categoría y Nivel de Riesgo */}
                    <div className="text-sm font-semibold capitalize text-slate-700 mt-1">
                      Categoría: {a.category ? a.category.replace("_", " ") : "General"} · 
                      <span className={a.risk_level === "critical" ? "text-destructive font-extrabold ml-1" : "text-amber-600 ml-1"}>
                        Nivel {a.risk_level || "Alto"}
                      </span>
                    </div>

                    {/* Nota detectada por el Chat */}
                    {a.notes && (
                      <div className="text-xs bg-slate-100 p-2 rounded-lg text-slate-600 mt-2 italic">
                        {a.notes}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2">
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
              <div className="pt-2 border-t flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-muted-foreground mr-1">Cambiar estado:</span>
                {["pending", "in_progress", "attended", "closed"].map((s) => (
                  <button
                    key={s}
                    disabled={a.status === s}
                    onClick={() => changeStatus(a.id, s)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      a.status === s
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-slate-200 bg-white hover:bg-slate-100 text-slate-700"
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