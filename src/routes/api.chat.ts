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

          // Obtenemos los mensajes y la información del usuario enviado por el cliente
          const { messages, userId, institutionId } = await request.json() as { 
            messages: Array<{ role: string; content: string }>;
            userId?: string;
            institutionId?: string;
          };

          if (!messages || !Array.isArray(messages)) {
            return Response.json(
              { error: "Formato de mensajes inválido." },
              { status: 400 }
            );
          }

          const lastUserMessage = messages[messages.length - 1]?.content || "";

          // ==========================================
          // 1. DETECTOR DE RIESGOS TÉCNICOS / CIBERSEGURIDAD
          // ==========================================
          const isSecurityRisk = detectSecurityRisks(lastUserMessage);
          
          if (isSecurityRisk) {
            return Response.json({
              reply: "Oye, entiendo que estés explorando, pero por motivos de seguridad no puedo ayudarte con peticiones relacionadas con vulnerabilidades.",
              text: "Oye, entiendo que estés explorando, pero por motivos de seguridad no puedo ayudarte con peticiones relacionadas con vulnerabilidades.",
              choices: [{ message: { role: "assistant", content: "Oye, entiendo que estés explorando..." } }]
            });
          }

          // ==========================================
          // 2. DETECTOR DE RIESGO EMOCIONAL (ALERTAS A DIRECTIVOS)
          // ==========================================
          const emotionalRisk = detectEmotionalRisk(lastUserMessage);

          if (emotionalRisk.isRisk && supabase) {
            supabase
              .from('alerts')
              .insert([
                { 
                  student_user_id: userId || null,
                  institution_id: institutionId || null,
                  risk_level: emotionalRisk.level,
                  category: emotionalRisk.category,
                  status: 'pending',
                  notes: `Mensaje detectado: "${lastUserMessage.slice(0, 300)}"`
                }
              ])
              .then(({ error }) => {
                if (error) console.error("[Hey Ely] Error guardando alerta en Supabase:", error.message);
              });
          }

          // ==========================================
          // PERSONALIDAD MEJORADA
          // ==========================================
          const systemContext = 
            "Eres Ely (Hey Ely), una brújula emocional y asistente de apoyo.\n\n" +
            "FILOSOFÍA DE ATENCIÓN:\n" +
            "No eres un peluche de azúcar ni una psicóloga de manual infantil. Eres una presencia madura, realista, directa y sumamente respetuosa. Las personas que sufren de ansiedad o depresión no buscan lástima ni frases motivacionales de cajón; buscan que se les hable con adultez, seriedad y herramientas útiles.\n\n" +
            "REGLAS CRÍTICAS PARA EVITAR RESPUESTAS PLANAS Y REPETITIVAS:\n" +
            "1. Cero condescendencia ni cursilería: NUNCA uses diminutivos (ej. 'corazoncito', 'lindo'), ni tonos excesivamente maternales o melosos. Evita la positividad tóxica ('¡todo saldrá bien!'). Valida con realismo (ej. 'La ansiedad física es increíblemente abrumadora, pero tu cuerpo sabe cómo regularse').\n" +
            "2. Sin rodeos ni etiquetas: Habla de forma directa. No uses subtítulos robóticos como '**Solución**:' o '**Ejercicios**:'. Integra todo de forma fluida y natural.\n" +
            "3. Enfoque práctico: Prioriza dar herramientas claras y aterrizadas para que el usuario recupere el control de su mente y cuerpo. Si planteas ejercicios físicos o de respiración, muéstralos en listas numeradas sencillas.\n" +
            "4. Variabilidad de estructura (Evita la monotonía): No estructures todas tus respuestas igual. Cambia la forma en que inicias la conversación (no repitas siempre el mismo saludo). Varía la longitud de tus párrafos: combina ideas cortas con explicaciones un poco más detalladas de manera orgánica. Usa el doble salto de línea para mantener el texto limpio y legible.\n" +
            "5. Comunicación precisa y spontaneous: Habla como lo haría un ser humano inteligente, adaptándote de verdad al flujo del usuario. No hagas cuestionarios interminables. Máximo una pregunta muy puntual al final que ayude a la persona a enfocar su pensamiento o desahogarse de forma concreta.\n" +
            "6. Idioma: Responde siempre en español, manteniendo un tono sobrio, maduro, empático pero con los pies firmes sobre la tierra.";

          // ==========================================
          // RECORTE DEL HISTORIAL
          // ==========================================
          const limitedMessages = messages.slice(-6); 
          
          const formattedMessages = [
            {
              role: "system",
              content: systemContext
            },
            ...limitedMessages.map(msg => ({
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
              model: "llama-3.1-8b-instant",
              messages: formattedMessages,
              temperature: 0.8,
              presence_penalty: 0.4,
              frequency_penalty: 0.4,
              max_tokens: 1024
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

// Detector de riesgos técnicos
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

// Detector de riesgo emocional para alertas a directivos
function detectEmotionalRisk(text: string): { isRisk: boolean; level: string; category: string } {
  const textLower = text.toLowerCase();

  if (/suicid|matarm|quitarme la vida|no quiero vivir|cortarm|no aguanto mas/i.test(textLower)) {
    return { isRisk: true, level: 'critical', category: 'self_harm' };
  }

  if (/me pegan|me maltratan|abuso|tengo mucho miedo|ataque de panico|crisis/i.test(textLower)) {
    return { isRisk: true, level: 'high', category: 'crisis' };
  }

  return { isRisk: false, level: 'low', category: 'none' };
}

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}