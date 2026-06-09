/** The telemetry viewer HTML shell. Markup lives in public/template.html. */
import { readFile } from 'node:fs/promises'

const templatePath = new URL('../public/template.html', import.meta.url)

export async function dashboardHtml(title: string): Promise<string> {
  const template = await readFile(templatePath, 'utf-8')
  return template.replaceAll('{{TITLE}}', escapeHtml(title))
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      default:
        return '&#39;'
    }
  })
}
