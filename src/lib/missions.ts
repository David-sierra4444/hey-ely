import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Calcula la clave de periodo actual para la misión según su frecuencia
 */
export function getPeriodKey(freq: string) {
  const d = new Date();
  if (freq === "daily") {
    return `d-${d.toISOString().slice(0, 10)}`;
  }
  if (freq === "weekly") {
    const first = new Date(d);
    const day = first.getDay();
    const diff = first.getDate() - day + (day === 0 ? -6 : 1);
    first.setDate(diff);
    return `w-${first.toISOString().slice(0, 10)}`;
  }
  return `m-${d.getFullYear()}-${d.getMonth() + 1}`;
}

/**
 * Otorga XP únicamente cuando el usuario completa la acción requerida.
 * 
 * @param userId ID del usuario actual
 * @param currentXp Puntos de experiencia actuales del perfil
 * @param terminoBusqueda Palabra clave o título de la misión (ej: "Respira", "Semáforo", "Cazador")
 */
export async function completarMisionPorTitulo(
  userId: string,
  currentXp: number,
  terminoBusqueda: string
) {
  try {
    // 1. Buscar la misión activa en Supabase coincidiendo por título o categoría
    const { data: missions, error: searchError } = await supabase
      .from("missions")
      .select("*")
      .eq("active", true);

    if (searchError || !missions) {
      console.error("❌ Error al consultar la tabla missions:", searchError);
      return;
    }

    // Coincidencia flexible de texto (insensible a mayúsculas/minúsculas)
    const mission = missions.find(
      (m: any) =>
        m.title.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
        (m.category && m.category.toLowerCase().includes(terminoBusqueda.toLowerCase()))
    );

    if (!mission) {
      console.warn(`⚠️ No se encontró ninguna misión en la base de datos que coincida con "${terminoBusqueda}". Revisa los nombres en Supabase.`);
      return;
    }

    // 2. Obtener clave de periodo
    const pk = getPeriodKey(mission.frequency);

    // 3. Verificar si ya fue completada en el periodo actual
    const { data: yaHecha } = await supabase
      .from("mission_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("mission_id", mission.id)
      .eq("period_key", pk)
      .maybeSingle();

    if (yaHecha) {
      console.log(`ℹ️ La misión "${mission.title}" ya fue completada para el periodo ${pk}.`);
      return;
    }

    // 4. Registrar la misión como completada
    const { error: progressError } = await supabase
      .from("mission_progress")
      .insert({
        user_id: userId,
        mission_id: mission.id,
        period_key: pk,
      });

    if (progressError) throw progressError;

    // 5. Sumar los XP al perfil
    const nuevoXp = (currentXp || 0) + mission.xp_reward;
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ xp: nuevoXp })
      .eq("id", userId);

    if (profileError) throw profileError;

    // 6. Notificación visual al usuario
    toast.success(`✨ ¡Misión completada: ${mission.title}! +${mission.xp_reward} XP`);

  } catch (error: any) {
    console.error("❌ Error al completar la misión:", error.message);
  }
}