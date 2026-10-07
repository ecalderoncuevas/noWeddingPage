import { Concepto } from "@/components/sections/Concepto"
import { Hero } from "@/components/sections/Hero"
import { Invitaciones } from "@/components/sections/Invitaciones"
import { Novios } from "@/components/sections/Novios"
import { OrdenDelDia } from "@/components/sections/OrdenDelDia"

export default function Page() {
  return (
    <main>
      <Hero />
      <Concepto />
      <Novios />
      <OrdenDelDia />
      <Invitaciones />
    </main>
  )
}
