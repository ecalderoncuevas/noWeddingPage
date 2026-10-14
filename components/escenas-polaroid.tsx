import { gsap } from "@/lib/gsap"

// Las seis escenas de las fotos de las polaroids (sección 2). Cada una es un
// SVG de 300 × 300 (el hueco de la foto) con sus capas marcadas con
// data-capa, copiadas de polaroids-escenas.svg, y una función que devuelve su
// timeline en pausa. Las figuras no se mueven: lo que se anima es el fondo.
// Sin animaciones se ven tal cual, en su primer fotograma

const capas = (escena: Element) => {
  const q = gsap.utils.selector(escena)
  return (nombre: string) => q(`[data-capa='${nombre}']`)
}

const BEIGE = "var(--beige)"
const VERDE = "var(--verde)"
const ROSA = "#c99ab0"

// Trazo común de las figuras: beige de 3 px y relleno del color del fondo
// (la variable --fondo de cada escena) para tapar lo de detrás
const linea = {
  fill: "none",
  stroke: BEIGE,
  strokeWidth: 3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const

function Cabeza({ x, y }: { x: number; y: number }) {
  return (
    <>
      <circle cx={x} cy={y} r="18" fill="var(--fondo)" />
      <text
        x={x}
        y={y + 8.2}
        textAnchor="middle"
        fontSize="24"
        fill={BEIGE}
        stroke="none"
        className="font-display italic"
      >
        ?
      </text>
    </>
  )
}

// El moño de ella: un círculo pequeño arriba a la derecha de la cabeza
function Mono({ x, y }: { x: number; y: number }) {
  return <circle cx={x + 13} cy={y - 13} r="7" fill="var(--fondo)" />
}

function Pajarita({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M${x} ${y}l-8-5v10ZM${x} ${y}l8-5v10Z`}
      fill={VERDE}
      stroke={VERDE}
      strokeWidth="1.5"
    />
  )
}

function Suelo({ desde = 0, hasta = 300 }: { desde?: number; hasta?: number }) {
  return <path d={`M${desde} 274H${hasta}`} opacity="0.5" />
}

// Estrella de cuatro puntas con las curvas del archivo
function estrella(x: number, y: number, r: number) {
  const c = r * 0.15
  return `M${x} ${y - r}Q${x + c} ${y - c} ${x + r} ${y}Q${x + c} ${y + c} ${x} ${y + r}Q${x - c} ${y + c} ${x - r} ${y}Q${x - c} ${y - c} ${x} ${y - r}Z`
}

function Escena({
  fondo,
  etiqueta,
  children,
}: {
  fondo: string
  etiqueta: string
  children: React.ReactNode
}) {
  return (
    <svg
      role="img"
      aria-label={etiqueta}
      viewBox="0 0 300 300"
      style={{ "--fondo": fondo } as React.CSSProperties}
      className="size-full overflow-hidden"
      {...linea}
    >
      <rect width="300" height="300" fill="var(--fondo)" stroke="none" />
      {children}
    </svg>
  )
}

// 1 · Cómo se conocieron ----------------------------------------------------

const gotas = [
  [52, 202],
  [245, 79],
  [46, 34],
  [10, 205],
  [281, 148],
  [30, 113],
  [266, 274],
  [88, 54],
  [13, 133],
  [84, 158],
  [44, 172],
  [143, 45],
  [280, 153],
  [3, 149],
  [293, 159],
  [260, 99],
  [132, 22],
  [41, 23],
]
// La lluvia es un mosaico: el grupo de gotas se repite 300 px a la derecha y,
// en la fila de arriba, 128 px más a la derecha (la inclinación de las gotas).
// Así, al bajar todo un tramo, cada copia ocupa el sitio de otra
const mosaico = [
  [0, 0],
  [300, 0],
  [-172, -300],
  [128, -300],
]

function Lluvia() {
  return (
    <Escena
      fondo="#672d4b"
      etiqueta="Los novios bajo un paraguas, bajo la lluvia"
    >
      {/* La lluvia va la primera: pasa por detrás del paraguas y los novios */}
      <g data-capa="lluvia" stroke={VERDE} strokeWidth="2.5" opacity="0.7">
        {mosaico.map(([dx, dy]) => (
          <g key={`${dx}-${dy}`} transform={`translate(${dx} ${dy})`}>
            {gotas.map(([x, y]) => (
              <path key={`${x}-${y}`} d={`M${x} ${y}l-6 14`} />
            ))}
          </g>
        ))}
      </g>
      <path
        data-capa="paraguas"
        d="M90 118Q160 40 230 118q-12-10-24 0-12-10-24 0-12-10-22 0-12-10-24 0-12-10-24 0-12-10-22 0Z"
        fill={VERDE}
      />
      <path d="M160 64V54m0 64v60q0 10 8 10" />
      <g data-capa="novio">
        <path d="M118 190v36l-14 46m14-46 14 46m-14-72-14 14m14-14h22" />
        <Cabeza x={118} y={172} />
        <Pajarita x={118} y={193} />
      </g>
      <g data-capa="novia">
        <path d="M204 190v36l-14 46m14-46 14 46m-14-72-36-14m36 14 22 14" />
        <Mono x={204} y={172} />
        <Cabeza x={204} y={172} />
      </g>
      <Suelo desde={30} hasta={270} />
      {/* Dos copias del charco para las ondas; la segunda espera oculta */}
      {[0.6, 0].map((opacidad, i) => (
        <ellipse
          key={i}
          data-capa="charco"
          cx="160"
          cy="282"
          rx="70"
          ry="7"
          strokeWidth="2"
          opacity={opacidad}
        />
      ))}
    </Escena>
  )
}

function animarLluvia(escena: Element) {
  const capa = capas(escena)
  const [onda, onda2] = capa("charco")

  return gsap
    .timeline({ paused: true })
    .to(
      capa("lluvia"),
      { x: "-=128", y: "+=300", duration: 1.2, ease: "none", repeat: -1 },
      0
    )
    .add(
      [onda, onda2].map((el, i) =>
        gsap.fromTo(
          el,
          { scale: 0.4, autoAlpha: 0.6 },
          {
            scale: 1.2,
            autoAlpha: 0,
            transformOrigin: "50% 50%",
            duration: 1.6,
            ease: "power1.out",
            repeat: -1,
            delay: i * 0.8,
          }
        )
      ),
      0
    )
}

// 2 · La primera cita -------------------------------------------------------

function Cine() {
  return (
    <Escena
      fondo="#54392d"
      etiqueta="Los novios en el cine, con un cubo de palomitas entre los dos"
    >
      <path
        data-capa="haz"
        d="M300 0 30 40v80Z"
        fill={BEIGE}
        stroke="none"
        opacity="0.08"
      />
      {/* En el boceto la pantalla solo tiene borde: aquí se rellena para que brille */}
      <rect
        data-capa="pantalla"
        x="30"
        y="28"
        width="240"
        height="96"
        rx="4"
        fill={BEIGE}
        fillOpacity="0.04"
      />
      <g fill={BEIGE} stroke="none" opacity="0.5">
        {[38, 64, 90, 116, 142, 168, 194, 220, 246].map((x) => (
          <rect key={x} x={x} y="134" width="14" height="6" rx="1" />
        ))}
      </g>
      <g data-capa="novio">
        <path d="M96 194v22l-12 46m12-46 14 46m-14-58-18 24m18-24 36 22" />
        <Cabeza x={96} y={176} />
        <Pajarita x={96} y={197} />
      </g>
      <g data-capa="novia">
        <path d="M204 194v22l-12 46m12-46 14 46m-14-58-34 22m34-22 18 24" />
        <Mono x={204} y={176} />
        <Cabeza x={204} y={176} />
      </g>
      <g data-capa="butacas" strokeWidth="2.5" opacity="0.7">
        <rect x="64" y="236" width="64" height="40" rx="8" />
        <rect x="172" y="236" width="64" height="40" rx="8" />
      </g>
      <g data-capa="palomitas">
        <path d="M136 206h28l-4 38h-20Z" fill="var(--fondo)" />
        <path d="m143 206 2 38m6-38v38m6-38-2 38" stroke={ROSA} />
        <g fill={BEIGE} stroke="none">
          <circle cx="142" cy="200" r="5" />
          <circle cx="152" cy="197" r="5" />
          <circle cx="160" cy="201" r="5" />
          <circle data-capa="palomita" cx="148" cy="186" r="5" />
          <circle data-capa="palomita" cx="158" cy="180" r="5" />
        </g>
      </g>
    </Escena>
  )
}

function animarCine(escena: Element) {
  const capa = capas(escena)

  // Parpadeo de proyector antiguo: cada vuelta, valores nuevos
  const parpadeo = gsap.timeline({ repeat: -1, repeatRefresh: true })
  for (let i = 0; i < 7; i++) {
    parpadeo.to(capa("haz"), {
      opacity: () => gsap.utils.random(0.05, 0.12),
      duration: () => gsap.utils.random(0.05, 0.15),
      ease: "none",
    })
  }

  const saltos = capa("palomita").map((palomita) => {
    const salto = gsap
      .timeline({
        repeat: -1,
        repeatDelay: gsap.utils.random(0.8, 2),
        onRepeat: () => {
          salto.repeatDelay(gsap.utils.random(0.8, 2))
        },
      })
      .to(palomita, {
        y: -18,
        rotation: 45,
        transformOrigin: "50% 50%",
        duration: 0.35,
        ease: "power2.out",
      })
      .to(palomita, { y: 0, rotation: 90, duration: 0.35, ease: "power2.in" })
    return salto
  })

  return gsap
    .timeline({ paused: true })
    .add(parpadeo, 0)
    .to(
      capa("pantalla"),
      {
        fillOpacity: 0.1,
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      },
      0
    )
    .add(saltos, 0)
}

// 3 · Empezaron a salir -----------------------------------------------------

const estrellas = [
  [40, 40, 7, BEIGE],
  [90, 70, 5, VERDE],
  [150, 30, 6, BEIGE],
  [196, 64, 4, BEIGE],
  [120, 110, 4, VERDE],
  [30, 120, 5, BEIGE],
  [270, 130, 5, VERDE],
] as const

function Noche() {
  return (
    <Escena
      fondo="#7a4763"
      etiqueta="Los novios paseando de noche cogidos de la mano"
    >
      <path
        data-capa="luna"
        d="M242 36a26 26 0 1 0 20 46 20 20 0 1 1-20-46Z"
        fill={BEIGE}
        stroke="none"
      />
      <g stroke="none">
        {estrellas.map(([x, y, r, color]) => (
          <path
            key={`${x}-${y}`}
            data-capa="estrella"
            d={estrella(x, y, r)}
            fill={color}
          />
        ))}
      </g>
      <g data-capa="farola">
        <path d="M44 272V150q0-14 14-14h8" />
        <path d="M60 136h12l-3 12h-6Z" fill={BEIGE} strokeWidth="2" />
        <circle
          data-capa="luz"
          cx="66"
          cy="156"
          r="22"
          fill={BEIGE}
          stroke="none"
          opacity="0.12"
        />
      </g>
      <g data-capa="novio">
        <path d="M140 190v36l-12 46m12-46 12 42m-12-68-18 26m18-26 26 14" />
        <Cabeza x={140} y={172} />
        <Pajarita x={140} y={193} />
      </g>
      <g data-capa="novia">
        <path d="M196 190v36l-12 42m12-42 12 46m-12-72-26 14m26-14 20 28" />
        <Mono x={196} y={172} />
        <Cabeza x={196} y={172} />
      </g>
      <path d="M166 214h4" />
      <Suelo />
    </Escena>
  )
}

function animarNoche(escena: Element) {
  const capa = capas(escena)

  return gsap
    .timeline({ paused: true })
    .add(
      capa("estrella").map((estrella) =>
        gsap.to(estrella, {
          scale: 0.5,
          autoAlpha: 0.4,
          transformOrigin: "50% 50%",
          duration: gsap.utils.random(1.2, 2.4),
          delay: gsap.utils.random(0, 1.5),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        })
      ),
      0
    )
    .to(
      capa("luz"),
      {
        scale: 1.25,
        opacity: 0.22,
        transformOrigin: "50% 50%",
        duration: 2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      },
      0
    )
    .fromTo(
      capa("luna"),
      { y: -3 },
      { y: 3, duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 },
      0
    )
}

// 4 · El primer perro -------------------------------------------------------

const corazones = [
  [150, 96, 0.9],
  [170, 70, 0.6],
  [136, 52, 0.4],
]

function Perro() {
  return (
    <Escena fondo="#6b5145" etiqueta="Los novios paseando a su perro">
      <g fill={ROSA} stroke="none">
        {corazones.map(([x, y, opacidad]) => (
          <path
            key={`${x}-${y}`}
            data-capa="corazon"
            d={`M${x} ${y}c-6-8-16-2-10 6l10 10 10-10c6-8-4-14-10-6Z`}
            opacity={opacidad}
          />
        ))}
      </g>
      <g data-capa="novio">
        <path d="M82 190v36l-14 46m14-46 14 46m-14-72-12 22m12-22 18 30" />
        <Cabeza x={82} y={172} />
        <Pajarita x={82} y={193} />
      </g>
      <g data-capa="novia">
        <path d="M222 190v36l-14 46m14-46 14 46m-14-72-18 32m18-32 18 20" />
        <Mono x={222} y={172} />
        <Cabeza x={222} y={172} />
      </g>
      <path
        data-capa="correa"
        d="M204 232q-18 18-28-10"
        stroke={VERDE}
        strokeWidth="2.5"
      />
      <g data-capa="perro">
        <ellipse cx="150" cy="240" rx="30" ry="15" fill="var(--fondo)" />
        <circle cx="178" cy="222" r="13" fill="var(--fondo)" />
        <path
          d="m172 212-4-12 10 8m6 4 6-10-4 12"
          fill="var(--fondo)"
          strokeWidth="2.5"
        />
        <path d="m132 252-2 20m12-18v18m18-18v18m10-20 2 20" />
        <path data-capa="cola" d="M120 236q-14-12-10-26" />
        <circle cx="182" cy="220" r="2" fill={BEIGE} stroke="none" />
      </g>
      {/* A los pies de él y no de ella: el matasellos de esta polaroid
          tapaba la pelota y sus ondas cruzaban el bote */}
      <circle
        data-capa="pelota"
        cx="40"
        cy="266"
        r="8"
        fill={VERDE}
        stroke="none"
      />
      <Suelo />
    </Escena>
  )
}

function animarPerro(escena: Element) {
  const capa = capas(escena)

  const subir = capa("corazon").map((corazon) =>
    gsap
      .timeline({ repeat: -1 })
      .fromTo(
        corazon,
        { y: 0, scale: 0.6 },
        {
          y: -60,
          scale: 1,
          transformOrigin: "50% 50%",
          duration: 2.4,
          ease: "power1.out",
        },
        0
      )
      .fromTo(corazon, { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.6 }, 0)
      .to(corazon, { autoAlpha: 0, duration: 1.2 }, 1.2)
  )

  const pelota = capa("pelota")
  const botar = gsap
    .timeline({ repeat: -1 })
    .to(pelota, { y: -26, duration: 0.3, ease: "power2.out" })
    .to(pelota, { y: 0, duration: 0.3, ease: "power2.in" })
    // Se aplasta al tocar el suelo
    .to(pelota, {
      scaleX: 1.25,
      scaleY: 0.75,
      transformOrigin: "50% 100%",
      duration: 0.08,
    })
    .to(pelota, { scaleX: 1, scaleY: 1, duration: 0.08 })

  const tl = gsap
    .timeline({ paused: true })
    .fromTo(
      capa("cola"),
      { rotation: -18 },
      {
        rotation: 18,
        transformOrigin: "100% 100%",
        duration: 0.18,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      },
      0
    )
    .add(botar, 0)
  subir.forEach((corazon, i) => tl.add(corazon, i * 0.8))
  return tl
}

// 5 · La pedida -------------------------------------------------------------

// Cada estallido: 12 rayos que van del centro hacia fuera
const estallidos = [
  { x: 70, y: 60, desde: 11.9, hasta: 34, color: VERDE },
  { x: 220, y: 50, desde: 9.8, hasta: 28, color: ROSA },
  { x: 150, y: 100, desde: 7, hasta: 20, color: BEIGE },
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
    <Escena fondo="#672d4b" etiqueta="Él, de rodillas, le ofrece un anillo">
      <g data-capa="fuegos" strokeWidth="2.5">
        {estallidos.map((estallido) => (
          <g key={estallido.x} data-capa="estallido" stroke={estallido.color}>
            {rayos(estallido).map((d) => (
              <path key={d} data-capa="rayo" d={d} />
            ))}
          </g>
        ))}
      </g>
      <g data-capa="novio">
        <path d="M110 212v14l-18 46m18-46 22 26 2 20m-24-50-14 14m14-14 34-12" />
        <Cabeza x={110} y={194} />
        <Pajarita x={110} y={215} />
      </g>
      <g data-capa="anillo">
        <rect
          x="140"
          y="198"
          width="18"
          height="14"
          rx="2"
          fill="var(--fondo)"
          strokeWidth="2.5"
        />
        <circle cx="149" cy="194" r="6" stroke={VERDE} strokeWidth="2.5" />
        <path
          data-capa="destello"
          d={estrella(160, 180, 6)}
          fill={BEIGE}
          stroke="none"
        />
      </g>
      <g data-capa="novia">
        <path d="M212 190v36l-14 46m14-46 14 46m-14-72-14-4m14 4 14-4" />
        <Mono x={212} y={172} />
        <Cabeza x={212} y={172} />
      </g>
      <Suelo />
    </Escena>
  )
}

function animarPedida(escena: Element) {
  const capa = capas(escena)
  const tl = gsap.timeline({ paused: true })

  capa("estallido").forEach((grupo, i) => {
    const lineas = gsap.utils.selector(grupo)("[data-capa='rayo']")
    const estallar = gsap
      .timeline({
        repeat: -1,
        repeatDelay: gsap.utils.random(0.6, 1.6),
        onRepeat: () => {
          estallar.repeatDelay(gsap.utils.random(0.6, 1.6))
        },
      })
      // La línea sale del centro y después se aleja hasta desaparecer
      .fromTo(
        lineas,
        { drawSVG: "0% 0%", autoAlpha: 1 },
        { drawSVG: "0% 100%", duration: 0.35, ease: "expo.out" }
      )
      .to(lineas, { drawSVG: "100% 100%", duration: 0.4, ease: "power1.in" })
      // Con largo cero, las puntas redondas dejarían un anillo de puntos
      .set(lineas, { autoAlpha: 0 })
      .fromTo(
        grupo,
        { scale: 0.8 },
        {
          scale: 1.1,
          transformOrigin: "50% 50%",
          duration: 0.75,
          ease: "power2.out",
        },
        0
      )
    // Desfasados entre sí
    tl.add(estallar, i * 0.5)
  })

  return tl.add(
    gsap
      .timeline({ repeat: -1, repeatDelay: 1.2 })
      .fromTo(
        capa("destello"),
        { scale: 0, rotation: 0 },
        {
          scale: 1,
          rotation: 45,
          transformOrigin: "50% 50%",
          duration: 0.45,
          ease: "back.out(2)",
        }
      )
      .to(capa("destello"), {
        scale: 0,
        rotation: 90,
        duration: 0.45,
        ease: "power2.in",
      }),
    0
  )
}

// 6 · La «boda» -------------------------------------------------------------

const floresArco = [
  [240, 130, 9, VERDE],
  [235.6, 105.3, 7, ROSA],
  [222.8, 83, 9, BEIGE],
  [202.9, 65.3, 7, VERDE],
  [177.8, 53.9, 9, ROSA],
  [150, 50, 7, BEIGE],
  [122.2, 53.9, 9, VERDE],
  [97.1, 65.3, 7, ROSA],
  [77.2, 83, 9, BEIGE],
  [64.4, 105.3, 7, VERDE],
  [60, 130, 9, ROSA],
] as const

const confeti = [
  [90, 96, 20, VERDE],
  [132, 78, -30, ROSA],
  [176, 90, 45, BEIGE],
  [214, 110, -15, VERDE],
  [110, 140, 60, BEIGE],
  [196, 150, 10, ROSA],
  [150, 120, -50, VERDE],
] as const

function Boda() {
  return (
    <Escena
      fondo="#54392d"
      etiqueta="Los novios bajo un arco de flores, entre confeti"
    >
      <path data-capa="arco" d="M60 274V130q0-80 90-80t90 80v144" />
      <g stroke="none">
        {floresArco.map(([x, y, r, color]) => (
          <circle
            key={`${x}-${y}`}
            data-capa="flor"
            cx={x}
            cy={y}
            r={r}
            fill={color}
          />
        ))}
      </g>
      {/* Por delante del arco y por detrás de los novios. Cada trozo va en
          su grupo: el giro del dibujo y el de la caída no se pisan */}
      <g stroke="none">
        {confeti.map(([x, y, giro, color]) => (
          <g key={`${x}-${y}`} data-capa="confeti" data-y={y}>
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
      <g data-capa="novio">
        <path d="M128 190v36l-14 46m14-46 14 46m-14-72-16 28m16-28 22 22" />
        <Cabeza x={128} y={172} />
        <Pajarita x={128} y={193} />
      </g>
      <g data-capa="novia">
        <path
          data-capa="velo"
          d="M182 160q34 42 30 102"
          strokeWidth="2.5"
          opacity="0.85"
        />
        <path
          data-capa="vestido"
          d="m172 190-6 22-24 60h60l-24-60Z"
          fill="var(--fondo)"
        />
        <path d="m172 200-22 22m22-22 18 30" />
        <Mono x={172} y={172} />
        <Cabeza x={172} y={172} />
      </g>
      <g data-capa="ramito" stroke="none">
        <circle cx="146" cy="224" r="6" fill={VERDE} />
        <circle cx="154" cy="220" r="5" fill={ROSA} />
        <circle cx="150" cy="230" r="5" fill={BEIGE} />
      </g>
      <Suelo desde={30} hasta={270} />
    </Escena>
  )
}

// Segundos que el confeti lleva cayendo al empezar: así ya hay trozos a
// media caída en vez de salir todos de arriba a la vez
const ADELANTO = 5

function animarBoda(escena: Element) {
  const capa = capas(escena)
  const tl = gsap.timeline({ paused: true })

  capa("confeti").forEach((trozo) => {
    const y = Number((trozo as HTMLElement).dataset.y)
    const giro = gsap.utils.random(-360, 360)
    // Cada trozo empieza en un punto distinto de su caída
    const inicio = ADELANTO - gsap.utils.random(0, ADELANTO)

    tl.fromTo(
      trozo,
      { y: -40 - y, rotation: 0 },
      {
        y: 310 - y,
        rotation: giro,
        transformOrigin: "50% 50%",
        duration: gsap.utils.random(3, 5),
        ease: "none",
        repeat: -1,
      },
      inicio
    ).fromTo(
      trozo,
      { x: -8 },
      {
        x: 8,
        duration: gsap.utils.random(0.8, 1.4),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      },
      inicio
    )
  })

  capa("flor").forEach((flor) => {
    const duracion = gsap.utils.random(1.6, 2.4)
    tl.fromTo(
      flor,
      { y: -1.5 },
      {
        y: 1.5,
        duration: duracion,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      },
      ADELANTO - duracion / 2
    )
  })

  // Arranca con el reloj adelantado: todo empieza ya en marcha
  return tl.seek(ADELANTO)
}

const escenas = [
  { Escena: Lluvia, animar: animarLluvia },
  { Escena: Cine, animar: animarCine },
  { Escena: Noche, animar: animarNoche },
  { Escena: Perro, animar: animarPerro },
  { Escena: Pedida, animar: animarPedida },
  { Escena: Boda, animar: animarBoda },
]

export { escenas as escenasPolaroid }
