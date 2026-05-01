import { NextRequest, NextResponse } from 'next/server';

// JDoodle language + versionIndex map
const LANGUAGE_MAP: Record<string, { language: string; versionIndex: string }> = {
    cpp:        { language: 'cpp17',      versionIndex: '0' },
    python:     { language: 'python3',    versionIndex: '3' },
    javascript: { language: 'nodejs',     versionIndex: '4' },
    typescript: { language: 'typescript', versionIndex: '3' },
    java:       { language: 'java',       versionIndex: '4' },
};

const JDOODLE_EXECUTE = 'https://api.jdoodle.com/v1/execute';

export async function POST(req: NextRequest) {
    const clientId     = process.env.JDOODLE_CLIENT_ID;
    const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        return NextResponse.json(
            { success: false, error: 'JDoodle credentials not configured in .env.local.' },
            { status: 500 }
        );
    }

    let body: { language?: string; code?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 });
    }

    const { language, code } = body;
    if (!language || !code) {
        return NextResponse.json(
            { success: false, error: 'Missing required fields: language, code.' },
            { status: 400 }
        );
    }

    const lang = LANGUAGE_MAP[language];
    if (!lang) {
        return NextResponse.json(
            { success: false, error: `Unsupported language: ${language}` },
            { status: 400 }
        );
    }

    try {
        const res = await fetch(JDOODLE_EXECUTE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                clientId,
                clientSecret,
                script:       code,
                stdin:        '',
                language:     lang.language,
                versionIndex: lang.versionIndex,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json(
                { success: false, error: data?.error || `JDoodle error: ${res.status}` },
                { status: 502 }
            );
        }

        // JDoodle statusCode 200 = success; non-200 or error field = runtime/compile error
        const output: string = data.output ?? '';
        const isError = data.statusCode !== 200 || output.toLowerCase().includes('error');

        return NextResponse.json({
            success:  !isError,
            output:   output.trim() || '(no output)',
            error:    isError ? output.trim() : undefined,
            cpuTime:  data.cpuTime,
            memory:   data.memory,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: `Network error reaching JDoodle: ${String(err)}` },
            { status: 502 }
        );
    }
}
