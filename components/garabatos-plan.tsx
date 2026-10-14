import { gsap } from "@/lib/gsap"

// Los detalles animados que van encima de las cinco ilustraciones del orden
// del día (sección 3). La especificación está en
// `noWeddingLanding-orden-del-dia-detalles.md`.
//
// La ilustración no se mueve (salvo el vaivén mínimo del apartado 4): lo que
// se anima son las piezas de alrededor. Los cinco momentos usan las mismas
// cinco piezas (destellos, caída, subida, interrogantes y onda), así que
// están sacadas aquí arriba y cada momento solo declara las suyas.
//
// Cada momento devuelve dos timelines: `entrada` (el pop al activarse) y
// `bucles` (en pausa). El SVG lleva el viewBox de su ilustración, así que
// las coordenadas son las del dibujo y escalan con él

const BEIGE = "var(--beige)"
const VERDE = "var(--verde)"
const LILA = "#672D4B"
const MARRON = "#54392D"
const ROSA = "#C99AB0"

// Rectángulo donde una pieza puede aparecer o caer
type Zona = { x: number; y: number; w: number; h: number }

const capas = (raiz: Element) => {
  const q = gsap.utils.selector(raiz)
  return (nombre: string) => q(`[data-capa='${nombre}']`)
}

// El azar de los bucles: solo se usa dentro de las timelines, que se crean
// en el navegador
const azar = gsap.utils.random

// El azar del dibujo: lo que se pinta tiene que salir igual en el servidor y
// en el navegador, o React se queja de la hidratación. Es la misma función
// fija del borde rasgado de las polaroids: cada valor depende de su índice
const fijo = (i: number) => {
  const s = Math.sin(i * 12.9898) * 43758.5453
  return s - Math.floor(s)
}
const entreFijo = (i: number, min: number, max: number) =>
  Math.round(min + fijo(i) * (max - min))

// 1 · Las piezas ------------------------------------------------------------

// Estrella de cuatro puntas centrada en el origen: la coloca su grupo, para
// que el bucle pueda moverla a otro sitio con un transform
const estrella = (r: number) => {
  const c = r * 0.15
  return `M0 ${-r}Q${c} ${-c} ${r} 0Q${c} ${c} 0 ${r}Q${-c} ${c} ${-r} 0Q${-c} ${-c} 0 ${-r}Z`
}

function Destellos({
  puntos,
  color,
  grosor = 4,
}: {
  puntos: number[][]
  color?: string
  grosor?: number
}) {
  return (
    <g strokeWidth={grosor} stroke={color}>
      {puntos.map(([x, y, r]) => (
        <g
          key={`${x}-${y}`}
          data-capa="destello"
          transform={`translate(${x} ${y})`}
        >
          <path d={estrella(r)} />
        </g>
      ))}
    </g>
  )
}

// Aparecen, brillan y desaparecen; al volver a salir, en otro sitio
function titilar(
  tl: gsap.core.Timeline,
  piezas: Element[],
  sitio: () => number[],
  duracion = 1.2
) {
  piezas.forEach((pieza, i) => {
    const recolocar = () => {
      const [x, y] = sitio()
      gsap.set(pieza, { x, y })
    }
    recolocar()
    tl.add(
      gsap
        .timeline({
          repeat: -1,
          repeatDelay: azar(0.4, 1.6),
          onRepeat: recolocar,
        })
        .fromTo(
          pieza,
          { scale: 0, rotation: 0 },
          {
            scale: 1,
            rotation: 45,
            duration: duracion / 2,
            ease: "sine.inOut",
          }
        )
        .to(pieza, { scale: 0, duration: duracion / 2, ease: "sine.inOut" }),
      i * 0.3
    )
  })
}

// Un punto al azar dentro de una zona
const enZona =
  ({ x, y, w, h }: Zona) =>
  () => [azar(x, x + w), azar(y, y + h)]

// Un punto de una lista, para los destellos que saltan de copa en copa
const entre = (puntos: number[][]) => () =>
  puntos[azar(0, puntos.length - 1, 1)]

// Piezas que caen despacio girando: el arroz y el confeti
function Caida({ piezas, color }: { piezas: number[][]; color?: string }) {
  return (
    <g stroke="none">
      {piezas.map(([x, y, w, h, tono], i) => (
        <g key={i} data-capa="caida" transform={`translate(${x} ${y})`}>
          <rect
            x={-w / 2}
            y={-h / 2}
            width={w}
            height={h}
            rx={w / 2}
            fill={[color, ROSA, VERDE][tono ?? 0] ?? color}
          />
        </g>
      ))}
    </g>
  )
}

// Segundos que la caída lleva andando al arrancar: así ya hay piezas
// repartidas por toda la altura en cuanto empieza
const ADELANTO = 7

function caer(
  tl: gsap.core.Timeline,
  piezas: Element[],
  alto: number,
  movil: boolean
) {
  piezas.forEach((pieza, i) => {
    // En móvil cae la mitad de las piezas; el resto se queda quieto
    if (movil && i % 2) return

    const duracion = azar(4, 7)
    tl.add(
      gsap.fromTo(
        pieza,
        { y: -20 },
        {
          y: alto,
          rotation: azar(-180, 180),
          duration: duracion,
          ease: "none",
          repeat: -1,
        }
      ),
      azar(0, ADELANTO)
    ).to(
      pieza,
      {
        x: `+=${azar(-6, 6)}`,
        duration: duracion / 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      },
      0
    )
  })
}

// Piezas que suben, se mecen y se desvanecen: notas, burbujas y corazones
function subir(
  tl: gsap.core.Timeline,
  piezas: Element[],
  alto: number,
  duracion = 2.6
) {
  piezas.forEach((pieza, i) =>
    tl
      .fromTo(
        pieza,
        { y: 0, autoAlpha: 0 },
        {
          y: -alto,
          autoAlpha: 0,
          keyframes: { autoAlpha: [0, 1, 1, 0], easeEach: "none" },
          duration: duracion,
          ease: "power1.out",
          repeat: -1,
        },
        i * azar(0.5, 0.9)
      )
      .to(
        pieza,
        {
          x: `+=${azar(-10, 10)}`,
          rotation: azar(-12, 12),
          duration: duracion / 2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        },
        0
      )
  )
}

// Corchea: plica con banderola y cabeza inclinada, centrada en el origen
function Nota({
  x,
  y,
  escala = 1,
  color,
}: {
  x: number
  y: number
  escala?: number
  color?: string
}) {
  return (
    <g
      data-capa="nota"
      transform={`translate(${x} ${y}) scale(${escala})`}
      stroke={color}
    >
      <path d="M0 0v-52c16 5 26 15 26 30" />
      <ellipse cx="-9" cy="4" rx="12" ry="9" transform="rotate(-20 -9 4)" />
    </g>
  )
}

const corazon = (s: number) =>
  `M0 0c${-0.3 * s}${-0.4 * s} ${-0.8 * s}${-0.1 * s} ${-0.5 * s} ${0.3 * s}l${0.5 * s} ${0.5 * s} ${0.5 * s}${-0.5 * s}c${0.3 * s}${-0.4 * s} ${-0.2 * s}${-0.7 * s} ${-0.5 * s}${-0.3 * s}Z`

// El "?" de una cara: la cursiva de titulares, como en el hero
function Interrogante({
  x,
  y,
  tam,
  color,
}: {
  x: number
  y: number
  tam: number
  color: string
}) {
  return (
    <g data-capa="interrogante" transform={`translate(${x} ${y})`}>
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={tam}
        fill={color}
        stroke="none"
        className="font-display italic"
      >
        ?
      </text>
    </g>
  )
}

// Los "?" flotan; el segundo va 1,5 s por detrás
const flotar = (tl: gsap.core.Timeline, piezas: Element[]) =>
  piezas.forEach((pieza, i) =>
    tl.add(
      gsap.fromTo(
        pieza,
        { y: -4, rotation: -6 },
        {
          y: 4,
          rotation: 6,
          duration: 3,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        }
      ),
      i * 1.5
    )
  )

// Arcos que salen de un punto y se desvanecen: el sonido y el brindis
const ondear = (
  tl: gsap.core.Timeline,
  piezas: Element[],
  origen: string,
  duracion = 1.2
) =>
  piezas.forEach((pieza, i) =>
    tl.fromTo(
      pieza,
      { scale: 0.6, autoAlpha: 1 },
      {
        scale: 1.3,
        autoAlpha: 0,
        svgOrigin: origen,
        duration: duracion,
        ease: "power1.out",
        repeat: -1,
      },
      i * 0.4
    )
  )

// La capa de detalles de un momento. `overflow: visible` deja que los
// destellos y las notas se salgan un poco del hueco, como pide el documento
function Detalles({
  ancho,
  alto,
  color,
  children,
}: {
  ancho: number
  alto: number
  color: string
  children: React.ReactNode
}) {
  return (
    <svg
      viewBox={`0 0 ${ancho} ${alto}`}
      aria-hidden
      fill="none"
      stroke={color}
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      {children}
    </svg>
  )
}

// 2 · 01 Ceremonia ----------------------------------------------------------

const ANCHO_1 = 735
const ALTO_1 = 944
const ZONA_1 = { x: 30, y: 40, w: 675, h: 800 }

// El arroz: trocitos repartidos por toda la escena
const arroz = Array.from({ length: 16 }, (_, i) => [
  entreFijo(i * 2, 20, ANCHO_1 - 20),
  entreFijo(i * 2 + 1, 0, ALTO_1),
  5,
  9,
])

function Ceremonia() {
  return (
    <Detalles ancho={ANCHO_1} alto={ALTO_1} color={BEIGE}>
      <Caida piezas={arroz} color={BEIGE} />
      <Destellos
        puntos={[
          [600, 140, 15],
          [680, 300, 10],
          [520, 70, 9],
          [650, 480, 13],
          [95, 700, 11],
        ]}
      />
      {/* Encima de los "?" que ya lleva el dibujo */}
      <Interrogante x={255} y={290} tam={54} color={BEIGE} />
      <Interrogante x={450} y={225} tam={54} color={BEIGE} />
    </Detalles>
  )
}

function buclesCeremonia(raiz: Element, movil: boolean) {
  const capa = capas(raiz)
  const tl = gsap.timeline({ paused: true })

  caer(tl, capa("caida"), ALTO_1, movil)
  titilar(tl, capa("destello"), enZona(ZONA_1))
  flotar(tl, capa("interrogante"))
  return tl.seek(ADELANTO)
}

// 3 · 02 Banquete -----------------------------------------------------------

const ANCHO_2 = 960
const ALTO_2 = 1200

// Las cinco copas de la mesa: los brillos saltan entre ellas
const copas = [
  [259, 456],
  [557, 420],
  [403, 660],
  [557, 744],
  [778, 516],
]
// Puntos de choque entre dos copas cercanas, para el "chin-chin"
const brindis = [
  [480, 702],
  [408, 438],
  [668, 630],
]
// Encima de dos platos
const platos = [
  [288, 288],
  [710, 900],
]
// Una línea de vapor: ondula hacia arriba unos 48 px
const vaho = "M0 0c-9-12 9-24 0-36s9-24 0-36"

function Banquete() {
  return (
    <Detalles ancho={ANCHO_2} alto={ALTO_2} color={BEIGE}>
      {platos.map(([x, y]) =>
        [-16, 16].map((dx) => (
          <g
            key={`${x}-${dx}`}
            data-capa="vaho"
            transform={`translate(${x + dx} ${y})`}
          >
            <path d={vaho} stroke={VERDE} strokeWidth="4" />
          </g>
        ))
      )}

      {brindis.map(([x, y]) => (
        <g
          key={`${x}-${y}`}
          data-capa="chinchin"
          transform={`translate(${x} ${y})`}
        >
          {[-50, -90, -130].map((g) => {
            const a = (g * Math.PI) / 180
            return (
              <path
                key={g}
                d={`M${(10 * Math.cos(a)).toFixed(1)} ${(10 * Math.sin(a)).toFixed(1)}L${(29 * Math.cos(a)).toFixed(1)} ${(29 * Math.sin(a)).toFixed(1)}`}
                strokeWidth="4"
              />
            )
          })}
        </g>
      ))}

      {/* Dos uvas sueltas junto al racimo */}
      {[
        [374, 540],
        [398, 562],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} data-capa="uva" transform={`translate(${x} ${y})`}>
          <circle r="9" fill={VERDE} stroke="none" />
        </g>
      ))}

      {/* En verde: la vajilla es de color crema y encima de ella un trazo
          beige no se vería */}
      <Destellos
        puntos={copas.map(([x, y], i) => [x, y, entreFijo(300 + i, 9, 14)])}
        color={VERDE}
        grosor={4}
      />
    </Detalles>
  )
}

function buclesBanquete(raiz: Element, movil: boolean) {
  const capa = capas(raiz)
  const q = gsap.utils.selector(raiz)
  const tl = gsap.timeline({ paused: true })

  // Los brillos saltan de copa en copa
  titilar(tl, capa("destello"), entre(copas))

  // El vapor se dibuja mientras sube y después se desvanece
  capa("vaho").forEach((linea, i) =>
    tl.add(
      gsap
        .timeline({ repeat: -1, repeatDelay: 0.6 })
        .fromTo(
          linea.firstElementChild,
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 1.4, ease: "power1.out" }
        )
        .to(linea, { y: -20, duration: 2.4, ease: "none" }, 0)
        .to(linea, { autoAlpha: 0, duration: 1 }, 1.4)
        .set(linea, { autoAlpha: 1, y: 0 }),
      i * 0.6
    )
  )

  if (!movil) {
    // Cada 3 a 5 s brindan dos copas distintas
    capa("chinchin").forEach((choque, i) =>
      tl.fromTo(
        choque,
        { scale: 0, autoAlpha: 1 },
        {
          scale: 1,
          autoAlpha: 0,
          duration: 0.4,
          ease: "power2.out",
          repeat: -1,
          repeatDelay: azar(3, 5),
        },
        i * 1.4
      )
    )

    // Las uvas ruedan y vuelven
    capa("uva").forEach((uva, i) =>
      tl.to(
        uva,
        {
          x: `+=${i ? -10 : 10}`,
          rotation: i ? -180 : 180,
          duration: 3,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        },
        0
      )
    )

    // Apartado 4: la mesa gira muy despacio. Va en el dibujo, no en el
    // contenedor, que es el que cruza con el scroll
    tl.to(
      q("[data-plan='dibujo']"),
      {
        rotation: 1.5,
        duration: 8,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        transformOrigin: "center",
      },
      0
    ).set(q("[data-plan='dibujo']"), { rotation: -1.5 }, 0)
  }

  return tl
}

// 4 · 03 Discursos ----------------------------------------------------------

const ANCHO_3 = 690
const ALTO_3 = 1103
// La cabeza del micrófono: de ahí salen las ondas
const MICRO = "330 610"

// Las notas van por los dos pasillos libres: el hueco de la izquierda, entre
// el cartel y la mano, y el de la derecha, entre la copa y la otra mano
const notasDiscursos = [
  [115, 455, 1, LILA],
  [68, 418, 0.8, MARRON],
  [625, 450, 0.95, LILA],
  [664, 408, 0.75, MARRON],
]

// El vaso de la copa, para que las burbujas no se salgan
const COPA = "M437 155H578L522 440H495Z"
const burbujas = Array.from({ length: 7 }, (_, i) => [
  entreFijo(200 + i * 3, 468, 548),
  entreFijo(201 + i * 3, 330, 430),
  entreFijo(202 + i * 3, 3, 5),
])

function Discursos() {
  return (
    <Detalles ancho={ANCHO_3} alto={ALTO_3} color={LILA}>
      <defs>
        <clipPath id="plan-copa">
          <path d={COPA} />
        </clipPath>
      </defs>

      {/* Ondas de sonido: tres a cada lado de la cabeza del micro */}
      {[-1, 1].map((lado) =>
        [0, 1, 2].map((n) => (
          <g key={`${lado}-${n}`} data-capa="onda">
            <path
              d={`M${330 + lado * 75} 582q${lado * 16} 28 0 56`}
              strokeWidth="4"
            />
          </g>
        ))
      )}

      {/* Rayitas a los lados del cartel «NO», que se agita */}
      {[-1, 1].map((lado) => (
        <g key={lado} data-capa="agita">
          {[-46, 0, 46].map((dy) => (
            <path
              key={dy}
              d={`M${245 + lado * 118} ${386 + dy}h${lado * 26}`}
              strokeWidth="4"
            />
          ))}
        </g>
      ))}

      <g clipPath="url(#plan-copa)">
        {burbujas.map(([x, y, r], i) => (
          <g key={i} data-capa="burbuja" transform={`translate(${x} ${y})`}>
            <circle r={r} fill={LILA} stroke="none" opacity="0.7" />
          </g>
        ))}
      </g>

      {notasDiscursos.map(([x, y, escala, color]) => (
        <Nota
          key={`${x}-${y}`}
          x={x as number}
          y={y as number}
          escala={escala as number}
          color={color as string}
        />
      ))}

      {/* Los dos primeros van encima de los que ya tiene el dibujo */}
      <Destellos
        puntos={[
          [48, 254, 13],
          [662, 651, 13],
          [600, 200, 10],
          [415, 230, 8],
          [250, 170, 9],
        ]}
        grosor={3}
      />
    </Detalles>
  )
}

function buclesDiscursos(raiz: Element, movil: boolean) {
  const capa = capas(raiz)
  const tl = gsap.timeline({ paused: true })

  titilar(tl, capa("destello"), enZona({ x: 40, y: 120, w: 610, h: 560 }))
  subir(tl, capa("nota"), 138, 2.8)

  // Las burbujas suben desde el fondo de la copa hasta el borde
  capa("burbuja").forEach((burbuja) =>
    tl.fromTo(
      burbuja,
      { y: 0 },
      {
        y: -azar(170, 230),
        autoAlpha: 0,
        duration: azar(1.6, 2.4),
        ease: "none",
        repeat: -1,
      },
      azar(0, 2.4)
    )
  )

  if (!movil) {
    ondear(tl, capa("onda"), MICRO)

    // El cartel se agita: tres vaivenes alternando lados y una pausa
    capa("agita").forEach((lado, i) =>
      tl.fromTo(
        lado,
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          duration: 0.3,
          yoyo: true,
          repeat: -1,
          repeatDelay: 0.3,
          ease: "none",
        },
        i * 0.3
      )
    )
  }

  return tl.seek(2.4)
}

// 5 · 04 Tarta --------------------------------------------------------------

const ANCHO_4 = 804
const ALTO_4 = 1035

// Los goterones de chocolate de los que cae una gota
const goterones = [
  [265, 445],
  [378, 776],
  [499, 621],
]

function Tarta() {
  return (
    <Detalles ancho={ANCHO_4} alto={ALTO_4} color={LILA}>
      {goterones.map(([x, y]) => (
        <g
          key={`${x}-${y}`}
          data-capa="gota"
          transform={`translate(${x} ${y})`}
        >
          <path
            d="M0 0c-4 5-4 9 0 11s4-6 0-11Z"
            fill={LILA}
            stroke="none"
            transform="scale(1.4)"
          />
        </g>
      ))}

      {/* Dos corazones desde el remate */}
      {[
        [344, 83],
        [372, 78],
      ].map(([x, y]) => (
        <g
          key={`${x}-${y}`}
          data-capa="corazon"
          transform={`translate(${x} ${y})`}
        >
          <path d={corazon(26)} stroke={ROSA} strokeWidth="4" />
        </g>
      ))}

      <Destellos
        puntos={[
          [280, 60, 11],
          [430, 150, 8],
          [320, 190, 9],
        ]}
        grosor={3}
      />

      {/* ¿Y esta quién es? */}
      <Interrogante x={650} y={366} tam={54} color={LILA} />

      {/* El flash de la foto: tapa toda la ilustración un instante */}
      <g data-capa="flash">
        <rect
          width={ANCHO_4}
          height={ALTO_4}
          fill="#F1F0E2"
          stroke="none"
          opacity="0"
        />
      </g>
      <g data-capa="chispa">
        {[20, 52, 84, 116].map((g) => {
          const a = ((g - 160) * Math.PI) / 180
          return (
            <path
              key={g}
              d={`M${(740 + 10 * Math.cos(a)).toFixed(1)} ${(70 + 10 * Math.sin(a)).toFixed(1)}L${(740 + 24 * Math.cos(a)).toFixed(1)} ${(70 + 24 * Math.sin(a)).toFixed(1)}`}
              strokeWidth="4"
            />
          )
        })}
      </g>
    </Detalles>
  )
}

function buclesTarta(raiz: Element, movil: boolean) {
  const capa = capas(raiz)
  const tl = gsap.timeline({ paused: true })

  titilar(tl, capa("destello"), enZona({ x: 253, y: 10, w: 201, h: 207 }))
  subir(tl, capa("corazon"), 67, 2.4)
  flotar(tl, capa("interrogante"))

  // Cada gota se alarga, cae y desaparece; nunca dos a la vez
  capa("gota").forEach((gota, i) =>
    tl.add(
      gsap
        .timeline({ repeat: -1, repeatDelay: azar(3, 5) })
        .fromTo(
          gota,
          { scaleY: 0, autoAlpha: 1 },
          {
            scaleY: 1,
            duration: 0.6,
            ease: "power1.in",
            transformOrigin: "center top",
          }
        )
        .to(gota, { y: 40, autoAlpha: 0, duration: 0.4, ease: "power2.in" }),
      i * 1.6
    )
  )

  // El flash de "la foto que todos esperan": como mucho uno cada 6 s
  if (!movil) {
    const destellar = gsap
      .timeline({ repeat: -1, repeatDelay: 6 })
      .fromTo(
        capa("flash")[0].firstElementChild,
        { opacity: 0 },
        { opacity: 0.7, duration: 0.12, ease: "none" }
      )
      .to(capa("flash")[0].firstElementChild, { opacity: 0, duration: 0.13 })
      .fromTo(
        capa("chispa"),
        { scale: 0, autoAlpha: 1 },
        {
          scale: 1,
          autoAlpha: 0,
          duration: 0.4,
          svgOrigin: "740 70",
          ease: "power2.out",
        },
        0.25
      )
    tl.add(destellar, 2)
  }

  return tl
}

// 6 · 05 Baile --------------------------------------------------------------

const ANCHO_5 = 912
const ALTO_5 = 1084
const BOLA = [450, 240]

// Puntos de luz repartidos alrededor de la bola: el grupo gira entero
const luces = Array.from({ length: 11 }, (_, i) => {
  const a = (i * 2 * Math.PI) / 11 + 0.4
  const r = 140 + ((i * 97) % 280)
  return [
    +(BOLA[0] + r * Math.cos(a)).toFixed(1),
    +(BOLA[1] + r * Math.sin(a) * 0.8).toFixed(1),
    3 + (i % 3),
  ]
})

const confeti = Array.from({ length: 24 }, (_, i) => [
  entreFijo(100 + i * 2, 20, ANCHO_5 - 20),
  entreFijo(101 + i * 2, 0, 760),
  3,
  15,
  i % 3,
])

function Baile() {
  return (
    <Detalles ancho={ANCHO_5} alto={ALTO_5} color={BEIGE}>
      {/* Dos haces que barren la sala desde la bola */}
      <g data-capa="haz" opacity="0.06">
        <path
          d={`M${BOLA[0]} ${BOLA[1]}L${BOLA[0] - 150} ${ALTO_5}L${BOLA[0] - 20} ${ALTO_5}Z`}
          fill={BEIGE}
          stroke="none"
        />
      </g>
      <g data-capa="haz" opacity="0.06">
        <path
          d={`M${BOLA[0]} ${BOLA[1]}L${BOLA[0] + 20} ${ALTO_5}L${BOLA[0] + 150} ${ALTO_5}Z`}
          fill={BEIGE}
          stroke="none"
        />
      </g>

      <Caida piezas={confeti} color={BEIGE} />

      {/* Los reflejos de la bola, en un grupo que gira con ella */}
      <g data-capa="luces">
        {luces.map(([x, y, r]) => (
          <circle
            key={`${x}-${y}`}
            data-capa="luz"
            cx={x}
            cy={y}
            r={r}
            fill={BEIGE}
            stroke="none"
            opacity="0.6"
          />
        ))}
      </g>

      <Destellos
        puntos={[
          [420, 210, 9],
          [470, 250, 7],
          [450, 230, 8],
        ]}
        grosor={3}
      />
    </Detalles>
  )
}

function buclesBaile(raiz: Element, movil: boolean) {
  const capa = capas(raiz)
  const q = gsap.utils.selector(raiz)
  const tl = gsap.timeline({ paused: true })

  // Los brillos saltan de faceta en faceta, más rápidos que el resto
  titilar(tl, capa("destello"), enZona({ x: 395, y: 186, w: 109, h: 108 }), 0.8)
  caer(tl, capa("caida"), 760, movil)

  // El reflejo de la bola dando vueltas por la sala
  tl.to(
    capa("luces"),
    {
      rotation: 360,
      duration: 12,
      ease: "none",
      repeat: -1,
      svgOrigin: BOLA.join(" "),
    },
    0
  )
  capa("luz").forEach((luz) =>
    tl.to(
      luz,
      {
        autoAlpha: azar(0.3, 1),
        duration: azar(0.8, 1.8),
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      },
      0
    )
  )

  if (!movil) {
    // Los dos haces barren en sentidos contrarios
    capa("haz").forEach((haz, i) =>
      tl.fromTo(
        haz,
        { rotation: i ? 20 : -20 },
        {
          rotation: i ? -20 : 20,
          duration: 4,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          svgOrigin: BOLA.join(" "),
        },
        0
      )
    )

    // Apartado 4: los invitados botan al ritmo, a 120 pulsaciones por minuto
    tl.to(
      q("[data-plan='dibujo']"),
      {
        y: -3,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      },
      0
    )
  }

  return tl.seek(ADELANTO)
}

// 7 · Entrada ---------------------------------------------------------------

// Al activarse el momento, sus piezas hacen un pop y después empiezan los
// bucles. El flash se queda fuera: es una capa a pantalla completa
function crearEntrada(raiz: Element) {
  const q = gsap.utils.selector(raiz)
  const tl = gsap.timeline({ paused: true })
  const piezas = q(
    "[data-capa]:not([data-capa='flash']):not([data-capa='luz'])"
  )

  if (piezas.length) {
    tl.from(piezas, {
      scale: 0,
      duration: 0.4,
      stagger: 0.04,
      ease: "back.out(2)",
    })
  }
  return tl
}

const escenas = [
  { Detalles: Ceremonia, bucles: buclesCeremonia },
  { Detalles: Banquete, bucles: buclesBanquete },
  { Detalles: Discursos, bucles: buclesDiscursos },
  { Detalles: Tarta, bucles: buclesTarta },
  { Detalles: Baile, bucles: buclesBaile },
]

const garabatosPlan = escenas.map(({ Detalles, bucles }) => ({
  Detalles,
  animar: (raiz: Element, movil: boolean) => ({
    entrada: crearEntrada(raiz),
    bucles: bucles(raiz, movil),
  }),
}))

export { garabatosPlan }
