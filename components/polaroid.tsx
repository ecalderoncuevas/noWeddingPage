import { cn } from "@/lib/utils"

// Todos los dibujos van sobre un lienzo de 340 × 430 (la polaroid de la
// especificación) y escalan con ella. La foto, de 300 × 300, a 20 del borde
const VISTA = "0 0 340 430"

type Sujecion = "celo" | "washi" | "chincheta" | "esquineros"

type Diseno = {
  // Clases de color, escritas enteras para que Tailwind las encuentre
  papel: string
  foto: string
  sujecion: Sujecion
  // Giro del celo, en grados
  giroCelo?: number
  // Centro y radios de cada mancha
  manchas?: number[][]
  arrugas?: boolean
  caligrafia?: boolean
  matasellos?: boolean
  // Clase de color del interior del sello de correos
  sello?: string
  rasgado?: boolean
  debajo?: boolean
}

const SOMBRA =
  "0 3px 4px rgba(38, 26, 18, 0.35), 6px 22px 36px rgba(38, 26, 18, 0.22)"
// La segunda sombra crece al pasar el ratón
const SOMBRA_HOVER =
  "0 3px 4px rgba(38, 26, 18, 0.35), 10px 34px 56px rgba(38, 26, 18, 0.3)"

const carta = [
  "Querida, nos vemos el sábado",
  "a las seis, junto a la fuente.",
  "No llegues tarde. Te quiero.",
]

// Puntas de una estrella, para el atributo `points` de un polígono
function estrella(
  cx: number,
  cy: number,
  fuera: number,
  dentro: number,
  n: number
) {
  return Array.from({ length: n * 2 }, (_, i) => {
    const radio = i % 2 ? dentro : fuera
    const angulo = (Math.PI * i) / n - Math.PI / 2
    return `${(cx + radio * Math.cos(angulo)).toFixed(1)},${(cy + radio * Math.sin(angulo)).toFixed(1)}`
  }).join(" ")
}

// Borde rasgado: se recorre el contorno cada 10 px y cada punto se mete hacia
// dentro una cantidad fija para su posición (un "azar" que no cambia entre el
// servidor y el navegador)
const rasgado = (() => {
  const mordida = (i: number) => {
    const s = Math.sin(i * 12.9898) * 43758.5453
    return 0.5 + (s - Math.floor(s)) * 4.5
  }
  const puntos: number[][] = []
  let i = 0
  for (let x = 0; x < 340; x += 10) puntos.push([x, mordida(i++)])
  for (let y = 0; y < 430; y += 10) puntos.push([340 - mordida(i++), y])
  for (let x = 340; x > 0; x -= 10) puntos.push([x, 430 - mordida(i++)])
  for (let y = 430; y > 0; y -= 10) puntos.push([mordida(i++), y])

  return {
    recorte: `polygon(${puntos
      .map(([x, y]) => `${(x / 3.4).toFixed(2)}% ${(y / 4.3).toFixed(2)}%`)
      .join(",")})`,
    contorno: puntos
      .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" "),
  }
})()

const washi = [
  [14, 24],
  [36, 12],
  [58, 25],
  [82, 13],
  [104, 24],
  [126, 12],
]

function Matasellos() {
  return (
    <g
      transform="translate(238 298) rotate(-12)"
      fill="none"
      stroke="#5A4330"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.45"
    >
      <circle r="34" />
      <circle r="27" />
      <text
        y="4"
        textAnchor="middle"
        fill="#5A4330"
        stroke="none"
        fontSize="11"
        fontWeight="700"
        letterSpacing="2"
        className="font-body"
      >
        BODA
      </text>
      {[-13, 0, 13].map((y) => (
        <path key={y} d={`M40 ${y}q8-7 16 0t16 0 16 0 16 0`} />
      ))}
    </g>
  )
}

function Sello({ color }: { color: string }) {
  return (
    <g transform="translate(292 377) rotate(8)">
      <rect x="-26" y="-31" width="52" height="62" fill="#F1F0E2" />
      {/* Perforado: puntos redondos del color del papel que muerden el borde */}
      <rect
        x="-26"
        y="-31"
        width="52"
        height="62"
        fill="none"
        strokeWidth="5"
        strokeDasharray="0 7.125"
        strokeLinecap="round"
        className="stroke-(--papel)"
      />
      <rect x="-19" y="-24" width="38" height="48" className={color} />
      <polygon points={estrella(0, 0, 11, 4.5, 8)} fill="#F1F0E2" />
    </g>
  )
}

function Sujetar({ tipo, giro = 4 }: { tipo: Sujecion; giro?: number }) {
  if (tipo === "celo")
    return (
      <rect
        x="107"
        y="-16"
        width="126"
        height="36"
        transform={`rotate(${giro} 170 2)`}
        fill="#F1F0E2"
        fillOpacity="0.72"
        stroke="#fff"
        strokeOpacity="0.4"
      />
    )

  if (tipo === "washi")
    return (
      <g transform="translate(120 -18) rotate(5 70 19)">
        <rect width="140" height="38" fill="#672D4B" fillOpacity="0.82" />
        {washi.map(([x, y]) => (
          <polygon key={x} points={estrella(x, y, 6, 1.8, 4)} fill="#F1F0E2" />
        ))}
      </g>
    )

  if (tipo === "chincheta")
    return (
      <g transform="translate(170 4)">
        <path
          d="M0 10v14"
          stroke="#8d8d8d"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="3" cy="5" r="15" fill="rgb(38 26 18 / 0.28)" />
        <circle r="15" fill="#672D4B" />
        <circle cx="-5" cy="-5" r="3.5" fill="#fff" fillOpacity="0.6" />
      </g>
    )

  // Esquineros de álbum: un triángulo sobre cada esquina de la foto
  return (
    <g fill="#54392D">
      <path d="M12 12h42L12 54Z" />
      <path d="M328 12h-42l42 42Z" />
      <path d="M12 328h42L12 286Z" />
      <path d="M328 328h-42l42-42Z" />
    </g>
  )
}

// La pieza entera: es lo que se arrastra, con su sujeción y lo que lleve
// debajo. El papel recorta manchas, caligrafía y matasellos; la sujeción va
// fuera de él porque sobresale por arriba
function Polaroid({
  numero,
  pie,
  diseno,
  children,
}: {
  numero: number
  pie: string
  diseno: Diseno
  // Lo que va en el hueco de la foto: la escena de la sección
  children: React.ReactNode
}) {
  const manchas = `polaroid-mancha-${numero}`

  return (
    <div className="relative aspect-[340/430]">
      {diseno.debajo && (
        <div
          style={{ boxShadow: SOMBRA }}
          className="absolute inset-0 translate-x-[4.1cqw] -translate-y-[2.9cqw] -rotate-6 rounded-[4px] bg-[#DDD0B2]"
        />
      )}
      {/* La sombra va aparte: el recorte del borde rasgado se la comería */}
      <div
        data-polaroid="sombra"
        style={{ boxShadow: SOMBRA }}
        className={cn(
          "absolute rounded-[4px]",
          diseno.rasgado ? "inset-[1.5%]" : "inset-0"
        )}
      />

      <div
        style={diseno.rasgado ? { clipPath: rasgado.recorte } : undefined}
        className={cn(
          "absolute inset-0 isolate overflow-hidden rounded-[4px] bg-(--papel)",
          diseno.papel
        )}
      >
        <svg viewBox={VISTA} aria-hidden className="absolute inset-0 size-full">
          {/* Manchas ya difuminadas: un degradado es más barato que un blur */}
          <radialGradient id={manchas}>
            <stop offset="0" stopColor="#8A6A45" stopOpacity="0.3" />
            <stop offset="1" stopColor="#8A6A45" stopOpacity="0" />
          </radialGradient>
          {diseno.manchas?.map(([cx, cy, rx, ry]) => (
            <ellipse
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={`url(#${manchas})`}
            />
          ))}
          {diseno.arrugas && (
            <path
              d="M0 338l118 14 96-24 126 26M92 349l42 81M214 328l38 102M0 46 58 0M340 96l-52-40 20-56"
              fill="none"
              stroke="#6E5537"
              strokeOpacity="0.18"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}
          {diseno.caligrafia && (
            <text
              transform="rotate(-2 24 350)"
              fill="#5A4330"
              fillOpacity="0.14"
              fontSize="17"
              className="font-manuscrita"
            >
              {carta.map((linea, i) => (
                <tspan key={linea} x="22" y={352 + i * 19}>
                  {linea}
                </tspan>
              ))}
            </text>
          )}
        </svg>
        {/* Bordes envejecidos */}
        <div className="absolute inset-0 shadow-[inset_0_0_4.1cqw_rgb(122_94_62/0.25)]" />

        <div className="absolute top-[4.65%] left-[5.88%] w-[88.24%]">
          {/* La escena no se sale de la foto, tampoco al arrastrar */}
          <div
            data-polaroid="foto"
            className={cn(
              "relative aspect-square overflow-hidden",
              diseno.foto
            )}
          >
            {children}
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0.6cqw_2.4cqw_rgb(0_0_0/0.4)]" />
          </div>
        </div>

        <svg viewBox={VISTA} aria-hidden className="absolute inset-0 size-full">
          {diseno.matasellos && <Matasellos />}
          {diseno.sello && <Sello color={diseno.sello} />}
          {diseno.rasgado && (
            <polygon
              points={rasgado.contorno}
              fill="none"
              stroke="#9C8466"
              strokeOpacity="0.5"
              strokeWidth="1.5"
            />
          )}
        </svg>

        <figcaption
          className={cn(
            "absolute inset-x-0 top-[74.42%] bottom-0 flex items-center justify-center font-manuscrita text-[9.7cqw] leading-none font-bold whitespace-nowrap text-[#3E2E22]",
            // El sello de correos ocupa la derecha de la franja
            diseno.sello && "pr-[17cqw]"
          )}
        >
          {pie}
        </figcaption>
        <div className="grano pointer-events-none absolute inset-0" />
      </div>

      <svg
        viewBox={VISTA}
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        <Sujetar tipo={diseno.sujecion} giro={diseno.giroCelo} />
      </svg>
    </div>
  )
}

export { Polaroid, SOMBRA, SOMBRA_HOVER }
export type { Diseno }
