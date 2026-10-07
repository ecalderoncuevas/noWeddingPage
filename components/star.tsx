function Star({
  points,
  inner = 0.45,
  className,
}: {
  points: number
  inner?: number
  className?: string
}) {
  const vertices = Array.from({ length: points * 2 }, (_, i) => {
    const radius = i % 2 ? 50 * inner : 50
    const angle = (Math.PI * i) / points - Math.PI / 2
    return `${(50 + radius * Math.cos(angle)).toFixed(2)},${(50 + radius * Math.sin(angle)).toFixed(2)}`
  })

  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <polygon points={vertices.join(" ")} />
    </svg>
  )
}

export { Star }
