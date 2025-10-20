import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages, projectContext, currentPRD } = await request.json();

    const systemPrompt = `You are conducting an interview to build a Product Requirements Document (PRD) for a software project.

Project Context:
- Name: ${projectContext.name}
- Description: ${projectContext.description || 'Not specified'}
- Users: ${projectContext.whoWillUseIt || 'Not specified'}
- Platform: ${projectContext.platform || 'Not specified'}

Current PRD Data: ${JSON.stringify(currentPRD || {}, null, 2)}

Your job is to:
1. Ask ONE focused question at a time to gather PRD information
2. Be conversational and helpful
3. Extract information from user responses to build the PRD
4. Cover these key areas (in order):
   - Why they're building this (business value/problem it solves)
   - Technical approach (APIs needed, data storage, authentication)
   - Learning needs (what they need to learn, resources needed)
   - Risks and blockers (potential issues, dependencies)
   - Confidence level (how clear is the path forward)

5. When the user types "done" or you've covered all areas, indicate completion

After each user response, you should:
- Acknowledge their answer
- Ask the next relevant question OR indicate completion if done
- Be encouraging and helpful

Keep responses concise and focused. Ask follow-up questions based on their answers.`;

    const conversationMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    const lastUserMessage = conversationMessages[conversationMessages.length - 1].content.toLowerCase();
    const isDone = lastUserMessage.includes('done') || lastUserMessage.includes('finish') || lastUserMessage.includes('complete');

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        ...conversationMessages,
        {
          role: 'assistant',
          content: isDone
            ? 'Understood! Let me help you wrap up the PRD.'
            : ''
        }
      ].filter(m => m.content),
    });

    const assistantMessage = response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract PRD data from conversation
    const extractionPrompt = `Based on this conversation, extract structured PRD data in JSON format.

Conversation:
${conversationMessages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join('\n')}

Extract and return ONLY a JSON object with this structure (omit fields with no information):
{
  "whyBuilding": "string - why they're building this",
  "apisRequired": ["array of API names mentioned"],
  "dataStorage": "string - data storage approach",
  "authenticationNeeds": "string - auth requirements",
  "learningNeeds": ["array of things they need to learn"],
  "resources": ["array of resource URLs or names"],
  "knownRisks": ["array of risks mentioned"],
  "anticipatedBlockers": ["array of potential blockers"],
  "confidenceLevel": "high | medium | low"
}

Return ONLY the JSON object, no other text.`;

    const extractionResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: extractionPrompt }],
    });

    const extractionText = extractionResponse.content[0].type === 'text'
      ? extractionResponse.content[0].text
      : '{}';

    let extractedPRD = currentPRD || {};
    try {
      const jsonMatch = extractionText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        extractedPRD = { ...extractedPRD, ...parsed };
      }
    } catch (e) {
      console.error('Failed to parse extracted PRD:', e);
    }

    return NextResponse.json({
      message: assistantMessage,
      prd: extractedPRD,
      isComplete: isDone || assistantMessage.toLowerCase().includes('we have everything'),
    });
  } catch (error) {
    console.error('Interview error:', error);
    return NextResponse.json(
      { error: 'Interview failed' },
      { status: 500 }
    );
  }
}
