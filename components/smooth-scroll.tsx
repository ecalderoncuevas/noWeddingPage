"use client"

import Lenis from "lenis"
import "lenis/dist/lenis.css"

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap"

function SmoothScroll() {
  useGSAP(() => {
    const mm = gsap.matchMedia()

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const lenis = new Lenis({ anchors: true })
      const raf = (time: number) => lenis.raf(time * 1000)

      lenis.on("scroll", ScrollTrigger.update)
      gsap.ticker.add(raf)
      gsap.ticker.lagSmoothing(0)

      return () => {
        gsap.ticker.remove(raf)
        lenis.destroy()
      }
    })
  })

  return null
}

export { SmoothScroll }
