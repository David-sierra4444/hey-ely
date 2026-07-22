import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "@/lib/session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ClipboardList, CheckCircle, Send, ArrowLeft, Clock } from "lucide-react";

export const Route = createFileRoute("/app/encuestas")({
  component: StudentSurveys,
});

interface Question {
  text: string;
  options?: string[];
}

interface Survey {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  institution_id: string;
  created_at: string;
}

function StudentSurveys() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Obtener la institución asociada al perfil del estudiante
  const { data: studentProfile } = useQuery({
    queryKey: ["student-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("institution_id")
        .eq("id", user!.id)
        .maybeSingle();
      return data;
    },
  });

  const institutionId = studentProfile?.institution_id;

  // 2. Obtener encuestas PUBLICADAS para la institución del estudiante
  const { data: surveys, isLoading: loadingSurveys } = useQuery({
    queryKey: ["student-surveys", institutionId],
    enabled: !!institutionId,
    queryFn: async () => {
      const { data } = await supabase
        .from("surveys")
        .select("*")
        .eq("institution_id", institutionId)
        .eq("published", true)
        .order("created_at", { ascending: false });
      return (data as Survey[]) ?? [];
    },
  });

  // 3. Consultar la tabla survey_responses usando user_id para verificar qué encuestas ya respondió
  const { data: completedResponses } = useQuery({
    queryKey: ["student-responses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("survey_responses")
        .select("survey_id")
        .eq("user_id", user!.id);
      return data?.map((r) => r.survey_id) ?? [];
    },
  });

  // Registrar respuesta seleccionada
  const handleSelectAnswer = (questionIndex: number, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  // Guardar respuestas en Supabase
  const handleSubmit = async () => {
    if (!selectedSurvey || !user) return;

    const totalQuestions = selectedSurvey.questions.length;
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < totalQuestions) {
      toast.error(`Por favor responde todas las preguntas (${answeredCount}/${totalQuestions}).`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Inserción exacta mapeada a tus columnas: survey_id, user_id, answers
      const { error } = await supabase.from("survey_responses").insert({
        survey_id: selectedSurvey.id,
        user_id: user.id,
        answers: answers,
      });

      if (error) throw error;

      toast.success("¡Gracias! Tus respuestas han sido enviadas exitosamente.");
      setSelectedSurvey(null);
      setAnswers({});
      qc.invalidateQueries({ queryKey: ["student-responses"] });
    } catch (err: any) {
      toast.error(err.message || "Error al enviar la encuesta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Encabezado */}
      <div className="flex flex-col gap-1">
        <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 w-fit">
          Bienestar Estudiantil
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
          Encuestas y Cuestionarios
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground">
          Responde estas encuestas breves para ayudarnos a entender cómo te sientes.
        </p>
      </div>

      {/* VISTA 1: FORMULARIO DE RESPUESTA A LA ENCUESTA */}
      {selectedSurvey ? (
        <div className="card-soft p-6 rounded-3xl bg-card border border-primary/30 shadow-md space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => {
              setSelectedSurvey(null);
              setAnswers({});
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a las encuestas
          </button>

          <div className="border-b border-border/60 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary text-primary border border-border/50">
              {selectedSurvey.category}
            </span>
            <h2 className="text-xl font-extrabold text-foreground mt-2">{selectedSurvey.title}</h2>
            {selectedSurvey.description && (
              <p className="text-xs text-muted-foreground mt-1">{selectedSurvey.description}</p>
            )}
          </div>

          {/* Preguntas de la encuesta */}
          <div className="space-y-6">
            {selectedSurvey.questions.map((q, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-3">
                <p className="text-sm font-bold text-foreground">
                  {idx + 1}. {q.text}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(q.options || ["Nunca", "A veces", "Frecuente", "Siempre"]).map((opt) => {
                    const isSelected = answers[idx] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleSelectAnswer(idx, opt)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-xs"
                            : "bg-background hover:bg-muted text-foreground border-border"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Botón para enviar respuestas */}
          <div className="flex justify-end pt-4 border-t border-border/60">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-2xl bg-primary text-primary-foreground px-6 py-2.5 text-sm font-bold flex items-center gap-2 shadow-sm hover:opacity-95 transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Enviando..." : "Enviar Respuestas"}
            </button>
          </div>
        </div>
      ) : (
        /* VISTA 2: TARJETAS DE ENCUESTAS DISPONIBLES */
        <div className="space-y-3">
          {loadingSurveys && (
            <div className="p-12 text-center text-xs text-muted-foreground animate-pulse font-medium">
              Cargando encuestas disponibles...
            </div>
          )}

          {!loadingSurveys && surveys?.length === 0 && (
            <div className="p-12 text-center text-muted-foreground space-y-2 rounded-3xl bg-card border border-border/60">
              <ClipboardList className="w-8 h-8 mx-auto opacity-40 text-primary" />
              <p className="text-sm font-medium">No hay encuestas pendientes en este momento.</p>
            </div>
          )}

          {surveys?.map((s) => {
            const isCompleted = completedResponses?.includes(s.id);

            return (
              <div
                key={s.id}
                className="p-5 rounded-3xl bg-card border border-border/60 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-secondary text-primary border border-border/50">
                      {s.category}
                    </span>
                    {isCompleted ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Respondida
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Pendiente
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-foreground">{s.title}</h3>
                  {s.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
                  )}
                </div>

                <div className="shrink-0 flex justify-end">
                  {isCompleted ? (
                    <button
                      disabled
                      className="rounded-xl px-4 py-2 text-xs font-bold bg-muted text-muted-foreground cursor-not-allowed"
                    >
                      Completada
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedSurvey(s)}
                      className="rounded-xl bg-primary text-primary-foreground px-5 py-2 text-xs font-bold shadow-xs hover:opacity-95 transition-all"
                    >
                      Responder
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}