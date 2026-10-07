"use client"

import { useRef } from "react"

import { Placeholder } from "@/components/placeholder"
import { gsap, useGSAP } from "@/lib/gsap"
import { cn } from "@/lib/utils"

const lila = "#672d4b"
const verde = "#b0b487"
const marron = "#54392d"
const beige = "#f1f0e2"

// Momentos ya maquetados; el resto se añade a este array
const momentos = [
  {
    hora: "15:30",
    nombre: "Ceremonia",
    frase: "Lágrimas, arroz y un «sí, quiero» que no compromete a nadie.",
    fondo: lila,
    texto: beige,
    acento: verde,
    slot: "plan-ceremonia",
    forma: "arch",
    hueco: "",
    ancho: 540,
    alto: 700,
  },
  {
    hora: "17:00",
    nombre: "Banquete",
    frase:
      "Cinco platos, barra libre y una mesa llena de gente que tampoco conoce a los novios.",
    fondo: marron,
    texto: beige,
    acento: verde,
    slot: "plan-banquete",
    forma: "circle",
    hueco: "",
    ancho: 600,
    alto: 600,
  },
  {
    hora: "19:00",
    nombre: "Discursos",
    frase:
      "El padrino, la mejor amiga y, si te atreves, tú. Micrófono abierto.",
    fondo: verde,
    texto: lila,
    acento: marron,
    slot: "plan-discursos",
    forma: "capsule",
    hueco: "bg-beige text-marron",
    ancho: 400,
    alto: 700,
  },
  {
    hora: "20:00",
    nombre: "Tarta",
    frase:
      "Tres pisos, un cuchillo demasiado grande y la foto que todos esperan.",
    fondo: beige,
    texto: lila,
    acento: marron,
    slot: "plan-tarta",
    forma: "tarta",
    hueco: "",
    ancho: 540,
    alto: 660,
  },
] as const

// La barra de progreso muestra ya los cinco momentos del día
const etapas = ["Ceremonia", "Banquete", "Discursos", "Tarta", "Baile"]

const numero = (i: number) => String(i + 1).padStart(2, "0")
const total = numero(etapas.length - 1)

// Elementos superpuestos en la misma celda: solo se ve el del momento actual
const capa = (i: number) =>
  i ? "invisible col-start-1 row-start-1" : "col-start-1 row-start-1"

// El hueco de la tarta no es una forma simple: tres pisos y una guinda
function Hueco({
  momento,
  slot,
  className,
}: {
  momento: (typeof momentos)[number]
  slot: string
  className?: string
}) {
  if (momento.forma !== "tarta") {
    return (
      <Placeholder
        slot={slot}
        width={momento.ancho}
        height={momento.alto}
        shape={momento.forma}
        className={cn(momento.hueco, className)}
      />
    )
  }

  return (
    <div
      data-slot={slot}
      style={{ aspectRatio: `${momento.ancho} / ${momento.alto}` }}
      className={cn("flex w-full flex-col items-center", className)}
    >
      <span className="mb-[1.85%] aspect-square w-[11.1%] rounded-full bg-lila" />
      <span className="min-h-0 w-[40.7%] flex-[170] rounded-3xl bg-verde" />
      <span className="min-h-0 w-[70.4%] flex-[200] rounded-3xl bg-verde" />
      <span className="flex min-h-0 w-full flex-[220] items-center justify-center rounded-3xl bg-verde text-xs tracking-[0.18em] text-marron uppercase">
        Imagen o ilustración
      </span>
    </div>
  )
}

function OrdenDelDia() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const mm = gsap.matchMedia()

      mm.add(
        "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        () => {
          const [escenario] = q("[data-plan='escenario']")
          const imagenes = q("[data-plan='imagen']")
          const nombres = q("[data-plan='nombre']")
          const contadores = q("[data-plan='contador']")
          const frases = q("[data-plan='frase']")
          const puntos = q("[data-plan='punto']")
          const etiquetas = q("[data-plan='etapa']")
          // Una celda por carácter de la hora, con un dígito por momento
          const cajas = q("[data-plan='celda']") as HTMLElement[]
          const celdas = cajas.map(
            (caja) => Array.from(caja.children) as HTMLElement[]
          )
          const visibles = celdas.map(() => 0)
          // Cada celda mide lo que su dígito actual, en em para que escale
          const anchos = celdas.map((digitos, posicion) => {
            const cuerpo = parseFloat(
              getComputedStyle(cajas[posicion]).fontSize
            )
            return digitos.map((digito) => `${digito.offsetWidth / cuerpo}em`)
          })
          cajas.forEach((caja, posicion) =>
            gsap.set(caja, { width: anchos[posicion][0] })
          )

          gsap.set(puntos[0], { scale: 1.6 })
          gsap.set(etiquetas[0], { opacity: 1 })

          const tl = gsap.timeline({
            defaults: { ease: "power2.inOut", duration: 0.8 },
            scrollTrigger: {
              trigger: escenario,
              pin: true,
              scrub: true,
              invalidateOnRefresh: true,
              end: `+=${(momentos.length - 1) * 100}%`,
            },
          })

          // Sube el elemento que sale y entra el nuevo desde abajo
          const rodar = (sale: Element, entra: Element, t: number) => {
            tl.to(sale, { yPercent: -100 }, t).fromTo(
              entra,
              { yPercent: 100 },
              { yPercent: 0 },
              t
            )
            // Ya está fuera de su máscara: puede dejar de estar oculto
            gsap.set(entra, { visibility: "visible" })
          }

          for (let i = 0; i < momentos.length - 1; i++) {
            const t = i
            const siguiente = momentos[i + 1]

            tl.to(
              imagenes[i],
              { xPercent: -120, rotation: -8, autoAlpha: 0 },
              t
            ).fromTo(
              imagenes[i + 1],
              { x: "60vw", rotation: 8 },
              { x: 0, rotation: 0 },
              t
            )
            gsap.set(imagenes[i + 1], { visibility: "visible" })

            celdas.forEach((digitos, posicion) => {
              if (momentos[i].hora[posicion] === siguiente.hora[posicion]) {
                return
              }
              rodar(digitos[visibles[posicion]], digitos[i + 1], t)
              tl.to(cajas[posicion], { width: anchos[posicion][i + 1] }, t)
              visibles[posicion] = i + 1
            })
            rodar(nombres[i], nombres[i + 1], t)
            rodar(contadores[i], contadores[i + 1], t)

            tl.to(frases[i], { autoAlpha: 0, y: -20, duration: 0.4 }, t)
              .fromTo(
                frases[i + 1],
                { autoAlpha: 0, y: 20 },
                { autoAlpha: 1, y: 0, duration: 0.4 },
                t + 0.4
              )
              .to(
                escenario,
                { backgroundColor: siguiente.fondo, color: siguiente.texto },
                t
              )
              .to(q("[data-plan='eyebrow']"), { color: siguiente.acento }, t)
              .to(
                q("[data-plan='relleno']"),
                { scaleX: (i + 1) / etapas.length },
                t
              )
              .to(puntos[i], { scale: 1 }, t)
              .to(etiquetas[i], { opacity: 0.45 }, t)
              .to(puntos[i + 1], { scale: 1.6 }, t)
              .to(etiquetas[i + 1], { opacity: 1 }, t)
          }
        }
      )
    },
    { scope }
  )

  return (
    <section ref={scope} id="plan" className="seccion">
      <h2 className="sr-only">El orden del día</h2>

      {/* Escritorio: una pantalla fija cuyo contenido cambia con el scroll */}
      <div
        data-plan="escenario"
        style={{ backgroundColor: momentos[0].fondo, color: momentos[0].texto }}
        className="hidden h-svh min-h-[40rem] flex-col overflow-hidden md:motion-safe:flex"
      >
        <div className="contenedor items-center pt-10 lg:pt-12">
          <p
            data-plan="eyebrow"
            style={{ color: momentos[0].acento }}
            className="eyebrow col-span-4"
          >
            El orden del día
          </p>
          <p className="col-span-4 col-start-5 flex gap-2 justify-self-end font-display text-2xl font-bold lg:col-start-9 lg:text-3xl">
            <span className="inline-grid overflow-hidden">
              {momentos.map((momento, i) => (
                <span
                  key={momento.slot}
                  data-plan="contador"
                  className={capa(i)}
                >
                  {numero(i)}
                </span>
              ))}
            </span>
            / {total}
          </p>
        </div>

        <div className="contenedor min-h-0 flex-1 grid-rows-[minmax(0,1fr)] items-center py-6">
          <div className="col-span-4 lg:col-span-6">
            <p className="flex font-display text-[min(15.3vw,13.8rem,27svh)] leading-[1.15] font-bold tracking-[-0.02em]">
              {[0, 1, 2, 3, 4].map((posicion) => (
                <span
                  key={posicion}
                  data-plan="celda"
                  className="inline-grid justify-items-start overflow-hidden"
                >
                  {momentos.map((momento, i) => (
                    <span key={momento.slot} className={capa(i)}>
                      {momento.hora[posicion]}
                    </span>
                  ))}
                </span>
              ))}
            </p>
            <p className="-mt-[0.2em] grid overflow-hidden font-display text-[min(6.8vw,6.125rem,12svh)] leading-[1.25] italic">
              {momentos.map((momento, i) => (
                <span key={momento.slot} data-plan="nombre" className={capa(i)}>
                  {momento.nombre}
                </span>
              ))}
            </p>
            <div className="mt-4 grid max-w-[32rem] text-lg leading-[1.45] lg:text-2xl">
              {momentos.map((momento, i) => (
                <p key={momento.slot} data-plan="frase" className={capa(i)}>
                  {momento.frase}
                </p>
              ))}
            </div>
          </div>

          <div className="[container-type:size] col-span-4 col-start-5 grid place-items-center self-stretch lg:col-span-5 lg:col-start-8">
            {momentos.map((momento, i) => (
              <div
                key={momento.slot}
                data-plan="imagen"
                style={{
                  width: `min(100cqw, 100cqh * ${momento.ancho / momento.alto})`,
                }}
                className={capa(i)}
              >
                <Hueco momento={momento} slot={momento.slot} />
              </div>
            ))}
          </div>
        </div>

        <div className="contenedor pt-4 pb-10 lg:pb-14">
          <div className="relative col-span-full">
            <div className="absolute inset-x-0 top-0 h-px bg-current opacity-35" />
            <div
              data-plan="relleno"
              style={{ transform: "scaleX(0)" }}
              className="absolute inset-x-0 -top-px h-[3px] origin-left bg-current"
            />
            <ol className="grid grid-cols-5">
              {etapas.map((etapa) => (
                <li key={etapa} className="relative pt-6">
                  <span
                    data-plan="punto"
                    className="absolute top-0 left-0 size-2.5 -translate-y-1/2 rounded-full bg-current"
                  />
                  <span
                    data-plan="etapa"
                    className="font-semibold opacity-45 lg:text-lg"
                  >
                    {etapa}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Móvil y movimiento reducido: los momentos apilados, sin fijar */}
      <div className="md:motion-safe:hidden">
        {momentos.map((momento, i) => (
          <div
            key={momento.slot}
            style={{ backgroundColor: momento.fondo, color: momento.texto }}
            className="py-16"
          >
            <div className="contenedor gap-y-3">
              <p
                style={{ color: momento.acento }}
                className="eyebrow col-span-full"
              >
                {numero(i)} / {total} · El orden del día
              </p>
              <p className="col-span-full font-display text-[clamp(5rem,27vw,10rem)] leading-none font-bold tracking-[-0.02em]">
                {momento.hora}
              </p>
              <h3 className="col-span-full font-display text-[clamp(2.75rem,13vw,5rem)] leading-none italic">
                {momento.nombre}
              </h3>
              <p className="col-span-full mt-2 max-w-md text-lg leading-[1.45]">
                {momento.frase}
              </p>
              <Hueco
                momento={momento}
                slot={`${momento.slot}-movil`}
                className="col-span-full mx-auto mt-8 max-w-xs"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export { OrdenDelDia }
