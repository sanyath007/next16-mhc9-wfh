import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { templateId, signerEmail, signerName } = await req.json();

        const submission = await fetch(`${process.env.DOCUSEAL_URL}/api/submissions`, {
            method: 'POST',
            headers: {
                'X-Auth-Token': process.env.DOCUSEAL_API_KEY!,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                template_id: templateId,
                send_email: true, // DocuSeal emails the link directly
                submitters: [{ role: 'Second Party', email: signerEmail }],
            }),
        });

        return NextResponse.json(submission);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create submission' }, { status: 500 });
    }
}