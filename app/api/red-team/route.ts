import { NextRequest, NextResponse } from 'next/server';
import { redTeamService, DEFAULT_ATTACK_TEMPLATES } from '@/lib/red-team-service';
import { z } from 'zod';

const RunTestSchema = z.object({
  tenantId: z.string(),
  providerId: z.string().optional(),
  attackType: z
    .enum([
      'prompt_injection',
      'jailbreak',
      'context_leakage',
      'pii_extraction',
      'role_playing',
      'encoding_attack',
      'token_splitting',
    ])
    .optional(),
  templateId: z.string().optional(),
});

const RunFullAssessmentSchema = z.object({
  tenantId: z.string(),
  providerId: z.string().optional(),
  attackTypes: z
    .array(
      z.enum([
        'prompt_injection',
        'jailbreak',
        'context_leakage',
        'pii_extraction',
        'role_playing',
        'encoding_attack',
        'token_splitting',
      ]),
    )
    .optional(),
});

// GET /api/red-team/templates - Get available attack templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as any;

    let templates;
    if (type) {
      templates = redTeamService.getAttackTemplatesByType(type);
    } else {
      templates = redTeamService.getAttackTemplates();
    }

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('Get red team templates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/red-team/test - Run single attack test
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RunTestSchema.parse(body);

    const { tenantId, providerId, attackType, templateId } = validatedData;

    // Find template to test
    let template;
    if (templateId) {
      template = DEFAULT_ATTACK_TEMPLATES.find((t) => t.id === templateId);
    } else if (attackType) {
      const templates = DEFAULT_ATTACK_TEMPLATES.filter((t) => t.type === attackType);
      template = templates[Math.floor(Math.random() * templates.length)];
    } else {
      template =
        DEFAULT_ATTACK_TEMPLATES[Math.floor(Math.random() * DEFAULT_ATTACK_TEMPLATES.length)];
    }

    if (!template) {
      return NextResponse.json({ error: 'No attack template found' }, { status: 400 });
    }

    // Select random input template
    const inputTemplate = template.templates[Math.floor(Math.random() * template.templates.length)];

    // Run the test
    const result = await redTeamService.runAttackTest(
      tenantId,
      template,
      inputTemplate,
      providerId,
    );

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Run red team test error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/red-team/assess - Run full red team assessment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = RunFullAssessmentSchema.parse(body);

    const { tenantId, providerId, attackTypes } = validatedData;

    // Run comprehensive assessment
    const assessment = await redTeamService.runFullAssessment(tenantId, providerId, attackTypes);

    return NextResponse.json({
      success: true,
      assessment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 },
      );
    }

    console.error('Run red team assessment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
