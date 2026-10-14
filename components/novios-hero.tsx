import { cn } from "@/lib/utils"

// Novios del hero, dibujados a línea como los del footer. Solo pintan: los
// anima el hero. Calcados del boceto a 2000 px de ancho: una unidad del
// viewBox es un píxel del boceto. El borde de abajo es el del hero, que corta
// las figuras por la cintura

// Base de cada figura: desde ahí se balancea
const BASE = { novio: "121 395", novia: "360 395" }

const linea = {
  stroke: "var(--beige)",
  strokeWidth: 4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const

// Lo que se dibuja a línea en la entrada lleva data-trazo; si además tiene
// relleno, este aparece después del trazo
function Duda({ x, y }: { x: number; y: number }) {
  return (
    <g data-profundidad="duda">
      <text
        data-hero="duda"
        x={x}
        y={y}
        textAnchor="middle"
        fontSize="100"
        fill="var(--beige)"
        className="font-display italic"
      >
        ?
      </text>
    </g>
  )
}

const flores = [
  { x: 209, y: 265, r: 15.5, color: "var(--beige)", centro: null },
  { x: 243, y: 267, r: 21.5, color: "#c99ab0", centro: "var(--lila)" },
  { x: 276, y: 260, r: 16.5, color: "var(--verde)", centro: null },
  { x: 223, y: 297, r: 21.5, color: "var(--verde)", centro: "var(--beige)" },
  { x: 263, y: 289, r: 18, color: "var(--beige)", centro: "var(--verde)" },
]

function NoviosHero({ className }: { className?: string }) {
  return (
    <svg
      role="img"
      aria-label="Dos novios con un interrogante en lugar de la cara"
      viewBox="0 0 520 395"
      fill="var(--lila)"
      {...linea}
      className={cn("w-full overflow-visible", className)}
    >
      <g data-hero="figura" data-base={BASE.novio}>
        <path data-trazo d="M103 148v24M139 148v24" fill="none" />
        <path
          data-trazo
          data-capa="chaqueta"
          d="M13 395 23 250c3-45 47-70 98-80 49 10 93 30 101 58l7 167"
        />
        <path
          data-trazo
          data-capa="brazo"
          d="M43 249c-7 41-9 91-4 146"
          fill="none"
        />
        <path
          data-trazo
          data-capa="camisa"
          d="M102 173h39l-20 90Z"
          fill="var(--beige)"
        />
        <path
          data-trazo
          data-capa="solapas"
          d="m81 180 26 78 14 6 15-6 25-77"
          fill="none"
        />
        <path
          data-trazo
          data-capa="pajarita"
          d="m100 178 21 11 21-11v24l-21-10-21 10Z"
          fill="var(--verde)"
          stroke="var(--verde)"
          strokeWidth="3"
        />
        <circle data-trazo data-capa="cabeza" cx="121" cy="83" r="66" />
        <Duda x={124} y={124} />
      </g>

      <g data-hero="figura" data-base={BASE.novia}>
        <path
          data-trazo
          data-capa="velo"
          d="M360 22c60 8 110 68 120 148l28 225"
          fill="none"
        />
        <circle data-trazo data-capa="moño" cx="346" cy="34" r="23" />
        <path data-trazo d="M330 166v18M363 166v18" fill="none" />
        <path
          data-trazo
          data-capa="vestido"
          d="m262 395 6-145c2-45 37-65 78-70 44 5 72 25 79 55l33 160"
        />
        <path
          data-trazo
          data-capa="velo-2"
          d="M367 37c43 43 70 113 71 179"
          fill="none"
          strokeWidth="3"
        />
        <path
          data-trazo
          data-capa="escote"
          d="M294 216q52 34 104 0"
          fill="none"
          strokeWidth="3"
        />
        <circle data-trazo data-capa="cabeza" cx="346" cy="104" r="61" />
        <Duda x={352} y={143} />
      </g>

      {/* Ramo entre los dos, por delante */}
      <g data-capa="ramo">
        <path
          data-trazo
          d="m224 307 26 88M263 312l-31 83M241 300v95"
          fill="none"
          strokeWidth="3"
        />
        <path
          data-trazo
          d="M222 362h38l-20 13Z"
          fill="var(--beige)"
          strokeWidth="3"
        />
        {flores.map((flor) => (
          <g key={`${flor.x}-${flor.y}`} data-hero="flor">
            <circle
              cx={flor.x}
              cy={flor.y}
              r={flor.r}
              fill={flor.color}
              stroke={
                flor.color === "var(--beige)" ? "var(--lila)" : "var(--beige)"
              }
              strokeWidth="3"
            />
            {flor.centro && (
              <circle
                cx={flor.x}
                cy={flor.y}
                r={flor.r * 0.27}
                fill={flor.centro}
                stroke="none"
              />
            )}
          </g>
        ))}
      </g>
    </svg>
  )
}

export { BASE, NoviosHero }
