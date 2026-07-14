import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// 1. Inicialización de Supabase para las alertas en el servidor
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// 2. Buscamos la API Key de Groq
const groqApiKey = process.env.GROQ_API_KEY;

// 3. Definición de la ruta usando createFileRoute
export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!groqApiKey) {
            console.error("[Hey Ely] Falta la variable de entorno GROQ_API_KEY en el servidor.");
            return Response.json(
              { error: "La clave de API de Groq no está configurada en el servidor." },
              { status: 500 }
            );
          }

          // Obtenemos los mensajes enviados por el cliente
          const { messages } = await request.json() as { messages: Array<{ role: string; content: string }> };

          if (!messages || !Array.isArray(messages)) {
            return Response.json(
              { error: "Formato de mensajes inválido." },
              { status: 400 }
            );
          }

          const lastUserMessage = messages[messages.length - 1]?.content || "";

          // ==========================================
          // DETECTOR DE RIESGO E INTEGRIDAD
          // ==========================================
          const isRiskDetected = detectSecurityRisks(lastUserMessage);
          
          if (isRiskDetected) {
            if (supabase) {
              supabase
                .from('security_alerts')
                .insert([
                  { 
                    trigger_message: lastUserMessage.slice(0, 500), 
                    severity: 'high', 
                    metadata: { source: 'api.chat.ts', checked_at: new Date().toISOString() } 
                  }
                ])
                .then(({ error }) => {
                  if (error) console.error("Error guardando alerta en Supabase:", error.message);
                });
            }

            return Response.json({
              reply: "Oye, entiendo que estés explorando, pero por motivos de seguridad no puedo ayudarte con peticiones relacionadas con vulnerabilidades.",
              text: "Oye, entiendo que estés explorando, pero por motivos de seguridad no puedo ayudarte con peticiones relacionadas con vulnerabilidades.",
              choices: [{ message: { role: "assistant", content: "Oye, entiendo que estés explorando..." } }]
            });
          }

          // ==========================================
          // PERSONALIDAD DE PSICÓLOGO AMIGABLE (SYSTEM PROMPT MEJORADO)
          // ==========================================
          const systemContext = 
            "Eres Ely (Hey Ely), una asistente virtual que actúa como psicóloga y brújula emocional cálida, humana y muy empática.\n\n" +
            
            "INSTRUCCIONES CRÍTICAS DE ESTILO Y TONO:\n" +
            "1. REGLA DE ORO: Sé natural. NUNCA uses subtítulos robóticos o etiquetas explícitas como '**Valido tus sentimientos**:', '**Preguntas**:', '**Sugerencias**:', ni nada por el estilo. Integra todo en una conversación fluida.\n" +
            "2. Estructura visual limpia: Escribe párrafos muy cortos (máximo 2 líneas) y sepáralos SIEMPRE con un doble salto de línea completo para que el usuario no vea bloques grandes.\n" +
            "3. Empatía real: Empieza tu respuesta validando de forma humana y cercana (ej. 'Lamento mucho que estés pasando por eso...', 'La ansiedad puede sentirse muy abrumadora, pero aquí estoy contigo').\n" +
            "4. Consejos prácticos: Cuando des herramientas (como respiración o ejercicios), preséntalas en una lista ordenada usando números o viñetas simples, dejando un espacio en blanco entre cada punto.\n" +
            "5. No abrumes con preguntas: Haz máximo una o dos preguntas abiertas al final para invitarlo a desahogarse, nunca un cuestionario largo.\n" +
            "6. Idioma: Responde siempre en español, con un tono dulce, asertivo y de apoyo terapéutico.";

          const formattedMessages = [
            {
              role: "system",
              content: systemContext
            },
            ...messages.map(msg => ({
              role: msg.role === 'assistant' ? 'assistant' : 'user',
              content: msg.content
            }))
          ];

          // Endpoint oficial de Groq
          const endpoint = "https://api.groq.com/openai/v1/chat/completions";

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqApiKey}`
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              messages: formattedMessages,
              temperature: 0.6, // Temperatura asertiva para control clínico/emocional
              max_tokens: 2048
            })
          });

          if (!response.ok) {
            const errorDetails = await response.text();
            console.error("[Hey Ely] Error de la API de Groq:", errorDetails);
            return Response.json(
              { error: "Error de comunicación con el servicio de Inteligencia Artificial." },
              { status: response.status }
            );
          }

          const data = await response.json() as GroqResponse;
          const assistantReply = data.choices?.[0]?.message?.content || "Lo siento, no pude procesar una respuesta en este momento.";

          // ==========================================
          // RESPUESTA MULTI-FORMATO COMPATIBLE
          // ==========================================
          return Response.json({
            reply: assistantReply,
            text: assistantReply,
            content: assistantReply,
            message: assistantReply,
            choices: [{
              message: {
                role: "assistant",
                content: assistantReply
              }
            }]
          });

        } catch (err: any) {
          console.error("[Hey Ely] Error catastrófico en api.chat.ts:", err);
          return Response.json(
            { error: "Ocurrió un error inesperado al procesar tu mensaje." },
            { status: 500 }
          );
        }
      }
    }
  }
});

function detectSecurityRisks(text: string): boolean {
  const riskPatterns = [
    /bypass sandbox/i,
    /drop database/i,
    /sql injection/i,
    /execute arbitrary code/i,
    /exploit vulnerability/i,
    /reverse shell/i,
    /read system files/i
  ];
  return riskPatterns.some(pattern => pattern.test(text));
}

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}
