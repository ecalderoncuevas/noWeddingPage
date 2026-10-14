import { useId } from "react"

import { cera } from "@/components/sello-arrastra"
import { Star } from "@/components/star"
import { gsap } from "@/lib/gsap"
import { cn } from "@/lib/utils"

// Las tres escenas de las cards de la sección 1. Cada una es un SVG de
// 500 × 330 (el hueco de la card) con sus capas marcadas con data-capa, y
// una función que devuelve su timeline en pausa. La etiqueta "fijo" marca el
// fotograma que se enseña con movimiento reducido

const capas = (escena: Element) => {
  const q = gsap.utils.selector(escena)
  return (nombre: string) => q(`[data-capa='${nombre}']`)
}

const petalos = [0, 72, 144, 216, 288]

// El sello del cursor "Arrastra", en pequeño
function Lacre() {
  return (
    <>
      <path
        d={cera}
        transform="translate(250 201) scale(0.25) translate(-100 -100)"
        strokeWidth="8"
        className="fill-lila stroke-beige"
      />
      <circle
        cx="250"
        cy="201"
        r="14"
        className="fill-[#5a2741] stroke-[#8a4a6b]"
      />
      {petalos.map((angulo) => (
        <ellipse
          key={angulo}
          cx="250"
          cy="194"
          rx="3"
          ry="5.5"
          transform={`rotate(${angulo} 250 201)`}
          className="fill-[#a0607f]"
        />
      ))}
      <circle cx="250" cy="201" r="2.5" className="fill-[#4a1d35]" />
    </>
  )
}

// Card 01: el sobre que se abre solo
function Sobre() {
  const id = useId()

  return (
    <svg
      data-escena="sobre"
      viewBox="0 0 500 330"
      aria-hidden
      className="size-full"
    >
      <defs>
        {/* La grieta por la que se parte el sello */}
        <clipPath id={`${id}-izq`}>
          <path d="M215 165h37l-6 25 9 13-8 12 4 22h-36Z" />
        </clipPath>
        <clipPath id={`${id}-der`}>
          <path d="M285 165h-33l-6 25 9 13-8 12 4 22h34Z" />
        </clipPath>
      </defs>
      <g strokeWidth="2.5" strokeLinejoin="round" className="stroke-marron">
        <rect
          x="130"
          y="120"
          width="240"
          height="160"
          rx="6"
          className="fill-[#d5d3bd]"
        />
        {/* La solapa por dentro, ya abierta: queda detrás de la invitación */}
        <path
          data-capa="sobre-solapa-abierta"
          d="M130 120 250 30l120 90Z"
          className="invisible fill-[#e4e2cf]"
        />
        <g data-capa="invitacion">
          <rect
            x="147"
            y="132"
            width="206"
            height="140"
            rx="4"
            strokeWidth="2"
            className="fill-[#fbfaf3]"
          />
          <rect
            x="156"
            y="141"
            width="188"
            height="122"
            rx="2"
            fill="none"
            strokeWidth="1.5"
            strokeDasharray="6 5"
            strokeOpacity="0.45"
          />
          <text
            x="250"
            y="184"
            textAnchor="middle"
            stroke="none"
            className="fill-marron font-display text-[30px] italic"
          >
            Para: ti
          </text>
        </g>
        <g data-capa="sobre-cuerpo">
          <path
            d="M130 120l120 85 120-85v154a6 6 0 0 1-6 6H136a6 6 0 0 1-6-6Z"
            className="fill-beige"
          />
          <path
            d="M133 277l84-79M367 277l-84-79"
            fill="none"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
        </g>
        <path
          data-capa="sobre-solapa"
          d="M130 120h240l-120 92Z"
          className="fill-[#e9e7d6]"
        />
      </g>
      <g data-capa="sello-izq" clipPath={`url(#${id}-izq)`}>
        <Lacre />
      </g>
      <g data-capa="sello-der" clipPath={`url(#${id}-der)`}>
        <Lacre />
      </g>
    </svg>
  )
}

function animarSobre(escena: Element) {
  const capa = capas(escena)
  const sello = [...capa("sello-izq"), ...capa("sello-der")]
  const solapa = capa("sobre-solapa")
  const abierta = capa("sobre-solapa-abierta")
  const invitacion = capa("invitacion")

  // La solapa son dos piezas: la de fuera se pliega hasta el borde del sobre
  // y ahí la releva la de dentro, que queda por detrás de la invitación
  gsap.set(solapa, { transformOrigin: "50% 0%" })
  gsap.set(abierta, { scaleY: 0, transformOrigin: "50% 100%" })
  gsap.set(sello, { svgOrigin: "250 201" })

  return (
    gsap
      .timeline({ paused: true, repeat: -1, repeatDelay: 2 })
      .to(sello, {
        keyframes: { rotation: [0, 4, -4, 4, -4, 0] },
        duration: 0.45,
        ease: "none",
      })
      .to(
        sello,
        {
          x: (i) => (i ? 48 : -48),
          y: 85,
          rotation: (i) => (i ? 70 : -70),
          autoAlpha: 0,
          duration: 0.5,
          ease: "power2.in",
        },
        0.55
      )
      .to(solapa, { scaleY: 0, duration: 0.18, ease: "power2.in" }, 0.85)
      .set(solapa, { autoAlpha: 0 })
      .set(abierta, { autoAlpha: 1 })
      .to(abierta, { scaleY: 1, duration: 0.22, ease: "power2.out" })
      .to(invitacion, {
        y: -100,
        rotation: -4,
        svgOrigin: "250 202",
        duration: 0.6,
        ease: "back.out(1.4)",
      })
      .addLabel("fijo")
      // Dos segundos con la invitación fuera y todo vuelve atrás
      .to(
        invitacion,
        { y: 0, rotation: 0, duration: 0.45, ease: "power2.in" },
        "+=2"
      )
      .to(abierta, { scaleY: 0, duration: 0.16, ease: "power2.in" })
      .set(abierta, { autoAlpha: 0 })
      .set(solapa, { autoAlpha: 1 })
      .to(solapa, { scaleY: 1, duration: 0.2, ease: "power2.out" })
      .to(sello, {
        x: 0,
        y: 0,
        rotation: 0,
        autoAlpha: 1,
        duration: 0.35,
        ease: "back.out(1.6)",
      })
  )
}

// Ángulos (en grados) hacia los que sale cada trozo de confeti
const confeti = [-160, -138, -116, -98, -82, -62, -42, -20]

// Card 02: la caja de regalo vacía
function Regalo() {
  return (
    <svg
      data-escena="regalo"
      viewBox="0 0 500 330"
      aria-hidden
      className="size-full"
    >
      {/* Estrella y confeti van primero: salen de detrás de la caja */}
      {confeti.map((angulo, i) => (
        <circle
          key={angulo}
          data-capa="confeti"
          cx="250"
          cy="178"
          r={i % 3 ? 5 : 7}
          className={cn("invisible", i % 2 ? "fill-verde" : "fill-beige")}
        />
      ))}
      <g data-capa="estrella" className="invisible">
        <Star
          points={8}
          x="228"
          y="163"
          width="44"
          height="44"
          className="fill-verde"
        />
      </g>
      <g data-capa="regalo">
        <g data-capa="caja">
          <rect
            x="180"
            y="172"
            width="140"
            height="118"
            rx="5"
            className="fill-beige"
          />
          <rect
            x="238"
            y="172"
            width="24"
            height="118"
            className="fill-verde"
          />
          <rect
            x="180"
            y="172"
            width="140"
            height="10"
            fillOpacity="0.14"
            className="fill-marron"
          />
        </g>
        <g data-capa="tapa">
          <g data-capa="lazo" className="fill-verde">
            <path d="M250 144c-14-34-50-36-48-14 1 16 30 16 48 14Z" />
            <path d="M250 144c14-34 50-36 48-14-1 16-30 16-48 14Z" />
          </g>
          <rect
            x="170"
            y="142"
            width="160"
            height="34"
            rx="5"
            className="fill-[#fbfaf3]"
          />
          <rect x="236" y="142" width="28" height="34" className="fill-verde" />
          <circle cx="250" cy="141" r="8" className="fill-[#8f9369]" />
        </g>
      </g>
    </svg>
  )
}

function animarRegalo(escena: Element) {
  const capa = capas(escena)
  const tapa = capa("tapa")
  const estrella = capa("estrella")
  const radianes = (i: number) => (confeti[i] * Math.PI) / 180

  return (
    gsap
      .timeline({ paused: true, repeat: -1, repeatDelay: 2 })
      .to(capa("regalo"), {
        keyframes: { rotation: [0, 5, -5, 5, -5, 5, -5, 0] },
        svgOrigin: "250 290",
        duration: 0.55,
        ease: "none",
      })
      .to(
        tapa,
        {
          x: 72,
          y: -84,
          rotation: 24,
          transformOrigin: "50% 50%",
          duration: 0.5,
          ease: "back.out(2)",
        },
        0.6
      )
      .fromTo(
        capa("confeti"),
        { x: 0, y: 0, scale: 1, autoAlpha: 1 },
        {
          x: (i) => Math.cos(radianes(i)) * (80 + (i % 3) * 22),
          y: (i) => Math.sin(radianes(i)) * (80 + (i % 3) * 22),
          scale: 0.5,
          autoAlpha: 0,
          transformOrigin: "50% 50%",
          duration: 0.9,
          ease: "power2.out",
          // Sin esto, el confeti se pintaría visible al crear la timeline
          immediateRender: false,
        },
        0.72
      )
      // El chiste: de la caja solo sale una estrella pequeña, y despacio
      .fromTo(
        estrella,
        { y: 0, scale: 0.3, rotation: -40, autoAlpha: 0 },
        {
          y: -90,
          scale: 1,
          rotation: 0,
          autoAlpha: 1,
          svgOrigin: "250 185",
          duration: 1.5,
          ease: "power1.out",
          immediateRender: false,
        },
        0.8
      )
      .addLabel("fijo")
      .to(
        tapa,
        { x: 0, y: 0, rotation: 0, duration: 0.6, ease: "bounce.out" },
        "+=1.5"
      )
      .to(estrella, { scale: 0.3, autoAlpha: 0, duration: 0.3 }, "<")
  )
}

// Facetas de la bola: una rejilla cuyo brillo se repite cada cuatro columnas,
// para poder desplazarla ese tramo en bucle sin que se note el salto
const paso = 18
const brillos = [0.12, 0.45, 0.85, 0.3]
const facetas = Array.from({ length: 8 * 12 }, (_, i) => {
  const fila = Math.floor(i / 12)
  const columna = i % 12
  return {
    x: 106 + columna * paso,
    y: 93 + fila * paso,
    brillo: brillos[(columna + fila * 3) % brillos.length],
  }
})

const luces = [
  { x: 62, y: 58, r: 5 },
  { x: 404, y: 66, r: 6 },
  { x: 118, y: 252, r: 7 },
  { x: 442, y: 182, r: 4 },
  { x: 88, y: 152, r: 4 },
  { x: 382, y: 272, r: 7 },
  { x: 178, y: 294, r: 5 },
  { x: 338, y: 40, r: 4 },
  { x: 40, y: 284, r: 5 },
  { x: 462, y: 290, r: 5 },
  { x: 152, y: 48, r: 6 },
  { x: 424, y: 122, r: 5 },
]

// Card 03: la bola de discoteca
function Bola() {
  const id = useId()

  return (
    <svg
      data-escena="bola"
      viewBox="0 0 500 330"
      aria-hidden
      className="size-full"
    >
      <defs>
        <clipPath id={`${id}-bola`}>
          <circle cx="250" cy="165" r="72" />
        </clipPath>
        <radialGradient id={`${id}-sombra`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0.25" stopColor="#452f25" stopOpacity="0" />
          <stop offset="1" stopColor="#452f25" stopOpacity="0.7" />
        </radialGradient>
      </defs>
      {/* En móvil, la mitad de las luces */}
      {luces.map((luz, i) => (
        <circle
          key={`${luz.x}-${luz.y}`}
          data-capa="luz"
          cx={luz.x}
          cy={luz.y}
          r={luz.r}
          className={cn("fill-beige opacity-80", i % 2 && "max-md:hidden")}
        />
      ))}
      <g data-capa="colgante">
        <path
          data-capa="cordel"
          d="M250 0v93"
          strokeWidth="2.5"
          className="stroke-beige"
        />
        <g data-capa="bola">
          <circle cx="250" cy="165" r="72" className="fill-verde" />
          <g clipPath={`url(#${id}-bola)`}>
            <g data-capa="facetas" className="fill-beige">
              {facetas.map((faceta) => (
                <rect
                  key={`${faceta.x}-${faceta.y}`}
                  x={faceta.x}
                  y={faceta.y}
                  width={paso - 3}
                  height={paso - 3}
                  rx="2"
                  fillOpacity={faceta.brillo}
                />
              ))}
            </g>
          </g>
          <circle cx="250" cy="165" r="72" fill={`url(#${id}-sombra)`} />
          <rect
            x="242"
            y="86"
            width="16"
            height="10"
            rx="3"
            className="fill-beige"
          />
        </g>
      </g>
    </svg>
  )
}

function animarBola(escena: Element) {
  const capa = capas(escena)
  const colgante = capa("colgante")
  const tl = gsap
    .timeline({ paused: true })
    .addLabel("fijo")
    // Arranca recta y se queda balanceándose de lado a lado
    .to(colgante, {
      rotation: 3,
      svgOrigin: "250 0",
      duration: 0.9,
      ease: "sine.out",
    })
    .to(colgante, {
      rotation: -3,
      duration: 1.8,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
    })
    // Un tramo de cuatro columnas en bucle da la sensación de giro
    .to(
      capa("facetas"),
      {
        x: paso * brillos.length,
        duration: 2.4,
        ease: "none",
        repeat: -1,
      },
      0
    )

  // Cada luz hace su recorrido y a su ritmo
  capa("luz").forEach((luz, i) => {
    tl.to(
      luz,
      {
        x: ((i * 37) % 60) - 30,
        y: ((i * 53) % 50) - 25,
        autoAlpha: 0,
        duration: 1.3 + ((i * 7) % 5) * 0.35,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      },
      (i % 4) * 0.3
    )
  })

  return tl
}

const escenas = [
  { Escena: Sobre, animar: animarSobre },
  { Escena: Regalo, animar: animarRegalo },
  { Escena: Bola, animar: animarBola },
]

export { escenas }
