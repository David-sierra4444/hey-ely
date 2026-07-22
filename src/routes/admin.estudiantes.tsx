import { createFileRoute } from "@tanstack/react-router";
import { useSession, computeLevel } from "@/lib/session";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Users, Search, GraduationCap, Award, Zap } from "lucide-react";

export const Route = createFileRoute("/admin/estudiantes")({ component: StudentsList });

function StudentsList() {
  const { user } = useSession();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: inst } = useQuery({
    queryKey: ["my-inst", user?.id], 
    enabled: !!user,
    queryFn: async () => (await supabase.from("institutions").select("id").eq("admin_user_id", user!.id).maybeSingle()).data,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["students-full", inst?.id], 
    enabled: !!inst,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("institution_id", inst!.id).eq("user_type", "student").order("full_name")).data ?? [],
  });

  // Filtrar estudiantes por el buscador rápido
  const filteredData = data?.filter((s: any) => 
    s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Encabezado y Buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Control Estudiantil
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Estudiantes</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Total matriculados: <strong className="text-foreground">{data?.length ?? 0}</strong>
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            placeholder="Buscar por nombre, grado..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border bg-card pl-10 pr-4 py-2.5 text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Tabla de Estudiantes */}
      <div className="card-soft overflow-hidden rounded-3xl bg-card border border-border/60 shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground animate-pulse font-medium">
            Cargando estudiantes...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/60 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60">
                <tr>
                  <th className="p-4">Nombre</th>
                  <th className="p-4">Edad</th>
                  <th className="p-4">Grado</th>
                  <th className="p-4">Curso</th>
                  <th className="p-4">Nivel</th>
                  <th className="p-4">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredData?.map((s: any) => {
                  const calculatedLevel = computeLevel ? computeLevel(s.xp ?? 0).level : s.level;
                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-bold text-foreground flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-extrabold text-xs shrink-0 border border-primary/20">
                          {s.full_name?.charAt(0)?.toUpperCase() || "E"}
                        </div>
                        <span className="truncate max-w-[180px] sm:max-w-xs">{s.full_name}</span>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs font-medium">{s.age ?? "-"}</td>
                      <td className="p-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-primary opacity-80" />
                          <span>{s.grade ?? "-"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium">{s.course ?? "-"}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                          <Award className="w-3 h-3" /> {calculatedLevel}
                        </span>
                      </td>
                      <td className="p-4 font-black text-foreground">
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Zap className="w-3 h-3" /> {s.xp ?? 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredData?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-muted-foreground space-y-2">
                      <Users className="w-8 h-8 mx-auto opacity-40 text-primary" />
                      <p className="text-sm font-medium">Aún no hay estudiantes registrados o que coincidan con la búsqueda.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}