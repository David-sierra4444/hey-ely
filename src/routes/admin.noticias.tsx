import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSession } from "@/lib/session";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Newspaper, Megaphone } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/noticias")({ component: NewsAdmin });

function NewsAdmin() {
  const { user } = useSession();
  const qc = useQueryClient();
  const [f, setF] = useState({ title: "", body: "" });
  const [publishing, setPublishing] = useState(false);

  // Obtener la institución asociada al admin actual
  const { data: inst, isLoading: loadingInst } = useQuery({
    queryKey: ["my-inst", user?.id], 
    enabled: !!user,
    queryFn: async () => (await supabase.from("institutions").select("id").eq("admin_user_id", user!.id).maybeSingle()).data,
  });

  // Obtener las noticias publicadas
  const { data: newsList, isLoading: loadingNews } = useQuery({
    queryKey: ["news-admin"], 
    enabled: !!user,
    queryFn: async () => (await supabase.from("news").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  async function publish() {
    if (!user) {
      toast.error("Debes iniciar sesión.");
      return;
    }
    if (!inst) {
      toast.error("No se encontró una institución asociada a tu cuenta de administrador.");
      return;
    }
    if (!f.title.trim() || !f.body.trim()) {
      toast.error("Por favor completa el título y el contenido.");
      return;
    }

    setPublishing(true);
    try {
      const { error } = await supabase.from("news").insert({ 
        admin_user_id: user.id, 
        institution_id: inst.id, 
        title: f.title.trim(), 
        body: f.body.trim() 
      });

      if (error) throw error;

      toast.success("¡Noticia publicada con éxito!");
      setF({ title: "", body: "" });
      qc.invalidateQueries({ queryKey: ["news-admin"] });
    } catch (err: any) {
      toast.error(err.message || "Error al publicar la noticia.");
    } finally {
      setPublishing(false);
    }
  }

  async function del(id: string) {
    try {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
      
      toast.success("Noticia eliminada correctamente.");
      qc.invalidateQueries({ queryKey: ["news-admin"] });
    } catch (err: any) {
      toast.error("Error al eliminar la noticia.");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      
      {/* Encabezado */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
            Panel de Administración
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">Gestión de Noticias</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Publica comunicados oficiales y avisos importantes para tu comunidad escolar.
        </p>
      </div>

      {/* Formulario de Nueva Noticia */}
      <div className="card-soft p-5 md:p-6 space-y-4 rounded-3xl bg-card border border-border/60 shadow-xs">
        <div className="flex items-center gap-2 border-b pb-3">
          <Megaphone className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold">Publicar Nueva Noticia</h2>
        </div>

        <div className="space-y-3">
          <input 
            placeholder="Título del comunicado..." 
            value={f.title} 
            onChange={(e) => setF({ ...f, title: e.target.value })} 
            className="w-full rounded-2xl border bg-background px-4 py-3 text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
          />
          <textarea 
            placeholder="Escribe el contenido detallado de la noticia aquí..." 
            rows={4} 
            value={f.body} 
            onChange={(e) => setF({ ...f, body: e.target.value })} 
            className="w-full rounded-2xl border bg-background px-4 py-3 text-sm shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" 
          />
          <div className="flex justify-end pt-1">
            <button 
              onClick={publish} 
              disabled={publishing || loadingInst || !f.title.trim() || !f.body.trim()}
              className="rounded-2xl bg-primary text-primary-foreground px-5 py-3 font-bold text-sm disabled:opacity-50 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" /> 
              {publishing ? "Publicando..." : "Publicar Noticia"}
            </button>
          </div>
        </div>
      </div>

      {/* Listado de Noticias Publicadas */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground px-1">
          Noticias Anteriores ({newsList?.length ?? 0})
        </h3>

        {loadingNews ? (
          <div className="text-center py-8 text-xs text-muted-foreground animate-pulse font-medium">
            Cargando noticias...
          </div>
        ) : newsList?.length === 0 ? (
          <div className="card-soft p-8 text-center rounded-3xl bg-card border border-border/50 space-y-2">
            <Newspaper className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm font-medium text-muted-foreground">No hay noticias publicadas todavía.</p>
          </div>
        ) : (
          newsList?.map((n: any) => (
            <div key={n.id} className="card-soft p-5 rounded-2xl bg-card border border-border/60 shadow-2xs transition-all hover:border-primary/30">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString("es-ES", { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h4 className="text-base font-bold text-foreground">{n.title}</h4>
                  <p className="text-xs md:text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{n.body}</p>
                </div>
                <button 
                  onClick={() => del(n.id)} 
                  className="rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive p-2.5 transition-all shrink-0 cursor-pointer"
                  title="Eliminar noticia"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}