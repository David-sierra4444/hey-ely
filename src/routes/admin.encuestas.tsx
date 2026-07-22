import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "@/lib/session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Send, Trash2, ClipboardList, HelpCircle, Layers, CheckCircle2, X } from "lucide-react";

export const Route = createFileRoute("/admin/encuestas")({ component: Surveys });

const CATEGORIES = [
  "Ansiedad", 
  "Estrés", 
  "Autoestima", 
  "Bullying", 
  "Ciberbullying", 
  "Relaciones familiares", 
  "Proyecto de vida", 
  "Clima escolar", 
  "Bienestar emocional"
];

function Surveys() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", description: "", category: "Ansiedad", questions: "" });

  const { data: inst } = useQuery({
    queryKey: ["my-inst", user?.id], 
    enabled: !!user,
    queryFn: async () => (await supabase.from("institutions").select("id").eq("admin_user_id", user!.id).maybeSingle()).data,
  });

  const { data: surveys, isLoading } = useQuery({
    queryKey: ["surveys", user?.id], 
    enabled: !!user,
    queryFn: async () => (await supabase.from("surveys").select("*").eq("admin_user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  async function create() {
    if (!user || !inst) return;
    if (!f.title.trim() || !f.questions.trim()) {
      toast.error("Por favor completa el título y al menos una pregunta.");
      return;
    }

    const questions = f.questions.split("\n").filter(Boolean).map((q) => ({ text: q, options: ["Nunca", "A veces", "Frecuente", "Siempre"] }));
    const { error } = await supabase.from("surveys").insert({
      admin_user_id: user.id, 
      institution_id: inst.id, 
      title: f.title, 
      description: f.description, 
      category: f.category, 
      questions,
      published: false
    });

    if (error) return toast.error(error.message);
    toast.success("Encuesta creada exitosamente");
    setOpen(false); 
    setF({ title: "", description: "", category: "Ansiedad", questions: "" });
    qc.invalidateQueries({ queryKey: ["surveys"] });
  }

  async function publish(id: string, published: boolean) {
    const { error } = await supabase.from("surveys").update({ published: !published }).eq("id", id);
    if (error) {
      toast.error("Error al actualizar estado");
      return;
    }
    toast.success(published ? "Encuesta despublicada" : "Encuesta publicada para los estudiantes");
    qc.invalidateQueries({ queryKey: ["surveys"] });
  }

  async function del(id: string) {
    if (!window.confirm("¿Estás seguro de eliminar esta encuesta?")) return;
    const { error } = await supabase.from("surveys").delete().eq("id", id);
    if (error) {
      toast.error("No se pudo eliminar");
      return;
    }
    toast.success("Encuesta eliminada");
    qc.invalidateQueries({ queryKey: ["surveys"] });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Encabezado y Botón Nueva */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Evaluación Psicoemocional
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Gestión de Encuestas</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Crea y publica cuestionarios de bienestar para tus estudiantes.
          </p>
        </div>

        <button 
          onClick={() => setOpen(!open)} 
          className="rounded-2xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-bold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-all"
        >
          {open ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />} 
          {open ? "Cancelar" : "Nueva Encuesta"}
        </button>
      </div>

      {/* Formulario Desplegable para Crear Encuesta */}
      {open && (
        <div className="card-soft p-6 rounded-3xl bg-card border border-primary/30 shadow-md space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Crear Nuevo Cuestionario</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Título de la Encuesta</label>
              <input 
                placeholder="Ej. Evaluación de Niveles de Estrés Académico" 
                value={f.title} 
                onChange={(e) => setF({ ...f, title: e.target.value })} 
                className="w-full rounded-2xl border bg-background px-4 py-2.5 text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Categoría</label>
                <select 
                  value={f.category} 
                  onChange={(e) => setF({ ...f, category: e.target.value })} 
                  className="w-full rounded-2xl border bg-background px-4 py-2.5 text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">Descripción Breve</label>
                <input 
                  placeholder="Instrucciones para el estudiante..." 
                  value={f.description} 
                  onChange={(e) => setF({ ...f, description: e.target.value })} 
                  className="w-full rounded-2xl border bg-background px-4 py-2.5 text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1 flex items-center justify-between">
                <span>Preguntas (Una por línea)</span>
                <span className="text-[10px] text-muted-foreground font-normal">Opciones por defecto: Nunca, A veces, Frecuente, Siempre</span>
              </label>
              <textarea 
                placeholder="¿Te has sentido abrumado esta semana?&#10;¿Duermes bien por las noches?&#10;..." 
                value={f.questions} 
                onChange={(e) => setF({ ...f, questions: e.target.value })} 
                rows={5} 
                className="w-full rounded-2xl border bg-background p-4 text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
              />
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={create} 
                className="rounded-2xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold shadow-sm hover:opacity-95 transition-all"
              >
                Guardar y Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listado de Encuestas */}
      <div className="space-y-3">
        {isLoading && (
          <div className="card-soft p-12 text-center text-xs text-muted-foreground animate-pulse font-medium">
            Cargando encuestas institucionales...
          </div>
        )}

        {!isLoading && surveys?.length === 0 && (
          <div className="card-soft p-12 text-center text-muted-foreground space-y-2 rounded-3xl bg-card border border-border/60">
            <ClipboardList className="w-8 h-8 mx-auto opacity-40 text-primary" />
            <p className="text-sm font-medium">Aún no has creado ninguna encuesta.</p>
          </div>
        )}

        {surveys?.map((s: any) => {
          const questionCount = Array.isArray(s.questions) ? s.questions.length : 0;
          return (
            <div key={s.id} className="card-soft p-5 rounded-3xl bg-card border border-border/60 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0 mt-0.5">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-secondary text-primary border border-border/50">
                      {s.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.published ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"}`}>
                      {s.published ? "Activa / Publicada" : "Borrador"}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-foreground mt-0.5">{s.title}</h3>
                  {s.description && <p className="text-xs text-muted-foreground line-clamp-1">{s.description}</p>}
                  
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                    <HelpCircle className="h-3 w-3" />
                    <span>{questionCount} pregunta{questionCount !== 1 ? "s" : ""} configurada{questionCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-border/60 justify-end">
                <button 
                  onClick={() => publish(s.id, s.published)} 
                  className={`rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-1.5 transition-all ${
                    s.published 
                      ? "border border-border bg-card hover:bg-muted text-muted-foreground" 
                      : "bg-primary text-primary-foreground shadow-xs hover:opacity-95"
                  }`}
                >
                  <Send className="h-3.5 w-3.5" /> 
                  {s.published ? "Despublicar" : "Publicar"}
                </button>

                <button 
                  onClick={() => del(s.id)} 
                  className="rounded-xl border border-border/80 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  title="Eliminar encuesta"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}