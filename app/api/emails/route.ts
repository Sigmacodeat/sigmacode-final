import { Resend } from 'resend';
import type { NextRequest } from 'next/server';

// Email service configuration
let resend: {
  emails: {
    send: (arg0: {
      from: string;
      to: string[] | string[];
      subject: string;
      html: string;
      text?: string;
    }) => any;
  };
} | null = null;
const getResendClient = () => {
  if (!resend && process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
};

// Email templates as HTML strings
interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// Helper function to create HTML email templates
function createEmailTemplate(subject: string, content: string): EmailTemplate {
  return {
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${content}
        </body>
      </html>
    `,
  };
}

// Welcome email template function
function createWelcomeEmail(name: string): EmailTemplate {
  const content = `
    <h1 style="color: #0066cc;">Willkommen bei SIGMACODE AI!</h1>
    <p>Hallo ${name},</p>
    <p>Willkommen bei SIGMACODE AI - der Security-First AI Platform für Enterprise-Anwendungen.</p>
    <p>Mit unserer KI-Firewall schützen wir Ihre Daten und gewährleisten Compliance in allen Bereichen.</p>
    <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">🚀 Erste Schritte:</h3>
      <ul>
        <li>Erkunden Sie unsere 24+ Use Cases</li>
        <li>Testen Sie die AI-Firewall</li>
        <li>Richten Sie Ihr erstes Projekt ein</li>
      </ul>
    </div>
    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
    <p>Mit freundlichen Grüßen,<br/>Das SIGMACODE AI Team</p>
  `;
  return createEmailTemplate('Willkommen bei SIGMACODE AI', content);
}

// Contact form email template function
function createContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
): EmailTemplate {
  const content = `
    <h1 style="color: #0066cc;">Neue Kontaktanfrage</h1>
    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Kontaktdaten:</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Betreff:</strong> ${subject}</p>
      <h3>Nachricht:</h3>
      <p style="white-space: pre-wrap;">${message}</p>
    </div>
    <p>Diese Nachricht wurde automatisch generiert. Bitte antworten Sie direkt an ${email}.</p>
  `;
  return createEmailTemplate(`Kontaktanfrage: ${subject}`, content);
}

// Password reset email template function
function createPasswordResetEmail(name: string, resetLink: string): EmailTemplate {
  const content = `
    <h1 style="color: #0066cc;">Passwort zurücksetzen</h1>
    <p>Hallo ${name},</p>
    <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts erhalten.</p>
    <p>Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a
        href="${resetLink}"
        style="
          background-color: #0066cc;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          display: inline-block;
        "
      >
        Passwort zurücksetzen
      </a>
    </div>
    <p><strong>⚠️ Sicherheitshinweis:</strong> Dieser Link ist 1 Stunde gültig.</p>
    <p>Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail einfach.</p>
    <p>Mit freundlichen Grüßen,<br/>Das SIGMACODE AI Team</p>
  `;
  return createEmailTemplate('Passwort zurücksetzen - SIGMACODE AI', content);
}

// Demo request email template function
function createDemoRequestEmail(
  name: string,
  email: string,
  company?: string,
  useCase?: string,
): EmailTemplate {
  const content = `
    <h1 style="color: #0066cc;">Demo-Anfrage erhalten</h1>
    <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3>Demo-Anfrage Details:</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${company ? `<p><strong>Unternehmen:</strong> ${company}</p>` : ''}
      ${useCase ? `<p><strong>Use Case:</strong> ${useCase}</p>` : ''}
    </div>
    <p>Ein Mitglied unseres Teams wird sich in Kürze bei Ihnen melden, um einen Demo-Termin zu vereinbaren.</p>
    <p>Mit freundlichen Grüßen,<br/>Das SIGMACODE AI Team</p>
  `;
  return createEmailTemplate('Demo-Anfrage erhalten - SIGMACODE AI', content);
}

// User confirmation email template
function createConfirmationEmail(name: string, type: 'contact' | 'demo'): EmailTemplate {
  const subjects = {
    contact: 'Ihre Kontaktanfrage wurde erhalten',
    demo: 'Demo-Anfrage bestätigt',
  };

  const messages = {
    contact:
      'Ihre Kontaktanfrage wurde erfolgreich erhalten. Wir werden uns in Kürze bei Ihnen melden.',
    demo: 'Ihre Demo-Anfrage wurde erhalten. Unser Team wird sich in Kürze bei Ihnen melden.',
  };

  const content = `
    <h1 style="color: #0066cc;">${subjects[type]}</h1>
    <p>Hallo ${name},</p>
    <p>${messages[type]}</p>
    <p>Mit freundlichen Grüßen,<br/>Das SIGMACODE AI Team</p>
  `;

  return createEmailTemplate(subjects[type], content);
}

// Email service class
class EmailService {
  private static instance: EmailService;

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const resendClient = getResendClient();
    if (!resendClient) {
      console.warn('Resend API key not configured, skipping email send');
      return;
    }

    try {
      const template = createWelcomeEmail(name);

      await resendClient.emails.send({
        from: 'noreply@sigmacode.ai',
        to: [to],
        subject: template.subject,
        html: template.html,
        text: `Hallo ${name}, willkommen bei SIGMACODE AI!`,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendContactEmail(
    name: string,
    email: string,
    subject: string,
    message: string,
  ): Promise<void> {
    const resendClient = getResendClient();
    if (!resendClient) {
      console.warn('Resend API key not configured, skipping email send');
      return;
    }

    try {
      const adminTemplate = createContactEmail(name, email, subject, message);
      const userTemplate = createConfirmationEmail(name, 'contact');

      // Send to admin
      await resendClient.emails.send({
        from: 'noreply@sigmacode.ai',
        to: ['admin@sigmacode.ai'],
        subject: adminTemplate.subject,
        html: adminTemplate.html,
      });

      // Send confirmation to user
      await resendClient.emails.send({
        from: 'noreply@sigmacode.ai',
        to: [email],
        subject: userTemplate.subject,
        html: userTemplate.html,
      });
    } catch (error) {
      console.error('Failed to send contact email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<void> {
    const resendClient = getResendClient();
    if (!resendClient) {
      console.warn('Resend API key not configured, skipping email send');
      return;
    }

    try {
      const template = createPasswordResetEmail(name, resetLink);

      await resendClient.emails.send({
        from: 'noreply@sigmacode.ai',
        to: [to],
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendDemoRequestEmail(
    name: string,
    email: string,
    company?: string,
    useCase?: string,
  ): Promise<void> {
    const resendClient = getResendClient();
    if (!resendClient) {
      console.warn('Resend API key not configured, skipping email send');
      return;
    }

    try {
      const salesTemplate = createDemoRequestEmail(name, email, company, useCase);
      const userTemplate = createConfirmationEmail(name, 'demo');

      // Send to sales team
      await resendClient.emails.send({
        from: 'noreply@sigmacode.ai',
        to: ['sales@sigmacode.ai'],
        subject: salesTemplate.subject,
        html: salesTemplate.html,
      });

      // Send confirmation to user
      await resendClient.emails.send({
        from: 'noreply@sigmacode.ai',
        to: [email],
        subject: userTemplate.subject,
        html: userTemplate.html,
      });
    } catch (error) {
      console.error('Failed to send demo request email:', error);
      throw error;
    }
  }

  async sendNewsletter(to: string[], subject: string, content: string): Promise<void> {
    const resendClient = getResendClient();
    if (!resendClient) {
      console.warn('Resend API key not configured, skipping email send');
      return;
    }

    try {
      await resendClient.emails.send({
        from: 'newsletter@sigmacode.ai',
        to,
        subject,
        html: content,
      });
    } catch (error) {
      console.error('Failed to send newsletter:', error);
      throw error;
    }
  }
}

// API route for sending emails
export async function POST(request: NextRequest) {
  try {
    const raw: unknown = await request.json();
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return Response.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }
    const { type, ...data } = raw as Record<string, any> & { type?: string };

    const emailService = EmailService.getInstance();

    switch (type) {
      case 'welcome':
        await emailService.sendWelcomeEmail(data.email, data.name);
        break;
      case 'contact':
        await emailService.sendContactEmail(data.name, data.email, data.subject, data.message);
        break;
      case 'password-reset':
        await emailService.sendPasswordResetEmail(data.email, data.name, data.resetLink);
        break;
      case 'demo-request':
        await emailService.sendDemoRequestEmail(data.name, data.email, data.company, data.useCase);
        break;
      case 'newsletter':
        await emailService.sendNewsletter(data.to, data.subject, data.content);
        break;
      default:
        return Response.json({ error: 'Invalid email type' }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Email API Error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
