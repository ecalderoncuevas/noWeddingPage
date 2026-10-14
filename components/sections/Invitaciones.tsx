"use client"

import { useRef } from "react"

import { BotonCompra } from "@/components/boton-compra"
import { Star } from "@/components/star"
import { evento } from "@/lib/datos-evento"
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap"
import { cn } from "@/lib/utils"

// Orden en que aparecen al apilarse: "Familia" es el primero
const APILADOS = [1, 0, 2]

// "movil" y "escritorio" dicen qué lugar ocupa el ticket en la tira:
// en móvil se apilan y "Familia" pasa a ser el primero
const tickets = [
  {
    nombre: "Invitado",
    serie: "Nº 000127",
    precio: 45,
    frase: "Para venir, comer y bailar.",
    incluye: [
      "Ceremonia, banquete y baile",
      "Barra libre hasta la tarta",
      "Sitio en la foto de grupo (al fondo)",
    ],
    colores: "bg-verde text-marron",
    // Marrón sobre verde contrasta menos que beige sobre lila o marrón:
    // el texto corrido y las etiquetas llevan más peso para leerse igual
    texto: "font-bold",
    etiqueta: "font-[800]",
    boton: "clara",
    destacado: false,
    movil: "medio",
    escritorio: "inicio",
    // Línea de corte: debajo al apilar y a la derecha en la tira
    corte:
      "right-0 bottom-0 left-0 border-b-2 lg:top-0 lg:left-auto lg:border-r-2 lg:border-b-0",
    giro: -1,
  },
  {
    nombre: "Familia",
    serie: "Nº 000128",
    precio: 75,
    frase: "Para los que quieren salir en todas las fotos.",
    incluye: [
      "Todo lo de Invitado",
      "Mesa cerca de los novios",
      "Barra libre toda la noche",
      "Primera fila en la foto de grupo",
    ],
    colores: "bg-lila text-beige",
    texto: "",
    etiqueta: "font-semibold",
    boton: "oscura",
    destacado: true,
    movil: "inicio",
    escritorio: "medio",
    // En la tira sus dos líneas son de los vecinos, que entran antes que él
    corte: "right-0 bottom-0 left-0 border-b-2 lg:hidden",
    giro: 0.6,
  },
  {
    nombre: "Mesa presidencial",
    serie: "Nº 000129",
    precio: 120,
    frase: "Para quien siempre quiso ser el protagonista.",
    incluye: [
      "Todo lo de Familia",
      "Cenas con los novios",
      "Das un discurso",
      "Cortas la tarta",
    ],
    colores: "bg-marron text-beige",
    texto: "",
    etiqueta: "font-semibold",
    boton: "oscura",
    destacado: false,
    movil: "fin",
    escritorio: "fin",
    corte: "top-0 bottom-0 left-0 hidden border-l-2 lg:block",
    giro: 1,
  },
] as const

function Invitaciones() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const mm = gsap.matchMedia()

      mm.add(
        {
          animado: "(prefers-reduced-motion: no-preference)",
          escritorio: "(min-width: 1024px)",
          raton: "(min-width: 1024px) and (hover: hover)",
        },
        (context) => {
          const { animado, escritorio, raton } = context.conditions!

          const tira = q("[data-invitaciones='ticket']") as HTMLElement[]
          const entrada = {
            trigger: q("[data-invitaciones='tira']"),
            start: "top 75%",
            once: true,
          }

          if (!animado) {
            gsap.fromTo(
              tira,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.6, scrollTrigger: entrada }
            )
            return
          }

          // La cabecera se enciende palabra a palabra, como en la sección 2
          const cabecera = q("[data-invitaciones='texto']")
          gsap.from(SplitText.create(cabecera, { type: "words" }).words, {
            opacity: 0.25,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
              trigger: cabecera[1],
              start: "top 80%",
              end: "bottom 45%",
              scrub: true,
            },
          })

          const [invitado, familia, mesa] = tira
          const cortes = q("[data-invitaciones='corte']")
          const precios = q("[data-invitaciones='precio']") as HTMLElement[]
          // Radio de las muescas: es la variable que usa la máscara del ticket
          const muesca = getComputedStyle(invitado).getPropertyValue("--m")

          // El brillo de "Familia" solo corre con la entrada terminada, la
          // sección en pantalla y el ratón fuera del ticket
          let lista = false
          let visible = false
          let encima = false
          const pasada = gsap.fromTo(
            q("[data-invitaciones='brillo']"),
            { xPercent: -150 },
            {
              xPercent: 150,
              duration: 1.2,
              ease: "power2.inOut",
              repeat: -1,
              repeatDelay: 5,
              paused: true,
            }
          )
          const brillar = () =>
            lista && visible && !encima ? pasada.play() : pasada.pause()

          const tl = gsap.timeline({
            scrollTrigger: entrada,
            // Los precios están escritos en el HTML: se ponen a cero justo
            // antes de que se vea el primer ticket
            onStart: () =>
              precios.forEach((precio) => {
                // Ancho fijo mientras cuenta, para no mover lo de al lado
                precio.style.width = `${precio.offsetWidth}px`
                precio.textContent = "0"
              }),
            onComplete: () => {
              precios.forEach((precio) => precio.style.removeProperty("width"))
              tira.forEach((ticket) => ticket.style.removeProperty("--m"))
              lista = true
              brillar()
            },
          })
          const aparecer = (
            ticket: HTMLElement,
            desde: gsap.TweenVars,
            hasta: gsap.TweenVars,
            t: number
          ) =>
            tl.fromTo(
              ticket,
              { autoAlpha: 0, ...desde },
              { autoAlpha: 1, x: 0, y: 0, scale: 1, ...hasta },
              t
            )
          const contar = (i: number, t: number) => {
            const cuenta = { valor: 0 }
            tl.to(
              cuenta,
              {
                valor: tickets[i].precio,
                snap: { valor: 1 },
                duration: 0.8,
                ease: "power2.out",
                onUpdate: () => {
                  precios[i].textContent = String(cuenta.valor)
                },
              },
              t
            )
          }
          const sellar = (t: number) =>
            tl.fromTo(
              q("[data-invitaciones='sello']"),
              { scale: 1.6, rotation: -12, autoAlpha: 0 },
              {
                scale: 1,
                rotation: -3,
                autoAlpha: 1,
                duration: 0.45,
                ease: "back.out(3)",
              },
              t
            )

          // Cada paso lleva su segundo exacto, como en el hero
          if (escritorio) {
            const lados = { duration: 0.7, ease: "power3.out" }
            aparecer(invitado, { x: -60 }, lados, 0)
            aparecer(mesa, { x: 60 }, lados, 0)
            tl.fromTo(
              cortes,
              { scaleY: 0, transformOrigin: "top" },
              { scaleY: 1, duration: 0.5 },
              0.4
            )
            aparecer(
              familia,
              { y: 30, scale: 0.96 },
              { duration: 0.6, ease: "power2.out" },
              0.5
            )
            sellar(0.9)
            tickets.forEach((_, i) => contar(i, 1))
          } else {
            const subida = { duration: 0.6, ease: "power2.out" }
            APILADOS.forEach((i, puesto) => {
              const t = puesto ? 0.5 + (puesto - 1) * 0.15 : 0
              aparecer(tira[i], { y: 30 }, subida, t)
              contar(i, t + 0.2)
            })
            sellar(0.4)
            tl.fromTo(
              cortes,
              { scaleX: 0, transformOrigin: "left" },
              { scaleX: 1, duration: 0.5, stagger: 0.4 },
              0.4
            )
          }
          tl.fromTo(
            tira,
            { "--m": "0px" },
            { "--m": muesca, duration: 0.3 },
            0.4
          )

          const vigilar = ScrollTrigger.create({
            trigger: scope.current,
            onToggle: ({ isActive }) => {
              visible = isActive
              brillar()
            },
          })
          visible = vigilar.isActive

          // Si se deshace a media cuenta, los precios vuelven a su cifra
          const limpiar = [
            () =>
              precios.forEach((precio, i) => {
                precio.textContent = String(tickets[i].precio)
                precio.style.removeProperty("width")
              }),
          ]

          if (raton) {
            tira.forEach((ticket, i) => {
              const subir = () => {
                if (ticket === familia) {
                  encima = true
                  brillar()
                }
                // El hover espera a que termine la entrada
                if (!lista) return
                gsap.to(ticket, {
                  y: -12,
                  rotation: tickets[i].giro,
                  zIndex: 1,
                  duration: 0.3,
                })
              }
              const bajar = () => {
                if (ticket === familia) {
                  encima = false
                  brillar()
                }
                if (!lista) return
                gsap.to(ticket, { y: 0, rotation: 0, zIndex: 0, duration: 0.3 })
              }

              ticket.addEventListener("mouseenter", subir)
              ticket.addEventListener("mouseleave", bajar)
              limpiar.push(() => {
                ticket.removeEventListener("mouseenter", subir)
                ticket.removeEventListener("mouseleave", bajar)
              })
            })
          }

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
        <p data-invitaciones="texto" className="eyebrow col-span-full">
          Invitaciones
        </p>
        <h2
          data-invitaciones="texto"
          className="col-span-full font-display text-[clamp(2.5rem,4.9vw,4.375rem)] leading-none tracking-[-0.02em] text-lila lg:col-span-9"
        >
          <span className="font-bold">¿De parte de</span> <em>quién vienes?</em>
        </h2>
        <p
          data-invitaciones="texto"
          className="col-span-full font-semibold lg:col-span-3 lg:self-end lg:pb-2 lg:text-right"
        >
          {evento.plazas} invitaciones · plazas limitadas
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
                "ticket relative row-span-6 grid grid-cols-[minmax(0,1fr)_auto] grid-rows-subgrid py-10 pr-3 pl-7 lg:py-9 lg:pr-4 lg:pl-[3vw] xl:pl-10",
                ticket.colores,
                ticket.movil === "inicio" && "order-first lg:order-none",
                ticket.escritorio === "fin" && "lg:rounded-r-[14px]",
                ticket.escritorio === "inicio" && "lg:rounded-l-[14px]"
              )}
            >
              <div className="flex min-h-9 flex-wrap items-center justify-between gap-2">
                <p
                  className={cn(
                    "flex items-center gap-2.5 text-sm tracking-[0.18em]",
                    ticket.etiqueta
                  )}
                >
                  <Star points={5} inner={0.42} className="size-3" />
                  {ticket.serie}
                  <Star points={5} inner={0.42} className="size-3" />
                </p>
                {ticket.destacado && (
                  <span
                    data-invitaciones="sello"
                    className="-rotate-3 rounded-full bg-verde px-3.5 py-1 text-sm font-semibold text-marron"
                  >
                    La más pedida
                  </span>
                )}
              </div>

              <h3 className="@container col-start-1 mt-3">
                <span className="block font-display text-[min(10cqw,2.5rem)] leading-tight font-bold whitespace-nowrap">
                  {ticket.nombre}
                </span>
              </h3>

              <p className={cn("col-start-1 mt-1 leading-snug", ticket.texto)}>
                {ticket.frase}
              </p>

              {/* El número cuenta desde cero al entrar: quien no ve la
                  animación lee siempre el precio final */}
              <p className="@container col-start-1 mt-5">
                <span className="sr-only">{ticket.precio} € por persona</span>
                <span aria-hidden className="flex items-baseline gap-2">
                  <span className="font-display text-[min(21cqw,5.5rem)] leading-none font-bold whitespace-nowrap">
                    <span data-invitaciones="precio" className="inline-block">
                      {ticket.precio}
                    </span>{" "}
                    €
                  </span>
                  <span
                    className={cn(
                      "text-xs whitespace-nowrap xl:text-sm",
                      ticket.texto
                    )}
                  >
                    por persona
                  </span>
                </span>
              </p>

              <ul
                className={cn(
                  "col-start-1 mt-5 space-y-1.5 pb-10",
                  ticket.texto
                )}
              >
                {ticket.incluye.map((linea) => (
                  <li key={linea}>— {linea}</li>
                ))}
              </ul>

              <BotonCompra
                variante={ticket.boton}
                tamano="pequeno"
                className="col-start-1 w-full max-sm:text-xs lg:max-xl:text-xs"
              >
                Quiero esta invitación
              </BotonCompra>

              <p className="col-start-2 row-span-full row-start-1 ml-4 flex w-10 items-center justify-center border-l-2 border-dashed border-current/40 pl-3 lg:ml-[1.2vw] lg:w-[4vw] xl:ml-4 xl:w-14">
                <span
                  className={cn(
                    "rotate-180 text-xs tracking-[0.18em] whitespace-nowrap uppercase [writing-mode:vertical-rl]",
                    ticket.etiqueta
                  )}
                >
                  Válido para una persona
                </span>
              </p>

              <div
                data-invitaciones="corte"
                aria-hidden
                className={cn(
                  "absolute border-dashed border-beige/60",
                  ticket.corte
                )}
              />
              {/* Franja de luz que cruza el ticket cada pocos segundos */}
              {ticket.destacado && (
                <div
                  data-invitaciones="brillo"
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_calc(50%-60px),rgb(241_240_226/0.25)_50%,transparent_calc(50%+60px))] mix-blend-soft-light motion-reduce:hidden"
                />
              )}
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
