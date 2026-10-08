import { cn } from "@/lib/utils"

const shapes = {
  rect: "",
  rounded: "rounded-[28px]",
  arch: "rounded-t-full rounded-b-lg",
  circle: "rounded-full",
  capsule: "rounded-full",
}

function Placeholder({
  slot,
  width,
  height,
  shape = "rect",
  on = "dark",
  label = "Imagen o ilustración",
  className,
}: {
  slot: string
  width: number
  height: number
  shape?: keyof typeof shapes
  on?: "dark" | "light"
  label?: string
  className?: string
}) {
  return (
    <div
      data-slot={slot}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={cn(
        "flex w-full items-center justify-center",
        on === "dark" ? "bg-beige/12 text-beige" : "bg-marron/12 text-marron",
        shapes[shape],
        className
      )}
    >
      <span className="text-xs tracking-[0.18em] uppercase opacity-70">
        {label}
      </span>
    </div>
  )
}

export { Placeholder }
