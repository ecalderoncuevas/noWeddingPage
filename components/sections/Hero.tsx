"use client"

import { useRef } from "react"

import { BotonCompra } from "@/components/boton-compra"
import { Placeholder } from "@/components/placeholder"
import { gsap, SplitText, useGSAP } from "@/lib/gsap"

const enlaces = [
  { href: "#plan", texto: "El plan" },
  { href: "#novios", texto: "Los novios" },
  { href: "#invitaciones", texto: "Invitaciones" },
  { href: "#dudas", texto: "Dudas" },
]

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
        const frase = SplitText.create(q("[data-hero='frase']"), {
          type: "lines",
        })
        const dudas = q("[data-hero='duda']")
        // Las piezas del botón del header: las mismas que mueve su hover
        const comprar = (pieza: string) =>
          q(`[data-hero='comprar'] [data-btn='${pieza}']`)
        const cascada = { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.08 }
        // En móvil la línea de la fecha puede ocupar dos renglones: separar
        // las letras la haría saltar, así que ahí solo aparece
        const ancho = window.matchMedia("(min-width: 640px)").matches

        // Cada paso lleva su segundo exacto para poder moverlo sin
        // descuadrar los demás
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .from(q("[data-hero='header']"), { yPercent: -100, duration: 0.6 }, 0)
          .from(q("[data-hero='logo']"), { yPercent: 100, duration: 0.6 }, 0.2)
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
          .from(
            q("[data-hero='novios']"),
            { y: 60, opacity: 0, duration: 0.9 },
            1.1
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
            dudas,
            { scale: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.12 },
            1.8
          )
          .to(
            dudas,
            {
              y: -12,
              rotation: (i) => (i ? 6 : -6),
              duration: 2.4,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              stagger: 0.4,
            },
            2.5
          )

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
        {/* El margen de arriba deja sitio al ramo que asoma sobre el botón */}
        <header
          data-hero="header"
          className="col-span-full flex items-center justify-between gap-4 pt-10 pb-6 lg:row-start-1 lg:pb-8"
        >
          {/* El enlace hace de máscara: el texto sube desde su borde inferior */}
          <a
            href="#inicio"
            className="-m-1 overflow-hidden p-1 font-display text-xl italic sm:text-2xl lg:text-3xl"
          >
            <span data-hero="logo" className="block">
              Logo
            </span>
          </a>
          <nav aria-label="Principal" className="hidden md:block">
            <ul className="flex gap-6 lg:gap-10 lg:text-lg">
              {enlaces.map((enlace) => (
                <li key={enlace.href} data-hero="enlace">
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
          <span data-hero="fecha">La boda del año · [Fecha] · [Lugar]</span>
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
            [Número] invitaciones · plazas limitadas
          </p>
        </div>
      </div>
    </section>
  )
}

export { Hero }
