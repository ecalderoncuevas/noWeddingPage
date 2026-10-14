import { gsap } from "@/lib/gsap"

// Los garabatos de las seis fotos de las polaroids (sección 2): dibujos a
// línea encima de la foto, como si alguien hubiera pintado sobre ella con un
// rotulador. Sustituyen a los monigotes de escenas-polaroid.tsx, pero
// conservan su forma: cada escena es un SVG de 300 × 300 (el hueco de la
// foto) con sus capas marcadas con data-capa, y una función que devuelve sus
// timelines. La especificación está en noWeddingLanding-polaroids-fotos.md
//
// Cada foto tiene dos timelines: `entrada` (el revelado y el dibujo, una sola
// vez, igual en las seis) y `bucles` (los dos bucles de esa foto, en pausa).
// Las posiciones están calcadas sobre la foto definitiva: los "?" van donde
// estarían las caras y los garabatos, en la zona vacía de cada una

const BEIGE = "var(--beige)"
const VERDE = "var(--verde)"
const LILA = "#672D4B"
const ROSA = "#c99ab0"

// Para que una pieza gire o escale desde su propio centro y no desde la
// esquina del SVG
const PIEZA = "[transform-box:fill-box] [transform-origin:center]"

const capas = (foto: Element) => {
  const q = gsap.utils.selector(foto)
  return (nombre: string) => q(`[data-capa='${nombre}']`)
}

// Trazo común: 3 px, puntas y uniones redondeadas, el mismo del hero y el
// footer. Una sombra muy suave para que se lea sobre cualquier zona de la foto
const trazo = {
  fill: "none",
  strokeWidth: 3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const

function Garabatos({
  color = BEIGE,
  children,
}: {
  color?: string
  children: React.ReactNode
}) {
  return (
    <svg
      viewBox="0 0 300 300"
      aria-hidden
      stroke={color}
      {...trazo}
      className="pointer-events-none absolute inset-0 size-full [filter:drop-shadow(0_1px_1px_rgb(0_0_0/0.35))]"
    >
      {children}
    </svg>
  )
}

// El "?" de una cara: la cursiva de titulares dentro de un círculo de trazo,
// como las cabezas de los monigotes. Salta entero en la entrada, así que no
// se dibuja con DrawSVG
function Interrogante({ x, y, r = 17 }: { x: number; y: number; r?: number }) {
  return (
    <g data-capa="interrogante" className={PIEZA}>
      <circle cx={x} cy={y} r={r} />
      <text
        x={x}
        y={y + 12}
        textAnchor="middle"
        fontSize="34"
        fill={BEIGE}
        stroke="none"
        className="font-display italic"
      >
        ?
      </text>
    </g>
  )
}

// Estrella de cuatro puntas, con las curvas de las escenas anteriores
function estrella(x: number, y: number, r: number) {
  const c = r * 0.15
  return `M${x} ${y - r}Q${x + c} ${y - c} ${x + r} ${y}Q${x + c} ${y + c} ${x} ${y + r}Q${x - c} ${y + c} ${x - r} ${y}Q${x - c} ${y - c} ${x} ${y - r}Z`
}

const corazon = (x: number, y: number) =>
  `M${x} ${y}c-6-8-16-2-10 6l10 10 10-10c6-8-4-14-10-6Z`

// Los "?" flotan: el segundo va 1,5 s por detrás y espera ya en un extremo
// para no dar un salto al empezar
const flotar = (interrogante: Element) =>
  gsap.fromTo(
    interrogante,
    { y: -4, rotation: -6 },
    {
      y: 4,
      rotation: 6,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
    }
  )

const anadirFlotar = (tl: gsap.core.Timeline, piezas: Element[]) =>
  piezas.forEach((pieza, i) => tl.add(flotar(pieza), i * 1.5))

// 1 · Cómo se conocieron ----------------------------------------------------

// Las gotas caen inclinadas (-6 en x por cada 14 en y)
const gotas = [
  [40, 20],
  [110, 55],
  [250, 15],
  [180, 35],
  [20, 95],
  [285, 70],
  [95, 120],
  [150, 85],
  [205, 140],
  [265, 180],
  [55, 165],
  [125, 205],
]
// La lluvia es un mosaico: el grupo se repite 300 px a la derecha y, en la
// fila de arriba, 128 px más a la derecha (lo que se desplaza al caer un
// tramo). Así, al bajar, cada copia ocupa el sitio de otra y no se nota
const mosaico = [
  [0, 0],
  [300, 0],
  [-172, -300],
  [128, -300],
]

function Lluvia() {
  return (
    <Garabatos>
      <g data-capa="lluvia" strokeWidth="2.5" opacity="0.8">
        {mosaico.map(([dx, dy]) => (
          <g key={`${dx}-${dy}`} transform={`translate(${dx} ${dy})`}>
            {gotas.map(([x, y]) => (
              <path key={`${x}-${y}`} data-dibujo d={`M${x} ${y}l-6 14`} />
            ))}
          </g>
        ))}
      </g>
      {/* Las dos cabezas asoman por debajo del paraguas */}
      <Interrogante x={139} y={151} />
      <Interrogante x={183} y={145} />
    </Garabatos>
  )
}

function buclesLluvia(foto: Element) {
  const capa = capas(foto)
  const tl = gsap.timeline({ paused: true })

  tl.to(
    capa("lluvia"),
    { x: "-=128", y: "+=300", duration: 1.2, ease: "none", repeat: -1 },
    0
  )
  anadirFlotar(tl, capa("interrogante"))
  return tl
}

// 2 · La primera cita -------------------------------------------------------

// Saltan del cubo de palomitas real, que queda justo debajo
const palomitas = [
  [142, 152],
  [156, 139],
  [169, 147],
  [150, 126],
  [177, 133],
]

function Palomita({ x, y }: { x: number; y: number }) {
  return (
    <g
      data-capa="palomita"
      className={PIEZA}
      transform={`translate(${x} ${y})`}
    >
      <circle data-dibujo cx="-3" cy="0" r="3.4" />
      <circle data-dibujo cx="3" cy="-1" r="3.4" />
      <circle data-dibujo cx="0" cy="3.4" r="3.2" />
    </g>
  )
}

function Cine() {
  return (
    <Garabatos>
      {palomitas.map(([x, y]) => (
        <Palomita key={`${x}-${y}`} x={x} y={y} />
      ))}
      {/* Las dos siluetas contra la pantalla */}
      <Interrogante x={98} y={133} />
      <Interrogante x={199} y={126} />
    </Garabatos>
  )
}

function buclesCine(foto: Element) {
  const capa = capas(foto)
  const tl = gsap.timeline({ paused: true })

  // Cada palomita sube y cae con su propia espera, distinta en cada vuelta
  capa("palomita").forEach((palomita, i) => {
    tl.add(
      gsap
        .timeline({
          repeat: -1,
          repeatDelay: gsap.utils.random(0.8, 2),
          repeatRefresh: true,
        })
        .to(palomita, { y: -18, duration: 0.35, ease: "power2.out" })
        .to(palomita, { y: 0, duration: 0.35, ease: "power2.in" })
        .to(palomita, { rotation: 90, duration: 0.7 }, 0),
      i * 0.3
    )
  })
  anadirFlotar(tl, capa("interrogante"))
  return tl
}

// 3 · Empezaron a salir -----------------------------------------------------

// El cielo está vacío salvo por la farola, abajo a la izquierda
const estrellas = [
  [120, 28, 8],
  [165, 52, 6],
  [200, 22, 7],
  [275, 80, 6],
  [140, 86, 5],
  [215, 88, 7],
]

function Noche() {
  return (
    <Garabatos>
      <g data-capa="estrella-grupo">
        {estrellas.map(([x, y, r]) => (
          <path
            key={`${x}-${y}`}
            data-capa="estrella"
            data-dibujo
            className={PIEZA}
            d={estrella(x, y, r)}
          />
        ))}
      </g>
      {/* Luna en lo alto, a la derecha */}
      <path data-dibujo d="M247 25a15 15 0 1 0 0 30a12 12 0 1 1 0-30Z" />
      {/* Justo encima de las manos cogidas */}
      <path
        data-capa="corazon"
        data-dibujo
        className={PIEZA}
        d={corazon(157, 234)}
        stroke={ROSA}
      />
    </Garabatos>
  )
}

function buclesNoche(foto: Element) {
  const capa = capas(foto)
  const tl = gsap.timeline({ paused: true })

  // Duración y espera al azar: así nunca titilan a la vez
  capa("estrella").forEach((estrella) =>
    tl.to(
      estrella,
      {
        scale: 0.5,
        autoAlpha: 0.4,
        duration: gsap.utils.random(1.2, 2.4),
        delay: gsap.utils.random(0, 1.2),
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      },
      0
    )
  )

  // El mismo latido que el corazón del hilo del footer
  tl.add(
    gsap
      .timeline({ repeat: -1, repeatDelay: 0.8 })
      .to(capa("corazon"), { scale: 1.15, duration: 0.18, ease: "power2.out" })
      .to(capa("corazon"), { scale: 1, duration: 0.18 })
      .to(capa("corazon"), { scale: 1.1, duration: 0.16 })
      .to(capa("corazon"), { scale: 1, duration: 0.38, ease: "power2.out" }),
    0
  )
  return tl
}

// 4 · El primer perro -------------------------------------------------------

// Salen por encima de la cabeza del perro, nunca sobre ella, y suben hacia
// los árboles en sombra. Se desvanecen antes de llegar al trozo de cielo
// azul, donde no se leerían
const corazones = [
  [152, 116],
  [140, 106],
  [164, 100],
]
// Rayitas de movimiento pegadas a la cola real, que el perro lleva levantada
const cola = ["M205 132q7-4 12 0", "M206 142q8-4 13 0", "M205 152q7-4 12 0"]

function Perro() {
  return (
    <Garabatos>
      {corazones.map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          data-capa="corazon"
          data-dibujo
          className={PIEZA}
          d={corazon(x, y)}
          stroke={ROSA}
        />
      ))}
      <g data-capa="cola-grupo" strokeWidth="2.5">
        {cola.map((d) => (
          <path key={d} data-capa="raya" data-dibujo d={d} />
        ))}
      </g>
    </Garabatos>
  )
}

function buclesPerro(foto: Element) {
  const capa = capas(foto)
  const tl = gsap.timeline({ paused: true })

  capa("corazon").forEach((corazon, i) =>
    tl.add(
      gsap.fromTo(
        corazon,
        { y: 0, scale: 0.6, autoAlpha: 0 },
        {
          y: -60,
          scale: 1,
          autoAlpha: 0,
          duration: 2.4,
          ease: "power1.out",
          repeat: -1,
          keyframes: {
            autoAlpha: [0, 0.9, 0.9, 0],
            easeEach: "none",
          },
        }
      ),
      i * 0.8
    )
  )

  // Las tres rayitas alternan, con el giro desde el lado de la cola
  capa("raya").forEach((raya, i) =>
    tl.to(
      raya,
      {
        rotation: i % 2 ? -12 : 12,
        transformOrigin: "left center",
        duration: 0.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      },
      0
    )
  )
  return tl
}

// 5 · La pedida -------------------------------------------------------------

// Los tres estallidos van en el cielo vacío, por debajo de la guirnalda
const estallidos = [
  { x: 72, y: 58, desde: 8, hasta: 24, color: VERDE },
  { x: 155, y: 30, desde: 7, hasta: 20, color: ROSA },
  { x: 232, y: 85, desde: 9, hasta: 26, color: BEIGE },
]

function rayos({ x, y, desde, hasta }: (typeof estallidos)[number]) {
  return Array.from({ length: 12 }, (_, i) => {
    const angulo = (i * Math.PI) / 6
    const cos = Math.cos(angulo)
    const sin = Math.sin(angulo)
    return `M${(x + desde * cos).toFixed(1)} ${(y + desde * sin).toFixed(1)}L${(x + hasta * cos).toFixed(1)} ${(y + hasta * sin).toFixed(1)}`
  })
}

function Pedida() {
  return (
    <Garabatos>
      <g strokeWidth="2.5">
        {estallidos.map((estallido) => (
          <g
            key={estallido.x}
            data-capa="estallido"
            className={PIEZA}
            stroke={estallido.color}
          >
            {rayos(estallido).map((d) => (
              <path key={d} data-capa="rayo" data-dibujo d={d} />
            ))}
          </g>
        ))}
      </g>
      {/* Junto a la caja del anillo */}
      <path
        data-capa="destello"
        className={PIEZA}
        d={estrella(163, 164, 9)}
        strokeWidth="2.5"
      />
    </Garabatos>
  )
}

function buclesPedida(foto: Element) {
  const capa = capas(foto)
  const tl = gsap.timeline({ paused: true })

  // Cada rayo sale del centro y se aleja: la línea nace en "0% 0%", crece
  // hasta "0% 100%" y después se recoge por detrás
  capa("estallido").forEach((estallido, i) => {
    const q = gsap.utils.selector(estallido)
    tl.add(
      gsap
        .timeline({
          repeat: -1,
          repeatDelay: gsap.utils.random(0.6, 1.6),
          repeatRefresh: true,
        })
        .fromTo(
          q("[data-capa='rayo']"),
          { drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 0.35, ease: "expo.out" }
        )
        .to(q("[data-capa='rayo']"), { drawSVG: "100% 100%", duration: 0.4 })
        .fromTo(
          estallido,
          { scale: 0.8 },
          { scale: 1.1, duration: 0.75, ease: "power1.out" },
          0
        ),
      i * 0.5
    )
  })

  tl.fromTo(
    capa("destello"),
    { scale: 0 },
    {
      scale: 1,
      rotation: 90,
      duration: 0.9,
      yoyo: true,
      repeat: -1,
      repeatDelay: 1.2,
      ease: "back.out(2)",
    },
    0
  )
  return tl
}

// 6 · La «boda» -------------------------------------------------------------

// El muro de la masía es claro: aquí el confeti va en lila, verde y rosa.
// En beige no se leería
const confeti = [
  [28, 40, 20, LILA],
  [62, 12, -30, VERDE],
  [96, 62, 45, ROSA],
  [128, 20, -15, LILA],
  [162, 48, 60, VERDE],
  [196, 10, 10, ROSA],
  [228, 56, -50, LILA],
  [258, 26, 35, VERDE],
  [44, 86, -20, ROSA],
  [112, 96, 70, LILA],
  [210, 92, -40, VERDE],
  [276, 70, 25, ROSA],
] as const

// Segundos que el confeti lleva cayendo al arrancar el bucle: así ya hay
// trozos a media caída en cuanto empieza
const ADELANTO = 5

function Boda() {
  return (
    <Garabatos>
      <g stroke="none">
        {confeti.map(([x, y, giro, color]) => (
          // Cada trozo en su grupo: el giro dibujado y el de la caída no se pisan
          <g key={`${x}-${y}`} data-capa="confeti">
            <rect
              x={x}
              y={y}
              width="7"
              height="4"
              rx="1"
              transform={`rotate(${giro} ${x} ${y})`}
              fill={color}
            />
          </g>
        ))}
      </g>
      {/* Sobre el velo y sobre la cabeza de él, bajo el arco en sombra */}
      <Interrogante x={148} y={129} />
      <Interrogante x={192} y={126} />
    </Garabatos>
  )
}

function buclesBoda(foto: Element) {
  const capa = capas(foto)
  const tl = gsap.timeline({ paused: true })

  capa("confeti").forEach((trozo) => {
    const duracion = gsap.utils.random(3, 5)
    tl.add(
      gsap.fromTo(
        trozo,
        { y: -40 },
        {
          y: 320,
          rotation: gsap.utils.random(-360, 360),
          duration: duracion,
          ease: "none",
          repeat: -1,
        }
      ),
      gsap.utils.random(0, ADELANTO)
    ).to(
      trozo,
      {
        x: gsap.utils.random(-8, 8),
        duration: duracion / 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      },
      0
    )
  })

  anadirFlotar(tl, capa("interrogante"))
  // Arranca con el reloj adelantado: ya hay confeti por el aire
  return tl.seek(ADELANTO)
}

// Entrada: igual en las seis -------------------------------------------------

// Cuando la polaroid termina de caer, la foto se revela como una Polaroid de
// verdad, se dibujan los garabatos y saltan los "?". El filter solo se anima
// aquí: en bucle sería demasiado caro
function crearEntrada(foto: Element) {
  const q = gsap.utils.selector(foto)
  const tl = gsap.timeline({ paused: true })

  // Cada foto lleva garabatos distintos, así que algunas de estas selecciones
  // vienen vacías: la «boda» no tiene ningún trazo que dibujar y solo tres
  // fotos llevan "?". Una tween sin elementos funciona, pero GSAP avisa por
  // consola, así que se añade únicamente si hay algo que animar
  const desde = (selector: string, vars: gsap.TweenVars, t: number) => {
    const piezas = q(selector)
    if (piezas.length) tl.from(piezas, vars, t)
  }

  // La foto y su capa de revelado existen siempre
  tl.to(
    q("[data-foto='revelado']"),
    { autoAlpha: 0, duration: 2, ease: "power1.inOut" },
    0
  ).fromTo(
    q("[data-foto='img']"),
    { filter: "saturate(0) contrast(0.7) brightness(1.2)" },
    { filter: "saturate(1) contrast(1) brightness(1)", duration: 2 },
    0
  )

  desde(
    "[data-dibujo]",
    { drawSVG: "0%", duration: 0.8, stagger: 0.04, ease: "power2.inOut" },
    1.2
  )
  // El confeti y los destellos son rellenos: DrawSVG no los dibuja
  desde(
    "[data-capa='confeti'], [data-capa='destello']",
    {
      autoAlpha: 0,
      scale: 0,
      duration: 0.5,
      stagger: 0.03,
      ease: "back.out(2)",
    },
    1.2
  )
  desde(
    "[data-capa='interrogante']",
    {
      scale: 0,
      rotation: -20,
      duration: 0.5,
      stagger: 0.12,
      ease: "back.out(2)",
    },
    1.7
  )

  return tl
}

const escenas = [
  { Garabatos: Lluvia, bucles: buclesLluvia },
  { Garabatos: Cine, bucles: buclesCine },
  { Garabatos: Noche, bucles: buclesNoche },
  { Garabatos: Perro, bucles: buclesPerro },
  { Garabatos: Pedida, bucles: buclesPedida },
  { Garabatos: Boda, bucles: buclesBoda },
]

const garabatosPolaroid = escenas.map(({ Garabatos, bucles }) => ({
  Garabatos,
  // El hueco de la foto: dentro están la imagen, el revelado y los garabatos
  animar: (foto: Element) => ({
    entrada: crearEntrada(foto),
    bucles: bucles(foto),
  }),
}))

export { garabatosPolaroid }
