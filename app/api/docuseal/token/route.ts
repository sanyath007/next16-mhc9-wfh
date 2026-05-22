// app/api/docuseal/token/route.ts  — server only, generates embed token
import { NextResponse } from 'next/server'

const DOCUSEAL_URL = process.env.DOCUSEAL_URL || 'http://localhost:9000'
const DOCUSEAL_API_KEY = process.env.DOCUSEAL_API_KEY

export async function POST(req: Request) {
    try {
        const { submissionId } = await req.json()

        if (!DOCUSEAL_API_KEY) {
            return NextResponse.json({ error: 'DocuSeal API key not configured' }, { status: 500 })
        }

        const apiPrefix = DOCUSEAL_URL.includes('api.docuseal.com') ? '' : '/api'
        const targetUrl = `${DOCUSEAL_URL}${apiPrefix}/submitters/${submissionId}`

        const res = await fetch(targetUrl, {
            headers: { 'X-Auth-Token': DOCUSEAL_API_KEY },
        })

        if (!res.ok) {
            const error = await res.text()
            return NextResponse.json({ error }, { status: res.status })
        }

        const submitter = await res.json()
        return NextResponse.json({ token: submitter.embed_src })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}