"use client"

import { useRef } from "react"

import { Placeholder } from "@/components/placeholder"
import { Star } from "@/components/star"
import { Draggable, gsap, SplitText, useGSAP } from "@/lib/gsap"
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
    titulo: "Sin compromiso",
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

// La frase se repite para que la pista cubra el ancho al dar la vuelta
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

          const loop = gsap.to(pista, {
            xPercent: -100 / copias.length,
            duration: 30,
            ease: "none",
            repeat: -1,
          })

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

          if (!escritorio) return

          // Arrastre: un proxy invisible mueve el progreso del bucle
          const proxy = document.createElement("div")
          const wrap = gsap.utils.wrap(0, 1)
          let inicio = 0
          let ancho = 1
          const alinear = () =>
            loop.progress(wrap(inicio + (arrastre.startX - arrastre.x) / ancho))
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
              if (!arrastre.isThrowing) loop.play()
            },
            onThrowComplete() {
              gsap.set(proxy, { x: 0 })
              loop.play()
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

          return () => {
            marquee.removeEventListener("mouseenter", entrar)
            marquee.removeEventListener("mousemove", mover)
            marquee.removeEventListener("mouseleave", salir)
          }
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
        className="overflow-hidden py-6 select-none md:cursor-grab"
      >
        <div data-concepto="pista" className="flex w-max">
          {copias.map((copia) => (
            <p
              key={copia}
              aria-hidden={copia > 0}
              className="flex shrink-0 items-center font-display text-[clamp(4.5rem,12vw,10.875rem)] leading-none font-bold tracking-[-0.02em] whitespace-nowrap"
            >
              <span>
                Una boda de verdad en todo,{" "}
                <em className="font-normal">menos en la boda</em>
              </span>
              <Star
                points={8}
                className="mx-[0.25em] size-[0.45em] text-verde"
              />
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
