"use client"

import { useId, useRef } from "react"

import { irA } from "@/components/smooth-scroll"
import { Star } from "@/components/star"
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap"
import { cn } from "@/lib/utils"

// Todas las medidas van en em: el tamaño de letra del enlace escala el botón entero
const variantes = {
  // Sobre fondos lila y marrón
  oscura: "[--cuerpo:var(--beige)] [--tinta:var(--lila)]",
  // Sobre fondos beige y verde
  clara: "[--cuerpo:var(--lila)] [--tinta:var(--beige)]",
}

const tamanos = {
  grande: "text-[1.1875rem]",
  pequeno: "text-[0.890625rem]",
}

const flores = [
  { x: 20, y: 31, r: 10, petalos: "fill-verde", centro: "fill-beige" },
  { x: 39, y: 19, r: 12, petalos: "fill-beige", centro: "fill-[#c99ab0]" },
  { x: 60, y: 14, r: 13, petalos: "fill-[#c99ab0]", centro: "fill-beige" },
  { x: 81, y: 19, r: 12, petalos: "fill-beige", centro: "fill-verde" },
  { x: 100, y: 31, r: 10, petalos: "fill-verde", centro: "fill-beige" },
  { x: 49, y: 34, r: 9, petalos: "fill-verde", centro: "fill-beige" },
  { x: 71, y: 34, r: 9, petalos: "fill-[#c99ab0]", centro: "fill-beige" },
]

// Ángulos (en grados) hacia los que sale cada puntito de confeti
const confeti = [-165, -140, -118, -98, -80, -60, -38, -15]

function Flor({ x, y, r, petalos, centro }: (typeof flores)[number]) {
  return (
    <g data-btn="flor">
      {Array.from({ length: 5 }, (_, i) => {
        const angulo = (2 * Math.PI * i) / 5 - Math.PI / 2
        return (
          <circle
            key={i}
            cx={(x + r * 0.55 * Math.cos(angulo)).toFixed(2)}
            cy={(y + r * 0.55 * Math.sin(angulo)).toFixed(2)}
            r={(r * 0.48).toFixed(2)}
            className={petalos}
          />
        )
      })}
      <circle cx={x} cy={y} r={(r * 0.3).toFixed(2)} className={centro} />
    </g>
  )
}

// Las flores ocupan los 44 px de arriba del dibujo: es lo único que asoma.
// Tallos y lazo se quedan tapados por el cuerpo del botón
function Ramo() {
  return (
    <svg
      data-btn="ramo"
      viewBox="0 0 120 68"
      className="invisible absolute top-[0.1em] left-1/2 -ml-[3.15em] h-[3.58em] w-[6.3em] overflow-visible"
    >
      <g
        className="fill-none stroke-[#8a8e63]"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M20 31Q38 48 58 62" />
        <path d="M39 19Q48 44 59 62" />
        <path d="M60 14V62" />
        <path d="M81 19Q72 44 61 62" />
        <path d="M100 31Q82 48 62 62" />
      </g>
      <g className="fill-verde">
        <ellipse cx="9" cy="40" rx="7" ry="3.5" transform="rotate(-40 9 40)" />
        <ellipse
          cx="111"
          cy="40"
          rx="7"
          ry="3.5"
          transform="rotate(40 111 40)"
        />
      </g>
      <g className="fill-beige">
        <path d="M60 58 49 53v10ZM60 58l11-5v10Z" />
        <circle cx="60" cy="58" r="2.5" />
      </g>
      {flores.map((flor) => (
        <Flor key={`${flor.x}-${flor.y}`} {...flor} />
      ))}
    </svg>
  )
}

function Copa({ lado }: { lado: "izquierda" | "derecha" }) {
  return (
    <svg
      data-btn="copa"
      viewBox="0 0 28 64"
      className={cn(
        "invisible absolute top-[0.1em] left-1/2 h-[3.4em] w-[1.5em] overflow-visible",
        lado === "izquierda" ? "-ml-[2.6em]" : "ml-[1.1em]"
      )}
    >
      <path d="M7 13h14l-.7 10.5Q14 34.5 7.7 23.5Z" className="fill-verde" />
      <g
        className="fill-none stroke-beige"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 3h16l-1.5 21Q14 37 7.5 24Z" />
        <path d="M14 33v25M7 60h14" />
      </g>
    </svg>
  )
}

function BotonCompra({
  children,
  className,
  variante = "oscura",
  tamano = "grande",
  decoracion = false,
  esperaRamo = 0,
  href = "#invitaciones",
  ...props
}: {
  variante?: keyof typeof variantes
  tamano?: keyof typeof tamanos
  // Ramo al pasar el ratón y copas al hacer clic: solo header y footer
  decoracion?: boolean
  // Segundos que espera el ramo antes de asomar solo en pantallas táctiles
  esperaRamo?: number
} & React.ComponentProps<"a">) {
  const scope = useRef<HTMLAnchorElement>(null)
  const mascara = useId()

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const mm = gsap.matchMedia()

      mm.add(
        {
          animado: "(prefers-reduced-motion: no-preference)",
          raton: "(hover: hover)",
        },
        (context) => {
          const { animado, raton } = context.conditions!
          if (!animado) return

          const boton = scope.current!
          const caja = q("[data-btn='caja']")
          const flecha = q("[data-btn='flecha']")

          const subir = gsap.to(caja, {
            y: -3,
            duration: 0.3,
            ease: "power2.out",
            paused: true,
          })
          const pulsar = gsap.to(caja, {
            scale: 0.97,
            duration: 0.12,
            paused: true,
          })
          // La flecha sale por la derecha y vuelve a entrar por la izquierda
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
          // Un guion (6) más un hueco (5): al repetirse no se nota el salto
          const hormigas = gsap.to(q("[data-btn='guiones']"), {
            strokeDashoffset: -11,
            duration: 0.5,
            ease: "none",
            repeat: -1,
            paused: true,
          })

          let ramo: gsap.core.Timeline | undefined
          let vaiven: gsap.core.Tween | undefined
          let brindis: gsap.core.Timeline | undefined

          if (decoracion) {
            const dibujo = q("[data-btn='ramo']")

            ramo = gsap
              .timeline({
                paused: true,
                onReverseComplete: () => vaiven?.pause(),
              })
              .fromTo(
                dibujo,
                { yPercent: 0, autoAlpha: 0 },
                {
                  yPercent: -68,
                  autoAlpha: 1,
                  duration: 0.5,
                  ease: "back.out(1.6)",
                }
              )
              .from(
                q("[data-btn='flor']"),
                {
                  scale: 0,
                  transformOrigin: "50% 50%",
                  duration: 0.4,
                  ease: "back.out(2)",
                  stagger: 0.05,
                },
                0.05
              )
            vaiven = gsap.fromTo(
              dibujo,
              { rotation: -3 },
              {
                rotation: 3,
                transformOrigin: "50% 100%",
                duration: 1.4,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                paused: true,
              }
            )

            const copas = q("[data-btn='copa']")
            const chispa = q("[data-btn='chispa']")
            const em = parseFloat(
              getComputedStyle(q("[data-btn='decoracion']")[0]).fontSize
            )

            brindis = gsap
              .timeline({ paused: true })
              .fromTo(
                copas,
                {
                  autoAlpha: 0,
                  yPercent: 0,
                  x: 0,
                  rotation: (i) => (i ? 22 : -22),
                  transformOrigin: "50% 100%",
                },
                {
                  autoAlpha: 1,
                  yPercent: -85,
                  duration: 0.3,
                  ease: "power2.out",
                }
              )
              .to(
                copas,
                {
                  rotation: (i) => (i ? -10 : 10),
                  x: (i) => (i ? -0.6 : 0.6) * em,
                  duration: 0.25,
                  ease: "back.out(3)",
                },
                0.3
              )
              .fromTo(
                chispa,
                { scale: 0, autoAlpha: 0, rotation: -45 },
                {
                  scale: 1,
                  autoAlpha: 1,
                  rotation: 0,
                  duration: 0.2,
                  ease: "back.out(3)",
                },
                0.42
              )
              .fromTo(
                q("[data-btn='confeti']"),
                { x: 0, y: 0, scale: 1, autoAlpha: 1 },
                {
                  x: (i) => Math.cos((confeti[i] * Math.PI) / 180) * 2.4 * em,
                  y: (i) => Math.sin((confeti[i] * Math.PI) / 180) * 2.4 * em,
                  scale: 0.4,
                  autoAlpha: 0,
                  duration: 0.5,
                  ease: "power2.out",
                  // Sin esto, el estado inicial (visible) se pintaría al crear la timeline
                  immediateRender: false,
                },
                0.42
              )
              // El desplazamiento arranca antes de que acabe el brindis
              .call(() => irA(href), undefined, 0.6)
              .to(chispa, { scale: 0, autoAlpha: 0, duration: 0.15 }, 0.7)
              .to(
                copas,
                {
                  yPercent: 0,
                  autoAlpha: 0,
                  duration: 0.25,
                  ease: "power2.in",
                },
                0.7
              )
          }

          const entrar = () => {
            subir.play()
            salto.restart()
            hormigas.play()
            if (brindis?.isActive()) return
            ramo?.timeScale(1).play()
            vaiven?.play()
          }
          const salir = () => {
            subir.reverse()
            hormigas.pause()
            ramo?.timeScale(1.5).reverse()
          }
          const enfocar = () => {
            if (boton.matches(":focus-visible")) entrar()
          }
          const hundir = () => pulsar.play()
          const soltar = () => pulsar.reverse()
          const brindar = (event: MouseEvent) => {
            if (
              event.button ||
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey
            )
              return
            // Lenis también escucha los clics en enlaces a anclas: se le corta
            // el paso para que no baje hasta que las copas hayan brindado
            event.preventDefault()
            event.stopPropagation()
            if (brindis!.isActive()) return
            ramo?.timeScale(3).reverse()
            brindis!.restart()
          }

          const eventos: [string, EventListener][] = [
            ["focus", enfocar],
            ["blur", salir],
            ["pointerdown", hundir],
            ["pointerup", soltar],
            ["pointerleave", soltar],
            ["pointercancel", soltar],
          ]
          if (raton) eventos.push(["mouseenter", entrar], ["mouseleave", salir])
          if (brindis && href.startsWith("#"))
            eventos.push(["click", brindar as EventListener])

          eventos.forEach(([tipo, accion]) =>
            boton.addEventListener(tipo, accion)
          )

          // Sin ratón no hay hover: el ramo asoma una vez al entrar en pantalla
          if (ramo && !raton) {
            const tl = ramo
            const asomar = gsap
              .timeline({ paused: true })
              .call(
                () => {
                  tl.timeScale(1).play()
                  vaiven?.play()
                },
                undefined,
                esperaRamo
              )
              .call(
                () => {
                  tl.timeScale(1.5).reverse()
                },
                undefined,
                esperaRamo + 2.2
              )

            ScrollTrigger.create({
              trigger: boton,
              start: "top bottom",
              once: true,
              onEnter: () => asomar.play(),
            })
          }

          return () =>
            eventos.forEach(([tipo, accion]) =>
              boton.removeEventListener(tipo, accion)
            )
        }
      )
    },
    { scope, dependencies: [decoracion, esperaRamo, href] }
  )

  return (
    <a
      ref={scope}
      href={href}
      className={cn(
        "group/compra relative isolate inline-flex max-w-full rounded-[4px] font-body outline-offset-4 outline-current focus-visible:outline-2",
        variantes[variante],
        tamanos[tamano],
        className
      )}
      {...props}
    >
      {decoracion && (
        // Va antes que la caja para quedar por detrás del cuerpo del botón
        <span
          aria-hidden
          className="pointer-events-none absolute top-0 right-[1.47em] left-0"
        >
          {/* En el botón pequeño los dibujos van a la mitad del tamaño grande */}
          <span
            data-btn="decoracion"
            className={cn(
              "absolute inset-0",
              tamano === "pequeno" && "text-[0.667em]"
            )}
          >
            <Ramo />
            <Copa lado="izquierda" />
            <Copa lado="derecha" />
            <Star
              data-btn="chispa"
              points={4}
              inner={0.3}
              className="invisible absolute -top-[4.4em] left-1/2 -ml-[0.55em] size-[1.1em] text-beige"
            />
            {confeti.map((angulo, i) => (
              <span
                key={angulo}
                data-btn="confeti"
                className={cn(
                  "invisible absolute -top-[3.2em] left-1/2 -ml-[0.16em] size-[0.32em] rounded-full",
                  i % 2 ? "bg-verde" : "bg-beige"
                )}
              />
            ))}
          </span>
        </span>
      )}

      <span
        data-btn="caja"
        className="relative flex grow pr-[1.47em] motion-reduce:group-hover/compra:opacity-90"
      >
        <span
          data-btn="cuerpo"
          className="relative flex min-h-[3.79em] grow items-center rounded-[4px] bg-(--cuerpo) py-[0.7em] pr-[2.75em] pl-[1.58em] text-(--tinta)"
        >
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-[0.37em] size-[calc(100%-0.74em)] overflow-visible"
          >
            {/* DrawSVG no dibuja bien una línea discontinua: los guiones se
                quedan fijos y lo que se dibuja es el trazo continuo de la máscara */}
            <mask id={mascara}>
              <rect
                data-btn="trazo"
                width="100%"
                height="100%"
                rx="2"
                fill="none"
                stroke="#fff"
                strokeWidth="4"
              />
            </mask>
            <rect
              data-btn="guiones"
              mask={`url(#${mascara})`}
              width="100%"
              height="100%"
              rx="2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 5"
            />
          </svg>
          <span
            data-btn="texto"
            className="relative leading-[1.15] font-semibold tracking-[0.12em] text-balance uppercase"
          >
            {children}
          </span>
        </span>
        <span
          data-btn="circulo"
          className="absolute top-1/2 right-0 grid size-[3.37em] -translate-y-1/2 place-items-center overflow-hidden rounded-full bg-(--tinta) text-(--cuerpo) shadow-[0_0_0_0.21em_var(--cuerpo)]"
        >
          <svg
            data-btn="flecha"
            aria-hidden
            viewBox="0 0 22 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[0.95em] w-[1.16em]"
          >
            <path d="M1.75 9h18.5M12.5 1.75 20.25 9l-7.75 7.25" />
          </svg>
        </span>
      </span>
    </a>
  )
}

export { BotonCompra }
