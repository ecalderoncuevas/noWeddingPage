"use client"

import { useRef } from "react"

import { buttonVariants } from "@/components/ui/button"
import { gsap, SplitText, useGSAP } from "@/lib/gsap"
import { cn } from "@/lib/utils"

const enlaces = [
  { href: "#plan", texto: "El plan" },
  { href: "#novios", texto: "Los novios" },
  { href: "#invitaciones", texto: "Invitaciones" },
  { href: "#dudas", texto: "Dudas" },
]

const datos = [
  { titulo: "Correo", lineas: ["[tu correo]"] },
  { titulo: "Cuándo", lineas: ["[Fecha]", "[Hora de llegada]"] },
  { titulo: "Redes", lineas: ["Instagram", "TikTok"] },
  { titulo: "Dónde", lineas: ["[Lugar]", "[Ciudad]"] },
]

function Footer() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // autoSplit rehace el corte si cambian las líneas (una en escritorio,
        // dos en móvil) y vuelve a crear la animación
        SplitText.create("[data-footer='nombre']", {
          type: "lines,chars",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.chars, {
              yPercent: 100,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.03,
              scrollTrigger: {
                trigger: "[data-footer='nombre']",
                start: "top 90%",
              },
            }),
        })
      })
    },
    { scope }
  )

  return (
    <footer
      ref={scope}
      className="seccion bg-marron pt-20 pb-8 text-beige lg:pt-28"
    >
      <div className="contenedor items-center">
        <p className="col-span-full font-display text-[clamp(2.25rem,4.6vw,4.125rem)] leading-none italic lg:col-span-9">
          ¿Te vienes a la boda de nadie?
        </p>
        <a
          href="#invitaciones"
          className={cn(
            buttonVariants({ size: "pill" }),
            "col-span-full mt-8 justify-self-start bg-beige text-marron hover:bg-beige/85 lg:col-span-3 lg:mt-0 lg:justify-self-end"
          )}
        >
          Quiero mi invitación
        </a>

        <hr className="col-span-full my-12 border-beige/35 lg:my-16" />

        <nav
          aria-label="Pie de página"
          className="col-span-full self-start lg:col-span-5"
        >
          <ol className="space-y-2">
            {enlaces.map((enlace, i) => (
              <li key={enlace.href} className="flex items-start gap-5 lg:gap-8">
                <span className="pt-2 text-sm text-verde">({i + 1})</span>
                <a
                  href={enlace.href}
                  className="relative font-display text-[clamp(2rem,3.3vw,2.9375rem)] leading-tight after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100"
                >
                  {enlace.texto}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <dl className="col-span-full mt-12 grid grid-cols-2 gap-x-(--canal) gap-y-10 self-start lg:col-span-6 lg:col-start-7 lg:mt-3">
          {datos.map((dato) => (
            <div key={dato.titulo}>
              <dt className="font-display text-xl">{dato.titulo}</dt>
              {dato.lineas.map((linea) => (
                <dd
                  key={linea}
                  className="mt-1.5 text-sm tracking-[0.12em] text-verde uppercase"
                >
                  {linea}
                </dd>
              ))}
            </div>
          ))}
        </dl>

        <div className="@container col-span-full mt-16 lg:mt-20">
          <p
            data-footer="nombre"
            className="font-display text-[29cqw] leading-none font-bold tracking-[-0.02em] whitespace-nowrap text-verde md:text-[15cqw]"
          >
            <em className="block md:inline">Nadie</em>{" "}
            <span className="block md:inline">se casa</span>
          </p>
        </div>

        <hr className="col-span-full mt-6 border-beige/35 lg:mt-8" />

        <div className="col-span-full flex flex-col gap-2 pt-6 text-sm text-verde md:flex-row md:items-center md:justify-between">
          <p className="font-semibold">Logo © 2026</p>
          <p>Aviso: en este evento no se casa nadie. De verdad.</p>
          <p className="font-semibold">Proyecto de DAW 2</p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
