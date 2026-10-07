"use client"

import { useRef } from "react"

import { Star } from "@/components/star"
import { buttonVariants } from "@/components/ui/button"
import { gsap, useGSAP } from "@/lib/gsap"
import { cn } from "@/lib/utils"

// "movil" y "escritorio" dicen qué lugar ocupa el ticket en la tira:
// en móvil se apilan y "Familia" pasa a ser el primero
const tickets = [
  {
    nombre: "Invitado",
    serie: "Nº 000127",
    precio: "45 €",
    frase: "Para venir, comer y bailar.",
    incluye: [
      "Ceremonia, banquete y baile",
      "Barra libre hasta la tarta",
      "Sitio en la foto de grupo (al fondo)",
    ],
    colores: "bg-verde text-marron",
    boton: "bg-marron text-beige hover:bg-marron/85",
    destacado: false,
    movil: "medio",
    escritorio: "inicio",
    giro: -1,
  },
  {
    nombre: "Familia",
    serie: "Nº 000128",
    precio: "75 €",
    frase: "Para los que quieren salir en todas las fotos.",
    incluye: [
      "Todo lo de Invitado",
      "Mesa cerca de los novios",
      "Barra libre toda la noche",
      "Primera fila en la foto de grupo",
    ],
    colores: "bg-lila text-beige",
    boton: "bg-beige text-lila hover:bg-beige/85",
    destacado: true,
    movil: "inicio",
    escritorio: "medio",
    giro: 0.6,
  },
  {
    nombre: "Mesa presidencial",
    serie: "Nº 000129",
    precio: "120 €",
    frase: "Para quien siempre quiso ser el protagonista.",
    incluye: [
      "Todo lo de Familia",
      "Cenas con los novios",
      "Das un discurso",
      "Cortas la tarta",
    ],
    colores: "bg-marron text-beige",
    boton: "bg-verde text-marron hover:bg-verde/85",
    destacado: false,
    movil: "fin",
    escritorio: "fin",
    giro: 1,
  },
]

function Invitaciones() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const mm = gsap.matchMedia()

      mm.add(
        {
          animado: "(prefers-reduced-motion: no-preference)",
          raton: "(min-width: 1024px) and (hover: hover)",
        },
        (context) => {
          const { animado, raton } = context.conditions!
          if (!animado) return

          const tira = q("[data-invitaciones='ticket']") as HTMLElement[]

          gsap.from(tira, {
            y: 60,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
              trigger: q("[data-invitaciones='tira']"),
              start: "top 80%",
            },
          })

          if (!raton) return

          const limpiar = tira.map((ticket, i) => {
            const subir = () =>
              gsap.to(ticket, {
                y: -12,
                rotation: tickets[i].giro,
                zIndex: 1,
                duration: 0.3,
              })
            const bajar = () =>
              gsap.to(ticket, { y: 0, rotation: 0, zIndex: 0, duration: 0.3 })

            ticket.addEventListener("mouseenter", subir)
            ticket.addEventListener("mouseleave", bajar)

            return () => {
              ticket.removeEventListener("mouseenter", subir)
              ticket.removeEventListener("mouseleave", bajar)
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
      id="invitaciones"
      className="seccion bg-beige py-24 text-marron lg:py-32"
    >
      <div className="contenedor gap-y-6">
        <p className="eyebrow col-span-full">Invitaciones</p>
        <h2 className="col-span-full font-display text-[clamp(2.5rem,4.9vw,4.375rem)] leading-none tracking-[-0.02em] text-lila lg:col-span-9">
          <span className="font-bold">¿De parte de</span> <em>quién vienes?</em>
        </h2>
        <p className="col-span-full font-semibold lg:col-span-3 lg:self-end lg:pb-2 lg:text-right">
          [Número] invitaciones · plazas limitadas
        </p>

        {/* Las filas se comparten con subgrid para que precios y botones
            queden a la misma altura en los tres tickets */}
        <div
          data-invitaciones="tira"
          className="col-span-full mx-auto mt-8 grid w-full max-w-lg lg:mt-12 lg:min-h-[35rem] lg:max-w-none lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_auto_1fr_auto]"
        >
          {tickets.map((ticket) => (
            <article
              key={ticket.nombre}
              data-invitaciones="ticket"
              data-movil={ticket.movil}
              data-escritorio={ticket.escritorio}
              className={cn(
                "ticket relative row-span-6 grid grid-cols-[minmax(0,1fr)_auto] grid-rows-subgrid border-dashed border-beige/60 py-10 pr-3 pl-7 lg:py-9 lg:pr-4 lg:pl-[3vw] xl:pl-10",
                ticket.colores,
                ticket.movil === "inicio" && "order-first lg:order-none",
                ticket.movil !== "fin" && "border-b-2",
                ticket.escritorio === "fin"
                  ? "lg:rounded-r-[14px]"
                  : "lg:border-r-2 lg:border-b-0",
                ticket.escritorio === "inicio" && "lg:rounded-l-[14px]"
              )}
            >
              <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2.5 text-sm font-semibold tracking-[0.18em]">
                  <Star points={5} inner={0.42} className="size-3" />
                  {ticket.serie}
                  <Star points={5} inner={0.42} className="size-3" />
                </p>
                {ticket.destacado && (
                  <span className="rounded-full bg-verde px-3.5 py-1 text-sm font-semibold text-marron">
                    La más pedida
                  </span>
                )}
              </div>

              <h3 className="@container col-start-1 mt-3">
                <span className="block font-display text-[min(10cqw,2.5rem)] leading-tight font-bold whitespace-nowrap">
                  {ticket.nombre}
                </span>
              </h3>

              <p className="col-start-1 mt-1 leading-snug">{ticket.frase}</p>

              <p className="@container col-start-1 mt-5">
                <span className="flex items-baseline gap-2">
                  <span className="font-display text-[min(21cqw,5.5rem)] leading-none font-bold whitespace-nowrap">
                    {ticket.precio}
                  </span>
                  <span className="text-xs whitespace-nowrap xl:text-sm">
                    por persona
                  </span>
                </span>
              </p>

              <ul className="col-start-1 mt-5 space-y-1.5 pb-10">
                {ticket.incluye.map((linea) => (
                  <li key={linea}>— {linea}</li>
                ))}
              </ul>

              <a
                href="#invitaciones"
                className={cn(
                  buttonVariants({ size: "pill" }),
                  "col-start-1 w-full px-3 text-[1.0625rem] xl:text-[1.1875rem]",
                  ticket.boton
                )}
              >
                Quiero esta invitación
              </a>

              <p className="col-start-2 row-span-full row-start-1 ml-4 flex w-10 items-center justify-center border-l-2 border-dashed border-current/40 pl-3 lg:ml-[1.2vw] lg:w-[4vw] xl:ml-4 xl:w-14">
                <span className="rotate-180 text-xs font-semibold tracking-[0.18em] whitespace-nowrap uppercase [writing-mode:vertical-rl]">
                  Válido para una persona
                </span>
              </p>
            </article>
          ))}
        </div>

        <p className="col-span-full mx-auto mt-8 max-w-[56rem] text-center text-lg leading-[1.45] lg:mt-10 lg:text-xl">
          La invitación no es nominativa: si al final no puedes venir, se la
          pasas a quien quieras. ¿Más dudas? Están justo debajo.
        </p>
      </div>
    </section>
  )
}

export { Invitaciones }
