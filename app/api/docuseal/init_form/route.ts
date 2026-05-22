import { NextRequest, NextResponse } from "next/server";
import docuseal from "../../../../lib/docuseal";

async function createSubmission(templateId?: number, signerEmail?: string, signerName?: string | null) {
    // Default template ID if none provided (useful for testing)
    const DEFAULT_TEMPLATE_ID = 1; 

    try {
        const submissions = await docuseal.createSubmission({
            template_id: templateId || DEFAULT_TEMPLATE_ID,
            send_email: false, 
            submitters: [
                {
                    role: 'Second Party', // Reverted to user's original role
                    email: signerEmail || 'test@example.com',
                    name: signerName || 'User',
                },
            ],
        });

        console.log('DocuSeal Submission created:', submissions);
        
        // DocuSeal SDK returns an array of submissions
        if (submissions && submissions.submitters.length > 0) {
            return submissions.submitters[0];
        }

        throw new Error('No submission created');
    } catch (error: any) {
        console.error('DocuSeal SDK error:', error);
        throw error;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { templateId, signerEmail, signerName } = await req.json();
        const submission = await createSubmission(templateId, signerEmail, signerName);
        return NextResponse.json(submission);
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to create submission' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const templateId = searchParams.get('templateId') ? parseInt(searchParams.get('templateId')!) : undefined;
        const signerEmail = searchParams.get('email') || undefined;
        const signerName = searchParams.get('name') || undefined;

        const submission = await createSubmission(templateId, signerEmail, signerName);
        
        // Ensure we return the slug for the frontend
        return NextResponse.json({ 
            ...submission,
            slug: submission.slug 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Failed to initialize form' }, { status: 500 });
    }
}