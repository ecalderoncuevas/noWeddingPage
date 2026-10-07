"use client"

import { useRef, useState } from "react"
import { ArrowDown } from "lucide-react"

import { Star } from "@/components/star"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap"

// Respuestas definitivas pendientes: de momento, lorem ipsum
const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam."

const dudas = [
  {
    pregunta: "¿De verdad no se casa nadie?",
    respuesta:
      "Nadie. Los novios son actores, el «sí, quiero» no tiene validez y tú solo vienes a pasarlo bien. Todo lo demás es de verdad: la comida, la barra y el baile.",
  },
  { pregunta: "¿Puedo ir solo?", respuesta: lorem },
  { pregunta: "¿Hay dress code?", respuesta: lorem },
  { pregunta: "¿Qué incluye la invitación?", respuesta: lorem },
  { pregunta: "¿Puedo dar un discurso?", respuesta: lorem },
  { pregunta: "¿Qué pasa si al final no puedo ir?", respuesta: lorem },
]

// La primera duda empieza abierta
const inicial = 0

function Dudas() {
  const scope = useRef<HTMLElement>(null)
  const [abierta, setAbierta] = useState<number | null>(inicial)

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-dudas='estrella']", {
          rotation: 360,
          duration: 20,
          ease: "none",
          repeat: -1,
        })
      })
    },
    { scope }
  )

  const alternar = contextSafe((i: number, lista: Element) => {
    const q = gsap.utils.selector(lista)
    const respuestas = q("[data-dudas='respuesta']")
    const paneles = q("[data-dudas='panel']")
    const flechas = q("[data-dudas='flecha']")
    const animado = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
    const inclinado = animado && window.matchMedia("(min-width: 768px)").matches
    const duration = animado ? 0.45 : 0
    const abrir = abierta !== i

    // Solo una respuesta abierta a la vez
    if (abierta !== null) {
      const anterior = respuestas[abierta]
      gsap.to(anterior, {
        height: 0,
        duration,
        ease: "power2.inOut",
        overwrite: true,
        onComplete: () => {
          gsap.set(anterior, { display: "none" })
          // Cambia el alto de la página
          if (!abrir) ScrollTrigger.refresh()
        },
      })
      gsap.to(flechas[abierta], { rotation: 0, duration, overwrite: true })
    }

    if (abrir) {
      gsap.set(respuestas[i], { display: "block" })
      gsap.fromTo(
        respuestas[i],
        { height: 0 },
        {
          height: "auto",
          duration,
          ease: "power2.out",
          overwrite: true,
          onComplete: () => ScrollTrigger.refresh(),
        }
      )
      gsap.to(flechas[i], { rotation: 180, duration, overwrite: true })
      // GSAP absorbe la rotación de la clase, así que se anima hasta ella
      if (inclinado) {
        gsap.fromTo(
          paneles[i],
          { rotation: 0 },
          { rotation: 1.2, duration: 0.7, ease: "back.out(2)", overwrite: true }
        )
      }
    }

    setAbierta(abrir ? i : null)
  })

  return (
    <section ref={scope} id="dudas" className="seccion">
      <div className="bg-lila py-14 text-beige lg:py-20">
        <div className="contenedor gap-y-4 text-center">
          <p className="eyebrow col-span-full text-verde">
            Preguntas frecuentes
          </p>
          <h2 className="col-span-full flex items-center justify-center gap-[0.2em] font-display text-[clamp(5rem,15vw,12.8rem)] leading-none font-bold tracking-[-0.02em]">
            <Star
              points={4}
              inner={0.18}
              data-dudas="estrella"
              className="size-[0.42em] text-verde"
            />
            Dudas
            <Star
              points={4}
              inner={0.18}
              data-dudas="estrella"
              className="size-[0.42em]"
            />
          </h2>
        </div>
      </div>

      <div className="bg-verde py-16 text-marron lg:py-24">
        <div className="contenedor">
          <div className="col-span-full lg:col-span-8 lg:col-start-3">
            {dudas.map((duda, i) => (
              <div
                key={duda.pregunta}
                className="border-t-2 border-marron last:border-b-2"
              >
                <h3>
                  <button
                    id={`duda-${i}`}
                    type="button"
                    aria-expanded={abierta === i}
                    aria-controls={`respuesta-${i}`}
                    onClick={(event) =>
                      alternar(i, event.currentTarget.closest("section")!)
                    }
                    className="flex w-full cursor-pointer items-center justify-between gap-6 py-7 text-left text-[clamp(1.25rem,1.9vw,1.625rem)] leading-tight font-semibold outline-offset-4 outline-marron focus-visible:outline-2"
                  >
                    {duda.pregunta}
                    <ArrowDown
                      data-dudas="flecha"
                      aria-hidden
                      style={
                        i === inicial
                          ? { transform: "rotate(180deg)" }
                          : undefined
                      }
                      className="size-8 shrink-0"
                    />
                  </button>
                </h3>
                <div
                  id={`respuesta-${i}`}
                  role="region"
                  aria-labelledby={`duda-${i}`}
                  data-dudas="respuesta"
                  className={
                    i === inicial ? "overflow-hidden" : "hidden overflow-hidden"
                  }
                >
                  {/* El relleno deja sitio a las esquinas del panel inclinado */}
                  <div className="px-1 pt-3 pb-10">
                    <p
                      data-dudas="panel"
                      className="panel-dentado rounded-lg bg-lila px-8 py-8 text-lg leading-[1.5] text-beige md:rotate-[1.2deg] md:px-16 lg:text-xl"
                    >
                      {duda.respuesta}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <p className="mt-12 text-center lg:text-lg">
              ¿Otra duda? Escríbenos a [tu correo]
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Dudas }
