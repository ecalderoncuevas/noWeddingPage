"use client"

import { Fragment, useRef } from "react"

import { escenas } from "@/components/escenas-concepto"
import { FondoCard } from "@/components/fondo-card"
import { SelloArrastra } from "@/components/sello-arrastra"
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
    colores: "bg-verde text-marron [--oscuro:#9b9e77]",
  },
  {
    numero: "02",
    titulo: "Sin regalo",
    descripcion: "No hay regalo, ni sobre, ni que quedar bien con nadie.",
    colores: "bg-lila text-beige [--oscuro:#5b2842]",
  },
  {
    numero: "03",
    titulo: "Solo lo divertido",
    descripcion:
      "Comer, brindar y bailar. La parte buena de una boda, sin la otra.",
    colores: "bg-marron text-beige [--oscuro:#452f25]",
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
          raton: "(hover: hover) and (pointer: fine)",
        },
        (context) => {
          const { animado, escritorio, raton } = context.conditions!

          // La escena de cada card, en pausa. Sin animaciones se queda en un
          // fotograma fijo: la invitación fuera, la caja abierta, la bola quieta
          const tarjetas = q("[data-concepto='card']") as HTMLElement[]
          const bucles = q("[data-escena]").map((escena, i) =>
            escenas[i].animar(escena)
          )
          if (!animado) {
            bucles.forEach((bucle) => bucle.pause("fijo"))
            return
          }

          const [marquee] = q("[data-concepto='marquee']") as HTMLElement[]
          const [pista] = q("[data-concepto='pista']")
          const [sello] = q("[data-concepto='sello']")
          const [parrafo] = q("[data-concepto='parrafo']")
          const estrellas = q("[data-concepto='estrella']")

          // Va en porcentaje de la pista: vale para cualquier texto y ancho
          const loop = gsap.to(pista, {
            xPercent: -100 / copias.length,
            duration: 30,
            ease: "none",
            repeat: -1,
          })

          // Un solo giro para todas las estrellas y para el texto del sello,
          // que así giran siempre a la vez. Arranca con recorrido de sobra
          // por detrás: sin él no podría girar al revés desde el inicio
          const giro = gsap.to([...estrellas, ...q("[data-sello='texto']")], {
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

          // Cada escena se reproduce solo mientras su card es la de arriba:
          // desde que llega a su tope fijo hasta que la siguiente llega al suyo
          const tope = (card: HTMLElement) =>
            parseFloat(getComputedStyle(card).top)
          tarjetas.forEach((card, i) => {
            const siguiente = tarjetas[i + 1]
            ScrollTrigger.create({
              trigger: card,
              start: () => `top ${tope(card)}px`,
              endTrigger: siguiente ?? scope.current,
              end: siguiente ? () => `top ${tope(siguiente)}px` : "bottom top",
              onToggle: (self) =>
                self.isActive ? bucles[i].play() : bucles[i].pause(),
            })
          })
          // Con las fuentes cargadas cambian las alturas: se vuelve a medir
          document.fonts.ready.then(() => ScrollTrigger.refresh())

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

          // Sello "Arrastra": hace de cursor sobre el marquee. Solo con ratón
          let dentro = false
          let pulsado = false
          let puntero: { x: number; y: number } | null = null
          let pulsarSello = () => {}
          let soltarSello = () => {}

          if (raton) {
            const cera = q("[data-sello='cera']")

            gsap.set(sello, { xPercent: -50, yPercent: -50, autoAlpha: 0 })
            const xTo = gsap.quickTo(sello, "x", {
              duration: 0.5,
              ease: "power3",
            })
            const yTo = gsap.quickTo(sello, "y", {
              duration: 0.5,
              ease: "power3",
            })
            const inclinarTo = gsap.quickTo(sello, "rotation", {
              duration: 0.4,
              ease: "power3",
            })

            // Al pulsar se encoge la cera. La escala va en ella y no en el
            // sello, que ya la usa para entrar y salir
            const apretar = gsap.to(cera, {
              scale: 0.9,
              duration: 0.25,
              ease: "power2.out",
              paused: true,
            })

            const estampar = () => {
              if (!puntero) return
              xTo(puntero.x, puntero.x)
              yTo(puntero.y, puntero.y)
              gsap.fromTo(
                sello,
                { scale: 1.4, autoAlpha: 0 },
                {
                  scale: 1,
                  autoAlpha: 1,
                  duration: 0.4,
                  ease: "back.out(3)",
                  overwrite: "auto",
                }
              )
            }
            const quitar = () =>
              gsap.to(sello, {
                scale: 0,
                autoAlpha: 0,
                duration: 0.25,
                ease: "power2.in",
                overwrite: "auto",
              })
            const entrar = () => {
              if (dentro) return
              dentro = true
              if (!pulsado) estampar()
            }
            const salir = () => {
              if (!dentro) return
              dentro = false
              // A mitad de arrastre el sello sigue al ratón aunque se salga
              if (!pulsado) quitar()
            }
            // Se inclina hacia donde se arrastra; con el ratón quieto, la
            // velocidad cae a cero y se endereza
            const inclinar = () => {
              inclinarTo(
                gsap.utils.clamp(
                  -20,
                  20,
                  InertiaPlugin.getVelocity(proxy, "x") / 80
                )
              )
            }
            pulsarSello = () => {
              apretar.play()
              gsap.ticker.add(inclinar)
            }
            soltarSello = () => {
              apretar.reverse()
              gsap.ticker.remove(inclinar)
              inclinarTo(0)
              if (!dentro) quitar()
            }

            // El movimiento se escucha en la ventana: Draggable sigue al
            // ratón fuera del marquee y el sello tiene que ir con él
            const mover = (event: MouseEvent) => {
              puntero = { x: event.clientX, y: event.clientY }
              if (!dentro && !pulsado) return
              xTo(event.clientX)
              yTo(event.clientY)
            }
            const alEntrar = (event: MouseEvent) => {
              mover(event)
              entrar()
            }
            const perder = () => (puntero = null)
            // Con el ratón quieto, el scroll mete o saca el marquee de debajo
            // sin avisar con mouseenter ni mouseleave
            const alDesplazar = () => {
              if (!puntero || pulsado) return
              const { top, bottom } = marquee.getBoundingClientRect()
              if (puntero.y >= top && puntero.y <= bottom) entrar()
              else salir()
            }
            const pagina = document.documentElement

            marquee.addEventListener("mouseenter", alEntrar)
            marquee.addEventListener("mouseleave", salir)
            window.addEventListener("mousemove", mover)
            window.addEventListener("scroll", alDesplazar, { passive: true })
            pagina.addEventListener("mouseleave", perder)
            limpiar.push(() => {
              marquee.removeEventListener("mouseenter", alEntrar)
              marquee.removeEventListener("mouseleave", salir)
              window.removeEventListener("mousemove", mover)
              window.removeEventListener("scroll", alDesplazar)
              pagina.removeEventListener("mouseleave", perder)
              gsap.ticker.remove(inclinar)
              gsap.killTweensOf(sello)
            })
          }

          const [arrastre] = Draggable.create(proxy, {
            trigger: marquee,
            type: "x",
            inertia: true,
            // Con el sello a la vista sobra el cursor del sistema
            ...(raton && { cursor: "none", activeCursor: "none" }),
            onPress() {
              loop.pause()
              inicio = loop.progress()
              ancho = pista.offsetWidth / copias.length
              pulsado = true
              pulsarSello()
            },
            onDrag: alinear,
            onThrowUpdate: alinear,
            onRelease() {
              pulsado = false
              soltarSello()
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
      <div data-concepto="marquee" className="overflow-hidden py-6 select-none">
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

      <SelloArrastra
        data-concepto="sello"
        className="invisible fixed top-0 left-0 z-50"
      />

      <div className="contenedor mt-12 gap-y-6 lg:mt-20">
        <p className="eyebrow col-span-full font-[900] text-marron lg:col-span-3 lg:pt-4">
          El concepto
        </p>
        <p
          data-concepto="parrafo"
          className="col-span-full font-display text-[clamp(1.75rem,3.3vw,3rem)] leading-[1.2] font-medium lg:col-span-9 lg:col-start-4"
        >
          Es una fiesta temática que reproduce una boda entera, con novios que
          son actores y cientos de invitados que no se conocen.
        </p>

        <div className="col-span-full mt-10 flex flex-col gap-6 [--franja:4.5rem] [--tope:1rem] lg:mt-20 lg:[--franja:7.5rem] lg:[--tope:6rem]">
          {cards.map((card, i) => {
            const { Escena } = escenas[i]
            return (
              <article
                key={card.numero}
                data-concepto="card"
                // El margen inferior hace que las tres cards se suelten a la vez
                style={{
                  top: `calc(var(--tope) + ${i} * var(--franja))`,
                  marginBottom: `calc(${cards.length - 1 - i} * var(--franja))`,
                }}
                className={cn(
                  "sticky isolate grid min-h-[26rem] grid-cols-[auto_1fr] grid-rows-[var(--franja)_auto_1fr] gap-x-4 rounded-[28px] px-6 lg:min-h-[31rem] lg:grid-cols-12 lg:grid-rows-[var(--franja)_1fr] lg:gap-x-(--canal) lg:rounded-[40px] lg:px-12",
                  card.colores
                )}
              >
                <FondoCard numero={card.numero} />
                <span className="self-center text-sm font-medium lg:text-base">
                  {card.numero}
                </span>
                <h3 className="self-center font-display text-[clamp(1.25rem,5.4vw,2.5rem)] leading-none font-bold lg:col-span-6">
                  {card.titulo}
                </h3>
                <p className="col-span-full text-lg leading-[1.45] lg:col-span-5 lg:col-start-2 lg:self-end lg:pb-12 lg:text-[1.375rem]">
                  {card.descripcion}
                </p>
                <div className="col-span-full my-6 aspect-500/330 self-end overflow-hidden rounded-[28px] bg-current/14 lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:mt-0 lg:mb-12">
                  <Escena />
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { Concepto }
