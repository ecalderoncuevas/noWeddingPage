"use client"

import { useRef } from "react"

import { BotonCompra } from "@/components/boton-compra"
import {
  BOCA,
  BOCETO,
  BOTELLA,
  Bola,
  Botella,
  FACETA,
  meridianos,
  Sueltos,
  Tarta,
  Trayecto,
} from "@/components/footer-relleno"
import { evento } from "@/lib/datos-evento"
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap"
import { cn } from "@/lib/utils"

const enlaces = [
  { href: "#plan", texto: "El plan" },
  { href: "#novios", texto: "Los novios" },
  { href: "#invitaciones", texto: "Invitaciones" },
  { href: "#dudas", texto: "Dudas" },
]

// Fotos del fotomatón: huecos de color hasta que lleguen las definitivas
const fotos = [
  { cartel: "Nos", color: "bg-lila", giro: "-rotate-3" },
  { cartel: "Vemos", color: "bg-[#7a4763]", giro: "rotate-3" },
  { cartel: "En la", color: "bg-lila", giro: "-rotate-[3.5deg]" },
  { cartel: "¡Boda!", color: "bg-[#7a4763]", giro: "rotate-2" },
]

// Los dibujos están medidos sobre el diseño a 2000 px de ancho: una unidad
// de sus viewBox es un píxel de ese diseño
const TRAZO = 4.2
// La novia se dibuja al 85 %: su trazo se compensa para que no quede más fino
const NOVIA = 0.85
// Mano izquierda (viewBox 160 × 190): punto donde el meñique sujeta el hilo
const MANO = { ancho: 160, alto: 190, x: 156, y: 35 }
// Lo que cuelga el hilo, de la mano a la punta del corazón
const CAIDA = 95
// Inclinación del hilo al salir de la mano (alto / ancho)
const PENDIENTE = 0.27
// Punto medio entre las manos del novio, sobre su viewBox de 130 × 300
const AGARRE = "50% 5.8%"

// Hilo elástico: hasta dónde llega el cursor y cuánto se deja llevar
const ALCANCE = 160
const MAX_X = 120
const MAX_Y = 60

// Profundidad con el ratón, en píxeles. Los novios van dentro del cartel y
// suman su movimiento al de él: 6 + 10 = 16. Tarta, bola y botella quedan
// entre el fotomatón y los novios; estrellas y anillos, más cerca
const PROFUNDIDAD = {
  cartel: 6,
  tira: 10,
  novios: 10,
  relleno: 12,
  sueltos: 20,
}

// Copa de la novia en su viewBox de 240 × 360: ahí termina el corcho
const COPA = { x: 166, y: 60 }

function Novia() {
  return (
    <svg
      data-footer="novia"
      aria-hidden
      viewBox="0 0 240 360"
      fill="var(--marron)"
      stroke="var(--beige)"
      strokeWidth={TRAZO / NOVIA}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-full overflow-visible"
    >
      <path
        data-capa="velo"
        fill="none"
        d="M90 84C45 105 18 150 18 208c0 32 10 55 24 77"
      />
      <path
        data-capa="vestido"
        d="M95 153h44l36 135c8 27 11 50-5 60-15-7-30-7-43-1-12-6-32-9-56 2-15-9-19-39-9-71Z"
      />
      <path
        data-capa="brazo-abajo"
        fill="none"
        d="M100 166c-10 24-16 49-13 75"
      />
      <g data-footer="brindis">
        <path
          data-capa="brazo-arriba"
          fill="none"
          d="M135 162c25-22 45-47 59-80"
        />
        <path
          data-capa="copa"
          d="M185 43h26l-4 27q-9 8-18 0ZM198 76v24m-10 0h21"
        />
      </g>
      <g data-capa="chispas" fill="none">
        <path data-footer="chispa" d="m179 18 7 13" />
        <path data-footer="chispa" d="M196 12v14" />
        <path data-footer="chispa" d="m213 18-6 13" />
      </g>
      <circle data-capa="cabeza" cx="116" cy="120" r="31" />
      <text
        x="116"
        y="134"
        textAnchor="middle"
        fontSize="44"
        fontWeight="700"
        fill="var(--beige)"
        stroke="none"
        className="font-display"
      >
        ?
      </text>
    </svg>
  )
}

function Novio() {
  return (
    <svg
      data-footer="novio"
      aria-hidden
      viewBox="0 0 130 300"
      fill="var(--marron)"
      stroke="var(--beige)"
      strokeWidth={TRAZO}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-full overflow-visible"
    >
      <path data-capa="brazos" fill="none" d="M25 21 43 92M104 21 89 87" />
      <path data-capa="manos" fill="none" d="M16 17q9-7 19 0M94 17q10-7 21 0" />
      <path data-capa="pantalon" d="M31 205v77h26l8-56 8 56h30l-2-77Z" />
      <path data-capa="cuerpo" d="M37 129h58l6 76H31Z" />
      <path
        data-capa="pajarita"
        fill="var(--verde)"
        stroke="none"
        d="m50 131 15 7 16-7v13l-16-6-15 6Z"
      />
      <circle data-capa="cabeza" cx="66" cy="104" r="26" />
      <text
        x="66"
        y="116"
        textAnchor="middle"
        fontSize="36"
        fontWeight="700"
        fill="var(--beige)"
        stroke="none"
        className="font-display"
      >
        ?
      </text>
    </svg>
  )
}

// Brazo que sale del borde y sujeta el hilo con el meñique. La derecha es la
// misma, en espejo
function Mano({ lado }: { lado: "izquierda" | "derecha" }) {
  return (
    <svg
      data-footer="mano"
      data-lado={lado}
      aria-hidden
      viewBox={`0 0 ${MANO.ancho} ${MANO.alto}`}
      fill="none"
      stroke="var(--beige)"
      strokeWidth={TRAZO}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(
        "absolute top-0 w-24 overflow-visible md:w-[calc(var(--f)*0.512)]",
        lado === "izquierda"
          ? "-left-8 md:left-0"
          : "-right-8 -scale-x-100 md:right-0"
      )}
    >
      <path d="M0 120 101 43M0 184l123-109" />
      <path d="M101 43c-3-15 9-26 24-26 18 0 31 11 30 30-1 17-12 27-28 28h-4" />
      <path d="m145 19 8 14" />
    </svg>
  )
}

function Footer() {
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const q = gsap.utils.selector(scope)
      const footer = scope.current!
      const [zona] = q("[data-footer='zona']") as HTMLElement[]
      const [hilo] = q("[data-footer='hilo']")
      const [izquierda, derecha] = q("[data-footer='mitad']")
      const [corazon] = q("[data-footer='corazon']")
      const [manoI, manoD] = q("[data-footer='mano']")

      // El hilo se dibuja en píxeles reales: su viewBox es el tamaño de la
      // zona y las manos dicen dónde empieza cada mitad
      const geo = { escala: 1, ix: 0, dx: 0, my: 0, ax: 0, ay: 0 }
      const tiron = { x: 0, y: 0 }

      const medir = () => {
        const caja = zona.getBoundingClientRect()
        const i = manoI.getBoundingClientRect()
        const d = manoD.getBoundingClientRect()
        const escala = i.width / MANO.ancho

        geo.escala = escala
        geo.ix = i.left - caja.left + MANO.x * escala
        geo.dx = d.right - caja.left - MANO.x * escala
        geo.my = i.top - caja.top + MANO.y * escala
        geo.ax = caja.width / 2
        // En móvil el tramo es corto: el hilo cuelga menos para no ocupar tanto alto
        geo.ay = geo.my + Math.min(CAIDA * escala, (geo.ax - geo.ix) * 0.2)
        hilo.setAttribute("viewBox", `0 0 ${caja.width} ${caja.height}`)
        hilo.setAttribute("stroke-width", String(TRAZO * escala))
      }

      // Cada mitad es una Bézier de la mano a la punta del corazón: sale de la
      // mano hacia abajo y llega plana al corazón
      const mitad = (mx: number, ax: number, ay: number) => {
        const tramo = ax - mx
        return `M${mx} ${geo.my}C${mx + tramo * 0.3} ${geo.my + Math.abs(tramo) * 0.3 * PENDIENTE} ${ax - tramo * 0.35} ${ay} ${ax} ${ay}`
      }

      // Solo se llama al medir y en el onUpdate del tirón, nunca en cada pointermove
      const trazar = () => {
        const ax = geo.ax + tiron.x
        const ay = geo.ay + tiron.y
        const giro = gsap.utils.clamp(-8, 8, tiron.x * 0.06)

        izquierda.setAttribute("d", mitad(geo.ix, ax, ay))
        derecha.setAttribute("d", mitad(geo.dx, ax, ay))
        corazon.setAttribute(
          "transform",
          `translate(${ax} ${ay}) rotate(${giro}) scale(${geo.escala})`
        )
        corazon.setAttribute("visibility", "visible")
      }

      // Trayecto del corcho: de la boca de la botella a la copa de la novia,
      // medidas en la pantalla para que llegue a la copa a cualquier ancho
      const [trayecto] = q("[data-footer='trayecto']")
      const [camino] = q(
        "[data-footer='camino']"
      ) as unknown as SVGPathElement[]
      const [mascara] = q("[data-footer='trayecto-mascara']")
      const [corcho] = q("[data-footer='corcho']")
      const [botella] = q("[data-botella]")
      const [cartel] = q("[data-footer='cartel']")
      const [capaNovia] = q("[data-footer='novia']").map(
        (n) => n.parentElement!
      )
      const vuelo = { activo: false, x: 0, y: 0 }

      const apuntar = () => {
        // En móvil no hay botella
        if (!trayecto.getClientRects().length) return
        const caja = trayecto.getBoundingClientRect()
        const b = botella.getBoundingClientRect()
        const n = capaNovia.getBoundingClientRect()
        const escala = parseFloat(getComputedStyle(cartel).fontSize) / BOCETO

        const bx = b.left - caja.left + (b.width * BOCA.x) / BOTELLA.ancho
        const by = b.top - caja.top + (b.height * BOCA.y) / BOTELLA.alto
        const cx = n.left - caja.left + (n.width * COPA.x) / 240
        const cy = n.top - caja.top + (n.height * COPA.y) / 360
        // Sube deprisa al salir de la botella y llega casi plano a la copa
        const d = `M${bx} ${by}Q${bx + (cx - bx) * 0.3} ${cy - (by - cy) * 0.05} ${cx} ${cy}`

        trayecto.setAttribute("viewBox", `0 0 ${caja.width} ${caja.height}`)
        camino.setAttribute("d", d)
        camino.setAttribute("stroke-width", String(3.5 * escala))
        camino.setAttribute("stroke-dasharray", `0 ${10 * escala}`)
        mascara.setAttribute("d", d)
        mascara.setAttribute("stroke-width", String(12 * escala))
        q("[data-footer='corcho-dibujo']")[0].setAttribute(
          "transform",
          `rotate(-30) scale(${escala})`
        )
        vuelo.x = cx
        vuelo.y = cy
        // Mientras vuela lo mueve su animación
        if (!vuelo.activo) gsap.set(corcho, { x: cx, y: cy })
      }

      medir()
      trazar()
      apuntar()
      const observador = new ResizeObserver(() => {
        medir()
        trazar()
        apuntar()
      })
      observador.observe(zona)
      observador.observe(footer)

      const mm = gsap.matchMedia()

      mm.add(
        {
          animado: "(prefers-reduced-motion: no-preference)",
          ancho: "(min-width: 768px)",
          raton: "(min-width: 768px) and (hover: hover) and (pointer: fine)",
        },
        (context) => {
          const { animado, ancho, raton } = context.conditions!
          const novia = q("[data-footer='novia']")
          const novio = q("[data-footer='novio']")
          const tira = q("[data-footer='tira']")
          const entradas = q("[data-footer='entrada']")
          const relleno = q("[data-footer='relleno']")
          const sueltos = q("[data-footer='suelto']")

          // Sin animaciones: fundidos, con el hilo ya dibujado
          if (!animado) {
            gsap.from(
              [
                q("[data-footer='cartel']"),
                tira,
                ...relleno,
                trayecto,
                ...sueltos,
                q("[data-footer='zona']"),
                ...entradas,
              ],
              {
                autoAlpha: 0,
                duration: 0.6,
                stagger: 0.08,
                scrollTrigger: {
                  trigger: footer,
                  start: "top 70%",
                  once: true,
                },
              }
            )
            return
          }

          const [titular] = q("[data-footer='titular']")
          const letras = SplitText.create(titular, {
            type: "lines,chars",
            mask: "lines",
          }).chars
          const latido = q("[data-footer='latido']")
          const chispas = q("[data-footer='chispa']")

          // Un brindis: el brazo y la copa giran desde el hombro y las chispas
          // se apagan y vuelven a saltar
          const brindis = () =>
            gsap
              .timeline()
              .to(
                chispas,
                {
                  autoAlpha: 0,
                  scale: 0.4,
                  transformOrigin: "50% 100%",
                  duration: 0.15,
                },
                0
              )
              .to(
                q("[data-footer='brindis']"),
                {
                  rotation: -10,
                  svgOrigin: "135 162",
                  duration: 0.4,
                  ease: "sine.out",
                },
                0
              )
              .to(
                q("[data-footer='brindis']"),
                {
                  rotation: 0,
                  svgOrigin: "135 162",
                  duration: 0.4,
                  ease: "sine.inOut",
                },
                0.4
              )
              .to(
                chispas,
                {
                  autoAlpha: 1,
                  scale: 1,
                  duration: 0.3,
                  ease: "back.out(3)",
                  stagger: 0.06,
                },
                0.6
              )

          // Los bucles empiezan al terminar la entrada y se paran fuera de pantalla
          let visible = false
          let listo = false
          const bucles: gsap.core.Animation[] = []
          const mover = () => bucles.forEach((b) => b.paused(!visible))

          const vivir = () => {
            listo = true
            // El péndulo arranca en su punto medio, donde lo deja la entrada
            const pendulo = gsap
              .fromTo(
                novio,
                { rotation: -4 },
                {
                  rotation: 4,
                  transformOrigin: AGARRE,
                  duration: 2.4,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                }
              )
              .seek(1.2)
            const latir = gsap.to(latido, {
              keyframes: {
                scale: [1, 1.12, 1, 1.08, 1],
                easeEach: "sine.inOut",
              },
              transformOrigin: "50% 100%",
              duration: 0.6,
              ease: "none",
              repeat: -1,
              repeatDelay: 2.4,
            })
            const esperar = () => gsap.utils.random(3.5, 5)
            const brindar = gsap
              .timeline({
                repeat: -1,
                delay: esperar(),
                repeatDelay: esperar(),
                onRepeat: () => {
                  brindar.repeatDelay(esperar())
                },
              })
              .add(brindis())

            // La bola gira: sus facetas avanzan una separación y vuelven a empezar
            const facetas = q("[data-footer='meridiano']")
            const fase = { valor: 0 }
            const girar = gsap.to(fase, {
              valor: FACETA,
              duration: 2.4,
              ease: "none",
              repeat: -1,
              onUpdate: () =>
                meridianos(fase.valor).forEach((d, i) =>
                  facetas[i].setAttribute("d", d)
                ),
            })
            const [vaiven] = q("[data-footer='vaiven']")
            const balancear = gsap
              .fromTo(
                vaiven,
                { rotation: -3 },
                {
                  rotation: 3,
                  svgOrigin: vaiven.dataset.origen,
                  duration: 2.2,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                }
              )
              .seek(1.1)
            // Cada destello y cada estrella titila a su ritmo
            const titilar = (estrellas: Element[], min: number, max: number) =>
              estrellas.map((estrella) =>
                gsap.fromTo(
                  estrella,
                  { scale: 1, autoAlpha: 1 },
                  {
                    scale: 0.4,
                    autoAlpha: 0.4,
                    transformOrigin: "50% 50%",
                    duration: gsap.utils.random(min, max),
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                  }
                )
              )
            // Los novios de la tarta, a destiempo: el segundo va 0,9 s (un
            // cuarto de vaivén) por detrás del primero
            const munecos = q("[data-footer='muneco']").map((muneco, i) =>
              gsap
                .fromTo(
                  muneco,
                  { rotation: -6 },
                  {
                    rotation: 6,
                    svgOrigin: muneco.dataset.base,
                    duration: 1.8,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                  }
                )
                .seek(i ? 0 : 0.9)
            )

            bucles.push(
              pendulo,
              latir,
              brindar,
              girar,
              balancear,
              ...munecos,
              ...titilar(q("[data-footer='destello']"), 1, 2),
              ...titilar(q("[data-estrella]"), 2, 3)
            )
            mover()
          }

          ScrollTrigger.create({
            trigger: footer,
            onToggle: ({ isActive }) => {
              visible = isActive
              mover()
            },
          })

          // Una sola timeline con el segundo exacto de cada paso, como en el hero
          const entrada = gsap
            .timeline({
              paused: true,
              defaults: { ease: "power3.out" },
              onComplete: vivir,
            })
            .from(
              [izquierda, derecha],
              {
                drawSVG: "0%",
                duration: 1,
                ease: "power2.inOut",
                // Sin restos del dibujo: el hilo elástico cambia su largo
                onComplete: () =>
                  gsap.set([izquierda, derecha], { clearProps: "all" }),
              },
              0
            )
            .from(
              q("[data-footer='mano']"),
              { autoAlpha: 0, duration: 0.6 },
              0.2
            )
            .from(letras, { yPercent: 100, duration: 0.8, stagger: 0.03 }, 0.3)
            .from(tira, { y: -80, autoAlpha: 0, duration: 0.7 }, 0.6)
            // Cada foto sale en blanco y se revela como recién impresa
            .fromTo(
              q("[data-footer='flash']"),
              { opacity: 1 },
              { opacity: 0, duration: 0.25, ease: "power1.out", stagger: 0.2 },
              0.9
            )
            .from(
              q("[data-footer='rubrica']"),
              { drawSVG: "0%", duration: 0.6, ease: "power2.inOut" },
              0.8
            )
            .from(
              q("[data-footer='corazon-trazo']"),
              { drawSVG: "0%", duration: 0.3, ease: "power1.inOut" },
              0.9
            )
            .to(
              latido,
              {
                keyframes: { scale: [1, 1.2, 1], easeEach: "sine.inOut" },
                transformOrigin: "50% 100%",
                duration: 0.4,
                ease: "none",
              },
              1.2
            )
            .from(
              novia,
              {
                y: -30,
                scale: 0.8,
                autoAlpha: 0,
                transformOrigin: "50% 100%",
                duration: 0.6,
                ease: "back.out(2)",
              },
              1
            )
            .from(
              q("[data-footer='parejas']"),
              { autoAlpha: 0, duration: 0.5 },
              1
            )
            // La opacidad va aparte: con el rebote elástico parpadearía
            .from(novio, { autoAlpha: 0, duration: 0.2 }, 1.1)
            .from(
              novio,
              {
                rotation: 25,
                transformOrigin: AGARRE,
                duration: 1.4,
                ease: "elastic.out(1, 0.4)",
              },
              1.1
            )
            .from(
              entradas,
              { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.05 },
              1.6
            )
            .from(
              [...relleno, ...sueltos],
              {
                y: 20,
                autoAlpha: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.6)",
              },
              1
            )
            // La novia brinda cuando le llega el corcho
            .add(brindis(), 2)

          // En móvil no hay botella: el corcho no tiene de dónde salir
          if (ancho)
            entrada
              // El corcho sale disparado hacia la copa mientras se dibuja su estela
              .set(trayecto, { visibility: "visible" }, 1.3)
              .fromTo(
                mascara,
                { drawSVG: "0%" },
                {
                  drawSVG: "100%",
                  duration: 0.7,
                  ease: "power2.out",
                  // Sin restos del dibujo: el trazado cambia con el ancho
                  onComplete: () => gsap.set(mascara, { clearProps: "all" }),
                },
                1.3
              )
              .fromTo(
                corcho,
                { rotation: 0 },
                {
                  rotation: 360,
                  motionPath: {
                    path: camino,
                    align: camino,
                    alignOrigin: [0.5, 0.5],
                  },
                  duration: 0.7,
                  ease: "power2.out",
                  immediateRender: false,
                  onStart: () => {
                    vuelo.activo = true
                  },
                  onComplete: () => {
                    vuelo.activo = false
                    gsap.set(corcho, { x: vuelo.x, y: vuelo.y })
                  },
                },
                1.3
              )
              .fromTo(
                q("[data-footer='gota']"),
                { scale: 0 },
                {
                  scale: 1,
                  transformOrigin: "50% 50%",
                  duration: 0.3,
                  ease: "back.out(2)",
                  stagger: 0.05,
                },
                1.3
              )
              .to(
                q("[data-footer='gota']"),
                { autoAlpha: 0, duration: 0.4, stagger: 0.05 },
                1.75
              )

          // El segundo novio de la tarta espera inclinado donde empieza su vaivén
          const [, segundo] = q("[data-footer='muneco']")
          gsap.set(segundo, { rotation: -6, svgOrigin: segundo.dataset.base })

          // El titular espera oculto por CSS; sus letras ya están bajo la máscara
          gsap.set(titular, { visibility: "visible" })

          ScrollTrigger.create({
            trigger: footer,
            start: "top 70%",
            once: true,
            onEnter: () => entrada.play(),
          })

          if (!raton) return

          // Profundidad: cada capa se aleja del cursor según lo cerca que esté
          const capas = (
            ["cartel", "tira", "novios", "relleno", "sueltos"] as const
          ).flatMap((nombre) =>
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

          // El tirón sigue al cursor con suavidad y, al soltarlo, rebota
          const seguir = {
            x: gsap.quickTo(tiron, "x", {
              duration: 0.5,
              ease: "power3.out",
              onUpdate: trazar,
            }),
            y: gsap.quickTo(tiron, "y", {
              duration: 0.5,
              ease: "power3.out",
              onUpdate: trazar,
            }),
          }
          const volver = {
            x: gsap.quickTo(tiron, "x", {
              duration: 1.2,
              ease: "elastic.out(1, 0.35)",
              onUpdate: trazar,
            }),
            y: gsap.quickTo(tiron, "y", {
              duration: 1.2,
              ease: "elastic.out(1, 0.35)",
              onUpdate: trazar,
            }),
          }
          let tenso = false

          const soltar = () => {
            if (!tenso) return
            tenso = false
            seguir.x.tween.pause()
            seguir.y.tween.pause()
            volver.x(0)
            volver.y(0)
          }

          const alMover = (e: PointerEvent) => {
            if (!listo || !visible) return

            const caja = footer.getBoundingClientRect()
            const nx = ((e.clientX - caja.left) / caja.width) * 2 - 1
            const ny = ((e.clientY - caja.top) / caja.height) * 2 - 1
            capas.forEach((capa) => {
              capa.x(-nx * capa.max)
              capa.y(-ny * capa.max)
            })

            const zonaCaja = zona.getBoundingClientRect()
            const cx = e.clientX - zonaCaja.left
            const cy = e.clientY - zonaCaja.top
            const cerca =
              Math.abs(cy - geo.ay) < ALCANCE && cx > geo.ix && cx < geo.dx
            if (!cerca) return soltar()

            if (!tenso) {
              tenso = true
              volver.x.tween.pause()
              volver.y.tween.pause()
            }
            seguir.x(gsap.utils.clamp(-MAX_X, MAX_X, (cx - geo.ax) * 0.3))
            seguir.y(gsap.utils.clamp(-MAX_Y, MAX_Y, (cy - geo.ay) * 0.5))
          }

          const alSalir = () => {
            capas.forEach((capa) => {
              capa.x(0)
              capa.y(0)
            })
            soltar()
          }

          footer.addEventListener("pointermove", alMover)
          footer.addEventListener("pointerleave", alSalir)
          return () => {
            footer.removeEventListener("pointermove", alMover)
            footer.removeEventListener("pointerleave", alSalir)
          }
        }
      )

      return () => observador.disconnect()
    },
    { scope }
  )

  return (
    <footer
      ref={scope}
      className="seccion relative isolate overflow-hidden bg-marron pt-[clamp(6rem,26vw,9rem)] pb-8 text-beige md:pt-[calc(var(--f)*0.16)] md:[--f:min(12.5vw,19svh)]"
    >
      <div
        aria-hidden
        className="grano pointer-events-none absolute inset-0 -z-10 opacity-12"
      />

      {/* Relleno de los laterales: solo desde 768 px. Va antes del cartel
          para quedar por detrás de la novia */}
      <Sueltos />
      <Botella />
      <Tarta />
      <Bola />
      <Trayecto />

      {/* Cartel: los novios y la rúbrica se colocan en em, así siguen
          pegados a la N y a la E a cualquier tamaño de letra */}
      <div
        data-footer="cartel"
        data-profundidad="cartel"
        className="relative mx-auto w-fit font-display text-[22vw] [--tope:0.035em] md:mt-[1em] md:text-[length:var(--f)]"
      >
        <p
          data-footer="titular"
          className="text-center leading-[0.8] tracking-[-0.01em]"
        >
          <span className="block font-bold uppercase">Nadie</span>
          <span className="-my-[0.03em] block text-[0.655em] leading-[1.1] italic">
            se
          </span>
          <span className="block font-bold uppercase">Casa!</span>
        </p>

        <svg
          data-footer="rubrica"
          aria-hidden
          viewBox="0 0 650 55"
          fill="none"
          stroke="var(--beige)"
          strokeWidth="3.2"
          strokeLinecap="round"
          className="pointer-events-none absolute top-[calc(var(--tope)+1.069em)] left-[0.3em] w-[2.06em] overflow-visible"
        >
          <path d="M0 47C70 30 160 15 250 22c80 6 170 24 270 23 60-1 105-15 130-40" />
        </svg>

        <span
          aria-hidden
          className="absolute top-[calc(var(--tope)-0.3em)] left-[2.195em]"
        >
          <span
            data-footer="parejas"
            className="block text-[0.117em] leading-none font-bold whitespace-nowrap text-verde"
          >
            ? & ?
          </span>
        </span>

        <div
          data-profundidad="novios"
          className="absolute top-[calc(var(--tope)-0.98em)] left-[-0.404em] h-[1.055em] w-[0.704em]"
        >
          <Novia />
        </div>
        <div
          data-profundidad="novios"
          className="absolute top-[calc(var(--tope)+0.665em)] left-[2.275em] h-[1.034em] w-[0.448em]"
        >
          <Novio />
        </div>
      </div>

      {/* Tira del fotomatón: girada a la izquierda en escritorio, en fila debajo
          del cartel en móvil */}
      <div
        data-profundidad="tira"
        className="@container mx-auto mt-14 w-[min(100%-2.5rem,26rem)] md:absolute md:top-[calc(var(--f)*0.96)] md:left-[4.375vw] md:mt-0 md:w-[calc(var(--f)*0.728)]"
      >
        <div
          data-footer="tira"
          className="-rotate-2 rounded-[6px] bg-[#3f2a21] px-[2.5cqw] pt-[2.5cqw] md:rotate-[4deg] md:px-[7cqw] md:pt-[5.7cqw]"
        >
          <ol className="grid grid-cols-4 gap-[2.5cqw] md:grid-cols-1 md:gap-[5.7cqw]">
            {fotos.map((foto) => (
              <li
                key={foto.cartel}
                className={cn(
                  "@container relative flex aspect-[195/175] items-end justify-center overflow-hidden pb-[12cqw]",
                  foto.color
                )}
              >
                <span
                  className={cn(
                    "grid h-[36cqw] w-[70cqw] place-items-center bg-[#fbf8ee] font-manuscrita text-[19.5cqw] leading-none text-marron uppercase",
                    foto.giro
                  )}
                >
                  {foto.cartel}
                </span>
                <span
                  data-footer="flash"
                  aria-hidden
                  className="absolute inset-0 bg-white opacity-0"
                />
              </li>
            ))}
          </ol>
          <p className="py-[1.5cqw] text-center font-manuscrita text-sm leading-none md:py-[3cqw] md:text-[8cqw]">
            [{evento.fecha}]
          </p>
        </div>
      </div>

      {/* Hilo con corazón entre dos manos: va a todo el ancho de la pantalla */}
      <div
        data-footer="zona"
        className="relative mt-16 h-[70px] md:mt-[calc(var(--f)*0.16)] md:h-[calc(var(--f)*0.608)]"
      >
        <Mano lado="izquierda" />
        <Mano lado="derecha" />
        <svg
          data-footer="hilo"
          aria-hidden
          fill="none"
          stroke="var(--beige)"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute inset-0 size-full overflow-visible"
        >
          <path data-footer="mitad" />
          <path data-footer="mitad" />
          <g data-footer="corazon" visibility="hidden" strokeWidth={TRAZO}>
            <g data-footer="latido">
              <path
                data-footer="corazon-trazo"
                fill="var(--marron)"
                d="M0 0c-20-15-48-38-49-58-1-14 7-20 17-20s22 8 32 15c10-7 22-15 32-15s18 6 17 20C48-38 20-15 0 0Z"
              />
            </g>
          </g>
        </svg>
      </div>

      <div className="contenedor">
        <BotonCompra
          data-footer="entrada"
          decoracion
          className="col-span-full mt-4 justify-self-center md:mt-[calc(var(--f)*0.08)]"
        >
          Comprar invitación
        </BotonCompra>

        <p
          data-footer="entrada"
          className="col-span-full mt-14 text-center font-manuscrita text-[clamp(1.75rem,1.77vw,2.25rem)] leading-[1.15] lg:col-span-3 lg:mt-16 lg:text-left"
        >
          Reserva tu sitio en
          <br />
          {evento.correo}
        </p>

        <div
          data-footer="entrada"
          className="col-span-full mt-8 text-center lg:col-span-6 lg:col-start-4 lg:mt-16 lg:self-start"
        >
          <nav aria-label="Pie de página">
            <ul className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-[clamp(0.9375rem,1vw,1.1875rem)] font-semibold tracking-[0.18em] text-verde uppercase">
              {enlaces.map((enlace, i) => (
                <li key={enlace.href} className="flex gap-2">
                  {i > 0 && <span aria-hidden>·</span>}
                  <a
                    href={enlace.href}
                    className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:after:scale-x-100"
                  >
                    {enlace.texto}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="mt-3 text-[clamp(0.9375rem,1vw,1.1875rem)] tracking-[0.1em]">
            {evento.fecha} | {evento.hora}
          </p>
        </div>

        <p
          data-footer="entrada"
          className="col-span-full mt-8 text-center font-manuscrita text-[clamp(1.75rem,1.77vw,2.25rem)] leading-[1.15] lg:col-span-3 lg:mt-16 lg:text-right"
        >
          {evento.lugar},
          <br />
          {evento.ciudad}
        </p>

        <div
          data-footer="entrada"
          className="col-span-full mt-12 flex flex-col items-center gap-2 border-t border-beige/30 pt-6 text-center text-sm md:flex-row md:justify-between md:text-left lg:mt-14"
        >
          <p className="font-semibold text-verde">{evento.marca} © 2026</p>
          <p className="text-beige/60">
            Aviso: en este evento no se casa nadie. De verdad.
          </p>
          <p className="font-semibold text-verde">Proyecto de DAW 2</p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
