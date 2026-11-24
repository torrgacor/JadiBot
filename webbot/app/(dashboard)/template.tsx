import type { ReactNode } from 'react'

/**
 * Page transition.
 *
 * A `template.tsx` re-mounts on every navigation, which is exactly what a
 * transition needs: the browser restarts the animation because the node is new.
 *
 * This is deliberately **CSS, not JavaScript**. It used to be a framer-motion
 * `motion.div`, and motion server-renders its `initial` state — so the entire
 * route, loading skeleton included, shipped as `style="opacity:0"` and stayed
 * invisible until the client bundle had finished hydrating. On a phone over the
 * tunnel that is several seconds of an apparently empty panel, and what finally
 * appears does so in one jump. A CSS animation gives the same fade for free, at
 * first paint, and the content stays readable even if the script never loads.
 *
 * Visitors who ask for reduced motion get no animation at all — see the
 * `prefers-reduced-motion` rule on `.page-enter` in `globals.css`.
 */
export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>
}
