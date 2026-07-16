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

// =======================================================
// NUEVO SISTEMA DE RECOMPENSAS SÍNCRONO POR CADA 30 PUNTOS DE XP
// =======================================================

export type RewardItem = {
  id: string;
  name: string;
  category: "hair" | "eyes" | "mood" | "outfit" | "accessory";
  requiredXp: number;
};

/**
 * Lista maestra ordenada de todos los desbloqueables del juego.
 * Cada elemento requiere exactamente 30 puntos de XP más que el anterior.
 */
const AVATAR_REWARDS: RewardItem[] = [
  // --- BÁSICOS INICIALES (Desbloqueados con 0 XP) ---
  { id: "short", name: "Cabello Corto Estándar", category: "hair", requiredXp: 0 },
  { id: "normal", name: "Ojos Normales", category: "eyes", requiredXp: 0 },
  { id: "happy", name: "Expresión Alegre", category: "mood", requiredXp: 0 },
  { id: "calm", name: "Expresión Serena", category: "mood", requiredXp: 0 },
  { id: "tee", name: "Camiseta Básica", category: "outfit", requiredXp: 0 },
  { id: "hoodie", name: "Sudadera Hoodie", category: "outfit", requiredXp: 0 },

  // --- HITOS DE DESBLOQUEO PROGRESIVO CADA 30 XP ---
  { id: "curly", name: "Peinado Rizado", category: "hair", requiredXp: 30 },
  { id: "wink", name: "Ojo Guiñado", category: "eyes", requiredXp: 60 },
  { id: "thinking", name: "Expresión Pensativa", category: "mood", requiredXp: 90 },
  { id: "long", name: "Cabello Largo Anime", category: "hair", requiredXp: 120 },
  { id: "sparkle", name: "Ojos Brillantes", category: "eyes", requiredXp: 150 },
  { id: "excited", name: "Expresión Entusiasmada", category: "mood", requiredXp: 180 },
  { id: "jacket", name: "Chaqueta Elegante", category: "outfit", requiredXp: 210 },
  { id: "glasses", name: "Gafas Modernas", category: "accessory", requiredXp: 240 },
  { id: "ponytail", name: "Coleta Ponytail", category: "hair", requiredXp: 270 },
  { id: "star", name: "Ojos de Estrella ✨", category: "eyes", requiredXp: 300 },
  { id: "sweater", name: "Suéter Cómodo", category: "outfit", requiredXp: 330 },
  { id: "cap", name: "Gorra Deportiva", category: "accessory", requiredXp: 360 },
  { id: "buns", name: "Peinado de Chongos (Buns)", category: "hair", requiredXp: 390 },
  { id: "surprised", name: "Expresión Sorprendida", category: "mood", requiredXp: 420 },
  { id: "dress", name: "Vestido de Gala", category: "outfit", requiredXp: 450 },
  { id: "headphones", name: "Audífonos Gamer", category: "accessory", requiredXp: 480 },
  { id: "spiky", name: "Cabello Picudo (Spiky)", category: "hair", requiredXp: 510 },
  { id: "anime-sad", name: "Ojos Emotivos Anime", category: "eyes", requiredXp: 540 },
  { id: "cool", name: "Expresión Desafiante / Cool", category: "mood", requiredXp: 570 },
  { id: "overalls", name: "Jardinera / Overol", category: "outfit", requiredXp: 600 },
  { id: "braids", name: "Cabello con Trenzas", category: "hair", requiredXp: 630 },
  { id: "scarf", name: "Bufanda Invernal", category: "accessory", requiredXp: 660 },
  { id: "sleeping", name: "Ojos Durmientes", category: "eyes", requiredXp: 690 },
  { id: "kimono", name: "Kimono Tradicional", category: "outfit", requiredXp: 720 },
  { id: "crown", name: "Corona Imperial Kawaii 👑", category: "accessory", requiredXp: 750 },
  { id: "wolfcut", name: "Corte Wolfcut Estilo", category: "hair", requiredXp: 780 },
  { id: "unimpressed", name: "Ojos de Desinterés", category: "eyes", requiredXp: 810 },
  { id: "jersey", name: "Jersey Deportivo", category: "outfit", requiredXp: 840 },
  { id: "gato", name: "Gatito Compañero 🐱", category: "accessory", requiredXp: 870 },
  { id: "mohawk", name: "Corte Mohawk Rebelde", category: "hair", requiredXp: 900 },
  { id: "dizzy", name: "Ojos Mareados / Espirales", category: "eyes", requiredXp: 930 },
  { id: "chef", name: "Uniforme de Chef Ejecutivo", category: "outfit", requiredXp: 960 },
  { id: "lentes_corazon", name: "Gafas de Corazón", category: "accessory", requiredXp: 990 },
  { id: "space-buns", name: "Chongos Espaciales (Space Buns)", category: "hair", requiredXp: 1020 },
  { id: "heart-eyes", name: "Ojos Enamorados de Corazón", category: "eyes", requiredXp: 1050 },
  { id: "wizard", name: "Túnica de Mago Místico", category: "outfit", requiredXp: 1080 },
  { id: "halo", name: "Halo Celestial", category: "accessory", requiredXp: 1110 },
  { id: "flat-top", name: "Corte Flat-Top Retro", category: "hair", requiredXp: 1140 },
  { id: "glamor", name: "Ojos Glamour con Pestañas", category: "eyes", requiredXp: 1170 },
  { id: "suit", name: "Traje Formal Elegante", category: "outfit", requiredXp: 1200 },
  { id: "eyepatch", name: "Parche de Pirata de Cuero", category: "accessory", requiredXp: 1230 },
  { id: "curly-bob", name: "Corte Bob Rizado Glam", category: "hair", requiredXp: 1260 },
  { id: "monocle", name: "Monóculo de Oro Aristocrático", category: "eyes", requiredXp: 1290 },
  { id: "astronaut", name: "Traje de Astronauta Espacial", category: "outfit", requiredXp: 1320 },
  { id: "ribbon", name: "Lazo Rosa Coquette", category: "accessory", requiredXp: 1350 },
  { id: "vintage-waves", name: "Ondas Vintage Clásicas", category: "hair", requiredXp: 1380 },
  { id: "pixel-retro", name: "Ojos Pixelados Retro 8-bit", category: "eyes", requiredXp: 1410 },
  { id: "pajamas", name: "Pijama Cómoda de Estrellas", category: "outfit", requiredXp: 1440 },
  { id: "detective-hat", name: "Sombrero de Detective Holmes", category: "accessory", requiredXp: 1470 },
  { id: "detective", name: "Gabardina de Detective Privado", category: "outfit", requiredXp: 1500 },
  { id: "chef-hat", name: "Sombrero de Chef Toque", category: "accessory", requiredXp: 1530 },
  { id: "builder", name: "Chaleco de Constructor", category: "outfit", requiredXp: 1560 },
  { id: "flower", name: "Flor para el Pelo", category: "accessory", requiredXp: 1590 },
  { id: "ninja", name: "Traje Shinobi Ninja", category: "outfit", requiredXp: 1620 },
  { id: "clown-nose", name: "Nariz de Payaso Roja", category: "accessory", requiredXp: 1650 },
  { id: "overcoat", name: "Abrigo de Invierno Elegante", category: "outfit", requiredXp: 1680 },
  { id: "swimsuit", name: "Traje de Baño Deportivo", category: "outfit", requiredXp: 1710 },
  { id: "clown", name: "Traje de Payaso Colorido", category: "outfit", requiredXp: 1740 },
];

/**
 * Devuelve la lista completa de ítems configurados en el catálogo.
 */
export function getAvatarRewards(): RewardItem[] {
  return AVATAR_REWARDS;
}

/**
 * Obtiene la lista de todos los objetos desbloqueados acumulados según los puntos de XP actuales.
 */
export function getUnlockedAvatarItems(xp: number): RewardItem[] {
  return AVATAR_REWARDS.filter((reward) => xp >= reward.requiredXp);
}

/**
 * Evalúa si un ítem específico está disponible basándose en la experiencia actual del jugador.
 */
export function isAvatarItemUnlocked(itemId: string, xp: number): boolean {
  if (itemId === "none" || itemId === "bald") return true;
  
  const reward = AVATAR_REWARDS.find((item) => item.id === itemId);
  if (!reward) return true; // Si el ID no está restringido en el catálogo, se considera libre por defecto
  
  return xp >= reward.requiredXp;
}

/**
 * Encuentra el siguiente objeto más cercano a desbloquear según el puntaje de XP.
 */
export function getNextAvatarUnlock(xp: number): { requiredXp: number; item: RewardItem; missingXp: number; text: string } | null {
  const nextReward = AVATAR_REWARDS.find((reward) => reward.requiredXp > xp);
  
  if (!nextReward) return null;

  const missing = nextReward.requiredXp - xp;
  return {
    requiredXp: nextReward.requiredXp,
    item: nextReward,
    missingXp: missing,
    text: `${nextReward.name} (Necesitas ${nextReward.requiredXp} XP, faltan ${missing} XP)`
  };
}