import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, useProfile } from "@/lib/session";
import { ElyMascot } from "@/components/brand";
import { toast } from "sonner";
import { Lock, Check, Heart, Sparkles, Utensils, Smile } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/app/mascota")({ component: PetsPage });

const PETS = [
  { key: "ely", name: "Ely", emoji: "🐘", cost: 0, perk: "+10% XP en misiones diarias" },
  { key: "gato", name: "Michi", emoji: "🐱", cost: 100, perk: "+5% XP extra en juegos" },
  { key: "perro", name: "Rocky", emoji: "🐶", cost: 150, perk: "Mensajes motivacionales" },
  { key: "conejo", name: "Nube", emoji: "🐰", cost: 200, perk: "+5% XP extra en misiones" },
  { key: "panda", name: "Bao", emoji: "🐼", cost: 300, perk: "+10% de calma emocional" },
  { key: "zorro", name: "Kori", emoji: "🦊", cost: 400, perk: "+10% XP en juegos de memoria" },
  { key: "capibara", name: "Capi", emoji: "🦫", cost: 500, perk: "Paz mental asegurada" },
  { key: "pinguino", name: "Piu", emoji: "🐧", cost: 600, perk: "+15% XP en desafíos" },
  { key: "buho", name: "Owly", emoji: "🦉", cost: 700, perk: "Bonus de sabiduría diaria" },
  { key: "axolote", name: "Axo", emoji: "🦎", cost: 800, perk: "Regeneración de energía" },
  { key: "dragon", name: "Draki", emoji: "🐉", cost: 1000, perk: "Doble experiencia los fines de semana" },
  { key: "robot", name: "Byte", emoji: "🤖", cost: 1200, perk: "Análisis de estado de ánimo" },
];

function PetsPage() {
  const { user } = useSession();
  const { profile, setProfile } = useProfile(user?.id);
  const qc = useQueryClient();

  const [pet, setPet] = useState<{ active_pet: string; unlocked_pets: string[] } | null>(null);
  const [affection, setAffection] = useState<number>(80);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("pets").select("active_pet,unlocked_pets").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) setPet({ active_pet: data.active_pet, unlocked_pets: (data.unlocked_pets as string[]) || ["ely"] });
    });
  }, [user]);

  async function selectOrBuy(p: typeof PETS[0]) {
    if (!user || !pet || !profile) return;
    const unlocked = pet.unlocked_pets.includes(p.key);

    if (unlocked) {
      const { error } = await supabase.from("pets").update({ active_pet: p.key }).eq("user_id", user.id);
      if (error) return toast.error(error.message);
      setPet({ ...pet, active_pet: p.key });
      qc.invalidateQueries({ queryKey: ["active-pet-shell"] });
      toast.success(`Ahora te acompaña ${p.name}`);
      return;
    }

    if (profile.xp < p.cost) return toast.error(`Necesitas ${p.cost - profile.xp} XP más`);

    const newUnlocked = [...pet.unlocked_pets, p.key];
    await supabase.from("pets").update({ unlocked_pets: newUnlocked, active_pet: p.key }).eq("user_id", user.id);
    const newXp = profile.xp - p.cost;
    await supabase.from("profiles").update({ xp: newXp }).eq("id", user.id);

    setPet({ active_pet: p.key, unlocked_pets: newUnlocked });
    setProfile({ ...profile, xp: newXp });
    qc.invalidateQueries({ queryKey: ["active-pet-shell"] });
    toast.success(`¡Desbloqueaste a ${p.name}! 🎉`);
  }

  function handleInteract(action: "feed" | "pet") {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 800);

    if (action === "feed") {
      setAffection((prev) => Math.min(100, prev + 15));
      toast.success(`Le diste una merienda a ${active.name} 🍎`);
    } else {
      setAffection((prev) => Math.min(100, prev + 10));
      toast.success(`Acariciaste a ${active.name} ❤️`);
    }
  }

  const active = PETS.find((p) => p.key === pet?.active_pet) ?? PETS[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <Smile className="text-primary h-7 w-7" /> Tu Compañero
        </h1>
        <p className="text-muted-foreground text-sm">
          Interactúa con tu mascota y desbloquea nuevos compañeros con tus XP.
        </p>
      </div>

      {/* Tarjeta de Mascota Activa con Interacción */}
      <div className="glass-panel p-6 sm:p-8 bg-gradient-to-br from-primary/10 via-background to-secondary rounded-3xl border border-primary/20 shadow-md flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden">
        
        {/* Visualizador interactivo */}
        <div className={`relative flex items-center justify-center p-6 bg-background/60 rounded-2xl border border-border/80 shadow-inner w-36 h-36 transition-transform duration-300 ${isAnimating ? "scale-110 rotate-3" : ""}`}>
          {active.key === "ely" ? (
            <ElyMascot className="w-28 drop-shadow-md" />
          ) : (
            <span className="text-7xl select-none">{active.emoji}</span>
          )}
        </div>

        {/* Detalles de la mascota */}
        <div className="flex-1 text-center sm:text-left space-y-3">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              Compañero Activo
            </span>
            <h2 className="text-3xl font-black text-foreground mt-1">{active.name}</h2>
            <p className="text-xs text-muted-foreground font-medium flex items-center justify-center sm:justify-start gap-1 mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Habilidad: {active.perk}
            </p>
          </div>

          {/* Barra de afecto */}
          <div className="space-y-1 max-w-xs mx-auto sm:mx-0">
            <div className="flex justify-between text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Cariño</span>
              <span>{affection}%</span>
            </div>
            <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border">
              <div 
                className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${affection}%` }}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
            <button
              onClick={() => handleInteract("pet")}
              className="px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-bold hover:bg-secondary transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              <Heart className="w-4 h-4 text-rose-500" /> Acariciar
            </button>
            <button
              onClick={() => handleInteract("feed")}
              className="px-3.5 py-2 rounded-xl bg-card border border-border text-xs font-bold hover:bg-secondary transition-all flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              <Utensils className="w-4 h-4 text-amber-500" /> Alimentar
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Elección / Colección de Mascotas */}
      <div>
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-muted-foreground mb-3 px-1">Colección de Mascotas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PETS.map((p) => {
            const unlocked = pet?.unlocked_pets.includes(p.key);
            const isActive = pet?.active_pet === p.key;

            return (
              <button
                key={p.key}
                onClick={() => selectOrBuy(p)}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between gap-2 relative ${
                  isActive
                    ? "bg-primary/10 border-primary ring-2 ring-primary/30"
                    : unlocked
                    ? "bg-card border-border hover:border-primary/50 hover:shadow-md"
                    : "bg-muted/20 border-border/60 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="text-4xl my-1">{p.emoji}</div>

                <div>
                  <div className="font-bold text-sm text-foreground">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1">{p.perk}</div>
                </div>

                <div className="w-full pt-1">
                  {isActive ? (
                    <span className="text-[11px] text-primary font-black flex items-center justify-center gap-1 bg-primary/10 py-1 rounded-lg">
                      <Check className="h-3.5 w-3.5 stroke-[3]" /> Activo
                    </span>
                  ) : unlocked ? (
                    <span className="text-[11px] text-muted-foreground font-bold hover:text-foreground">
                      Elegir
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-500 font-extrabold flex items-center justify-center gap-1 bg-amber-500/10 py-1 rounded-lg border border-amber-500/20">
                      <Lock className="h-3 w-3" /> {p.cost} XP
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}