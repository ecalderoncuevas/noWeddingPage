"use client"

import { useRef } from "react"

import {
  type Diseno,
  Polaroid,
  SOMBRA,
  SOMBRA_HOVER,
} from "@/components/polaroid"
import { Draggable, gsap, SplitText, useGSAP } from "@/lib/gsap"
import { cn } from "@/lib/utils"

// Posiciones en % de la mesa (cuadrada, del ancho del contenedor):
// columnas 1 a 3, 5 a 7 y 10 a 12. Cada una combina detalles distintos
// para que no parezcan seis copias
const polaroids: {
  pie: string
  giro: number
  x: number
  y: number
  diseno: Diseno
}[] = [
  {
    pie: "Cómo se conocieron",
    giro: -6,
    x: 0,
    y: 4.17,
    diseno: {
      papel: "[--papel:#EFE5CE]",
      foto: "bg-lila",
      sujecion: "celo",
      giroCelo: 4,
      caligrafia: true,
      matasellos: true,
    },
  },
  {
    pie: "La primera cita",
    giro: 5,
    x: 33.91,
    y: 16.67,
    diseno: {
      papel: "[--papel:#C4A77F]",
      foto: "bg-marron",
      sujecion: "chincheta",
      arrugas: true,
      manchas: [
        [36, 70, 52, 44],
        [305, 385, 55, 46],
      ],
    },
  },
  {
    pie: "Empezaron a salir",
    giro: -3,
    x: 76.33,
    y: 2.78,
    diseno: {
      papel: "[--papel:#EDE2C8]",
      foto: "bg-[#7A4763]",
      sujecion: "esquineros",
      rasgado: true,
      manchas: [
        [318, 96, 46, 52],
        [58, 404, 55, 42],
      ],
    },
  },
  {
    pie: "El primer perro",
    giro: 4,
    x: 76.33,
    y: 52.78,
    diseno: {
      papel: "[--papel:#EEE4CB]",
      foto: "bg-[#6B5145]",
      sujecion: "washi",
      debajo: true,
      sello: "fill-lila",
      matasellos: true,
    },
  },
  {
    pie: "La pedida",
    giro: -5,
    x: 33.91,
    y: 65.28,
    diseno: {
      papel: "[--papel:#BFA078]",
      foto: "bg-lila",
      sujecion: "chincheta",
      arrugas: true,
      caligrafia: true,
      manchas: [
        [28, 356, 50, 46],
        [296, 36, 52, 40],
        [206, 424, 55, 40],
      ],
    },
  },
  {
    pie: "La «boda»",
    giro: 6,
    x: 0,
    y: 51.39,
    diseno: {
      papel: "[--papel:#F0E6CF]",
      foto: "bg-marron",
      sujecion: "celo",
      giroCelo: -4,
      caligrafia: true,
      sello: "fill-verde",
      matasellos: true,
      manchas: [
        [324, 204, 46, 55],
        [66, 18, 55, 40],
      ],
    },
  },
]

// Cada año va en el punto medio del tramo que sale de su polaroid
const anos = [
  { ano: "2015", x: 29.11, y: 25.52 },
  { ano: "2017", x: 66.67, y: 27.31 },
  { ano: "2022", x: 88.14, y: 43.06 },
  { ano: "2024", x: 68.81, y: 75 },
  { ano: "2026", x: 27.78, y: 73.84 },
]

// La línea une los centros de las polaroids, sobre un lienzo de 1728 × 1728
const tramos = [
  "M204,336 C450,360 560,520 790,552",
  "M790,552 C1050,590 1250,380 1523,312",
  "M1523,312 L1523,1176",
  "M1523,1176 C1300,1200 1100,1400 790,1392",
  "M790,1392 C520,1385 430,1170 204,1152",
]
// Centro de cada polaroid en ese lienzo: donde se para la cámara
const LIENZO = 1728
const centros = [
  [204, 336],
  [790, 552],
  [1523, 312],
  [1523, 1176],
  [790, 1392],
  [204, 1152],
]

// Scroll de la cámara. El alto de la pista (clase `h-[650svh]`) reparte el
// recorrido: cada salto dura 1 y cada parada PAUSA
const PAUSA = 0.45
// Momento del salto en que la línea alcanza el borde de la polaroid siguiente,
// y lo que tarda esta en aparecer (acaba ya dentro de la parada)
const LLEGADA = 0.75
const APARICION = 0.5
// Segundos que tarda la animación en alcanzar al scroll
const SUAVIDAD = 1.5
const linea = tramos
  .map((tramo, i) => (i ? tramo.slice(tramo.indexOf(" ") + 1) : tramo))
  .join(" ")

function Novios() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const mm = gsap.matchMedia()

      mm.add(
        {
          animado: "(prefers-reduced-motion: no-preference)",
          escritorio: "(min-width: 768px)",
        },
        (context) => {
          const { animado, escritorio } = context.conditions!
          if (!animado) return

          // Etiqueta y titular se encienden palabra a palabra, como el
          // párrafo de la sección 1
          const [titular] = q("[data-novios='titular']")
          const palabras = SplitText.create(q("[data-novios='texto']"), {
            type: "words",
          })
          gsap.from(palabras.words, {
            opacity: 0.25,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: titular,
              start: "top 80%",
              end: "bottom 45%",
              scrub: true,
            },
          })

          const fotos = q("[data-novios='polaroid']") as HTMLElement[]
          const etiquetas = q("[data-novios='ano']")
          const mascaras = q("[data-novios='tramo']")
          const mesa = q("[data-novios='mesa']")[0]

          if (!escritorio) {
            const tl = gsap.timeline({
              defaults: { ease: "power2.out", duration: 1 },
              scrollTrigger: {
                trigger: mesa,
                start: "top 75%",
                end: "bottom bottom",
                scrub: SUAVIDAD,
              },
            })

            fotos.forEach((foto, i) => {
              tl.from(foto, {
                y: 60,
                opacity: 0,
                rotation: polaroids[i].giro + (i % 2 ? 6 : -6),
              })
              if (i) {
                tl.from(
                  etiquetas[i - 1],
                  { scale: 0, opacity: 0, duration: 0.4, ease: "back.out(2)" },
                  "<0.3"
                )
              }
            })
            tl.from(
              q("[data-novios='recta']"),
              {
                clipPath: "inset(0% 0% 100% 0%)",
                ease: "none",
                duration: tl.duration(),
              },
              0
            )
            return
          }

          // La cámara: la mesa se desplaza para dejar cada polaroid en el
          // centro de la ventana. En porcentaje, para no recalcular nada
          const enfocar = ([x, y]: number[]) => ({
            xPercent: (-x / LIENZO) * 100,
            yPercent: (-y / LIENZO) * 100,
          })
          const lejos = (i: number) => ({
            rotation: polaroids[i].giro * 3,
            scale: 0.9,
          })

          gsap.set(mesa, enfocar(centros[0]))
          gsap.set(fotos, { rotation: 0, scale: 1 })
          // Solo se ve la primera; las demás esperan a que llegue su tramo
          gsap.set(fotos.slice(1), {
            rotation: (i) => lejos(i + 1).rotation,
            scale: 0.8,
            autoAlpha: 0,
          })

          const pista = q("[data-novios='pista']")[0]

          // La primera aparece mientras la ventana sube a su sitio
          gsap.fromTo(
            fotos[0],
            { autoAlpha: 0, y: 80 },
            {
              autoAlpha: 1,
              y: 0,
              ease: "power2.out",
              scrollTrigger: {
                trigger: pista,
                start: "top 80%",
                end: "top 20%",
                scrub: SUAVIDAD,
              },
            }
          )

          const tl = gsap.timeline({
            defaults: { ease: "sine.inOut", duration: 1 },
            scrollTrigger: {
              trigger: pista,
              start: "top top",
              end: "bottom bottom",
              scrub: SUAVIDAD,
            },
          })

          // Por cada salto: pausa sobre la polaroid y viaje hasta el sitio de la
          // siguiente dibujando su tramo, con la etiqueta de año a mitad de
          // camino. La polaroid aparece cuando la línea toca su borde
          for (let i = 1; i < fotos.length; i++) {
            const t = PAUSA + (i - 1) * (1 + PAUSA)

            tl.to(mesa, enfocar(centros[i]), t)
              .fromTo(
                mascaras[i - 1],
                { drawSVG: "0%" },
                { drawSVG: "100%" },
                t
              )
              .to(fotos[i - 1], lejos(i - 1), t)
              .to(
                fotos[i],
                {
                  rotation: 0,
                  scale: 1,
                  autoAlpha: 1,
                  duration: APARICION,
                  ease: "power2.out",
                },
                t + LLEGADA
              )
              .from(
                etiquetas[i - 1],
                { scale: 0, opacity: 0, duration: 0.3, ease: "back.out(2)" },
                t + 0.5
              )
          }
          tl.to({}, { duration: PAUSA })

          // El scroll anima la capa exterior; el arrastre y el hover, la interior
          let altura = 10
          const marcos = fotos.map(
            (foto) => foto.firstElementChild as HTMLElement
          )

          // "Recolocar" asoma al mover la primera foto y se va al ordenarlas
          const boton = q("[data-novios='recolocar']")[0]
          const asomar = gsap.fromTo(
            boton,
            { autoAlpha: 0, y: 12 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.4,
              ease: "power2.out",
              paused: true,
            }
          )
          const recolocar = () => {
            asomar.reverse()
            // Corta la inercia de una foto recién soltada
            gsap.killTweensOf(marcos, "x,y")
            gsap.to(marcos, {
              x: 0,
              y: 0,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.04,
              onComplete: () => {
                altura = 10
                gsap.set(fotos, { clearProps: "zIndex" })
              },
            })
          }
          boton.addEventListener("click", recolocar)

          // Cada foto se aleja de su sitio, como mucho, un tercio de la mesa.
          // Un elemento como límite las metería todas en él al crearlas
          const radio = mesa.offsetWidth / 3

          const limpiar = fotos.map((foto, i) => {
            const marco = marcos[i]

            Draggable.create(marco, {
              type: "x,y",
              bounds: { minX: -radio, maxX: radio, minY: -radio, maxY: radio },
              inertia: true,
              zIndexBoost: false,
              onPress: () => gsap.set(foto, { zIndex: ++altura }),
              onDragStart: () => asomar.play(),
            })

            const sombra = marco.querySelector("[data-polaroid='sombra']")

            const entrar = () => {
              gsap.to(marco, { scale: 1.05, duration: 0.3 })
              gsap.to(sombra, { boxShadow: SOMBRA_HOVER, duration: 0.3 })
            }
            const salir = () => {
              gsap.to(marco, { scale: 1, duration: 0.3 })
              gsap.to(sombra, { boxShadow: SOMBRA, duration: 0.3 })
            }

            marco.addEventListener("mouseenter", entrar)
            marco.addEventListener("mouseleave", salir)

            return () => {
              marco.removeEventListener("mouseenter", entrar)
              marco.removeEventListener("mouseleave", salir)
            }
          })

          return () => {
            boton.removeEventListener("click", recolocar)
            limpiar.forEach((quitar) => quitar())
          }
        }
      )
    },
    { scope }
  )

  return (
    <section
      ref={scope}
      id="novios"
      className="seccion relative isolate bg-verde py-24 text-lila lg:py-32"
    >
      {/* El mismo grano de las polaroids, más flojo: la mesa de papel */}
      <div
        aria-hidden
        className="grano pointer-events-none absolute inset-0 -z-10 opacity-12"
      />
      <div data-novios="titular" className="contenedor gap-y-6">
        <p data-novios="texto" className="eyebrow col-span-full text-marron">
          Los novios
        </p>
        <h2
          data-novios="texto"
          className="col-span-full font-display text-[clamp(2.5rem,5.7vw,5.125rem)] leading-none tracking-[-0.02em] lg:col-span-9"
        >
          <span className="font-bold">Una historia de amor</span>{" "}
          <em>que nadie ha comprobado</em>
        </h2>
      </div>

      {/* Pista alta con una ventana fija a pantalla completa: dentro, la mesa
          hace de lienzo. Va fuera del contenedor para llegar a los bordes */}
      <div
        data-novios="pista"
        className="mt-10 md:mt-16 md:motion-safe:h-[650svh]"
      >
        <div className="md:motion-safe:[container-type:size] md:motion-safe:sticky md:motion-safe:top-0 md:motion-safe:h-svh md:motion-safe:overflow-hidden">
          <div
            data-novios="mesa"
            className="relative mx-auto flex w-[min(1368px,100%-2*var(--margen))] flex-col gap-8 md:block md:aspect-square md:motion-safe:absolute md:motion-safe:top-1/2 md:motion-safe:left-1/2 md:motion-safe:w-[min(200cqh,260cqw)] md:motion-safe:will-change-transform"
          >
            {/* La línea de puntos queda fija; se dibuja animando la máscara */}
            <svg
              viewBox="0 0 1728 1728"
              fill="none"
              aria-hidden
              className="absolute inset-0 hidden size-full md:block"
            >
              <mask
                id="novios-mascara"
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="1728"
                height="1728"
              >
                {tramos.map((tramo) => (
                  <path
                    key={tramo}
                    data-novios="tramo"
                    d={tramo}
                    stroke="white"
                    strokeWidth="12"
                  />
                ))}
              </mask>
              <path
                d={linea}
                mask="url(#novios-mascara)"
                className="stroke-lila"
                strokeWidth="4"
                strokeDasharray="18 14"
                strokeLinecap="round"
              />
            </svg>
            <div
              data-novios="recta"
              aria-hidden
              className="absolute top-0 bottom-24 left-1/2 -translate-x-1/2 border-l-4 border-dashed border-lila md:hidden"
            />

            {polaroids.map((polaroid, i) => (
              <div key={polaroid.pie} className="contents">
                <figure
                  data-novios="polaroid"
                  style={
                    {
                      "--x": `${polaroid.x}%`,
                      "--y": `${polaroid.y}%`,
                      transform: `rotate(${polaroid.giro}deg)`,
                    } as React.CSSProperties
                  }
                  className={cn(
                    "@container relative w-[64%] md:absolute md:top-(--y) md:left-(--x) md:w-[23.68%]",
                    i % 2 ? "self-end" : "self-start"
                  )}
                >
                  <Polaroid
                    numero={i + 1}
                    pie={polaroid.pie}
                    diseno={polaroid.diseno}
                  />
                </figure>
                {anos[i] && (
                  <span
                    data-novios="ano"
                    style={
                      {
                        "--x": `${anos[i].x}%`,
                        "--y": `${anos[i].y}%`,
                      } as React.CSSProperties
                    }
                    className="relative self-center rounded-full bg-lila px-4 py-1.5 text-sm font-semibold text-beige md:absolute md:top-(--y) md:left-(--x) md:-translate-1/2 lg:px-5 lg:text-base"
                  >
                    {anos[i].ano}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Mismo lenguaje que el botón de compra (ticket con línea
              discontinua), en pequeño. Oculto hasta que se mueve una foto */}
          <div className="pointer-events-none absolute inset-x-0 bottom-8 hidden justify-center md:motion-safe:flex">
            <button
              data-novios="recolocar"
              type="button"
              className="group/recolocar pointer-events-auto invisible relative flex cursor-pointer items-center gap-[0.7em] rounded-[4px] bg-beige/80 px-[1.4em] py-[1em] font-body text-xs font-semibold tracking-[0.12em] text-lila uppercase opacity-0 shadow-[0_6px_16px_rgb(0_0_0/0.12)] outline-offset-4 outline-current backdrop-blur-sm transition-colors hover:bg-beige focus-visible:outline-2"
            >
              <span
                aria-hidden
                className="absolute inset-[0.3em] rounded-[2px] border border-dashed border-current opacity-50"
              />
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-[1.1em] transition-transform duration-500 group-hover/recolocar:-rotate-180"
              >
                <path d="M2.5 8a5.5 5.5 0 1 0 1.8-4.07M2.5 2v3h3" />
              </svg>
              Recolocar
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Novios }
