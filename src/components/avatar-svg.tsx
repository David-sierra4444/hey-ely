import { useMemo } from "react";

export type AvatarConfig = {
  skin?: string;
  hair?: string;
  hairColor?: string;
  eyes?: string;
  outfit?: string;
  outfitColor?: string;
  accessory?: string;
  mood?: "happy" | "calm" | "excited" | "thinking";
};

export const AVATAR_OPTIONS = {
  skin: ["#F5D6BA", "#EAC199", "#D9A574", "#B67F4F", "#8A5A3B", "#5C3A22"],
  hair: ["short", "long", "curly", "ponytail", "buns", "bald"],
  hairColor: ["#2C1810", "#5C3A22", "#B67F4F", "#E8B860", "#C97A9A", "#7A9AC9", "#9A7AC9"],
  eyes: ["normal", "happy", "wink", "sparkle"],
  outfit: ["hoodie", "tee", "jacket", "dress"],
  outfitColor: ["#8FB4E8", "#F3B4C6", "#B0DFC9", "#C7B4EA", "#F5D488", "#F19B84"],
  accessory: ["none", "glasses", "cap", "headphones", "earrings"],
} as const;

export function AvatarSVG({ config, size = 160 }: { config: AvatarConfig; size?: number }) {
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

  // Contorno negro grueso estándar para el estilo Kawaii
  const strokeProps = {
    stroke: "#1A1A1A",
    strokeWidth: "3.5",
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  return (
    <svg 
      viewBox="0 0 200 200" 
      width={size} 
      height={size} 
      className="drop-shadow-sm w-full h-full object-contain block"
    >
      <rect width="200" height="200" fill="none" />

      {/* DETRÁS DEL CUERPO: Cabello Largo Trasero */}
      {c.hair === "long" && (
        <path d="M50 80 Q30 130 50 160 Q100 170 150 160 Q170 130 150 80 Z" fill={c.hairColor} {...strokeProps} />
      )}
      {c.hair === "ponytail" && (
        <g transform="translate(35, 30)">
          <path d="M110 50 C140 30 160 60 150 90 C130 110 110 90 110 70 Z" fill={c.hairColor} {...strokeProps} />
          <path d="M112 65 Q125 55 135 75" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      {c.hair === "buns" && (
        <g>
          <circle cx="55" cy="45" r="22" fill={c.hairColor} {...strokeProps} />
          <circle cx="145" cy="45" r="22" fill={c.hairColor} {...strokeProps} />
        </g>
      )}

      {/* PIES Y ZAPATOS (Llamativos de caricatura) */}
      <g>
        {/* Zapato Izquierdo */}
        <ellipse cx="80" cy="188" rx="16" ry="10" fill="#2C1810" {...strokeProps} />
        <ellipse cx="80" cy="184" rx="16" ry="6" fill="#FFF" opacity="0.3" />
        {/* Zapato Derecho */}
        <ellipse cx="120" cy="188" rx="16" ry="10" fill="#2C1810" {...strokeProps} />
        <ellipse cx="120" cy="184" rx="16" ry="6" fill="#FFF" opacity="0.3" />
      </g>

      {/* PIERNAS CORTAS */}
      <rect x="74" y="165" width="12" height="20" fill={c.skin} {...strokeProps} />
      <rect x="114" y="165" width="12" height="20" fill={c.skin} {...strokeProps} />

      {/* BRAZOS (Tipo caricatura, ligeramente separados) */}
      <g>
        {/* Brazo Izquierdo */}
        <path d="M60 142 Q40 155 45 168 Q53 172 60 158 Z" fill={c.skin} {...strokeProps} />
        {c.outfit !== "dress" && <path d="M60 142 Q48 150 52 158" fill={c.outfitColor} {...strokeProps} />}
        
        {/* Brazo Derecho */}
        <path d="M140 142 Q160 155 155 168 Q147 172 140 158 Z" fill={c.skin} {...strokeProps} />
        {c.outfit !== "dress" && <path d="M140 142 Q152 150 148 158" fill={c.outfitColor} {...strokeProps} />}
      </g>

      {/* CUERPO PEQUEÑO (Ropa) */}
      <g>
        {c.outfit === "dress" ? (
          <path d="M65 140 L50 175 L150 175 L135 140 Z" fill={c.outfitColor} {...strokeProps} />
        ) : c.outfit === "jacket" ? (
          <>
            <rect x="62" y="138" width="76" height="32" rx="10" fill={c.outfitColor} {...strokeProps} />
            <line x1="100" y1="138" x2="100" y2="170" stroke="#1A1A1A" strokeWidth="2.5" />
            <circle cx="94" cy="154" r="3" fill="#FFF" />
          </>
        ) : (
          <rect x="62" y="138" width="76" height="32" rx="10" fill={c.outfitColor} {...strokeProps} />
        )}

        {/* Detalle Hoodie */}
        {c.outfit === "hoodie" && (
          <path d="M75 138 Q100 154 125 138" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        )}
      </g>

      {/* CUELLO RECTANGULAR CHICO */}
      <rect x="92" y="125" width="16" height="15" fill={c.skin} {...strokeProps} />

      {/* CABEZA ENORME (Estilo Chibi, 45% del total) */}
      <rect x="52" y="45" width="96" height="90" rx="42" fill={c.skin} {...strokeProps} />

      {/* MEJILLAS SONROJADAS KAWAII */}
      <ellipse cx="68" cy="110" rx="9" ry="5" fill="#FF94B8" opacity="0.6" />
      <ellipse cx="132" cy="110" rx="9" ry="5" fill="#FF94B8" opacity="0.6" />

      {/* OJOS GRANDES CON BRILLO KAWAII */}
      <g>
        {c.eyes === "normal" && (
          <>
            {/* Ojo Izquierdo */}
            <ellipse cx="74" cy="96" rx="9" ry="12" fill="#1A1A1A" />
            <circle cx="72" cy="91" r="3.5" fill="#FFF" />
            <circle cx="77" cy="100" r="1.5" fill="#FFF" />
            {/* Ojo Derecho */}
            <ellipse cx="126" cy="96" rx="9" ry="12" fill="#1A1A1A" />
            <circle cx="124" cy="91" r="3.5" fill="#FFF" />
            <circle cx="129" cy="100" r="1.5" fill="#FFF" />
          </>
        )}
        {c.eyes === "happy" && (
          <>
            <path d="M64 98 Q74 84 84 98" fill="none" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M116 98 Q126 84 136 98" fill="none" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" />
          </>
        )}
        {c.eyes === "wink" && (
          <>
            <ellipse cx="74" cy="96" rx="9" ry="12" fill="#1A1A1A" />
            <circle cx="72" cy="91" r="3.5" fill="#FFF" />
            <circle cx="77" cy="100" r="1.5" fill="#FFF" />
            <path d="M116 96 Q126 84 136 96" fill="none" stroke="#1A1A1A" strokeWidth="4.5" strokeLinecap="round" />
          </>
        )}
        {c.eyes === "sparkle" && (
          <>
            {/* Izquierdo animado/brillante */}
            <ellipse cx="74" cy="96" rx="9" ry="12" fill="#1A1A1A" />
            <path d="M74 88 L76 93 L81 93 L77 96 L79 101 L74 98 L69 101 L71 96 L67 93 L72 93 Z" fill="#FFF" />
            {/* Derecho animado/brillante */}
            <ellipse cx="126" cy="96" rx="9" ry="12" fill="#1A1A1A" />
            <path d="M126 88 L128 93 L133 93 L129 96 L131 101 L126 98 L121 101 L123 96 L119 93 L124 93 Z" fill="#FFF" />
          </>
        )}
      </g>

      {/* BOCA PEQUEÑA Y EXPRESIVA */}
      <g>
        {c.mood === "happy" && (
          <path d="M94 110 Q100 118 106 110" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        )}
        {c.mood === "calm" && (
          <line x1="95" y1="112" x2="105" y2="112" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        )}
        {c.mood === "excited" && (
          <path d="M93 108 Q100 124 107 108 Z" fill="#FF6B8B" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        )}
        {c.mood === "thinking" && (
          <path d="M95 113 Q100 108 105 111" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        )}
      </g>

      {/* CABELLO DELANTERO (Mechones grandes y redondeados) */}
      <g>
        {c.hair === "short" && (
          <path d="M52 75 Q45 40 100 38 Q155 40 148 75 Q130 52 115 62 Q100 48 85 62 Q70 52 52 75 Z" fill={c.hairColor} {...strokeProps} />
        )}
        {c.hair === "long" && (
          <path d="M52 75 Q45 40 100 38 Q155 40 148 75 Q132 55 120 62 Q100 45 80 62 Q68 55 52 75 Z" fill={c.hairColor} {...strokeProps} />
        )}
        {c.hair === "curly" && (
          <path d="M50 76 C40 50 60 30 80 40 C90 25 110 25 120 40 C140 30 160 50 150 76 C135 60 125 65 115 58 C100 48 85 58 75 58 C65 65 58 60 50 76 Z" fill={c.hairColor} {...strokeProps} />
        )}
        {c.hair === "ponytail" && (
          <path d="M52 75 Q45 40 100 38 Q155 40 148 75 Q130 52 115 62 Q100 48 85 62 Q70 52 52 75 Z" fill={c.hairColor} {...strokeProps} />
        )}
        {c.hair === "buns" && (
          <path d="M52 75 Q45 45 100 42 Q155 45 148 75 Q130 55 115 62 Q100 50 85 62 Q70 55 52 75 Z" fill={c.hairColor} {...strokeProps} />
        )}
      </g>

      {/* ACCESORIOS */}
      <g>
        {c.accessory === "glasses" && (
          <>
            <circle cx="76" cy="98" r="15" fill="none" stroke="#1A1A1A" strokeWidth="3.5" />
            <circle cx="124" cy="98" r="15" fill="none" stroke="#1A1A1A" strokeWidth="3.5" />
            <line x1="91" y1="98" x2="109" y2="98" stroke="#1A1A1A" strokeWidth="3.5" />
            {/* Brillo del lente */}
            <line x1="68" y1="90" x2="76" y2="98" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <line x1="116" y1="90" x2="124" y2="98" stroke="#FFF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          </>
        )}
        {c.accessory === "cap" && (
          <g>
            <path d="M56 58 Q100 20 144 58 Z" fill="#7A9AC9" {...strokeProps} />
            <path d="M130 54 Q170 54 180 64 L144 64 Z" fill="#6585B2" {...strokeProps} />
          </g>
        )}
        {c.accessory === "headphones" && (
          <>
            <path d="M54 75 Q54 32 100 32 Q146 32 146 75" fill="none" stroke="#8B7EF1" strokeWidth="7" strokeLinecap="round" />
            <rect x="46" y="74" width="14" height="26" rx="6" fill="#8B7EF1" {...strokeProps} />
            <rect x="140" y="74" width="14" height="26" rx="6" fill="#8B7EF1" {...strokeProps} />
          </>
        )}
        {c.accessory === "earrings" && (
          <>
            <circle cx="49" cy="104" r="4" fill="#F5C842" {...strokeProps} />
            <circle cx="151" cy="104" r="4" fill="#F5C842" {...strokeProps} />
          </>
        )}
      </g>
    </svg>
  );
}
