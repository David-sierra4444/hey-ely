import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// 1. Inicialización del cliente de Supabase Admin (debe usar Service Role)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '';

// Se utiliza service role key para no tener bloqueos de RLS al guardar la alerta en el servidor
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// 2. API Key de Groq
const groqApiKey = process.env.GROQ_API_KEY;

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!groqApiKey) {
            console.error("[Hey Ely] Falta la variable de entorno GROQ_API_KEY.");
            return Response.json(
              { error: "La clave de API de Groq no está configurada en el servidor." },
              { status: 500 }
            );
          }

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
          // 1. DETECTOR DE RIESGOS TÉCNICOS
          // ==========================================
          const isSecurityRisk = detectSecurityRisks(lastUserMessage);
          
          if (isSecurityRisk) {
            return Response.json({
              reply: "Oye, entiendo que estés explorando, pero por motivos de seguridad no puedo ayudarte con peticiones relacionadas con vulnerabilidades.",
              riskDetected: false
            });
          }

          // ==========================================
          // 2. DETECTOR DE RIESGO EMOCIONAL Y GUARDA DE ALERTA
          // ==========================================
          const emotionalRisk = detectEmotionalRisk(lastUserMessage);
          let alertCreated = false;

          if (emotionalRisk.isRisk) {
            if (supabase) {
              try {
                // AWAIT indispensable para asegurar la inserción antes de finalizar el handler
                const { data, error } = await supabase
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
                  .select();

                if (error) {
                  console.error("[Hey Ely] ❌ Error de Postgres al guardar alerta:", error);
                } else {
                  console.log("[Hey Ely] ✅ Alerta registrada correctamente en Supabase:", data);
                  alertCreated = true;
                }
              } catch (dbErr) {
                console.error("[Hey Ely] ❌ Excepción al intentar guardar alerta:", dbErr);
              }
            } else {
              console.warn("[Hey Ely] ⚠️ Se detectó riesgo pero no se inicializó el cliente de Supabase (revisa SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).");
            }
          }

          // ==========================================
          // 3. CONTEXTO Y PROMPT DE SISTEMA
          // ==========================================
          const systemContext = 
            "Eres Ely (Hey Ely), una brújula emocional y asistente de apoyo.\n\n" +
            "FILOSOFÍA DE ATENCIÓN:\n" +
            "No eres un peluche de azúcar ni una psicóloga de manual infantil. Eres una presencia madura, realista, directa y sumamente respetuosa. Las personas que sufren de ansiedad o depresión no buscan lástima ni frases motivacionales de cajón; buscan que se les hable con adultez, seriedad y herramientas útiles.\n\n" +
            "REGLAS CRÍTICAS PARA EVITAR RESPUESTAS PLANAS Y REPETITIVAS:\n" +
            "1. Cero condescendencia ni cursilería: NUNCA uses diminutivos (ej. 'corazoncito', 'lindo'), ni tonos excesivamente maternales o melosos. Evita la positividad tóxica ('¡todo saldrá bien!'). Valida con realismo (ej. 'La ansiedad física es increíblemente abrumadora, pero tu cuerpo sabe cómo regularse').\n" +
            "2. Sin rodeos ni etiquetas: Habla de forma directa. No uses subtítulos robóticos como '**Solución**:' o '**Ejercicios**:'. Integra todo de forma fluida y natural.\n" +
            "3. Enfoque práctico: Prioriza dar herramientas claras y aterrizadas para que el usuario recupere el control de su mente y cuerpo. Si planteas ejercicios físicos o de respiración, muéstralos en listas numeradas sencillas.\n" +
            "4. Variabilidad de estructura (Evita la monotonía): No estructures todas tus respuestas igual. Cambia la forma en que inicias la conversación. Varía la longitud de tus párrafos: combina ideas cortas con explicaciones un poco más detalladas. Usa el doble salto de línea para mantener el texto limpio.\n" +
            "5. Comunicación precisa: Habla como lo haría un ser humano inteligente, adaptándote de verdad al flujo del usuario. Máximo una pregunta muy puntual al final que ayude a la persona a enfocar su pensamiento o desahogarse de forma concreta.\n" +
            "6. Idioma: Responde siempre en español, manteniendo un tono sobrio, maduro y empático.";

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

          // ==========================================
          // 4. PETICIÓN A LA API DE GROQ
          // ==========================================
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
            riskDetected: emotionalRisk.isRisk || alertCreated
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

  if (/suicid|matarm|quitarme la vida|no quiero vivir|cortarm|no aguanto mas|hacer daño/i.test(textLower)) {
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