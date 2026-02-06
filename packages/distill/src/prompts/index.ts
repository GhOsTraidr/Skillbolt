export const SYSTEM_DEFAULT = `You are Skill Distill, an expert at analyzing AI agent conversations and extracting reusable patterns.`;

export const SYSTEM_ANALYST = `You are an expert conversation analyst. Your task is to:
1. Understand the user's original intent
2. Identify key steps and patterns
3. Filter out failed attempts and trial-and-error
4. Extract reusable knowledge

Always respond in valid JSON format.`;

export const SYSTEM_SKILL_WRITER = `You are an expert at writing Claude Code Skills. You follow these rules:
1. Use third-person in descriptions ("This skill should be used when...")
2. Use imperative/infinitive form in steps ("Parse the file...", not "You should parse...")
3. Include specific trigger phrases
4. Keep content focused and lean
5. Follow Claude Code Skill format exactly`;

export function intentExtraction(conversation: string): string {
  return `Analyze the following conversation between a user and an AI assistant.

<conversation>
${conversation}
</conversation>

Extract the user's intent and provide a structured analysis.

Respond with a JSON object containing:
- goal: The user's core objective (what they wanted to achieve)
- problem: The problem they were trying to solve
- outcome: What was ultimately accomplished
- triggers: An array of 3-5 specific phrases that would trigger this type of task (e.g., "migrate to RSC", "add server components")
- category: The category of this task (e.g., "refactoring", "feature-development", "debugging", "configuration")

\`\`\`json
{
  "goal": "...",
  "problem": "...",
  "outcome": "...",
  "triggers": ["...", "..."],
  "category": "..."
}
\`\`\``;
}

export function stepDistillation(
  conversation: string,
  intent: { goal: string; problem: string },
  userPromptAdditions: string
): string {
  return `Based on the following conversation, extract the key steps that were taken to achieve the goal.

<goal>
${intent.goal}
</goal>

<problem>
${intent.problem}
</problem>

<conversation>
${conversation}
</conversation>
${userPromptAdditions}

Instructions:
1. Identify the SUCCESSFUL steps that led to the outcome (filter out failed attempts)
2. Generalize specific values into parameters where appropriate
3. Identify prerequisites needed before starting
4. Note any error handling patterns discovered

Respond with a JSON object:

\`\`\`json
{
  "steps": [
    {
      "title": "Step title",
      "description": "What to do in this step (use imperative form)",
      "substeps": ["optional substep 1", "optional substep 2"],
      "isKeyStep": true,
      "toolsUsed": ["tool1", "tool2"]
    }
  ],
  "parameters": [
    {
      "name": "parameter_name",
      "type": "string",
      "description": "What this parameter controls",
      "defaultValue": "optional default"
    }
  ],
  "prerequisites": [
    "Prerequisite 1",
    "Prerequisite 2"
  ],
  "errorHandling": {
    "Error scenario 1": "How to handle it",
    "Error scenario 2": "How to handle it"
  }
}
\`\`\``;
}

export function qualityEnhancement(skillJson: string): string {
  return `Review and enhance the following Skill definition for quality and completeness.

<skill>
${skillJson}
</skill>

Improvements to make:
1. Ensure all steps use imperative form ("Do X" not "You should do X")
2. Add any missing error handling scenarios
3. Improve trigger phrases to be more specific
4. Add example usage phrases
5. Ensure prerequisites are complete
6. Add any missing notes or warnings

Return the enhanced Skill as a complete JSON object with the same structure but improved content.`;
}

export function descriptionGeneration(intent: { goal: string; triggers: string[] }): string {
  return `Generate a Claude Code Skill description based on the following:

Goal: ${intent.goal}
Trigger phrases: ${intent.triggers.join(', ')}

Requirements:
1. Use third-person format: "This skill should be used when..."
2. Include the specific trigger phrases in quotes
3. Be concise but descriptive (1-2 sentences)

Example format:
"This skill should be used when the user asks to \\"migrate to RSC\\", \\"convert to Server Components\\", or mentions React Server Components migration. Provides step-by-step guidance for the migration process."

Generate only the description text, no additional formatting.`;
}
