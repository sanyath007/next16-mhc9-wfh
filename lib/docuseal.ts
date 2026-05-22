// lib/docuseal.ts
import docuseal from '@docuseal/api';

const DOCUSEAL_URL = process.env.DOCUSEAL_URL || process.env.DOCUSEAL_API_URL || 'http://localhost:9000';
const DOCUSEAL_API_KEY = process.env.DOCUSEAL_API_KEY;

docuseal.configure({
    key: DOCUSEAL_API_KEY!,
    // Ensure the URL ends with /api for the SDK if it doesn't already
    url: DOCUSEAL_URL.endsWith('/api') ? DOCUSEAL_URL : `${DOCUSEAL_URL.replace(/\/$/, '')}/api`,
});

export default docuseal;