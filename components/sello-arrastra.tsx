import { useId } from "react"

import { cn } from "@/lib/utils"

// Silueta de la cera: redonda pero irregular, como lacre derretido
const cera =
  "M95.7 14.1C107.3 13 123 12.9 134.1 17.8C145.2 22.7 154.9 36.2 162.3 43.6C169.7 51.1 174 53.3 178.6 62.7C183.2 72.1 190.3 87.7 190 100C189.7 112.3 181.5 127.1 176.8 136.4C172.1 145.7 168.7 148.2 161.5 155.7C154.4 163.2 144.7 176.3 133.7 181.3C122.7 186.3 105.9 186.5 95.7 185.9C85.5 185.3 81.8 181.8 72.3 177.7C62.7 173.6 47.9 169.5 38.5 161.5C29.1 153.6 19.5 139.6 15.7 130.1C11.9 120.5 14.8 114.7 15.6 104.2C16.4 93.7 16.4 78.7 20.5 67.1C24.7 55.4 33.3 41.5 40.6 34.4C47.9 27.3 55.1 27.9 64.2 24.5C73.4 21.2 84.1 15.2 95.7 14.1Z"

const petalos = [0, 72, 144, 216, 288]
const estambres = Array.from({ length: 12 }, (_, i) => i * 30 + 15)

// Sello de lacre que hace de cursor sobre el marquee. Solo pinta: lo anima
// la sección, que llega a sus piezas por los data-sello
function SelloArrastra({ className, ...props }: React.ComponentProps<"div">) {
  const circulo = useId()

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none size-50", className)}
      {...props}
    >
      <div data-sello="cera" className="relative size-full">
        <svg viewBox="0 0 200 200" className="size-full overflow-visible">
          <path d={cera} strokeWidth="3" className="fill-lila stroke-beige" />
          <path
            d="M24.5 76.9A79 79 0 0 1 70.4 26.8"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeOpacity="0.7"
            className="stroke-[#8a4a6b]"
          />
          <circle
            cx="100"
            cy="100"
            r="58"
            strokeWidth="2.5"
            className="fill-[#5a2741] stroke-[#8a4a6b]"
          />
          <g
            strokeWidth="1.5"
            strokeLinejoin="round"
            className="fill-[#7e3a5e] stroke-[#4a1d35]"
          >
            {petalos.map((angulo) => (
              <path
                key={angulo}
                transform={`rotate(${angulo} 100 100)`}
                d="M100 96C86 86 84 62 100 54c16 8 14 32 0 42Z"
              />
            ))}
          </g>
          <g
            fill="none"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="stroke-[#a0607f]"
          >
            {estambres.map((angulo) => (
              <g key={angulo} transform={`rotate(${angulo} 100 100)`}>
                <path d="M100 90v-7" />
                <circle
                  cx="100"
                  cy="82"
                  r="1.6"
                  stroke="none"
                  className="fill-[#a0607f]"
                />
              </g>
            ))}
          </g>
          <circle cx="100" cy="100" r="7" className="fill-[#4a1d35]" />
        </svg>
        {/* El texto va en su propio SVG para girar sobre su centro, como las
            estrellas, mientras la flor se queda quieta */}
        <svg
          data-sello="texto"
          viewBox="0 0 200 200"
          className="absolute inset-0 size-full"
        >
          {/* Línea base a 67 del centro: las letras quedan centradas en 71 */}
          <path
            id={circulo}
            d="M100 33a67 67 0 1 1 0 134a67 67 0 1 1 0-134"
            fill="none"
          />
          {/* El espaciado está medido para que la frase dé la vuelta justa */}
          <text className="fill-beige font-body text-xs font-semibold tracking-[1.155em] uppercase">
            <textPath href={`#${circulo}`}>Arrastra • Arrastra •</textPath>
          </text>
        </svg>
      </div>
    </div>
  )
}

export { cera, SelloArrastra }
