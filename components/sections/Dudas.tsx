"use client"

import { useRef, useState } from "react"

import { Star } from "@/components/star"
import { evento } from "@/lib/datos-evento"
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap"
import { cn } from "@/lib/utils"

// Respuestas definitivas pendientes: de momento, lorem ipsum
const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."

const dudas = [
  {
    pregunta: "¿De verdad no se casa nadie?",
    respuesta:
      "Nadie. Los novios son actores y el «sí, quiero» no tiene validez. Todo lo demás es de verdad: la comida, la barra y el baile.",
  },
  { pregunta: "¿Puedo ir solo?", respuesta: "¡Por supuesto! Es lo ideal. Aquí nadie te va a sentar en la mesa de los niños ni preguntarte para cuándo lo tuyo. Ven a tu aire, únete a la conga con desconocidos o quédate en la barra. Prometemos que no serás el único." },
  { pregunta: "¿Hay dress code?", respuesta: "Sí, traje de gala. Queremos la experiencia completa, así que saca el traje o el vestido largo para el fotomatón. Solo dos normas: no vengas de blanco (la novia es muy suya) y trae zapatos cómodos para el baile." },
  { pregunta: "¿Qué incluye la invitación?", respuesta: "Todo lo bueno, nada de lo malo. Incluye cóctel, banquete, barra libre y recena. Lo que te ahorras es: pagar el regalo por compromiso, aguantar a familiares lejanos y fingir que te cae bien la gente de tu mesa." },
  { pregunta: "¿Puedo dar un discurso?", respuesta: "Gracias por el entusiasmo, pero no. Hemos venido a evitar precisamente los discursos interminables y los vídeos con fotos de la infancia. El objetivo es comer, brindar y bailar, sin pausas dramáticas." },
  { pregunta: "¿Qué pasa si al final no puedo ir?", respuesta: "No podemos devolverte el dinero, pero puedes cederla. Tenemos que pagar los menús por adelantado, así que no hay reembolsos. Como las invitaciones no tienen nombre, puedes dársela o vendérsela al amigo que nunca se pierde una fiesta." },
]

// Las notas caen en zigzag, no en fila
const CAIDA = [0, 2, 4, 1, 3, 5]
// Inclinación de la nota abierta, según su columna
const GIROS = [-2.5, 2, -2]

const SOMBRA = "0 6px 14px rgba(31, 10, 20, 0.35)"
const SOMBRA_ABIERTA = "0 18px 30px rgba(31, 10, 20, 0.35)"

// Escritura a mano: el texto se descubre de izquierda a derecha
const BORRADO = "inset(0 100% 0 0)"
const ESCRITO = "inset(0 0% 0 0)"

// Sello de tinta que hace de botón en cada nota: doble recuadro lila, algo torcido
function Sello({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "col-start-1 row-start-1 border border-lila p-[3px] text-lila",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-[0.85em] border-2 border-lila px-[1.1em] py-[0.7em] text-[clamp(0.6875rem,0.95vw,0.8125rem)] leading-none font-semibold tracking-[0.18em] whitespace-nowrap uppercase">
        <Star
          points={4}
          inner={0.3}
          data-dudas="estrella"
          className="size-[0.7em]"
        />
        {children}
        <Star
          points={4}
          inner={0.3}
          data-dudas="estrella"
          className="size-[0.7em]"
        />
      </span>
    </span>
  )
}

function Dudas() {
  const scope = useRef<HTMLElement>(null)
  const [abierta, setAbierta] = useState<number | null>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const mm = gsap.matchMedia()

      mm.add(
        {
          animado: "(prefers-reduced-motion: no-preference)",
          columnas: "(min-width: 768px)",
          raton: "(min-width: 768px) and (hover: hover)",
        },
        (context) => {
          const { animado, columnas, raton } = context.conditions!

          const notas = q("[data-dudas='nota']") as HTMLElement[]
          const [otra] = q("[data-dudas='boton']")
          const piezas = notas.map((nota) => {
            const p = gsap.utils.selector(nota)
            return {
              nota,
              hoja: p("[data-dudas='hoja']")[0],
              boton: p("button")[0],
              respuesta: p("[data-dudas='respuesta']")[0] as HTMLElement,
              texto: p("[data-dudas='texto']")[0],
              clip: p("[data-dudas='clip']")[0],
              ver: p("[data-dudas='ver']")[0],
              cerrar: p("[data-dudas='cerrar']")[0],
            }
          })
          const entrada = {
            trigger: scope.current,
            start: "top 70%",
            once: true,
          }

          let actual: number | null = null
          // El hover espera a que termine la entrada
          let lista = !animado
          // Cada nota abierta tiene su timeline: abrir es play() y cerrar,
          // reverse(). Se crea al abrir, con la respuesta ya visible, porque
          // un texto oculto no se puede medir ni partir en líneas
          const aperturas: (gsap.core.Timeline | null)[] = notas.map(() => null)
          const lineas: (SplitText | null)[] = notas.map(() => null)

          // En una columna la nota empuja a las demás y cambia el alto de la página
          const recolocar = () => {
            if (!columnas) ScrollTrigger.refresh()
          }
          const soltar = (i: number) => {
            piezas[i].respuesta.hidden = true
            gsap.set(piezas[i].nota, { clearProps: "zIndex" })
            recolocar()
          }

          const cerrar = (i: number) => {
            const pieza = piezas[i]
            gsap.set(pieza.nota, { zIndex: 1 })

            if (!animado) {
              gsap.set([pieza.clip, pieza.cerrar], { visibility: "hidden" })
              gsap.set(pieza.ver, { visibility: "visible" })
              soltar(i)
              return
            }
            aperturas[i]?.timeScale(1.4).reverse()
          }

          const abrir = (i: number) => {
            const pieza = piezas[i]
            pieza.respuesta.hidden = false
            gsap.set(pieza.nota, { zIndex: 2 })

            if (!animado) {
              gsap.set([pieza.clip, pieza.cerrar], { visibility: "visible" })
              gsap.set(pieza.ver, { visibility: "hidden" })
              recolocar()
              return
            }

            // Si se vuelve a pulsar mientras se cierra, sigue desde donde va
            if (aperturas[i]) {
              aperturas[i].timeScale(1).play()
              return
            }

            // La nota deja el hover antes de levantarse
            gsap.to(pieza.nota, {
              y: 0,
              rotation: 0,
              duration: 0.2,
              overwrite: true,
            })

            const parrafo = SplitText.create(pieza.texto, { type: "lines" })
            lineas[i] = parrafo
            aperturas[i] = gsap
              .timeline({
                onComplete: recolocar,
                onReverseComplete: () => {
                  aperturas[i]?.kill()
                  aperturas[i] = null
                  parrafo.revert()
                  lineas[i] = null
                  soltar(i)
                },
              })
              .fromTo(
                pieza.hoja,
                { scale: 1, rotation: 0, boxShadow: SOMBRA },
                {
                  scale: 1.03,
                  rotation: GIROS[i % GIROS.length],
                  boxShadow: SOMBRA_ABIERTA,
                  duration: 0.35,
                  ease: "power2.out",
                },
                0
              )
              .fromTo(
                pieza.clip,
                { y: -40, autoAlpha: 0, rotation: -15 },
                {
                  y: 0,
                  autoAlpha: 1,
                  rotation: 0,
                  duration: 0.4,
                  ease: "back.out(2.5)",
                },
                0.15
              )
              .fromTo(
                pieza.respuesta,
                { height: 0 },
                { height: "auto", duration: 0.4, ease: "power2.out" },
                0.25
              )
              .fromTo(
                parrafo.lines,
                { y: 10, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.3, stagger: 0.06 },
                0.35
              )
              // El sello "Ver respuesta" se borra y se estampa "Cerrar"
              .fromTo(
                pieza.ver,
                { clipPath: ESCRITO },
                { clipPath: BORRADO, duration: 0.25, ease: "power1.inOut" },
                0.2
              )
              .fromTo(
                pieza.cerrar,
                { clipPath: BORRADO },
                { clipPath: ESCRITO, duration: 0.35, ease: "power1.inOut" },
                0.45
              )
          }

          const limpiar: (() => void)[] = []
          const escuchar = (
            elemento: Element,
            tipo: string,
            accion: EventListener
          ) => {
            elemento.addEventListener(tipo, accion)
            limpiar.push(() => elemento.removeEventListener(tipo, accion))
          }

          // Solo una nota abierta a la vez
          piezas.forEach(({ boton }, i) =>
            escuchar(boton, "click", () => {
              const abrirla = actual !== i
              if (actual !== null) cerrar(actual)
              if (abrirla) abrir(i)
              actual = abrirla ? i : null
              setAbierta(actual)
            })
          )

          // Todo lo que se haya abierto se deshace a mano: se creó desde un
          // clic, fuera del contexto que GSAP limpia solo
          limpiar.push(() => {
            aperturas.forEach((apertura) => apertura?.kill())
            lineas.forEach((parrafo) => parrafo?.revert())
            piezas.forEach((pieza) => {
              pieza.respuesta.hidden = true
              gsap.set(
                [
                  pieza.nota,
                  pieza.hoja,
                  pieza.respuesta,
                  pieza.clip,
                  pieza.ver,
                  pieza.cerrar,
                ],
                { clearProps: "all" }
              )
            })
            setAbierta(null)
          })
          const alSalir = () => limpiar.forEach((quitar) => quitar())

          if (!animado) {
            gsap.fromTo(
              [...notas, otra],
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.6, scrollTrigger: entrada }
            )
            return alSalir
          }

          // "Cerrar" espera sin estampar
          gsap.set(
            piezas.map((pieza) => pieza.cerrar),
            { visibility: "visible", clipPath: BORRADO }
          )

          const [titular] = q("[data-dudas='titular']")
          const [linea] = q("[data-dudas='linea']")
          const renglones = SplitText.create(titular, {
            type: "lines",
            mask: "lines",
          })

          const tl = gsap
            .timeline({
              scrollTrigger: entrada,
              onComplete: () => {
                lista = true
              },
            })
            .from(renglones.lines, { yPercent: 100, duration: 1 }, 0)
            .fromTo(
              linea,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.5, ease: "power2.out" },
              0.5
            )
            .fromTo(
              CAIDA.map((i) => notas[i]),
              {
                y: -40,
                autoAlpha: 0,
                rotation: () => gsap.utils.random(-6, 6),
              },
              {
                y: 0,
                autoAlpha: 1,
                rotation: 0,
                duration: 0.6,
                ease: "back.out(1.6)",
                stagger: 0.08,
              },
              0.7
            )
            .fromTo(
              CAIDA.map((i) => piezas[i].ver),
              { clipPath: BORRADO },
              {
                clipPath: ESCRITO,
                duration: 0.6,
                ease: "power1.inOut",
                stagger: 0.08,
              },
              1.2
            )
            .fromTo(
              otra,
              { y: 20, autoAlpha: 0 },
              { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
              1.9
            )
          // Titular y línea esperaban ocultos por CSS; su estado inicial ya los tapa
          gsap.set([titular, linea], { autoAlpha: 1 })
          limpiar.push(() => tl.kill())

          if (!raton) return alSalir

          piezas.forEach(({ nota, boton }, i) => {
            // Las estrellas del sello dan media vuelta cada vez que se entra
            const estrellas = gsap.utils.selector(nota)(
              "[data-dudas='estrella']"
            )

            escuchar(boton, "mouseenter", () => {
              if (!lista) return
              gsap.to(estrellas, {
                rotation: "+=180",
                duration: 0.5,
                ease: "power2.out",
                overwrite: true,
              })
              if (actual === i) return
              gsap.to(nota, {
                y: -4,
                rotation: i % 2 ? 1 : -1,
                duration: 0.25,
                overwrite: true,
              })
            })
            escuchar(boton, "mouseleave", () => {
              if (!lista) return
              gsap.to(nota, {
                y: 0,
                rotation: 0,
                duration: 0.25,
                overwrite: true,
              })
            })
          })

          // La flecha sale por la derecha y vuelve a entrar por la izquierda,
          // como en el botón de compra
          const flecha = q("[data-dudas='flecha']")
          const salto = gsap
            .timeline({ paused: true })
            .to(flecha, {
              xPercent: 110,
              opacity: 0,
              duration: 0.2,
              ease: "power2.in",
            })
            .set(flecha, { xPercent: -110 })
            .to(flecha, {
              xPercent: 0,
              opacity: 1,
              duration: 0.25,
              ease: "power2.out",
            })
          escuchar(otra, "mouseenter", () => salto.restart())

          return alSalir
        }
      )
    },
    { scope }
  )

  return (
    <section
      ref={scope}
      id="dudas"
      className="seccion relative isolate bg-lila py-24 text-beige lg:py-32"
    >
      <div
        aria-hidden
        className="grano pointer-events-none absolute inset-0 -z-10 opacity-12"
      />
      {/* Marco de líneas y etiqueta vertical: no se animan */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-3 border border-beige/35 md:inset-6"
      >
        <p className="absolute -top-px -left-px hidden h-[330px] w-[68px] items-center justify-center border border-beige/35 lg:flex">
          <span className="rotate-180 font-manuscrita text-3xl whitespace-nowrap [writing-mode:vertical-rl]">
            preguntas frecuentes
          </span>
        </p>
      </div>

      <div className="contenedor text-center">
        <p className="eyebrow col-span-full font-semibold text-verde">
          Lo que necesitas saber
        </p>
        <h2
          data-dudas="titular"
          className="col-span-full mt-6 font-display text-[clamp(3rem,8.2vw,7rem)] leading-none tracking-[-0.02em]"
        >
          <span className="font-bold">Dudas</span> <em>razonables</em>
        </h2>
        <div
          data-dudas="linea"
          className="col-span-full mx-auto mt-[18px] h-0.5 w-[104px] bg-beige/60"
        />

        <ul className="col-span-full mt-14 grid gap-6 text-left md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-12">
          {dudas.map((duda, i) => (
            // La celda mantiene su alto: en columnas, la hoja crece por
            // encima de la nota de debajo sin empujar la rejilla
            <li
              key={duda.pregunta}
              data-dudas="nota"
              className="relative md:h-[300px]"
            >
              <div
                data-dudas="hoja"
                className="relative flex min-h-[220px] flex-col rounded-[10px] bg-beige p-7 text-marron shadow-[0_6px_14px_rgb(31_10_20/0.35)] md:absolute md:inset-x-0 md:top-0 md:min-h-full lg:p-10"
              >
                <div className="grano pointer-events-none absolute inset-0 rounded-[10px]" />
                {/* El margen derecho deja sitio al clip */}
                <h3
                  id={`duda-${i}`}
                  className="pr-[50px] font-display text-[clamp(1.375rem,2.1vw,1.875rem)] leading-[1.1] italic lg:pr-[40px]"
                >
                  {duda.pregunta}
                </h3>
                <div
                  id={`respuesta-${i}`}
                  role="region"
                  aria-labelledby={`duda-${i}`}
                  data-dudas="respuesta"
                  hidden
                  className="overflow-hidden"
                >
                  <p
                    data-dudas="texto"
                    className="pt-5 text-[clamp(1rem,1.4vw,1.25rem)] leading-normal"
                  >
                    {duda.respuesta}
                  </p>
                </div>
                {/* Solo el sello abre y cierra la nota. Sus dos caras ocupan
                    la misma celda y solo se ve una; el nombre accesible
                    incluye la pregunta */}
                <div className="mt-auto pt-6">
                  <button
                    type="button"
                    aria-expanded={abierta === i}
                    aria-controls={`respuesta-${i}`}
                    aria-label={`${abierta === i ? "Cerrar" : "Ver respuesta"}: ${duda.pregunta}`}
                    className="relative grid cursor-pointer outline-offset-4 outline-marron focus-visible:outline-2"
                  >
                    <Sello
                      aria-hidden
                      data-dudas="ver"
                      className="rotate-[2.5deg]"
                    >
                      Ver respuesta
                    </Sello>
                    <Sello
                      aria-hidden
                      data-dudas="cerrar"
                      className="invisible -rotate-1"
                    >
                      Cerrar
                    </Sello>
                  </button>
                </div>
                <svg
                  data-dudas="clip"
                  aria-hidden
                  viewBox="0 0 40 92"
                  fill="none"
                  stroke="#B9B6AE"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className="pointer-events-none invisible absolute -top-[34px] right-3 h-[92px] w-10 drop-shadow-[0_2px_2px_rgb(31_10_20/0.3)]"
                >
                  <path d="M12 34V70a8 8 0 0 0 16 0V18a12 12 0 0 0-24 0V72a16 16 0 0 0 32 0V30" />
                </svg>
              </div>
            </li>
          ))}
        </ul>

        <a
          data-dudas="boton"
          href={`mailto:${evento.correo}`}
          className="col-span-full mt-16 inline-flex items-center gap-3 justify-self-center rounded-full bg-verde px-8 py-5 leading-none font-semibold tracking-[0.12em] text-marron uppercase outline-offset-4 outline-beige focus-visible:outline-2 lg:mt-24 lg:text-lg"
        >
          ¿Otra duda? Escríbenos
          <span className="overflow-hidden">
            <svg
              data-dudas="flecha"
              aria-hidden
              viewBox="0 0 22 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-[0.8em] w-[1em]"
            >
              <path d="M1.75 9h18.5M12.5 1.75 20.25 9l-7.75 7.25" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  )
}

export { Dudas }
