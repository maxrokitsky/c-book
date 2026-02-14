import { shallowRef } from 'vue'
import type MarkdownIt from 'markdown-it'

const md = shallowRef<MarkdownIt | null>(null)
let loadPromise: Promise<MarkdownIt> | null = null

async function ensureMarkdownIt(): Promise<MarkdownIt> {
  if (md.value) return md.value
  if (loadPromise) return loadPromise

  loadPromise = import('markdown-it').then((module) => {
    const MarkdownIt = module.default
    const instance = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })
    md.value = instance
    return instance
  })

  return loadPromise
}

export function useMarkdownRenderer() {
  async function render(markdown: string): Promise<string> {
    const instance = await ensureMarkdownIt()
    return instance.render(markdown)
  }

  return { render }
}
