import { useId } from "react"

import { Star } from "@/components/star"
import { cn } from "@/lib/utils"

// Dibujos que rellenan los laterales del footer. Solo pintan: los anima el
// footer. Están calcados del boceto a 2000 px de ancho, donde el cartel medía
// 182 px (la variable --f): una unidad de sus viewBox es un píxel del boceto,
// y una distancia del boceto en f es esa distancia / 182
const BOCETO = 182
const TRAZO = 3.1

const trazo = {
  fill: "var(--marron)",
  stroke: "var(--beige)",
  strokeWidth: TRAZO,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const

// Coloca un dibujo en el footer: izquierda en % del ancho y arriba y ancho
// en múltiplos de --f, para que escale con el cartel
function sitio(x: string, y: number, ancho: number) {
  return {
    left: x,
    top: `calc(var(--f) * ${y})`,
    width: `calc(var(--f) * ${ancho})`,
  }
}

// Remate ondulado de un piso de la tarta
function ola(x0: number, x1: number, y: number, n: number) {
  const paso = (x1 - x0) / n
  const onda = `q${paso / 4} -4 ${paso / 2} 0t${paso / 2} 0`
  return `M${x0} ${y}${onda.repeat(n)}`
}

// Novio o novia de la tarta: palo, cabeza y "?". Gira desde su base
function Muneco({ x }: { x: number }) {
  return (
    <g data-footer="muneco" data-base={`${x} 72`}>
      <path d={`M${x} 45V72`} fill="none" />
      <circle cx={x} cy="31" r="14" />
      <text
        x={x}
        y="37.5"
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fill="var(--beige)"
        stroke="none"
        className="font-display"
      >
        ?
      </text>
    </g>
  )
}

function Tarta() {
  return (
    <div
      data-profundidad="relleno"
      className="absolute hidden md:block"
      style={sitio("70%", 1.948, 310 / BOCETO)}
    >
      <svg
        data-footer="relleno"
        aria-hidden
        viewBox="0 0 310 300"
        {...trazo}
        className="w-full overflow-visible"
      >
        <path d="M121 59h64" fill="none" />
        <Muneco x={134} />
        <Muneco x={171} />
        <rect x="95" y="72" width="115" height="57" rx="4" />
        <path d={ola(99, 206, 88, 6)} fill="none" />
        <rect x="64" y="130" width="178" height="64" rx="4" />
        <path d={ola(68, 238, 147, 9)} fill="none" />
        <rect x="33" y="195" width="239" height="72" rx="4" />
        <path d={ola(37, 268, 211, 12)} fill="none" />
        <path d="M111 269l17 18h51l15-18" />
        <path d="M6 268h294" fill="none" />
      </svg>
    </div>
  )
}

// Bola de discoteca: centro y radio en su viewBox de 300 × 300
const BOLA = { x: 150, y: 209, r: 63.5 }
// Separación entre las facetas verticales y cuántas se pintan
const FACETA = 30
const MERIDIANOS = 7

// Una faceta vertical es media elipse que va de polo a polo; su anchura
// depende del ángulo, así que al sumar a todas el mismo ángulo la bola gira
function meridiano(angulo: number) {
  if (Math.abs(angulo) >= 90) return ""
  const { x, y, r } = BOLA
  const ancho = r * Math.sin((angulo * Math.PI) / 180)
  if (Math.abs(ancho) < 0.5) return `M${x} ${y - r}V${y + r}`
  return `M${x} ${y - r}A${Math.abs(ancho)} ${r} 0 0 ${ancho > 0 ? 1 : 0} ${x} ${y + r}`
}

// Facetas de la bola girada `fase` grados (de 0 a FACETA)
function meridianos(fase: number) {
  return Array.from({ length: MERIDIANOS }, (_, i) =>
    meridiano(fase + (i - (MERIDIANOS - 1) / 2) * FACETA)
  )
}

const paralelos = [-0.62, -0.3, 0, 0.3, 0.62].map((altura) => {
  const { x, y, r } = BOLA
  const alto = y + r * altura
  const ancho = r * Math.sqrt(1 - altura * altura)
  return `M${x - ancho} ${alto}Q${x} ${alto + 5} ${x + ancho} ${alto}`
})

const destellos = [
  { x: 30, y: 95, r: 6, color: "text-verde" },
  { x: 249, y: 136, r: 9, color: "text-verde" },
  { x: 35, y: 168, r: 6, color: "text-beige" },
  { x: 275, y: 251, r: 5, color: "text-beige" },
  { x: 51, y: 282, r: 7, color: "text-verde" },
]

// Distancia del techo del footer a lo alto del viewBox de la bola, en
// unidades del dibujo: de ahí cuelga el cordel y sobre ese punto se balancea
const TECHO = 0.41 * BOCETO

function Bola() {
  return (
    <div
      data-profundidad="relleno"
      className="absolute hidden aspect-square md:block"
      style={sitio("85%", 0.41, 300 / BOCETO)}
    >
      <svg
        data-footer="relleno"
        aria-hidden
        viewBox="0 0 300 300"
        {...trazo}
        className="w-full overflow-visible"
      >
        <g data-footer="vaiven" data-origen={`${BOLA.x} ${-TECHO}`}>
          {/* El cordel sube más allá del footer, que lo recorta */}
          <path d={`M${BOLA.x} ${-TECHO - 40}V134`} fill="none" />
          <rect x="140" y="134" width="21" height="13" rx="1" />
          <circle cx={BOLA.x} cy={BOLA.y} r={BOLA.r} />
          <g fill="none">
            {paralelos.map((d) => (
              <path key={d} d={d} />
            ))}
            {meridianos(0).map((d, i) => (
              <path key={i} data-footer="meridiano" d={d} />
            ))}
          </g>
          <circle cx={BOLA.x} cy={BOLA.y} r={BOLA.r} fill="none" />
        </g>
      </svg>
      {destellos.map((destello) => (
        <Star
          key={`${destello.x}-${destello.y}`}
          data-footer="destello"
          points={4}
          inner={0.3}
          className={cn("absolute", destello.color)}
          style={{
            left: `${((destello.x - destello.r) / 300) * 100}%`,
            top: `${((destello.y - destello.r) / 300) * 100}%`,
            width: `${((destello.r * 2) / 300) * 100}%`,
          }}
        />
      ))}
    </div>
  )
}

// Botella de pie, con la base en (125, 205), girada -28°. La boca queda en
// BOCA, ya girada; de ahí sale el corcho
const BOTELLA = { ancho: 160, alto: 225 }
const BOCA = { x: 32.1, y: 30.2 }

const gotas = [
  { x: 70, y: -80 },
  { x: 85, y: -64 },
  { x: 51, y: -44 },
  { x: 106, y: -37 },
  { x: 39, y: -12 },
]

function Botella() {
  return (
    <div
      data-profundidad="relleno"
      className="absolute hidden md:block"
      style={sitio("18.25%", 1.975, BOTELLA.ancho / BOCETO)}
    >
      <svg
        data-footer="relleno"
        data-botella
        aria-hidden
        viewBox={`0 0 ${BOTELLA.ancho} ${BOTELLA.alto}`}
        {...trazo}
        className="w-full overflow-visible"
      >
        <g transform="rotate(-28 125 205)">
          <path d="M97 205V85c0-15 11-23 19-30V20h18v35c8 7 19 15 19 30v120Z" />
          <rect x="114" y="7" width="22" height="13" rx="2" />
          <path d="M97 110h56M97 160h56" fill="none" />
          <rect
            x="103"
            y="117"
            width="44"
            height="36"
            rx="5"
            fill="var(--verde)"
            stroke="none"
          />
        </g>
        {gotas.map((gota) => (
          <circle
            key={`${gota.x}-${gota.y}`}
            data-footer="gota"
            cx={gota.x}
            cy={gota.y}
            r="3.6"
            fill="var(--beige)"
            stroke="none"
          />
        ))}
      </svg>
    </div>
  )
}

// Línea de puntos y corcho, de la botella a la copa de la novia. Va en
// píxeles reales: el footer calcula el trazado con la posición de las dos
function Trayecto() {
  const mascara = useId()

  return (
    <div
      data-profundidad="relleno"
      className="pointer-events-none absolute inset-0 hidden md:block"
    >
      <svg
        data-footer="trayecto"
        aria-hidden
        fill="none"
        strokeLinecap="round"
        className="size-full overflow-visible"
      >
        {/* DrawSVG no dibuja bien una línea de puntos: se dibuja el trazo
            continuo de la máscara, que va descubriendo los puntos */}
        <mask
          id={mascara}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100%"
          height="100%"
        >
          <path data-footer="trayecto-mascara" stroke="#fff" />
        </mask>
        <path
          data-footer="camino"
          mask={`url(#${mascara})`}
          stroke="var(--beige)"
        />
        <g data-footer="corcho">
          <rect
            data-footer="corcho-dibujo"
            x="-9"
            y="-13"
            width="18"
            height="26"
            rx="4"
            {...trazo}
          />
        </g>
      </svg>
    </div>
  )
}

// Estrellas y anillos sueltos: centro en % del ancho y en múltiplos de --f
const sueltos = [
  { x: "15.65%", y: 1.041, r: 10, color: "text-verde" },
  { x: "29.15%", y: 3.382, r: 7, color: "text-beige" },
  { x: "32.5%", y: 2.717, r: 7, color: "text-verde" },
  { x: "66%", y: 1.783, r: 7, color: "text-verde" },
  { x: "66.15%", y: 3.102, r: 6, color: "text-beige" },
  { x: "69.25%", y: 1.096, r: 8, color: "text-beige" },
  { x: "94%", y: 2.239, r: 6, color: "text-beige" },
  { x: "17.15%", y: 2.695, r: 26, anillos: true },
  { x: "90.4%", y: 2.986, r: 26, anillos: true },
]

function Sueltos() {
  return sueltos.map((suelto) => {
    const radio = suelto.r / BOCETO
    return (
      <div
        key={`${suelto.x}-${suelto.y}`}
        data-profundidad="sueltos"
        className="absolute hidden md:block"
        style={{
          left: `calc(${suelto.x} - var(--f) * ${radio})`,
          top: `calc(var(--f) * ${suelto.y - radio})`,
          width: `calc(var(--f) * ${radio * 2})`,
        }}
      >
        {suelto.anillos ? (
          <svg
            data-footer="suelto"
            aria-hidden
            viewBox="0 0 52 34"
            {...trazo}
            fill="none"
            className="w-full overflow-visible"
          >
            <circle cx="17" cy="17" r="15" />
            <circle cx="35" cy="17" r="15" />
          </svg>
        ) : (
          <Star
            data-footer="suelto"
            data-estrella
            points={4}
            inner={0.3}
            className={cn("w-full", suelto.color)}
          />
        )}
      </div>
    )
  })
}

export {
  BOCA,
  BOCETO,
  BOTELLA,
  FACETA,
  Botella,
  Bola,
  Sueltos,
  Tarta,
  Trayecto,
  meridianos,
}
