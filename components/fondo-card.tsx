import { useId } from "react"

const motivos = {
  // Dos anillos entrelazados
  anillos: (
    <g fill="none" stroke="currentColor" strokeWidth="8">
      <circle cx="-16" r="26" />
      <circle cx="16" r="26" />
    </g>
  ),
  // Estrella de cuatro puntas
  estrella: (
    <path d="M0-45C4-14 14-4 45 0 14 4 4 14 0 45-4 14-14 4-45 0-14-4-4-14 0-45Z" />
  ),
  // Flor de cinco pétalos
  flor: (
    <>
      {[0, 72, 144, 216, 288].map((angulo) => (
        <ellipse
          key={angulo}
          cy="-24"
          rx="13"
          ry="21"
          transform={`rotate(${angulo})`}
        />
      ))}
      <circle r="12" />
    </>
  ),
}

// Una tesela de 630 × 380: tres motivos cada 210 px y dos filas cada 190, la
// segunda desplazada media posición. La flor del borde va dos veces para que
// case con la tesela vecina
const tesela: {
  motivo: keyof typeof motivos
  x: number
  y: number
  giro: number
}[] = [
  { motivo: "anillos", x: 105, y: 95, giro: -20 },
  { motivo: "estrella", x: 315, y: 95, giro: 15 },
  { motivo: "flor", x: 525, y: 95, giro: -10 },
  { motivo: "flor", x: 0, y: 285, giro: 25 },
  { motivo: "flor", x: 630, y: 285, giro: 25 },
  { motivo: "anillos", x: 210, y: 285, giro: 10 },
  { motivo: "estrella", x: 420, y: 285, giro: -30 },
]

// Fondo de una card de la sección 1: número gigante, patrón y grano. El tono
// oscuro llega por la variable --oscuro de la card. Recorta aquí y no en la
// card para no tocar su sticky
function FondoCard({ numero }: { numero: string }) {
  const patron = useId()

  return (
    <div
      aria-hidden
      className="@container pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]"
    >
      {/* Asoma 24 px dentro de la franja que queda a la vista al apilarse: las
          cifras alineadas de Boska empiezan a 0.13em del borde de su caja */}
      <span
        data-fondo="numero"
        className="absolute top-[calc(var(--franja)-1.5rem-0.13em)] right-[12cqw] font-display text-[max(52.6cqw,15rem)] leading-none font-bold tracking-[-0.02em] text-(--oscuro) lining-nums"
      >
        {numero}
      </span>
      {/* En móvil el patrón va al 60 %: a tamaño real solo cabría un motivo */}
      <svg className="absolute top-0 left-0 size-full opacity-[0.07] max-lg:size-[166.7%] max-lg:origin-top-left max-lg:scale-60">
        <defs>
          <pattern
            id={patron}
            width="630"
            height="380"
            patternUnits="userSpaceOnUse"
          >
            {tesela.map(({ motivo, x, y, giro }) => (
              <g
                key={`${x}-${y}`}
                fill="currentColor"
                transform={`translate(${x} ${y}) rotate(${giro})`}
              >
                {motivos[motivo]}
              </g>
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patron})`} />
      </svg>
      <div className="grano absolute inset-0" />
    </div>
  )
}

export { FondoCard }
