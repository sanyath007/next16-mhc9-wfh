// app/api/docuseal/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const DOCUSEAL_URL = process.env.DOCUSEAL_URL || 'http://localhost:9000'
const DOCUSEAL_API_KEY = process.env.DOCUSEAL_API_KEY

async function proxyToDocuSeal(request: NextRequest, { path }: { path: string[] }) {
    if (!DOCUSEAL_API_KEY) {
        return NextResponse.json({ error: 'DocuSeal API key not configured' }, { status: 500 })
    }

    // Determine if we need to add /api prefix (self-hosted needs it, cloud usually doesn't if base URL is api.docuseal.com)
    // But based on the token route, it seems the user expects /api prefix.
    const apiPrefix = DOCUSEAL_URL.includes('api.docuseal.com') ? '' : '/api'
    const targetUrl = `${DOCUSEAL_URL}${apiPrefix}/${path.join('/')}`

    try {
        const body = request.method !== 'GET' && request.method !== 'HEAD'
            ? await request.arrayBuffer()
            : undefined

        const headers = new Headers(request.headers)
        headers.set('X-Auth-Token', DOCUSEAL_API_KEY)
        headers.delete('host')
        headers.delete('connection')

        const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            body,
            // @ts-ignore
            duplex: body ? 'half' : undefined,
        })

        const contentType = response.headers.get('content-type')

        if (contentType?.includes('application/json')) {
            const data = await response.json()
            return NextResponse.json(data, { status: response.status })
        } else {
            let body: any = await response.arrayBuffer()
            
            // If it's HTML, we inject a <base> tag to fix relative URLs for assets/links
            // and we also strip restrictive headers by not including them in the new response
            if (contentType?.includes('text/html')) {
                const decoder = new TextDecoder()
                let html = decoder.decode(body)
                
                // Inject <base> tag. This tells the browser to resolve all relative links 
                // (scripts, css, images, etc.) against the original DocuSeal URL.
                const baseTag = `<base href="${DOCUSEAL_URL}/">`
                if (html.includes('<head>')) {
                    html = html.replace('<head>', `<head>${baseTag}`)
                } else if (html.includes('<html>')) {
                    html = html.replace('<html>', `<html><head>${baseTag}</head>`)
                } else {
                    html = baseTag + html
                }
                
                body = html
            }

            return new NextResponse(body, {
                status: response.status,
                headers: {
                    'Content-Type': contentType || 'text/plain',
                    // We explicitly do NOT forward 'X-Frame-Options' or 'Content-Security-Policy'
                    // from the destination to allow embedding.
                },
            })
        }
    } catch (error: any) {
        console.error('DocuSeal proxy error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params
    return proxyToDocuSeal(req, { path })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params
    return proxyToDocuSeal(req, { path })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params
    return proxyToDocuSeal(req, { path })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params
    return proxyToDocuSeal(req, { path })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params
    return proxyToDocuSeal(req, { path })
}