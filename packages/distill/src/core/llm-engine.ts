import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { Session, Message } from '../types/session.js';
import type { Skill } from '../types/skill.js';
import * as prompts from '../prompts/index.js';

const IntentSchema = z.object({
  goal: z.string().describe('The user core objective'),
  problem: z.string().describe('The problem to solve'),
  outcome: z.string().describe('The final result'),
  triggers: z.array(z.string()).describe('Trigger phrases list'),
  category: z.string().describe('Task category'),
});

const StepSchema = z.object({
  title: z.string(),
  description: z.string(),
  substeps: z.array(z.string()).optional(),
  isKeyStep: z.boolean(),
  toolsUsed: z.array(z.string()).optional(),
});

const StepsResultSchema = z.object({
  steps: z.array(StepSchema),
  parameters: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['string', 'boolean', 'number']),
      description: z.string(),
      defaultValue: z.unknown().optional(),
    })
  ),
  prerequisites: z.array(z.string()),
  errorHandling: z.record(z.string()),
});

export type Intent = z.infer<typeof IntentSchema>;
export type DistilledStep = z.infer<typeof StepSchema>;
export type StepsResult = z.infer<typeof StepsResultSchema>;

interface LLMEngineOptions {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export class LLMEngine {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private totalUsage: TokenUsage = { inputTokens: 0, outputTokens: 0 };

  constructor(options: LLMEngineOptions = {}) {
    this.client = new Anthropic({
      apiKey: options.apiKey ?? process.env['ANTHROPIC_API_KEY'],
    });
    this.model = options.model ?? 'claude-sonnet-4-20250514';
    this.maxTokens = options.maxTokens ?? 4096;
  }

  async extractIntent(session: Session): Promise<Intent> {
    const conversationText = this.formatConversation(session.messages);

    const response = await this.chat(
      prompts.intentExtraction(conversationText),
      prompts.SYSTEM_ANALYST
    );

    return this.parseJson(response, IntentSchema);
  }

  async distillSteps(
    session: Session,
    intent: Intent,
    userPrompts?: string[]
  ): Promise<StepsResult> {
    const conversationText = this.formatConversation(session.messages);

    const promptAdditions = userPrompts?.length
      ? `\n\nUser additional instructions:\n${userPrompts.map((p) => `- ${p}`).join('\n')}`
      : '';

    const response = await this.chat(
      prompts.stepDistillation(conversationText, intent, promptAdditions),
      prompts.SYSTEM_ANALYST
    );

    return this.parseJson(response, StepsResultSchema);
  }

  async enhanceQuality(skill: Partial<Skill>): Promise<Skill> {
    const response = await this.chat(
      prompts.qualityEnhancement(JSON.stringify(skill, null, 2)),
      prompts.SYSTEM_SKILL_WRITER
    );

    try {
      const enhanced = this.parseJson(response, z.any()) as Partial<Skill>;

      const mergedSteps = (enhanced.steps ?? skill.steps ?? []).map((step: unknown) => {
        if (typeof step === 'object' && step !== null) {
          const s = step as Record<string, unknown>;
          return {
            title: String(s['title'] ?? s['name'] ?? 'Step'),
            description: String(s['description'] ?? s['content'] ?? ''),
            substeps: Array.isArray(s['substeps']) ? s['substeps'].map(String) : undefined,
          };
        }
        return { title: 'Step', description: String(step) };
      });

      const mergedExamples = (enhanced.examples ?? skill.examples ?? []).map((ex: unknown) => {
        if (typeof ex === 'string') return ex;
        if (typeof ex === 'object' && ex !== null) {
          const e = ex as Record<string, unknown>;
          return String(e['text'] ?? e['example'] ?? e['content'] ?? JSON.stringify(ex));
        }
        return String(ex);
      });

      return {
        metadata: enhanced.metadata ??
          skill.metadata ?? { name: 'Untitled', description: '', version: '1.0.0' },
        overview: enhanced.overview ?? skill.overview ?? '',
        triggers: enhanced.triggers ?? skill.triggers ?? [],
        prerequisites: enhanced.prerequisites ?? skill.prerequisites ?? [],
        steps: mergedSteps,
        parameters: enhanced.parameters ?? skill.parameters ?? [],
        errorHandling: enhanced.errorHandling ?? skill.errorHandling ?? {},
        examples: mergedExamples,
        notes: enhanced.notes ?? skill.notes ?? [],
      };
    } catch {
      return skill as Skill;
    }
  }

  async generateDescription(intent: Intent): Promise<string> {
    const response = await this.chat(
      prompts.descriptionGeneration(intent),
      prompts.SYSTEM_SKILL_WRITER
    );

    return response.trim();
  }

  async chat(prompt: string, system?: string): Promise<string> {
    const response = await this.withRetry(async () => {
      return this.client.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        system: system ?? prompts.SYSTEM_DEFAULT,
        messages: [{ role: 'user', content: prompt }],
      });
    });

    this.totalUsage.inputTokens += response.usage.input_tokens;
    this.totalUsage.outputTokens += response.usage.output_tokens;

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No text response from LLM');
    }

    return textBlock.text;
  }

  getTokenUsage(): TokenUsage {
    return { ...this.totalUsage };
  }

  private formatConversation(messages: Message[]): string {
    return messages
      .map((m) => {
        const role = m.role === 'user' ? 'User' : 'Assistant';
        let content = `[${role}]: ${m.content}`;

        if (m.toolCalls?.length) {
          content += `\n  [Tools Used]: ${m.toolCalls.map((t) => t.name).join(', ')}`;
        }

        return content;
      })
      .join('\n\n');
  }

  private parseJson<T>(text: string, schema: z.ZodSchema<T>): T {
    const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) ?? text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const jsonStr = jsonMatch[1] ?? jsonMatch[0];
    const parsed: unknown = JSON.parse(jsonStr);

    return schema.parse(parsed);
  }

  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 3, delay = 1000): Promise<T> {
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (error instanceof Anthropic.RateLimitError) {
          await this.sleep(delay * (i + 1) * 2);
        } else if (error instanceof Anthropic.APIError) {
          await this.sleep(delay * (i + 1));
        } else {
          throw error;
        }
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
