import { useMemo } from "react";

export type AvatarConfig = {
  skin?: string;
  hair?: string;
  hairColor?: string;
  eyes?: string;
  outfit?: string;
  outfitColor?: string;
  accessory?: string;
  mood?: "happy" | "calm" | "excited" | "thinking" | "surprised" | "cool";
};

export const AVATAR_OPTIONS = {
  skin: ["#FCE0C7", "#F5CBA0", "#E0A97F", "#B67F4F", "#8A5A3B", "#5C3A22"],
  hair: [
    "short", "long", "curly", "ponytail", "buns", "spiky", "braids", "bald",
    "wolfcut", "mohawk", "space-buns", "dreads", "vintage-waves", "flat-top", "curly-bob" // <-- +7 Peinados
  ],
  hairColor: ["#2C1810", "#5C3A22", "#B67F4F", "#E8B860", "#C97A9A", "#7A9AC9", "#9A7AC9", "#FE5F55"],
  eyes: [
    "normal", "happy", "wink", "sparkle", "star", "anime-sad",
    "sleeping", "unimpressed", "dizzy", "heart-eyes", "glamor", "monocle", "pixel-retro" // <-- +7 Ojos/Expresiones
  ],
  outfit: [
    "hoodie", "tee", "jacket", "dress", "sweater", "overalls", "kimono", "jersey", "chef", "wizard", "suit", "astronaut",
    "pajamas", "detective", "builder", "ninja", "overcoat", "swimsuit", "clown" // <-- +7 Ropas
  ],
  outfitColor: [
    "#8FB4E8", "#F3B4C6", "#B0DFC9", "#C7B4EA", "#F5D488", "#F19B84", "#222222", "#FFFFFF",
    "#FFDFD3", "#D4F0F0", "#CCE2CB", "#FFB7B2", "#E7C6FF", "#4A5568" // <-- +6 Colores de Ropa
  ],
  accessory: [
    "none", "glasses", "cap", "headphones", "earrings", "scarf", "crown", "gato", "lentes_corazon",
    "halo", "eyepatch", "ribbon", "detective-hat", "chef-hat", "flower", "clown-nose" // <-- +7 Accesorios
  ],
  mood: ["happy", "calm", "excited", "thinking", "surprised", "cool"] as const,
} as const;

export function AvatarSVG({ config, size = 180 }: { config: AvatarConfig; size?: number }) {
  const c = useMemo(() => ({
    skin: config.skin ?? AVATAR_OPTIONS.skin[1],
    hair: config.hair ?? "short",
    hairColor: config.hairColor ?? AVATAR_OPTIONS.hairColor[0],
    eyes: config.eyes ?? "normal",
    outfit: config.outfit ?? "hoodie",
    outfitColor: config.outfitColor ?? AVATAR_OPTIONS.outfitColor[0],
    accessory: config.accessory ?? "none",
    mood: config.mood ?? "happy",
  }), [config]);

  const S = { stroke: "#2A1B14", strokeWidth: 2.8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const thin = { stroke: "#2A1B14", strokeWidth: 1.8, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

  return (
    <svg viewBox="0 0 200 260" width={size} height={size} className="w-full h-full object-contain block drop-shadow-sm">
      
      {/* ================= 1. CABELLO TRASERO ================= */}
      {c.hair === "long" && (
        <path d="M 32,88 Q 8,170 38,235 L 68,235 Q 52,185 58,120 Z M 168,88 Q 192,170 162,235 L 132,235 Q 148,185 142,120 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "ponytail" && (
        <path d="M 150,75 C 195,65 210,135 175,155 C 158,145 148,120 148,90 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "braids" && (
        <>
          <path d="M 42,105 Q 18,165 38,225 Q 52,230 58,218 Q 45,175 58,125 Z" fill={c.hairColor} {...S} />
          <path d="M 158,105 Q 182,165 162,225 Q 148,230 142,218 Q 155,175 142,125 Z" fill={c.hairColor} {...S} />
        </>
      )}
      {c.hair === "wolfcut" && (
        <path d="M 28,95 Q 6,150 26,190 L 46,190 Q 38,150 42,120 Z M 172,95 Q 194,150 174,190 L 154,190 Q 162,150 158,120 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "dreads" && (
        <>
          <rect x="25" y="90" width="10" height="120" rx="5" fill={c.hairColor} {...S} />
          <rect x="15" y="100" width="10" height="100" rx="5" fill={c.hairColor} {...S} />
          <rect x="165" y="90" width="10" height="120" rx="5" fill={c.hairColor} {...S} />
          <rect x="175" y="100" width="10" height="100" rx="5" fill={c.hairColor} {...S} />
        </>
      )}

      {/* ================= 2. PIERNAS Y CALZADO ================= */}
      {c.outfit === "dress" || c.outfit === "kimono" || c.outfit === "wizard" || c.outfit === "ninja" || c.outfit === "detective" ? (
        <>
          <rect x="83" y="195" width="13" height="43" rx="5" fill={c.skin} {...S} />
          <rect x="104" y="195" width="13" height="43" rx="5" fill={c.skin} {...S} />
        </>
      ) : (
        <>
          <rect x="80" y="192" width="16" height="46" rx="6" fill={c.outfit === "overalls" ? c.outfitColor : "#3A5B8C"} {...S} />
          <rect x="104" y="192" width="16" height="46" rx="6" fill={c.outfit === "overalls" ? c.outfitColor : "#3A5B8C"} {...S} />
        </>
      )}
      {/* Zapatos */}
      <ellipse cx="87" cy="242" rx="13" ry="8" fill="#FFFFFF" {...S} />
      <ellipse cx="113" cy="242" rx="13" ry="8" fill="#FFFFFF" {...S} />
      <path d="M 74,242 L 100,242 M 100,242 L 126,242" stroke="#2A1B14" strokeWidth="2" />

      {/* ================= 3. CUELLO BASE ================= */}
      <rect x="91" y="145" width="18" height="24" rx="4" fill={c.skin} {...S} />

      {/* ================= 4. CUERPO (ROPA) ================= */}
      {c.outfit === "dress" ? (
        <path d="M 68,168 Q 100,162 132,168 L 142,205 Q 100,216 58,205 Z" fill={c.outfitColor} {...S} />
      ) : c.outfit === "kimono" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 144,215 Q 100,218 56,215 Z" fill={c.outfitColor} {...S} />
          <path d="M 85,166 L 100,188 L 115,166" fill="none" stroke="#2A1B14" strokeWidth="2.5" />
          <rect x="70" y="186" width="60" height="12" fill="#FE5F55" {...S} />
        </>
      ) : c.outfit === "jersey" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 136,204 Q 100,212 64,204 Z" fill={c.outfitColor} {...S} />
          <rect x="95" y="176" width="10" height="18" rx="2" fill="#FFFFFF" opacity="0.9" />
          <line x1="82" y1="166" x2="82" y2="204" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
          <line x1="118" y1="166" x2="118" y2="204" stroke="#FFFFFF" strokeWidth="2" opacity="0.8" />
        </>
      ) : c.outfit === "chef" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 136,204 Q 100,212 64,204 Z" fill="#F3F4F6" {...S} />
          <circle cx="92" cy="180" r="2" fill="#2A1B14" />
          <circle cx="108" cy="180" r="2" fill="#2A1B14" />
          <circle cx="92" cy="192" r="2" fill="#2A1B14" />
          <circle cx="108" cy="192" r="2" fill="#2A1B14" />
          <path d="M 86,166 Q 100,175 114,166 L 100,163 Z" fill="#FE5F55" {...S} />
        </>
      ) : c.outfit === "wizard" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 140,212 Q 100,216 60,212 Z" fill={c.outfitColor} {...S} />
          <polygon points="100,175 92,192 108,192" fill="#F5D488" {...thin} />
          <line x1="100" y1="192" x2="100" y2="212" stroke="#2A1B14" strokeWidth="1.8" />
        </>
      ) : c.outfit === "suit" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 136,204 Q 100,212 64,204 Z" fill="#2D3748" {...S} />
          <polygon points="90,166 100,185 110,166" fill="#FFFFFF" />
          <polygon points="98,175 102,175 104,195 100,201 96,195" fill={c.outfitColor} {...thin} />
        </>
      ) : c.outfit === "astronaut" ? (
        <>
          <path d="M 66,166 Q 100,158 134,166 L 138,205 Q 100,214 62,205 Z" fill="#E2E8F0" {...S} />
          <circle cx="100" cy="186" r="10" fill={c.outfitColor} {...thin} />
          <path d="M 94,186 L 106,186" stroke="#FFFFFF" strokeWidth="2" />
        </>
      ) : c.outfit === "pajamas" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 136,205 Q 100,214 64,205 Z" fill={c.outfitColor} {...S} />
          {/* Estrellitas en la pijama */}
          <polygon points="85,178 87,181 90,181 88,183 89,186 85,184 81,186 82,183 80,181 83,181" fill="#FFFFFF" opacity="0.8" />
          <polygon points="115,188 117,191 120,191 118,193 119,196 115,194 111,196 112,193 110,191 113,191" fill="#FFFFFF" opacity="0.8" />
        </>
      ) : c.outfit === "detective" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 140,210 Q 100,215 60,210 Z" fill="#7C5843" {...S} />
          <path d="M 85,166 L 100,192 L 115,166" fill="none" stroke="#2A1B14" strokeWidth="2.5" />
          <circle cx="84" cy="195" r="3" fill="#F5D488" {...thin} />
          <circle cx="116" cy="195" r="3" fill="#F5D488" {...thin} />
        </>
      ) : c.outfit === "builder" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 136,205 Q 100,214 64,205 Z" fill="#ED8936" {...S} />
          <rect x="80" y="166" width="40" height="39" fill="#1A202C" opacity="0.15" />
          <rect x="72" y="195" width="56" height="10" fill="#2D3748" {...thin} />
        </>
      ) : c.outfit === "ninja" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 140,212 Q 100,216 60,212 Z" fill="#1A202C" {...S} />
          <rect x="74" y="186" width="52" height="6" fill={c.outfitColor} {...thin} />
        </>
      ) : c.outfit === "overcoat" ? (
        <>
          <path d="M 66,166 Q 100,158 134,166 L 138,208 Q 100,216 62,208 Z" fill={c.outfitColor} {...S} />
          {/* Solapas elegantes */}
          <path d="M 68,166 L 88,190 L 100,166 L 112,190 L 132,166" fill="none" stroke="#2A1B14" strokeWidth="2.5" />
        </>
      ) : c.outfit === "swimsuit" ? (
        <>
          <path d="M 76,174 Q 100,170 124,174 L 128,205 Q 100,212 72,205 Z" fill={c.outfitColor} {...S} />
          <path d="M 82,174 L 82,166 M 118,174 L 118,166" stroke="#2A1B14" strokeWidth="2" />
        </>
      ) : c.outfit === "clown" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 136,204 Q 100,212 64,204 Z" fill="#F6AD55" {...S} />
          {/* Lunares gigantes */}
          <circle cx="86" cy="184" r="6" fill="#FC8181" {...thin} />
          <circle cx="114" cy="184" r="6" fill="#63B3ED" {...thin} />
          <circle cx="100" cy="198" r="5" fill="#4FD1C5" {...thin} />
        </>
      ) : c.outfit === "jacket" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 136,204 Q 100,212 64,204 Z" fill={c.outfitColor} {...S} />
          <line x1="100" y1="166" x2="100" y2="208" stroke="#2A1B14" strokeWidth="2.5" />
          <path d="M 84,167 L 100,185 L 116,167" fill="none" stroke="#2A1B14" strokeWidth="2.5" />
        </>
      ) : c.outfit === "sweater" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 136,205 Q 100,214 64,205 Z" fill={c.outfitColor} {...S} />
          <path d="M 72,178 Q 100,186 128,178" fill="none" stroke="#2A1B14" strokeWidth="1.8" opacity="0.6" />
        </>
      ) : c.outfit === "overalls" ? (
        <>
          <path d="M 68,166 Q 100,160 132,166 L 136,205 Q 100,214 64,205 Z" fill="#FFFFFF" {...S} />
          <path d="M 76,170 Q 100,166 124,170 L 128,205 Q 100,212 72,205 Z" fill={c.outfitColor} {...S} />
          <circle cx="84" cy="180" r="2.5" fill="#2A1B14" />
          <circle cx="116" cy="180" r="2.5" fill="#2A1B14" />
        </>
      ) : c.outfit === "hoodie" ? (
        <>
          <path d="M 66,166 Q 100,158 134,166 L 138,205 Q 100,214 62,205 Z" fill={c.outfitColor} {...S} />
          <path d="M 80,166 Q 100,182 120,166" fill="none" stroke="#2A1B14" strokeWidth="2.5" />
          <line x1="93" y1="172" x2="93" y2="188" stroke="#2A1B14" strokeWidth="1.8" />
          <line x1="107" y1="172" x2="107" y2="188" stroke="#2A1B14" strokeWidth="1.8" />
        </>
      ) : (
        /* Tee / Default */
        <path d="M 68,166 Q 100,160 132,166 L 136,204 Q 100,212 64,204 Z" fill={c.outfitColor} {...S} />
      )}

      {/* ================= 5. BRAZOS Y MANOS ================= */}
      <g>
        <path d="M 68,170 Q 52,176 50,198 Q 50,208 59,208 Q 68,206 70,194 Z" fill={c.outfit === "dress" || c.outfit === "kimono" || c.outfit === "wizard" || c.outfit === "swimsuit" || c.outfit === "detective" ? c.skin : c.outfit === "chef" ? "#F3F4F6" : c.outfit === "suit" ? "#2D3748" : c.outfit === "astronaut" ? "#E2E8F0" : c.outfit === "ninja" ? "#1A202C" : c.outfitColor} {...S} />
        <path d="M 132,170 Q 148,176 150,198 Q 150,208 141,208 Q 132,206 130,194 Z" fill={c.outfit === "dress" || c.outfit === "kimono" || c.outfit === "wizard" || c.outfit === "swimsuit" || c.outfit === "detective" ? c.skin : c.outfit === "chef" ? "#F3F4F6" : c.outfit === "suit" ? "#2D3748" : c.outfit === "astronaut" ? "#E2E8F0" : c.outfit === "ninja" ? "#1A202C" : c.outfitColor} {...S} />
        <circle cx="56" cy="207" r="7.5" fill={c.skin} {...S} />
        <circle cx="144" cy="207" r="7.5" fill={c.skin} {...S} />
      </g>

      {/* ================= 6. CABEZA ================= */}
      <ellipse cx="100" cy="88" rx="69" ry="71" fill={c.skin} {...S} />

      {/* Rubor */}
      <ellipse cx="58" cy="115" rx="13" ry="8" fill="#FF9BB8" opacity="0.65" />
      <ellipse cx="142" cy="115" rx="13" ry="8" fill="#FF9BB8" opacity="0.65" />

      {/* ================= 7. EXPRESIONES / OJOS ================= */}
      {c.eyes === "normal" && (
        <g>
          <ellipse cx="76" cy="100" rx="14" ry="19" fill="#2A1B14" />
          <ellipse cx="124" cy="100" rx="14" ry="19" fill="#2A1B14" />
          <ellipse cx="76" cy="102" rx="10" ry="15" fill={c.hairColor} />
          <ellipse cx="124" cy="102" rx="10" ry="15" fill={c.hairColor} />
          <ellipse cx="72" cy="94" rx="5" ry="6" fill="#FFFFFF" />
          <ellipse cx="120" cy="94" rx="5" ry="6" fill="#FFFFFF" />
          <circle cx="80" cy="109" r="2.8" fill="#FFFFFF" />
          <circle cx="128" cy="109" r="2.8" fill="#FFFFFF" />
          <circle cx="68" cy="98" r="1.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="116" cy="98" r="1.5" fill="#FFFFFF" opacity="0.8" />
          <path d="M 60,84 Q 65,78 74,81 M 92,84 Q 87,78 78,81" fill="none" {...thin} />
          <path d="M 108,84 Q 113,78 122,81 M 140,84 Q 135,78 126,81" fill="none" {...thin} />
        </g>
      )}
      {c.eyes === "happy" && (
        <g>
          <path d="M 60,102 Q 75,82 90,102" fill="none" stroke="#2A1B14" strokeWidth="5" strokeLinecap="round" />
          <path d="M 110,102 Q 124,82 139,102" fill="none" stroke="#2A1B14" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {c.eyes === "wink" && (
        <g>
          <ellipse cx="76" cy="100" rx="14" ry="19" fill="#2A1B14" />
          <ellipse cx="76" cy="102" rx="10" ry="15" fill={c.hairColor} />
          <ellipse cx="72" cy="94" rx="5" ry="6" fill="#FFFFFF" />
          <circle cx="80" cy="109" r="2.8" fill="#FFFFFF" />
          <path d="M 110,102 Q 124,82 139,102" fill="none" stroke="#2A1B14" strokeWidth="5" strokeLinecap="round" />
        </g>
      )}
      {c.eyes === "sparkle" && (
        <g>
          <ellipse cx="76" cy="100" rx="14" ry="19" fill="#2A1B14" />
          <ellipse cx="124" cy="100" rx="14" ry="19" fill="#2A1B14" />
          <polygon points="76,86 79,96 89,99 79,102 76,112 73,102 63,99 73,96" fill="#FFFFFF" />
          <polygon points="124,86 127,96 137,99 127,102 124,112 121,102 111,99 121,96" fill="#FFFFFF" />
        </g>
      )}
      {c.eyes === "star" && (
        <g>
          <ellipse cx="76" cy="100" rx="15" ry="15" fill="#F5D488" {...S} />
          <polygon points="76,88 80,96 88,97 82,103 84,111 76,107 68,111 70,103 64,97 72,96" fill="#FFFFFF" />
          <ellipse cx="124" cy="100" rx="15" ry="15" fill="#F5D488" {...S} />
          <polygon points="124,88 128,96 136,97 130,103 132,111 124,107 116,111 118,103 112,97 120,96" fill="#FFFFFF" />
        </g>
      )}
      {c.eyes === "anime-sad" && (
        <g>
          <ellipse cx="76" cy="100" rx="13" ry="17" fill="#2A1B14" />
          <ellipse cx="124" cy="100" rx="13" ry="17" fill="#2A1B14" />
          <ellipse cx="76" cy="102" rx="9" ry="13" fill="#7EAEE0" />
          <ellipse cx="124" cy="102" rx="9" ry="13" fill="#7EAEE0" />
          <ellipse cx="72" cy="94" rx="4" ry="5" fill="#FFFFFF" />
          <ellipse cx="120" cy="94" rx="4" ry="5" fill="#FFFFFF" />
          <path d="M 71,116 Q 73,126 77,121" fill="#8FB4E8" opacity="0.8" stroke="#2A1B14" strokeWidth="1" />
          <path d="M 119,116 Q 121,126 125,121" fill="#8FB4E8" opacity="0.8" stroke="#2A1B14" strokeWidth="1" />
        </g>
      )}
      {c.eyes === "sleeping" && (
        <g>
          <path d="M 64,102 Q 76,112 88,102" fill="none" stroke="#2A1B14" strokeWidth="4" strokeLinecap="round" />
          <path d="M 112,102 Q 124,112 136,102" fill="none" stroke="#2A1B14" strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      {c.eyes === "unimpressed" && (
        <g>
          <ellipse cx="76" cy="100" rx="14" ry="14" fill="#2A1B14" />
          <ellipse cx="124" cy="100" rx="14" ry="14" fill="#2A1B14" />
          <ellipse cx="72" cy="100" rx="5" ry="5" fill="#FFFFFF" />
          <ellipse cx="120" cy="100" rx="5" ry="5" fill="#FFFFFF" />
          <line x1="60" y1="88" x2="92" y2="88" stroke="#2A1B14" strokeWidth="3" />
          <line x1="108" y1="88" x2="140" y2="88" stroke="#2A1B14" strokeWidth="3" />
        </g>
      )}
      {c.eyes === "dizzy" && (
        <g>
          <path d="M 64,100 C 64,88 88,88 88,100 C 88,112 64,112 64,100 Z" fill="none" stroke="#2A1B14" strokeWidth="3.5" />
          <path d="M 70,100 C 70,94 82,94 82,100" fill="none" stroke="#2A1B14" strokeWidth="2.5" />
          <path d="M 112,100 C 112,88 136,88 136,100 C 136,112 112,112 112,100 Z" fill="none" stroke="#2A1B14" strokeWidth="3.5" />
          <path d="M 118,100 C 118,94 130,94 130,100" fill="none" stroke="#2A1B14" strokeWidth="2.5" />
        </g>
      )}
      {c.eyes === "heart-eyes" && (
        <g>
          <path d="M 64,100 Q 76,82 88,100 Q 76,118 64,100 Z" fill="#FE5F55" {...S} />
          <path d="M 112,100 Q 124,82 136,100 Q 124,118 112,100 Z" fill="#FE5F55" {...S} />
        </g>
      )}
      {c.eyes === "glamor" && (
        <g>
          <ellipse cx="76" cy="102" rx="14" ry="14" fill="#2A1B14" />
          <ellipse cx="124" cy="102" rx="14" ry="14" fill="#2A1B14" />
          <ellipse cx="74" cy="98" rx="5" ry="5" fill="#FFFFFF" />
          <ellipse cx="122" cy="98" rx="5" ry="5" fill="#FFFFFF" />
          {/* Pestañas de diva */}
          <path d="M 58,94 L 64,98" stroke="#2A1B14" strokeWidth="3" strokeLinecap="round" />
          <path d="M 142,94 L 136,98" stroke="#2A1B14" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {c.eyes === "monocle" && (
        <g>
          <ellipse cx="76" cy="100" rx="14" ry="19" fill="#2A1B14" />
          <ellipse cx="76" cy="102" rx="10" ry="15" fill={c.hairColor} />
          <ellipse cx="72" cy="94" rx="5" ry="6" fill="#FFFFFF" />
          <circle cx="80" cy="109" r="2.8" fill="#FFFFFF" />
          {/* Ojo derecho con monóculo dorado */}
          <ellipse cx="124" cy="100" rx="16" ry="21" fill="none" stroke="#F5D488" strokeWidth="3" />
          <ellipse cx="124" cy="100" rx="12" ry="17" fill="#2A1B14" />
          <ellipse cx="120" cy="94" rx="4" ry="5" fill="#FFFFFF" />
          <path d="M 140,105 L 152,125" stroke="#F5D488" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}
      {c.eyes === "pixel-retro" && (
        <g>
          <rect x="66" y="90" width="18" height="18" fill="#2A1B14" />
          <rect x="70" y="94" width="6" height="6" fill="#FFFFFF" />
          <rect x="114" y="90" width="18" height="18" fill="#2A1B14" />
          <rect x="118" y="94" width="6" height="6" fill="#FFFFFF" />
        </g>
      )}

      {/* Nariz */}
      <path d="M 98,119 Q 100,122 102,119" fill="none" stroke="#2A1B14" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />

      {/* Expresiones de boca */}
      {c.mood === "happy" && (
        <path d="M 91,129 Q 100,140 109,129" fill="#B85B7A" stroke="#2A1B14" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {c.mood === "calm" && (
        <path d="M 93,131 Q 100,133 107,131" fill="none" stroke="#2A1B14" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {c.mood === "excited" && (
        <path d="M 89,127 Q 100,146 111,127 Q 100,133 89,127 Z" fill="#B85B7A" stroke="#2A1B14" strokeWidth="2.5" />
      )}
      {c.mood === "thinking" && (
        <path d="M 93,132 Q 100,128 107,131" fill="none" stroke="#2A1B14" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {c.mood === "surprised" && (
        <ellipse cx="100" cy="131" rx="4" ry="6" fill="#B85B7A" stroke="#2A1B14" strokeWidth="2.5" />
      )}
      {c.mood === "cool" && (
        <path d="M 91,130 Q 100,127 109,130" fill="none" stroke="#2A1B14" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* ================= 8. CABELLO FRONTAL ================= */}
      {c.hair === "short" && (
        <path d="M 31,88 Q 28,24 100,16 Q 172,24 169,88 Q 148,58 128,66 Q 114,48 100,56 Q 86,48 72,66 Q 52,58 31,88 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "long" && (
        <path d="M 30,90 Q 28,24 100,16 Q 172,24 170,90 Q 148,60 130,70 Q 114,48 100,58 Q 86,48 70,70 Q 52,60 30,90 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "curly" && (
        <path d="M 30,94 C 18,58 42,28 70,38 C 80,18 120,18 130,38 C 158,28 182,58 170,94 C 152,72 136,80 122,66 C 108,52 92,52 78,66 C 64,80 50,72 30,94 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "ponytail" && (
        <path d="M 31,88 Q 28,24 100,16 Q 172,24 169,88 Q 148,58 128,66 Q 114,48 100,56 Q 86,48 72,66 Q 52,58 31,88 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "buns" && (
        <>
          <circle cx="44" cy="38" r="23" fill={c.hairColor} {...S} />
          <circle cx="156" cy="38" r="23" fill={c.hairColor} {...S} />
          <path d="M 38,86 Q 32,36 100,28 Q 168,36 162,86 Q 144,60 128,68 Q 114,50 100,58 Q 86,50 72,68 Q 56,60 38,86 Z" fill={c.hairColor} {...S} />
        </>
      )}
      {c.hair === "spiky" && (
        <path d="M 32,90 L 26,58 L 46,64 L 56,38 L 74,54 L 100,26 L 126,54 L 144,38 L 154,64 L 174,58 L 168,90 Q 100,66 32,90 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "braids" && (
        <path d="M 31,88 Q 28,24 100,16 Q 172,24 169,88 Q 148,58 128,66 Q 114,48 100,56 Q 86,48 72,66 Q 52,58 31,88 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "wolfcut" && (
        <path d="M 30,90 Q 28,24 100,16 Q 172,24 170,90 Q 155,56 132,68 Q 114,35 100,50 Q 86,35 68,68 Q 45,56 30,90 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "mohawk" && (
        <path d="M 86,30 L 100,2 L 114,30 L 100,45 Z M 92,60 L 100,32 L 108,60 L 100,75 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "space-buns" && (
        <>
          <circle cx="50" cy="32" r="16" fill={c.hairColor} {...S} />
          <circle cx="150" cy="32" r="16" fill={c.hairColor} {...S} />
          <path d="M 31,88 Q 28,24 100,16 Q 172,24 169,88 Q 152,65 130,70 Q 114,54 100,60 Q 86,54 70,70 Q 48,65 31,88 Z" fill={c.hairColor} {...S} />
        </>
      )}
      {c.hair === "dreads" && (
        <path d="M 31,88 Q 28,24 100,16 Q 172,24 169,88 Q 148,58 128,66 Q 114,48 100,56 Q 86,48 72,66 Q 52,58 31,88 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "vintage-waves" && (
        <path d="M 30,90 C 25,50 60,20 100,24 C 140,20 175,50 170,90 C 158,80 144,92 124,78 C 104,64 96,64 76,78 C 56,92 42,80 30,90 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "flat-top" && (
        <path d="M 40,84 L 40,40 L 160,40 L 160,84 Q 100,75 40,84 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "curly-bob" && (
        <path d="M 28,94 C 20,74 34,44 64,34 C 80,24 120,24 136,34 C 166,44 180,74 172,94 C 160,86 148,94 136,84 C 124,74 112,74 100,84 C 88,74 76,74 64,84 C 52,94 40,86 28,94 Z" fill={c.hairColor} {...S} />
      )}
      {c.hair === "bald" && null}

      {/* ================= 9. ACCESORIOS DE CAPA SUPERIOR ================= */}
      {c.accessory === "glasses" && (
        <g>
          <circle cx="76" cy="100" r="19" fill="none" stroke="#2A1B14" strokeWidth="3.5" />
          <circle cx="124" cy="100" r="19" fill="none" stroke="#2A1B14" strokeWidth="3.5" />
          <line x1="95" y1="100" x2="105" y2="100" stroke="#2A1B14" strokeWidth="3.5" />
        </g>
      )}
      {c.accessory === "lentes_corazon" && (
        <g>
          <path d="M 52,98 Q 60,80 76,87 Q 92,80 100,98 Q 92,116 76,116 Q 60,116 52,98 Z" fill="none" stroke="#FE5F55" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M 100,98 Q 108,80 124,87 Q 140,80 148,98 Q 140,116 124,116 Q 108,116 100,98 Z" fill="none" stroke="#FE5F55" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          <line x1="95" y1="97" x2="105" y2="97" stroke="#2A1B14" strokeWidth="3" />
        </g>
      )}
      {c.accessory === "cap" && (
        <g>
          <path d="M 34,54 Q 100,4 166,54 Q 140,40 100,40 Q 60,40 34,54 Z" fill="#E85D75" {...S} />
          <path d="M 138,51 Q 186,53 195,64 L 154,60 Z" fill="#C4425A" {...S} />
        </g>
      )}
      {c.accessory === "headphones" && (
        <g>
          <path d="M 33,84 Q 33,18 100,16 Q 167,18 167,84" fill="none" stroke="#8B7EF1" strokeWidth="8.5" strokeLinecap="round" />
          <rect x="23" y="78" width="18" height="32" rx="9" fill="#8B7EF1" {...S} />
          <rect x="159" y="78" width="18" height="32" rx="9" fill="#8B7EF1" {...S} />
        </g>
      )}
      {c.accessory === "earrings" && (
        <>
          <circle cx="30" cy="116" r="5" fill="#F5C842" {...S} />
          <circle cx="170" cy="116" r="5" fill="#F5C842" {...S} />
        </>
      )}
      {c.accessory === "scarf" && (
        <path d="M 64,152 Q 100,168 136,152 Q 142,178 124,180 L 118,204 L 108,204 L 112,182 Q 100,184 88,182 L 92,204 L 82,204 L 76,180 Q 58,178 64,152 Z" fill="#FE5F55" {...S} />
      )}
      {c.accessory === "crown" && (
        <g>
          <polygon points="56,30 68,10 82,26 100,4 118,26 132,10 144,30" fill="#F5D488" {...S} />
          <circle cx="68" cy="12" r="3" fill="#FE5F55" />
          <circle cx="100" cy="6" r="3" fill="#7EAEE0" />
          <circle cx="132" cy="12" r="3" fill="#B0DFC9" />
        </g>
      )}
      {c.accessory === "gato" && (
        <g>
          <ellipse cx="100" cy="20" rx="32" ry="14" fill="#FFFFFF" {...S} />
          <circle cx="124" cy="18" r="13" fill="#FFFFFF" {...S} />
          <polygon points="114,10 118,2 123,8" fill="#FFFFFF" {...S} />
          <polygon points="126,8 131,2 134,10" fill="#FFFFFF" {...S} />
          <path d="M 120,18 Q 122,21 124,18" fill="none" stroke="#2A1B14" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 127,18 Q 129,21 131,18" fill="none" stroke="#2A1B14" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 72,24 Q 60,30 62,18 Q 64,12 72,16" fill="none" stroke="#FFFFFF" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M 72,24 Q 60,30 62,18 Q 64,12 72,16" fill="none" stroke="#2A1B14" strokeWidth="2.8" strokeLinecap="round" />
        </g>
      )}
      {c.accessory === "halo" && (
        <g>
          <ellipse cx="100" cy="12" rx="30" ry="8" fill="none" stroke="#F6E05E" strokeWidth="4.5" opacity="0.9" />
          <ellipse cx="100" cy="12" rx="30" ry="8" fill="none" stroke="#FFF5F5" strokeWidth="1.5" opacity="0.7" />
        </g>
      )}
      {c.accessory === "eyepatch" && (
        <g>
          <line x1="42" y1="92" x2="110" y2="108" stroke="#2A1B14" strokeWidth="3" />
          <rect x="64" y="90" width="22" height="20" rx="4" fill="#2A1B14" {...S} />
        </g>
      )}
      {c.accessory === "ribbon" && (
        <g>
          {/* Lazo rosa para el pelo */}
          <polygon points="50,44 70,32 70,56" fill="#FC8181" {...S} />
          <polygon points="90,44 70,32 70,56" fill="#FC8181" {...S} />
          <circle cx="70" cy="44" r="5" fill="#FFF" {...S} />
        </g>
      )}
      {c.accessory === "detective-hat" && (
        <g>
          <ellipse cx="100" cy="38" rx="55" ry="14" fill="#7C5843" {...S} />
          <path d="M 60,34 Q 100,-6 140,34 Z" fill="#7C5843" {...S} />
          <rect x="58" y="26" width="84" height="8" fill="#2A1B14" />
        </g>
      )}
      {c.accessory === "chef-hat" && (
        <g>
          <path d="M 70,40 C 50,15 90,-5 100,12 C 110,-5 150,15 130,40 Z" fill="#FFFFFF" {...S} />
          <rect x="74" y="32" width="52" height="15" rx="3" fill="#FFFFFF" {...S} />
        </g>
      )}
      {c.accessory === "flower" && (
        <g>
          <circle cx="148" cy="74" r="8" fill="#FFF" {...thin} />
          <circle cx="158" cy="82" r="8" fill="#FFF" {...thin} />
          <circle cx="140" cy="86" r="8" fill="#FFF" {...thin} />
          <circle cx="148" cy="82" r="6" fill="#F6E05E" {...thin} />
        </g>
      )}
      {c.accessory === "clown-nose" && (
        <circle cx="100" cy="118" r="9" fill="#E53E3E" {...S} />
      )}
    </svg>
  );
}