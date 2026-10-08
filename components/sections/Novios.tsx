"use client"

import { useRef } from "react"

import { Placeholder } from "@/components/placeholder"
import { Draggable, gsap, useGSAP } from "@/lib/gsap"
import { cn } from "@/lib/utils"

// Posiciones en % de la mesa (cuadrada, del ancho del contenedor):
// columnas 1 a 3, 5 a 7 y 10 a 12
const polaroids = [
  { pie: "Cómo se conocieron", giro: -6, x: 0, y: 4.17, foto: "bg-lila" },
  { pie: "La primera cita", giro: 5, x: 33.91, y: 16.67, foto: "bg-marron" },
  { pie: "Empezaron a salir", giro: -3, x: 76.33, y: 2.78, foto: "bg-lila/85" },
  { pie: "El primer perro", giro: 4, x: 76.33, y: 52.78, foto: "bg-marron/85" },
  { pie: "La pedida", giro: -5, x: 33.91, y: 65.28, foto: "bg-lila" },
  { pie: "La «boda»", giro: 6, x: 0, y: 51.39, foto: "bg-marron" },
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

          const fotos = q("[data-novios='polaroid']") as HTMLElement[]
          const etiquetas = q("[data-novios='ano']")
          const mascaras = q("[data-novios='tramo']")

          const tl = gsap.timeline({
            defaults: { ease: "none", duration: 1 },
            scrollTrigger: {
              trigger: q("[data-novios='mesa']"),
              start: "top 70%",
              end: "bottom bottom",
              scrub: true,
            },
          })

          // Tramo de línea, caída de la polaroid y etiqueta de año
          fotos.forEach((foto, i) => {
            if (i && escritorio) {
              tl.fromTo(mascaras[i - 1], { drawSVG: "0%" }, { drawSVG: "100%" })
            }
            tl.from(foto, {
              y: -200,
              scale: 1.2,
              opacity: 0,
              rotation: polaroids[i].giro + (i % 2 ? 12 : -12),
              ease: "back.out(1.4)",
            })
            if (i) {
              tl.from(
                etiquetas[i - 1],
                { scale: 0, opacity: 0, duration: 0.4, ease: "back.out(2)" },
                "<0.3"
              )
            }
          })

          if (!escritorio) {
            tl.from(
              q("[data-novios='recta']"),
              { clipPath: "inset(0% 0% 100% 0%)", duration: tl.duration() },
              0
            )
            return
          }

          // El scroll anima la capa exterior; el arrastre y el hover, la interior
          let altura = 10
          const limpiar = fotos.map((foto, i) => {
            const marco = foto.firstElementChild as HTMLElement

            Draggable.create(marco, {
              type: "x,y",
              bounds: scope.current,
              inertia: true,
              zIndexBoost: false,
              onPress: () => gsap.set(foto, { zIndex: ++altura }),
            })

            const entrar = () =>
              gsap.to(marco, {
                rotation: -polaroids[i].giro,
                scale: 1.05,
                boxShadow: "0 28px 50px rgb(0 0 0 / 0.3)",
                duration: 0.3,
              })
            const salir = () =>
              gsap.to(marco, {
                rotation: 0,
                scale: 1,
                boxShadow: "0 12px 24px rgb(0 0 0 / 0.18)",
                duration: 0.3,
              })

            marco.addEventListener("mouseenter", entrar)
            marco.addEventListener("mouseleave", salir)

            return () => {
              marco.removeEventListener("mouseenter", entrar)
              marco.removeEventListener("mouseleave", salir)
            }
          })

          return () => limpiar.forEach((quitar) => quitar())
        }
      )
    },
    { scope }
  )

  return (
    <section
      ref={scope}
      id="novios"
      className="seccion bg-verde py-24 text-lila lg:py-32"
    >
      <div className="contenedor gap-y-6">
        <p className="eyebrow col-span-full text-marron">Los novios</p>
        <h2 className="col-span-full font-display text-[clamp(2.5rem,5.7vw,5.125rem)] leading-none tracking-[-0.02em] lg:col-span-9">
          <span className="font-bold">Una historia de amor</span>{" "}
          <em>que nadie ha comprobado</em>
        </h2>

        <div
          data-novios="mesa"
          className="relative col-span-full mt-10 flex flex-col gap-8 md:mt-16 md:block md:aspect-square"
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
                <div className="relative flex aspect-[340/440] flex-col rounded-md bg-beige p-[5.9cqw] shadow-[0_12px_24px_rgb(0_0_0/0.18)]">
                  <span className="absolute -top-[3%] left-1/2 h-[7%] w-[34%] -translate-x-1/2 rotate-[4deg] bg-beige/60" />
                  <Placeholder
                    slot={`polaroid-${i + 1}`}
                    width={300}
                    height={300}
                    label="Foto"
                    className={polaroid.foto}
                  />
                  <figcaption className="flex flex-1 items-center justify-center font-manuscrita text-[8.5cqw] leading-none text-marron">
                    {polaroid.pie}
                  </figcaption>
                </div>
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
      </div>
    </section>
  )
}

export { Novios }
