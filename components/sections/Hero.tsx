"use client"

import { useRef } from "react"

import { BotonCompra } from "@/components/boton-compra"
import { NoviosHero } from "@/components/novios-hero"
import { evento } from "@/lib/datos-evento"
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap"

const enlaces = [
  { href: "#plan", texto: "El plan" },
  { href: "#novios", texto: "Los novios" },
  { href: "#invitaciones", texto: "Invitaciones" },
  { href: "#dudas", texto: "Dudas" },
]

// "Boda ajena": la primera palabra en negrita y el resto en cursiva
const [marcaFuerte, ...marcaResto] = evento.marca.split(" ")

// Profundidad con el ratón, en píxeles. Los "?" van dentro de los novios y
// suman su movimiento al de ellos: 10 + 4 = 14
const PROFUNDIDAD = { titular: 4, novios: 10, duda: 4 }

function Hero() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const mm = gsap.matchMedia()

      mm.add(
        {
          animado: "(prefers-reduced-motion: no-preference)",
          raton: "(min-width: 1024px) and (hover: hover) and (pointer: fine)",
        },
        (context) => {
          const { animado, raton } = context.conditions!

          // Sin animaciones: los novios aparecen ya dibujados con un fundido
          if (!animado) {
            gsap.from(q("[data-hero='novios']"), {
              autoAlpha: 0,
              duration: 0.8,
              delay: 0.2,
            })
            return
          }

          const titular = SplitText.create(q("[data-hero='titular']"), {
            type: "lines",
            mask: "lines",
          })
          const frase = SplitText.create(q("[data-hero='frase']"), {
            type: "lines",
          })
          const dudas = q("[data-hero='duda']")
          const figuras = q("[data-hero='figura']")
          const flores = q("[data-hero='flor']")
          const trazos = q("[data-trazo]")
          // DrawSVG anima el trazo, no el relleno: el relleno aparece después
          const rellenos = trazos.filter(
            (trazo) => trazo.getAttribute("fill") !== "none"
          )
          // Las piezas del botón del header: las mismas que mueve su hover
          const comprar = (pieza: string) =>
            q(`[data-hero='comprar'] [data-btn='${pieza}']`)
          const cascada = { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.08 }
          // En móvil la línea de la fecha puede ocupar dos renglones: separar
          // las letras la haría saltar, así que ahí solo aparece
          const ancho = window.matchMedia("(min-width: 640px)").matches

          // Los bucles empiezan al terminar la entrada y se paran fuera de pantalla
          let visible = true
          const bucles: gsap.core.Animation[] = []
          const mover = () => bucles.forEach((b) => b.paused(!visible))

          // El segundo "?" espera en un extremo de su vaivén: va 1,5 s por
          // detrás del primero
          gsap.set(dudas[1], { y: -6, rotation: -6 })

          const vivir = () => {
            const flotar = dudas.map((duda, i) =>
              gsap
                .fromTo(
                  duda,
                  { y: -6, rotation: -6 },
                  {
                    y: 6,
                    rotation: 6,
                    transformOrigin: "50% 60%",
                    duration: 3,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                  }
                )
                .seek(i ? 0 : 1.5)
            )
            // Se mecen en sentidos contrarios: se acercan y se separan
            const mecer = figuras.map((figura, i) =>
              gsap
                .fromTo(
                  figura,
                  { rotation: i ? 1.5 : -1.5 },
                  {
                    rotation: i ? -1.5 : 1.5,
                    svgOrigin: figura.dataset.base,
                    duration: 4,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                  }
                )
                .seek(2)
            )
            const cabecear = flores.map((flor) => {
              const duracion = gsap.utils.random(1.6, 2.4)
              return gsap
                .fromTo(
                  flor,
                  { y: -2 },
                  {
                    y: 2,
                    duration: duracion,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                  }
                )
                .seek(duracion / 2)
            })

            bucles.push(...flotar, ...mecer, ...cabecear)
            mover()
          }

          ScrollTrigger.create({
            trigger: scope.current,
            onToggle: ({ isActive }) => {
              visible = isActive
              mover()
            },
          })

          // Cada paso lleva su segundo exacto para poder moverlo sin
          // descuadrar los demás
          gsap
            .timeline({ defaults: { ease: "power3.out" }, onComplete: vivir })
            .from(
              q("[data-hero='header']"),
              { yPercent: -100, duration: 0.6 },
              0
            )
            .from(
              q("[data-hero='anillo']"),
              {
                drawSVG: "0%",
                duration: 0.6,
                ease: "power2.inOut",
                stagger: 0.15,
              },
              0.2
            )
            .from(
              q("[data-hero='logo']"),
              { yPercent: 100, duration: 0.6 },
              0.2
            )
            .from(
              q("[data-hero='enlace']"),
              { y: 12, autoAlpha: 0, duration: 0.5, stagger: 0.06 },
              0.2
            )
            .from(comprar("cuerpo"), { autoAlpha: 0, duration: 0.5 }, 0.4)
            .from(
              comprar("trazo"),
              {
                drawSVG: "0%",
                duration: 0.5,
                ease: "power2.inOut",
                // Sin restos del dibujo: el trazo se adapta si el botón cambia de tamaño
                onComplete: () =>
                  gsap.set(comprar("trazo"), { clearProps: "all" }),
              },
              0.4
            )
            .from(comprar("texto"), { autoAlpha: 0, duration: 0.3 }, 0.7)
            .from(
              comprar("circulo"),
              { scale: 0, duration: 0.4, ease: "back.out(2)" },
              0.85
            )
            .from(
              q("[data-hero='fecha']"),
              {
                ...(ancho && { letterSpacing: "0.6em" }),
                autoAlpha: 0,
                duration: 0.9,
                // El espaciado vuelve a depender del CSS al terminar
                clearProps: "letterSpacing",
              },
              0.5
            )
            .from(
              titular.lines,
              { yPercent: 100, duration: 1, stagger: 0.15 },
              0.6
            )
            // Los novios se dibujan a línea y después se rellenan
            .from(
              trazos,
              {
                drawSVG: "0%",
                duration: 1.2,
                ease: "power2.inOut",
                stagger: 0.04,
              },
              1.1
            )
            .from(
              rellenos,
              { fillOpacity: 0, duration: 0.9, ease: "power1.out" },
              1.4
            )
            .from(
              [...frase.lines, ...q("[data-hero='boton']")],
              {
                ...cascada,
                // Deshace el corte por líneas para que el párrafo vuelva a
                // ajustarse solo si cambia el ancho
                onComplete: () => frase.revert(),
              },
              1.4
            )
            .from(q("[data-hero='dato']"), cascada, 1.4)
            .from(
              flores,
              {
                scale: 0,
                transformOrigin: "50% 50%",
                duration: 0.5,
                ease: "back.out(2.5)",
                stagger: 0.06,
              },
              1.9
            )
            .from(
              dudas,
              {
                scale: 0,
                rotation: -20,
                transformOrigin: "50% 60%",
                duration: 0.6,
                ease: "back.out(2)",
                stagger: 0.12,
              },
              2
            )

          gsap.set(q("[data-hero]"), { visibility: "visible" })

          // Hover del logo: los anillos dan media vuelta entrelazados (son
          // simétricos, así que acaban como empezaron) y el texto se aparta un poco
          const [marca] = q("[data-hero='marca']")
          const girar = gsap
            .timeline({
              paused: true,
              defaults: { duration: 0.7, ease: "power3.inOut" },
            })
            .to(q("[data-hero='anillos']"), { rotation: 180 }, 0)
            .to(q("[data-hero='logo']"), { x: 3 }, 0)
          const entrar = () => girar.play()
          const salir = () => girar.reverse()
          const eventos = [
            ["mouseenter", entrar],
            ["mouseleave", salir],
            ["focus", entrar],
            ["blur", salir],
          ] as const
          eventos.forEach(([tipo, accion]) =>
            marca.addEventListener(tipo, accion)
          )
          const quitarHover = () =>
            eventos.forEach(([tipo, accion]) =>
              marca.removeEventListener(tipo, accion)
            )

          if (!raton) return quitarHover

          // Profundidad: cada capa se aleja del cursor según lo cerca que esté
          const capas = (["titular", "novios", "duda"] as const).flatMap(
            (nombre) =>
              q(`[data-profundidad='${nombre}']`).map((capa) => ({
                max: PROFUNDIDAD[nombre],
                x: gsap.quickTo(capa, "x", {
                  duration: 0.8,
                  ease: "power3.out",
                }),
                y: gsap.quickTo(capa, "y", {
                  duration: 0.8,
                  ease: "power3.out",
                }),
              }))
          )
          const hero = scope.current!

          const alMover = (e: PointerEvent) => {
            if (!visible) return
            const caja = hero.getBoundingClientRect()
            const nx = ((e.clientX - caja.left) / caja.width) * 2 - 1
            const ny = ((e.clientY - caja.top) / caja.height) * 2 - 1
            capas.forEach((capa) => {
              capa.x(-nx * capa.max)
              capa.y(-ny * capa.max)
            })
          }
          const alSalir = () =>
            capas.forEach((capa) => {
              capa.x(0)
              capa.y(0)
            })

          hero.addEventListener("pointermove", alMover)
          hero.addEventListener("pointerleave", alSalir)
          return () => {
            quitarHover()
            hero.removeEventListener("pointermove", alMover)
            hero.removeEventListener("pointerleave", alSalir)
          }
        }
      )
    },
    { scope }
  )

  return (
    <section id="inicio" className="seccion bg-lila text-beige">
      <div
        ref={scope}
        className="contenedor min-h-[max(100svh,900px)] content-start lg:grid-rows-[auto_auto_auto_1fr]"
      >
        {/* El margen de arriba deja sitio al ramo que asoma sobre el botón */}
        <header
          data-hero="header"
          className="col-span-full flex items-center justify-between gap-4 pt-10 pb-6 lg:row-start-1 lg:pb-8"
        >
          <a
            href="#inicio"
            data-hero="marca"
            aria-label={`${evento.marca}, inicio`}
            className="flex items-center gap-[0.7em] font-display text-[clamp(1.375rem,1.6vw,1.9375rem)] leading-none"
          >
            <svg
              aria-hidden
              data-hero="anillos"
              viewBox="0 0 40 28"
              fill="none"
              stroke="var(--verde)"
              strokeWidth="3"
              className="h-[0.9em] w-auto shrink-0"
            >
              <circle data-hero="anillo" cx="12.5" cy="14" r="11" />
              <circle data-hero="anillo" cx="27.5" cy="14" r="11" />
            </svg>
            {/* El span de fuera hace de máscara: el texto sube desde su borde inferior */}
            <span className="-m-1 overflow-hidden p-1 whitespace-nowrap">
              <span data-hero="logo" className="block">
                <b className="font-bold">{marcaFuerte}</b>{" "}
                <i className="italic">{marcaResto.join(" ")}</i>
              </span>
            </span>
          </a>
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex gap-6 lg:gap-10 lg:text-lg">
              {enlaces.map((enlace) => (
                <li key={enlace.href} data-hero="enlace">
                  <a
                    href={enlace.href}
                    className="relative after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-out hover:after:origin-left hover:after:scale-x-100 focus-visible:after:origin-left focus-visible:after:scale-x-100 motion-reduce:after:transition-none"
                  >
                    {enlace.texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <BotonCompra
            data-hero="comprar"
            tamano="pequeno"
            decoracion
            esperaRamo={3}
            className="max-sm:text-xs"
          >
            Comprar invitación
          </BotonCompra>
        </header>

        {/* Alto fijo y una sola línea: al separarse las letras, el texto
            crece hacia los lados sin empujar a nadie */}
        <p className="eyebrow col-span-full mt-6 flex justify-center overflow-hidden text-center leading-normal text-verde sm:h-[1.5em] sm:whitespace-nowrap lg:row-start-2 lg:mt-4">
          <span data-hero="fecha">
            La boda del año · {evento.fecha} · {evento.lugar}
          </span>
        </p>

        <h1
          data-hero="titular"
          data-profundidad="titular"
          className="col-span-full mt-4 text-center font-display text-[clamp(4.5rem,15.5vw,13.5rem)] leading-[0.9] tracking-[-0.02em] lg:row-start-3"
        >
          <span className="block font-bold">Nadie</span>
          <span className="block italic">se casa</span>
        </h1>

        {/* Por delante del titular, por si el velo o las cabezas tocan las
            letras. En escritorio se apoya en el borde de abajo del hero */}
        <div
          data-hero="novios"
          data-profundidad="novios"
          className="relative z-10 col-span-full mt-2 w-[min(300px,80vw)] justify-self-center lg:row-span-2 lg:row-start-3 lg:mt-0 lg:w-[clamp(300px,26vw,560px)] lg:self-end"
        >
          <NoviosHero />
        </div>

        <div className="col-span-full flex flex-col items-center gap-6 pt-10 text-center lg:col-span-3 lg:col-start-1 lg:row-start-4 lg:items-start lg:self-end lg:pt-0 lg:pb-16 lg:text-left">
          <p
            data-hero="frase"
            className="max-w-md text-lg leading-[1.45] lg:text-xl"
          >
            Ceremonia, banquete, discursos, tarta y baile. Todo lo divertido de
            una boda, sin tener que conocer a los novios.
          </p>
          <BotonCompra data-hero="boton">Quiero mi invitación</BotonCompra>
        </div>

        <div className="col-span-full flex flex-col items-center gap-3 py-10 text-center lg:col-span-3 lg:col-start-10 lg:row-start-4 lg:items-end lg:self-end lg:pt-0 lg:pb-16 lg:text-right">
          <p data-hero="dato" className="eyebrow text-verde">
            Los novios
          </p>
          <p
            data-hero="dato"
            className="font-display text-3xl text-balance italic xl:text-4xl"
          >
            ¿Quiénes son? Da igual.
          </p>
          <p data-hero="dato" className="text-sm text-verde lg:text-base">
            {evento.plazas} invitaciones · plazas limitadas
          </p>
        </div>
      </div>
    </section>
  )
}

export { Hero }
