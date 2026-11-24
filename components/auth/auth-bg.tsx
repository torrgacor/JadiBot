import type { CSSProperties } from 'react'

/**
 * Auth canvas.
 *
 * Purely decorative: layered gradients, a faint engineering grid, a slow sweep
 * and a handful of particles. Every layer is `aria-hidden` and
 * `pointer-events-none`, so it costs the page nothing but depth — and nothing
 * here carries information, which is the point: the form is the whole story.
 *
 * Positions are a fixed list rather than random values, because random values
 * would render differently on the server and in the browser (React hydration
 * mismatch on a page whose only job is to render first).
 */
interface Particle {
  left: string
  top: string
  size: number
  duration: string
  delay: string
}

const PARTICLES: readonly Particle[] = [
  { left: '8%', top: '18%', size: 4, duration: '9s', delay: '0s' },
  { left: '22%', top: '72%', size: 3, duration: '11s', delay: '1.2s' },
  { left: '37%', top: '34%', size: 5, duration: '8.5s', delay: '2.4s' },
  { left: '51%', top: '86%', size: 3, duration: '12s', delay: '0.6s' },
  { left: '64%', top: '12%', size: 4, duration: '10s', delay: '3.1s' },
  { left: '78%', top: '58%', size: 3, duration: '9.5s', delay: '1.8s' },
  { left: '88%', top: '27%', size: 5, duration: '13s', delay: '2.9s' },
  { left: '15%', top: '48%', size: 3, duration: '10.5s', delay: '4.2s' },
  { left: '45%', top: '63%', size: 4, duration: '8s', delay: '3.6s' },
  { left: '70%', top: '79%', size: 3, duration: '11.5s', delay: '0.9s' },
  { left: '30%', top: '8%', size: 3, duration: '12.5s', delay: '2.1s' },
  { left: '93%', top: '70%', size: 4, duration: '9.2s', delay: '5s' },
]

function orbStyle(particle: Particle): CSSProperties {
  return {
    left: particle.left,
    top: particle.top,
    width: particle.size,
    height: particle.size,
    '--orb-duration': particle.duration,
    '--orb-delay': particle.delay,
  } as CSSProperties
}

export function AuthBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Two slow blooms so the black never reads as a flat fill. */}
      <div
        className="auth-anim-drift-a absolute -left-[18%] -top-[28%] h-[70vh] w-[70vw] rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--primary) 26%, transparent), transparent 68%)',
        }}
      />
      <div
        className="auth-anim-drift-b absolute -bottom-[32%] -right-[20%] h-[75vh] w-[65vw] rounded-full blur-[140px]"
        style={{
          background:
            'radial-gradient(circle, color-mix(in srgb, var(--accent) 18%, transparent), transparent 70%)',
        }}
      />

      {/* Engineering grid, faded toward the edges. */}
      <div className="grid-background radial-fade absolute inset-0 opacity-45" />
      <div className="auth-hud absolute inset-0 opacity-60" />

      {/* One slow sweep line — the only quick motion on the page. */}
      <div
        className="auth-anim-scan absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 55%, transparent) 50%, transparent)',
        }}
      />

      {/* Particles, each out of phase with the others. */}
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="auth-anim-orb absolute rounded-full bg-primary"
          style={orbStyle(particle)}
        />
      ))}

      {/* Corners darkened so the card always has something to sit against. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 75% at 50% 45%, transparent 35%, rgba(3, 3, 3, 0.72) 100%)',
        }}
      />
    </div>
  )
}

export default AuthBackground
