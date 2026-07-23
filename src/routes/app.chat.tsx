import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { ElyMascot } from "@/components/brand";
import { Send, AlertCircle, Sparkles, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { completarMisionPorTitulo } from "@/lib/missions";

export const Route = createFileRoute("/app/chat")({ component: ChatPage });

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED_PROMPTS = [
  "¿Cómo puedo manejar un momento de estrés?",
  "Hoy me siento un poco abrumado/a...",
  "Necesito un consejo para concentrarme mejor",
  "¿Hacemos un ejercicio rápido de calma?",
];

function ChatPage() {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("chat_messages")
      .select("role,content")
      .eq("user_id", user.id)
      .order("created_at")
      .then(({ data }) => {
        if (data && data.length) {
          setMessages(data as Msg[]);
        } else {
          const firstName = profile?.full_name ? profile.full_name.split(" ")[0] : "amigo/a";
          setMessages([
            {
              role: "assistant",
              content: `Hola, ${firstName} 👋 Qué bueno verte por aquí. ¿Cómo va tu día o qué pasa por tu mente hoy?`,
            },
          ]);
        }
      });
  }, [user, profile]);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  async function handleSendMessage(textToSend?: string) {
    const textContent = textToSend || input;
    if (!textContent.trim()) return;

    if (!user) {
      toast.error("Debes iniciar sesión para chatear.");
      return;
    }

    const userMsg: Msg = { role: "user", content: textContent.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);

    // 🎯 COMPLETAR MISIOGRAMAS AL INTERACTUAR CON ELY
    if (profile) {
      completarMisionPorTitulo(user.id, profile.xp, "Salúdame hoy");
      completarMisionPorTitulo(user.id, profile.xp, "Identificar emociones"); // 👈 Misión agregada
    }

    try {
      await supabase
        .from("chat_messages")
        .insert({ user_id: user.id, role: "user", content: userMsg.content });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          userName: profile?.full_name ? profile.full_name.split(" ")[0] : "Estudiante",
          userId: user.id,
          institutionId: profile?.institution_id || (profile as any)?.institutionId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar el mensaje");

      const reply: Msg = { role: "assistant", content: data.reply };
      setMessages((m) => [...m, reply]);

      await supabase
        .from("chat_messages")
        .insert({ user_id: user.id, role: "assistant", content: reply.content });

      if (data.riskDetected) {
        toast.warning(
          "Ely detectó una situación importante. Recuerda que cuentas con herramientas de apoyo."
        );
      }
    } catch (err: any) {
      console.error("❌ Error en el flujo del chat:", err);
      toast.error(err.message || "Error al conectar con Ely");
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Perdona, tuve un pequeño problema técnico al responder. ¿Lo intentamos de nuevo?",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-7rem)] overflow-hidden">
      
      {/* 1. Cabecera fija */}
      <div className="shrink-0 card-soft p-3.5 md:p-4 flex items-center gap-3.5 bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/20 shadow-xs rounded-2xl mb-3">
        <div className="relative shrink-0">
          <ElyMascot className="w-12 h-12 md:w-14 md:h-14 drop-shadow-sm" />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-extrabold text-sm md:text-base flex items-center gap-2">
            <span>Chat con Ely</span>
            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
              IA Empática
            </span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
            <AlertCircle className="h-3 w-3 shrink-0 text-purple-400" /> 
            <span>Espacio 100% confidencial y seguro.</span>
          </div>
        </div>
      </div>

      {/* 2. Zona con scroll interno dinámico */}
      <div 
        ref={chatScrollRef}
        className="flex-1 min-h-0 overflow-y-auto space-y-4 px-2 py-1 scroll-smooth"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex animate-in fade-in duration-300 ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                m.role === "user"
                  ? "gradient-hero text-white rounded-br-xs font-medium"
                  : "card-soft bg-card text-card-foreground rounded-bl-xs border border-border"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start animate-pulse">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-3xl rounded-bl-xs px-4 py-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-spin" />
              <span>Ely está pensando su respuesta...</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Área inferior anclada */}
      <div className="shrink-0 pt-3 space-y-2 bg-background border-t border-border/40 mt-2">
        {messages.length <= 2 && !sending && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap text-xs font-semibold bg-card border hover:border-primary/50 hover:bg-primary/5 text-secondary-foreground px-3 py-2 rounded-xl transition-all shadow-2xs shrink-0 flex items-center gap-1.5"
              >
                <HeartPulse className="w-3.5 h-3.5 text-primary" />
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }} 
          className="flex gap-2 items-center"
        >
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escríbele lo que quieras a Ely..."
            className="flex-1 rounded-2xl border bg-card px-4 py-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-2xl bg-primary text-primary-foreground px-4 py-3 font-bold disabled:opacity-50 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-md shrink-0 cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}