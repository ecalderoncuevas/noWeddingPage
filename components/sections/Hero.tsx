"use client"

import { useRef } from "react"

import { Placeholder } from "@/components/placeholder"
import { buttonVariants } from "@/components/ui/button"
import { gsap, SplitText, useGSAP } from "@/lib/gsap"
import { cn } from "@/lib/utils"

const enlaces = [
  { href: "#plan", texto: "El plan" },
  { href: "#novios", texto: "Los novios" },
  { href: "#invitaciones", texto: "Invitaciones" },
  { href: "#dudas", texto: "Dudas" },
]

const boton = cn(
  buttonVariants({ size: "pill" }),
  "bg-beige text-lila hover:bg-beige/85"
)

function Hero() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const titular = SplitText.create(q("[data-hero='titular']"), {
          type: "lines",
          mask: "lines",
        })
        const dudas = q("[data-hero='duda']")

        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(titular.lines, { yPercent: 100, duration: 1, stagger: 0.15 })
          .from(
            q("[data-hero='novios']"),
            { y: 60, opacity: 0, duration: 0.9 },
            "-=0.5"
          )
          .from(
            q("[data-hero='bloque']"),
            { opacity: 0, duration: 0.6, stagger: 0.1 },
            "-=0.4"
          )
          .from(dudas, {
            scale: 0,
            duration: 0.6,
            ease: "back.out(2)",
            stagger: 0.12,
          })
          .to(dudas, {
            y: -12,
            rotation: (i) => (i ? 6 : -6),
            duration: 2.4,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            stagger: 0.4,
          })

        gsap.set(q("[data-hero]"), { visibility: "visible" })
      })
    },
    { scope }
  )

  return (
    <section id="inicio" className="seccion bg-lila text-beige">
      <div
        ref={scope}
        className="contenedor min-h-[max(100svh,900px)] content-start lg:grid-rows-[auto_auto_auto_1fr]"
      >
        <header className="col-span-full flex items-center justify-between gap-4 py-6 lg:row-start-1 lg:py-8">
          <a
            href="#inicio"
            className="font-display text-xl italic sm:text-2xl lg:text-3xl"
          >
            [Tu marca]
          </a>
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex gap-6 lg:gap-10 lg:text-lg">
              {enlaces.map((enlace) => (
                <li key={enlace.href}>
                  <a
                    href={enlace.href}
                    className="underline-offset-4 hover:underline"
                  >
                    {enlace.texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href="#invitaciones"
            className={cn(boton, "max-sm:h-10 max-sm:px-4 max-sm:text-base")}
          >
            Comprar invitación
          </a>
        </header>

        <p className="eyebrow col-span-full mt-6 text-center text-verde lg:row-start-2 lg:mt-4">
          La boda del año · [Fecha] · [Lugar]
        </p>

        <h1
          data-hero="titular"
          className="col-span-full mt-4 text-center font-display text-[clamp(4.5rem,15.5vw,13.5rem)] leading-[0.9] tracking-[-0.02em] lg:row-start-3"
        >
          <span className="block font-bold">Nadie</span>
          <span className="block italic">se casa</span>
        </h1>

        <div
          data-hero="novios"
          className="relative z-10 col-span-full mx-auto -mt-[6vw] w-full max-w-[440px] lg:col-span-4 lg:col-start-5 lg:row-span-2 lg:row-start-3 lg:mt-0 lg:max-w-none lg:self-end"
        >
          <Placeholder
            slot="hero-novios"
            width={588}
            height={728}
            className="items-end pb-8"
          />
          <span
            data-hero="duda"
            aria-hidden
            className="absolute top-[36%] left-[18%] font-display text-[clamp(4rem,9vw,8.75rem)] leading-none font-bold italic"
          >
            ?
          </span>
          <span
            data-hero="duda"
            aria-hidden
            className="absolute top-[40%] right-[18%] font-display text-[clamp(4rem,9vw,8.75rem)] leading-none font-bold italic"
          >
            ?
          </span>
        </div>

        <div
          data-hero="bloque"
          className="col-span-full flex flex-col items-center gap-6 pt-10 text-center lg:col-span-3 lg:col-start-1 lg:row-start-4 lg:items-start lg:self-end lg:pt-0 lg:pb-16 lg:text-left"
        >
          <p className="max-w-md text-lg leading-[1.45] lg:text-xl">
            Ceremonia, banquete, discursos, tarta y baile. Todo lo divertido de
            una boda, sin tener que conocer a los novios.
          </p>
          <a href="#invitaciones" className={boton}>
            Quiero mi invitación
          </a>
        </div>

        <div
          data-hero="bloque"
          className="col-span-full flex flex-col items-center gap-3 py-10 text-center lg:col-span-3 lg:col-start-10 lg:row-start-4 lg:items-end lg:self-end lg:pt-0 lg:pb-16 lg:text-right"
        >
          <p className="eyebrow text-verde">Los novios</p>
          <p className="font-display text-3xl text-balance italic xl:text-4xl">
            ¿Quiénes son? Da igual.
          </p>
          <p className="text-sm text-verde lg:text-base">
            [Número] invitaciones · plazas limitadas
          </p>
        </div>
      </div>
    </section>
  )
}

export { Hero }
