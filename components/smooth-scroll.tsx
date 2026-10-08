"use client"

import Lenis from "lenis"
import "lenis/dist/lenis.css"

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap"

let lenis: Lenis | null = null

// Baja hasta un ancla a mano, para quien frena el clic del enlace
// (el botón de compra, mientras brindan las copas)
function irA(ancla: string) {
  if (lenis) lenis.scrollTo(ancla)
  else document.querySelector(ancla)?.scrollIntoView()
}

function SmoothScroll() {
  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const instancia = new Lenis({ anchors: true })
      const raf = (time: number) => instancia.raf(time * 1000)

      lenis = instancia
      instancia.on("scroll", ScrollTrigger.update)
      gsap.ticker.add(raf)
      gsap.ticker.lagSmoothing(0)

      return () => {
        gsap.ticker.remove(raf)
        instancia.destroy()
        lenis = null
      }
    })
  })

  return null
}

export { irA, SmoothScroll }
