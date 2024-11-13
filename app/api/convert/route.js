import { getRequestContext } from '@cloudflare/next-on-pages'
import remark from 'remark'
import html from 'remark-html'

export const runtime = 'edge'

export async function GET(request) {
  const url = new URL(request.url)
  const markdown = url.searchParams.get('markdown')
  const css = url.searchParams.get('css') || ''
  const storeResult = url.searchParams.get('store') || 'false'
  const customKey = url.searchParams.get('key') || null
  const history = url.searchParams.get('history') || 'false'

  // Check if markdown is provided
  if (!markdown) {
    return new Response('No markdown provided', { status: 400 })
  }

  console.log('Received markdown:', markdown); // Log markdown content for debugging

  try {
    // Attempt to convert markdown to HTML
    const htmlContent = await convertMarkdownToHtml(markdown, css)

    // Handle storing to history if requested
    if (history === 'true') {
      const { env } = getRequestContext()
      const kv = env.MY_KV_NAMESPACE
      const historyKey = 'history-list'
      let historyData = await kv.get(historyKey)

      // Parse the existing history, or initialize it
      historyData = historyData ? JSON.parse(historyData) : []

      // Add new entry to history
      const entry = { markdown, htmlContent, timestamp: Date.now() }
      historyData.push(entry)

      // Store the updated history
      await kv.put(historyKey, JSON.stringify(historyData))

      return new Response(JSON.stringify(historyData), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // If 'store' is true, store HTML to KV
    if (storeResult === 'true') {
      const { env } = getRequestContext()
      const kv = env.MY_KV_NAMESPACE
      const key = customKey || `html-${Date.now()}`
      await kv.put(key, htmlContent)
      return new Response(`Stored HTML with key: ${key}`, { status: 200 })
    }

    // Return the HTML content if no history or storage needed
    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    console.error('Error processing markdown:', error) // Log error details for debugging
    return new Response('Error processing markdown', { status: 500 })
  }
}

export async function POST(request) {
  const { markdown, css, store, customKey } = await request.json()

  // Check if markdown is provided
  if (!markdown) {
    return new Response('No markdown provided', { status: 400 })
  }

  console.log('Received markdown via POST:', markdown); // Log markdown content for debugging

  try {
    // Attempt to convert markdown to HTML
    const htmlContent = await convertMarkdownToHtml(markdown, css)

    // If 'store' is true, store HTML to KV
    if (store) {
      const { env } = getRequestContext()
      const kv = env.MY_KV_NAMESPACE
      const key = customKey || `html-${Date.now()}`
      await kv.put(key, htmlContent)
      return new Response(`Stored HTML with key: ${key}`, { status: 200 })
    }

    // Return the HTML content
    return new Response(htmlContent, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    console.error('Error processing markdown:', error) // Log error details for debugging
    return new Response('Error processing markdown', { status: 500 })
  }
}

async function convertMarkdownToHtml(markdown, css) {
  try {
    // Process markdown to HTML using remark
    const result = await remark().use(html).process(markdown)
    const htmlContent = result.toString()

    // If custom CSS is provided, wrap the HTML in a <style> tag
    if (css) {
      return `
        <style>${css}</style>
        <div class="markdown-body">${htmlContent}</div>
      `
    }

    return `<div class="markdown-body">${htmlContent}</div>`
  } catch (error) {
    console.error("Error in markdown processing:", error) // Log any error in the conversion process
    throw new Error("Error processing markdown")
  }
}
