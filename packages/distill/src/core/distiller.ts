import type { Session } from '../types/session.js';
import type { Skill, SkillStep, SkillParameter } from '../types/skill.js';
import { LLMEngine, type Intent, type StepsResult } from './llm-engine.js';
import { ConversationPreprocessor } from './preprocessor.js';
import { FailedAttemptFilter } from './failed-filter.js';
import { ParameterExtractor } from './parameter-extractor.js';

export interface DistillerOptions {
  userPrompts?: string[];
  skipFailedFilter?: boolean;
  verbose?: boolean;
}

export interface DistillResult {
  skill: Skill;
  metadata: {
    sessionId: string;
    distilledAt: string;
    tokenUsage: { input: number; output: number };
    stepsFiltered: number;
  };
}

export class Distiller {
  private llmEngine: LLMEngine;
  private preprocessor: ConversationPreprocessor;
  private failedFilter: FailedAttemptFilter;
  private parameterExtractor: ParameterExtractor;

  constructor(llmEngine?: LLMEngine) {
    this.llmEngine = llmEngine ?? new LLMEngine();
    this.preprocessor = new ConversationPreprocessor();
    this.failedFilter = new FailedAttemptFilter();
    this.parameterExtractor = new ParameterExtractor();
  }

  async distill(session: Session, options: DistillerOptions = {}): Promise<DistillResult> {
    const { userPrompts, skipFailedFilter, verbose } = options;

    if (verbose) console.log('Preprocessing conversation...');
    const preprocessed = this.preprocessor.process(session.messages);

    let filteredMessages = preprocessed.messages;
    let stepsFiltered = 0;

    if (!skipFailedFilter) {
      if (verbose) console.log('Filtering failed attempts...');
      const filterResult = this.failedFilter.filter(preprocessed.messages);
      filteredMessages = filterResult.messages;
      stepsFiltered = filterResult.removedCount;
    }

    const filteredSession: Session = {
      ...session,
      messages: filteredMessages,
    };

    if (verbose) console.log('Extracting intent...');
    const intent = await this.llmEngine.extractIntent(filteredSession);

    if (verbose) console.log('Distilling steps...');
    const stepsResult = await this.llmEngine.distillSteps(filteredSession, intent, userPrompts);

    if (verbose) console.log('Extracting parameters...');
    const { steps: parameterizedSteps, parameters } = this.parameterExtractor.extract(
      stepsResult.steps,
      this.convertParameters(stepsResult.parameters)
    );

    if (verbose) console.log('Generating description...');
    const description = await this.llmEngine.generateDescription(intent);

    const skill = this.assembleSkill(
      intent,
      description,
      parameterizedSteps,
      parameters,
      stepsResult
    );

    if (verbose) console.log('Enhancing quality...');
    const enhancedSkill = await this.llmEngine.enhanceQuality(skill);

    const tokenUsage = this.llmEngine.getTokenUsage();

    return {
      skill: enhancedSkill,
      metadata: {
        sessionId: session.id,
        distilledAt: new Date().toISOString(),
        tokenUsage: {
          input: tokenUsage.inputTokens,
          output: tokenUsage.outputTokens,
        },
        stepsFiltered,
      },
    };
  }

  private convertParameters(
    params: {
      name: string;
      type: 'string' | 'boolean' | 'number';
      description: string;
      defaultValue?: unknown;
    }[]
  ): SkillParameter[] {
    return params.map((p) => ({
      name: p.name,
      type: p.type,
      description: p.description,
      default: p.defaultValue,
      required: p.defaultValue === undefined,
    }));
  }

  private assembleSkill(
    intent: Intent,
    description: string,
    steps: SkillStep[],
    parameters: SkillParameter[],
    stepsResult: StepsResult
  ): Skill {
    return {
      metadata: {
        name: this.generateName(intent),
        description,
        version: '1.0.0',
      },
      overview: intent.goal,
      triggers: intent.triggers,
      prerequisites: stepsResult.prerequisites,
      steps,
      parameters,
      errorHandling: stepsResult.errorHandling,
      examples: this.generateExamples(intent.triggers),
      notes: [],
    };
  }

  private generateName(intent: Intent): string {
    const words = intent.goal
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 4);

    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  private generateExamples(triggers: string[]): string[] {
    return triggers.slice(0, 3).map((trigger) => `Help me ${trigger.toLowerCase()}`);
  }
}
