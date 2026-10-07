import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { Draggable } from "gsap/Draggable"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { InertiaPlugin } from "gsap/InertiaPlugin"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(
  useGSAP,
  ScrollTrigger,
  SplitText,
  Draggable,
  InertiaPlugin,
  DrawSVGPlugin
)

export {
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  Draggable,
  InertiaPlugin,
  DrawSVGPlugin,
}
