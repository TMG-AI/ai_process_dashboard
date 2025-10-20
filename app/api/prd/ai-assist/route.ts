import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { section, projectContext } = await request.json();

    let prompt = '';

    if (section === 'technical') {
      prompt = `You are a technical architect helping plan an AI project.

Project: ${projectContext.name}
Description: ${projectContext.description || 'Not specified'}
Users: ${projectContext.whoWillUseIt || 'Not specified'}
Platform: ${projectContext.platform || 'Not specified'}
Purpose: ${projectContext.whyBuilding || 'Not specified'}

Based on this project, suggest:
1. Which APIs are likely needed (be specific: Anthropic Claude API, OpenAI API, Stripe, SendGrid, etc.)
2. What data storage approach makes sense
3. Authentication requirements

Respond in JSON format:
{
  "apis": ["API 1", "API 2"],
  "dataStorage": "suggestion",
  "auth": "suggestion"
}`;
    } else if (section === 'learning') {
      prompt = `You are a learning advisor helping someone plan an AI project.

Project: ${projectContext.name}
Description: ${projectContext.description || 'Not specified'}
Platform: ${projectContext.platform || 'Not specified'}
APIs Planned: ${projectContext.apisRequired?.join(', ') || 'None specified'}
Data Storage: ${projectContext.dataStorage || 'Not specified'}

Based on this project, suggest:
1. What they likely need to learn before starting
2. Useful resources (docs, tutorials, examples) with actual URLs

Respond in JSON format:
{
  "learningNeeds": ["Thing 1", "Thing 2"],
  "resources": ["https://url1", "https://url2"]
}`;
    } else if (section === 'risks') {
      prompt = `You are a risk assessment expert helping plan an AI project.

Project: ${projectContext.name}
Description: ${projectContext.description || 'Not specified'}
Platform: ${projectContext.platform || 'Not specified'}
APIs: ${projectContext.apisRequired?.join(', ') || 'None'}
Learning Needs: ${projectContext.learningNeeds?.join(', ') || 'None'}

Based on this project, suggest:
1. Known risks they should be aware of
2. Potential blockers they might encounter

Respond in JSON format:
{
  "risks": ["Risk 1", "Risk 2"],
  "blockers": ["Blocker 1", "Blocker 2"]
}`;
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Try to parse JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const suggestions = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ suggestions });
    }

    return NextResponse.json({ suggestions: null, rawResponse: responseText });
  } catch (error) {
    console.error('AI assist error:', error);
    return NextResponse.json(
      { error: 'AI assistance failed' },
      { status: 500 }
    );
  }
}
