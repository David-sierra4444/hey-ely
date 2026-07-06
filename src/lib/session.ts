import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export type SessionState = {
  user: User | null;
  loading: boolean;
};

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ user: null, loading: true });
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setState({ user: data.session?.user ?? null, loading: false });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState({ user: session?.user ?? null, loading: false });
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);
  return state;
}

export type ProfileRow = {
  id: string;
  full_name: string;
  user_type: "admin" | "student" | "natural";
  email: string | null;
  age: number | null;
  grade: string | null;
  course: string | null;
  position: string | null;
  institution_id: string | null;
  xp: number;
  level: number;
  streak_days: number;
};

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userId) { setProfile(null); setLoading(false); return; }
    let alive = true;
    setLoading(true);
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle().then(({ data }) => {
      if (!alive) return;
      setProfile(data as ProfileRow | null);
      setLoading(false);
    });
    return () => { alive = false; };
  }, [userId]);
  return { profile, loading, setProfile };
}

export function xpForNextLevel(level: number) { return 100 + level * 50; }
export function computeLevel(xp: number) {
  let lvl = 1, remaining = xp;
  while (remaining >= xpForNextLevel(lvl)) { remaining -= xpForNextLevel(lvl); lvl++; }
  return { level: lvl, xpIntoLevel: remaining, nextLevelXp: xpForNextLevel(lvl) };
}

// ==========================================
// NUEVO SISTEMA DE RECOMPENSAS Y DESBLOQUEOS
// ==========================================

export type RewardItem = {
  id: string;
  name: string;
  category: "hair" | "outfit" | "accessory" | "general";
};

export type LevelReward = {
  level: number;
  items: RewardItem[];
};

/**
 * Catálogo maestro oficial de recompensas indexadas por nivel de la aplicación.
 * Fácilmente ampliable en el futuro añadiendo nuevos elementos al array.
 */
const AVATAR_REWARDS: LevelReward[] = [
  {
    level: 1,
    items: [
      { id: "short", name: "Cabello básico", category: "hair" },
      { id: "tee", name: "Camiseta básica", category: "outfit" }
    ]
  },
  {
    level: 3,
    items: [
      { id: "curly", name: "Nuevo peinado (Rizado)", category: "hair" },
      { id: "long", name: "Nuevo peinado (Largo)", category: "hair" }
    ]
  },
  {
    level: 5,
    items: [
      { id: "glasses", name: "Gafas", category: "accessory" }
    ]
  },
  {
    level: 8,
    items: [
      { id: "cap", name: "Gorro / Gorra", category: "accessory" }
    ]
  },
  {
    level: 10,
    items: [
      { id: "hoodie", name: "Hoodie con capucha", category: "outfit" }
    ]
  },
  {
    level: 12,
    items: [
      { id: "backpack", name: "Mochila", category: "accessory" }
    ]
  },
  {
    level: 15,
    items: [
      { id: "jacket", name: "Chaqueta moderna", category: "outfit" }
    ]
  },
  {
    level: 18,
    items: [
      { id: "scarf", name: "Bufanda", category: "accessory" }
    ]
  },
  {
    level: 20,
    items: [
      { id: "wings", name: "Alas decorativas", category: "accessory" }
    ]
  },
  {
    level: 25,
    items: [
      { id: "headphones", name: "Audífonos Gamer", category: "accessory" }
    ]
  },
  {
    level: 30,
    items: [
      { id: "crown", name: "Corona Kawaii", category: "accessory" }
    ]
  }
];

/**
 * Obtiene la lista completa de recompensas registradas en el sistema.
 */
export function getAvatarRewards(): LevelReward[] {
  return AVATAR_REWARDS;
}

/**
 * Devuelve todos los objetos del avatar que un usuario ha desbloqueado según su nivel actual.
 * Incluye todos los ítems de niveles menores o iguales al proporcionado.
 */
export function getUnlockedAvatarItems(level: number): RewardItem[] {
  return AVATAR_REWARDS
    .filter((reward) => reward.level <= level)
    .flatMap((reward) => reward.items);
}

/**
 * Comprueba de manera instantánea si un identificador específico de ítem está desbloqueado
 * para el nivel actual del usuario.
 */
export function isAvatarItemUnlocked(itemId: string, level: number): boolean {
  // Los ítems básicos por defecto del nivel 1 o no registrados siempre se consideran disponibles
  if (itemId === "none" || itemId === "bald") return true;
  
  const unlocked = getUnlockedAvatarItems(level);
  return unlocked.some((item) => item.id === itemId);
}

/**
 * Encuentra el próximo hito de desbloqueo disponible basándose en el nivel del jugador.
 * Retorna un objeto detallado con el nivel objetivo, la lista de ítems y una cadena formateada limpia.
 */
export function getNextAvatarUnlock(level: number): { level: number; items: RewardItem[]; text: string } | null {
  const nextReward = AVATAR_REWARDS.find((reward) => reward.level > level);
  
  if (!nextReward) return null;

  const namesList = nextReward.items.map(i => i.name).join(" y ");
  return {
    level: nextReward.level,
    items: nextReward.items,
    text: `${namesList} (Nivel ${nextReward.level})`
  };
}
