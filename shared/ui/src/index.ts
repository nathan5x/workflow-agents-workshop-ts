/**
 * A mountable telemetry viewer. Provides the dashboard page and the read-only
 * APIs it polls. The host app supplies the write path (POST /api/reviews) and
 * mounts this at the root:
 *
 *   app.route('/', createUiRouter('naive-agent'))
 */
import { readFile } from 'node:fs/promises'
import { Hono } from 'hono'
import { getFindings, getReview, getSpans, listReviews } from '@workshop/db'
import { dashboardHtml } from './page.js'

const stylesPath = new URL('../public/styles.css', import.meta.url)
const logoPath = new URL('../public/render_logo_white.svg', import.meta.url)

export function createUiRouter(title: string): Hono {
  const app = new Hono()

  app.get('/', async (c) => c.html(await dashboardHtml(title)))

  app.get('/dashboard.css', async (c) => {
    const css = await readFile(stylesPath, 'utf-8')
    return c.body(css, 200, { 'content-type': 'text/css; charset=utf-8' })
  })

  app.get('/render-logo.svg', async (c) => {
    const svg = await readFile(logoPath, 'utf-8')
    return c.body(svg, 200, { 'content-type': 'image/svg+xml; charset=utf-8' })
  })

  app.get('/api/reviews', async (c) => c.json(await listReviews(50)))

  app.get('/api/reviews/:id', async (c) => {
    const id = c.req.param('id')
    const review = await getReview(id)
    if (!review) return c.json({ error: 'not found' }, 404)
    const [findings, spans] = await Promise.all([getFindings(id), getSpans(id)])
    return c.json({ review, findings, spans })
  })

  return app
}

export { dashboardHtml }
