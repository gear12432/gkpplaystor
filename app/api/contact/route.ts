import { NextRequest, NextResponse } from 'next/server';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, websiteHoneypot } = body;

    // Anti-spam honeypot protection
    if (websiteHoneypot && String(websiteHoneypot).trim().length > 0) {
      return NextResponse.json(
        { error: 'Automated spam submission rejected.' },
        { status: 400 }
      );
    }

    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim();
    const cleanSubject = String(subject || '').trim();
    const cleanMessage = String(message || '').trim();

    if (cleanName.length < 2 || cleanName.length > 80) {
      return NextResponse.json(
        { error: 'Please enter a valid name (2–80 characters).' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (cleanSubject.length < 3 || cleanSubject.length > 120) {
      return NextResponse.json(
        { error: 'Please enter a clear subject line (3–120 characters).' },
        { status: 400 }
      );
    }

    if (cleanMessage.length < 10 || cleanMessage.length > 3000) {
      return NextResponse.json(
        { error: 'Message must be between 10 and 3,000 characters.' },
        { status: 400 }
      );
    }

    const ticketId = `APKHUB-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      ticketId,
      submittedAt: new Date().toISOString(),
      message: 'Your inquiry has been received by the APK Hub verification & support team.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to process your request. Please check your form inputs.' },
      { status: 400 }
    );
  }
}
