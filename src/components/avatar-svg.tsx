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
  hair: ["short", "long", "curly", "ponytail", "buns", "spiky", "braids", "bald"],
  hairColor: ["#2C1810", "#5C3A22", "#B67F4F", "#E8B860", "#C97A9A", "#7A9AC9", "#9A7AC9", "#FE5F55"],
  eyes: ["normal", "happy", "wink", "sparkle", "star", "anime-sad"],
  outfit: ["hoodie", "tee", "jacket", "dress", "sweater", "overalls"],
  outfitColor: ["#8FB4E8", "#F3B4C6", "#B0DFC9", "#C7B4EA", "#F5D488", "#F19B84", "#222222", "#FFFFFF"],
  accessory: ["none", "glasses", "cap", "headphones", "earrings", "scarf", "crown"],
} as const;

// ============================================================
//  CHIBI TOCA-BOCA STYLE AVATAR (CORREGIDO)
// ============================================================

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

      {/* ================= 2. PIERNAS Y CALZADO ================= */}
      {c.outfit === "dress" ? (
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
      {/* Zapatos con valores rx/ry optimizados para evitar errores de tipo */}
      <ellipse cx="87" cy="242" rx="13" ry="8" fill="#FFFFFF" {...S} />
      <ellipse cx="113" cy="242" rx="13" ry="8" fill="#FFFFFF" {...S} />
      <path d="M 74,242 L 100,242 M 100,242 L 126,242" stroke="#2A1B14" strokeWidth="2" />

      {/* ================= 3. CUELLO BASE ================= */}
      <rect x="91" y="145" width="18" height="24" rx="4" fill={c.skin} {...S} />

      {/* ================= 4. CUERPO (ROPA) ================= */}
      {c.outfit === "dress" ? (
        <path d="M 68,168 Q 100,162 132,168 L 142,205 Q 100,216 58,205 Z" fill={c.outfitColor} {...S} />
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
        <path d="M 68,170 Q 52,176 50,198 Q 50,208 59,208 Q 68,206 70,194 Z" fill={c.outfit === "dress" ? c.skin : c.outfitColor} {...S} />
        <path d="M 132,170 Q 148,176 150,198 Q 150,208 141,208 Q 132,206 130,194 Z" fill={c.outfit === "dress" ? c.skin : c.outfitColor} {...S} />
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
      {/* Caso "bald" manejado para que no renderice cabello extra sobre la cabeza */}
      {c.hair === "bald" && null}

      {/* ================= 9. ACCESORIOS DE CAPA SUPERIOR ================= */}
      {c.accessory === "glasses" && (
        <g>
          <circle cx="76" cy="100" r="19" fill="none" stroke="#2A1B14" strokeWidth="3.5" />
          <circle cx="124" cy="100" r="19" fill="none" stroke="#2A1B14" strokeWidth="3.5" />
          <line x1="95" y1="100" x2="105" y2="100" stroke="#2A1B14" strokeWidth="3.5" />
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
    </svg>
  );
}