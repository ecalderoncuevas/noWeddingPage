"use client"

import { Fragment, useRef } from "react"

import { Placeholder } from "@/components/placeholder"
import { Star } from "@/components/star"
import {
  Draggable,
  gsap,
  InertiaPlugin,
  ScrollTrigger,
  SplitText,
  useGSAP,
} from "@/lib/gsap"
import { cn } from "@/lib/utils"

const cards = [
  {
    numero: "01",
    titulo: "Sin invitación de nadie",
    descripcion:
      "No necesitas que nadie te invite: la compras tú. Ven solo, en pareja o con amigos.",
    colores: "bg-verde text-marron",
    hueco: "light",
  },
  {
    numero: "02",
    titulo: "Sin regalo",
    descripcion: "No hay regalo, ni sobre, ni que quedar bien con nadie.",
    colores: "bg-lila text-beige",
    hueco: "dark",
  },
  {
    numero: "03",
    titulo: "Solo lo divertido",
    descripcion:
      "Comer, brindar y bailar. La parte buena de una boda, sin la otra.",
    colores: "bg-marron text-beige",
    hueco: "dark",
  },
] as const

// Las dos frases del marquee, que se alternan separadas por una estrella.
// Las exclamaciones van aparte para poder animarlas
const frases = [
  { abre: "", negrita: "Boda", cursiva: "sin compromiso", cierra: "" },
  { abre: "¡", negrita: "Vivan", cursiva: "los novios", cierra: "!" },
]

// La pareja de frases se repite para que la pista cubra el ancho al dar la vuelta
const copias = [0, 1, 2]

function Concepto() {
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

          const [marquee] = q("[data-concepto='marquee']") as HTMLElement[]
          const [pista] = q("[data-concepto='pista']")
          const [cursor] = q("[data-concepto='cursor']")
          const [parrafo] = q("[data-concepto='parrafo']")
          const estrellas = q("[data-concepto='estrella']")

          // Va en porcentaje de la pista: vale para cualquier texto y ancho
          const loop = gsap.to(pista, {
            xPercent: -100 / copias.length,
            duration: 30,
            ease: "none",
            repeat: -1,
          })

          // Un solo giro para todas las estrellas. Arranca con recorrido de
          // sobra por detrás: sin él no podría girar al revés desde el inicio
          const giro = gsap.to(estrellas, {
            rotation: 360,
            transformOrigin: "50% 50%",
            duration: 8,
            ease: "none",
            repeat: -1,
          })
          giro.totalTime(giro.duration() * 100)

          // Las exclamaciones dan un brinco, primero la que abre y enseguida
          // la que cierra, como quien grita el "¡vivan!"
          const brinco = (signos: Element[], giro: number, cuando: number) =>
            gsap
              .timeline({ repeat: -1, repeatDelay: 1.6, delay: cuando })
              .to(signos, {
                yPercent: -15,
                rotation: giro,
                duration: 0.22,
                ease: "power2.out",
              })
              .to(signos, {
                yPercent: 0,
                rotation: 0,
                duration: 0.55,
                ease: "bounce.out",
              })
          brinco(q("[data-concepto='abre']"), -12, 0)
          brinco(q("[data-concepto='cierra']"), 12, 0.18)
          const ritmo = (escala: number, duration: number) =>
            gsap.to(giro, { timeScale: escala, duration, overwrite: true })

          // Cada estrella late al cruzar el centro de la pantalla
          const previas = new Map<Element, number>()
          const latir = () => {
            if (!ScrollTrigger.isInViewport(marquee)) return
            const mitad = window.innerWidth / 2
            estrellas.forEach((estrella) => {
              const { left, width } = estrella.getBoundingClientRect()
              const x = left + width / 2 - mitad
              const previa = previas.get(estrella)
              previas.set(estrella, x)
              // Un salto grande es la vuelta del bucle, no un cruce
              if (
                previa === undefined ||
                previa * x > 0 ||
                Math.abs(x - previa) > mitad
              )
                return
              gsap.fromTo(
                estrella,
                { scale: 1 },
                {
                  scale: 1.25,
                  duration: 0.2,
                  ease: "power1.inOut",
                  repeat: 1,
                  yoyo: true,
                  overwrite: "auto",
                }
              )
            })
          }
          gsap.ticker.add(latir)
          const limpiar = [
            () => gsap.ticker.remove(latir),
            () => gsap.killTweensOf(estrellas),
          ]
          const alSalir = () => limpiar.forEach((quitar) => quitar())

          const palabras = SplitText.create(parrafo, { type: "words" })
          gsap.from(palabras.words, {
            opacity: 0.25,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: parrafo,
              start: "top 80%",
              end: "bottom 45%",
              scrub: true,
            },
          })

          if (!escritorio) return alSalir

          // Arrastre: un proxy invisible mueve el progreso del bucle
          const proxy = document.createElement("div")
          const wrap = gsap.utils.wrap(0, 1)
          let inicio = 0
          let ancho = 1
          const alinear = () => {
            loop.progress(wrap(inicio + (arrastre.startX - arrastre.x) / ancho))
            // Las estrellas giran más deprisa cuanto más rápido se arrastra,
            // y al revés si se arrastra hacia atrás (a la derecha)
            const velocidad = InertiaPlugin.getVelocity(proxy, "x")
            const rapidez = gsap.utils.clamp(
              1,
              6,
              1 + Math.abs(velocidad) / 400
            )
            ritmo(velocidad > 0 ? -rapidez : rapidez, 0.2)
          }
          const [arrastre] = Draggable.create(proxy, {
            trigger: marquee,
            type: "x",
            inertia: true,
            onPress() {
              loop.pause()
              inicio = loop.progress()
              ancho = pista.offsetWidth / copias.length
            },
            onDrag: alinear,
            onThrowUpdate: alinear,
            onRelease() {
              if (arrastre.isThrowing) return
              loop.play()
              ritmo(1, 1.2)
            },
            onThrowComplete() {
              gsap.set(proxy, { x: 0 })
              loop.play()
              ritmo(1, 1.2)
            },
          })

          // Cursor "Arrastra"
          gsap.set(cursor, { xPercent: -50, yPercent: -50, scale: 0 })
          const xTo = gsap.quickTo(cursor, "x", {
            duration: 0.4,
            ease: "power3",
          })
          const yTo = gsap.quickTo(cursor, "y", {
            duration: 0.4,
            ease: "power3",
          })
          const entrar = (event: MouseEvent) => {
            xTo(event.clientX, event.clientX)
            yTo(event.clientY, event.clientY)
            gsap.to(cursor, { autoAlpha: 1, scale: 1, duration: 0.3 })
          }
          const mover = (event: MouseEvent) => {
            xTo(event.clientX)
            yTo(event.clientY)
          }
          const salir = () =>
            gsap.to(cursor, { autoAlpha: 0, scale: 0, duration: 0.3 })

          marquee.addEventListener("mouseenter", entrar)
          marquee.addEventListener("mousemove", mover)
          marquee.addEventListener("mouseleave", salir)
          limpiar.push(() => {
            marquee.removeEventListener("mouseenter", entrar)
            marquee.removeEventListener("mousemove", mover)
            marquee.removeEventListener("mouseleave", salir)
          })

          return alSalir
        }
      )
    },
    { scope }
  )

  return (
    <section
      ref={scope}
      id="concepto"
      className="seccion bg-beige pt-20 pb-24 text-lila lg:pt-28 lg:pb-36"
    >
      {/* El overflow va solo aquí: en la sección rompería el sticky de las cards */}
      <div
        data-concepto="marquee"
        className="overflow-hidden py-6 select-none md:motion-safe:cursor-grab"
      >
        {/* Sin animaciones se queda quieto: una sola pareja de frases, centrada */}
        <div
          data-concepto="pista"
          className="flex w-max motion-reduce:mx-auto motion-reduce:w-auto motion-reduce:px-(--margen)"
        >
          {copias.map((copia) => (
            <p
              key={copia}
              aria-hidden={copia > 0}
              className={cn(
                "flex shrink-0 items-center font-display text-[clamp(4.5rem,12vw,10.875rem)] leading-none font-bold tracking-[-0.02em] whitespace-nowrap motion-reduce:min-w-0 motion-reduce:shrink motion-reduce:grow motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:gap-y-2 motion-reduce:text-[clamp(2.25rem,7vw,6rem)]",
                copia > 0 && "motion-reduce:hidden"
              )}
            >
              {frases.map((frase, i) => (
                <Fragment key={frase.negrita}>
                  <span>
                    {frase.abre && (
                      <span data-concepto="abre" className="inline-block">
                        {frase.abre}
                      </span>
                    )}
                    {frase.negrita}{" "}
                    <em className="font-normal">
                      {frase.cursiva}
                      {frase.cierra && (
                        <span data-concepto="cierra" className="inline-block">
                          {frase.cierra}
                        </span>
                      )}
                    </em>
                  </span>
                  <Star
                    data-concepto="estrella"
                    points={8}
                    className={cn(
                      "mx-[0.4em] size-[0.5em] text-verde",
                      i === frases.length - 1 && "motion-reduce:hidden"
                    )}
                  />
                </Fragment>
              ))}
            </p>
          ))}
        </div>
      </div>

      <div
        data-concepto="cursor"
        aria-hidden
        className="pointer-events-none invisible fixed top-0 left-0 z-50 flex size-30 items-center justify-center rounded-full bg-marron font-semibold text-beige lg:size-[9.375rem] lg:text-lg"
      >
        <span className="-rotate-6">Arrastra</span>
      </div>

      <div className="contenedor mt-12 gap-y-6 lg:mt-20">
        <p className="eyebrow col-span-full text-marron lg:col-span-3 lg:pt-4">
          El concepto
        </p>
        <p
          data-concepto="parrafo"
          className="col-span-full font-display text-[clamp(1.75rem,3.3vw,3rem)] leading-[1.2] lg:col-span-9 lg:col-start-4"
        >
          Es una fiesta temática que reproduce una boda entera, con novios que
          son actores y cientos de invitados que no se conocen.
        </p>

        <div className="col-span-full mt-10 flex flex-col gap-6 [--franja:4.5rem] [--tope:1rem] lg:mt-20 lg:[--franja:7.5rem] lg:[--tope:6rem]">
          {cards.map((card, i) => (
            <article
              key={card.numero}
              // El margen inferior hace que las tres cards se suelten a la vez
              style={{
                top: `calc(var(--tope) + ${i} * var(--franja))`,
                marginBottom: `calc(${cards.length - 1 - i} * var(--franja))`,
              }}
              className={cn(
                "sticky grid min-h-[26rem] grid-cols-[auto_1fr] grid-rows-[var(--franja)_auto_1fr] gap-x-4 rounded-[28px] px-6 lg:min-h-[31rem] lg:grid-cols-12 lg:grid-rows-[var(--franja)_1fr] lg:gap-x-(--canal) lg:rounded-[40px] lg:px-12",
                card.colores
              )}
            >
              <span className="self-center text-sm font-medium lg:text-base">
                {card.numero}
              </span>
              <h3 className="self-center font-display text-[clamp(1.25rem,5.4vw,2.5rem)] leading-none font-bold lg:col-span-6">
                {card.titulo}
              </h3>
              <p className="col-span-full text-lg leading-[1.45] lg:col-span-5 lg:col-start-2 lg:self-end lg:pb-12 lg:text-[1.375rem]">
                {card.descripcion}
              </p>
              <Placeholder
                slot={`concepto-card-${i + 1}`}
                width={640}
                height={384}
                shape="rounded"
                on={card.hueco}
                label="Animación en bucle"
                className="col-span-full my-6 self-end lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:mt-0 lg:mb-12"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export { Concepto }
