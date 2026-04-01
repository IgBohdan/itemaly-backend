import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  CATEGORY_SUGGESTION_PROMPT,
  COMPREHENSIVE_TASK_IMPROVEMENT_PROMPT,
  TAG_RECOMMENDATION_PROMPT,
  TEXT_IMPROVEMENT_PROMPT,
} from './prompts';

interface GroqChatCompletionResponse {
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
}

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  private readonly groqApiKey = process.env.GROQ_API_KEY;
  private readonly groqBaseUrl =
    'https://api.groq.com/openai/v1/chat/completions';

  private readonly model = 'llama-3.1-8b-instant';

  /* ===================== PUBLIC API ===================== */

  async improveTaskComprehensive(
    title: string,
    description: string,
    category?: string,
    tags?: string[],
  ) {
    const tagsStr = tags ? tags.join(', ') : '';
    const prompt = COMPREHENSIVE_TASK_IMPROVEMENT_PROMPT.replace(
      '{{TITLE}}',
      title || '',
    )
      .replace('{{DESCRIPTION}}', description || '')
      .replace('{{CATEGORY}}', category || '')
      .replace('{{TAGS}}', tagsStr);

    return this.execute(prompt, () => ({
      originalTitle: title,
      improvedTitle: title,
      originalDescription: description,
      improvedDescription: description,
      originalCategory: category || '',
      suggestedCategory: category || 'General',
      confidence: 0.5,
      originalTags: tags || [],
      recommendedTags: tags || ['general'],
      explanation: 'LLM unavailable',
    }));
  }

  async improveText(text: string) {
    const prompt = TEXT_IMPROVEMENT_PROMPT.replace('{{TEXT}}', text);

    return this.execute(prompt, () => ({
      originalText: text,
      improvedText: text,
      explanation: 'LLM unavailable',
    }));
  }

  async suggestCategory(text: string) {
    const prompt = CATEGORY_SUGGESTION_PROMPT.replace('{{TEXT}}', text);

    return this.execute(prompt, () => ({
      text,
      suggestedCategory: 'General',
      confidence: 0.5,
    }));
  }

  async recommendTags(text: string) {
    const prompt = TAG_RECOMMENDATION_PROMPT.replace('{{TEXT}}', text);

    return this.execute(prompt, () => ({
      text,
      recommendedTags: ['general'],
    }));
  }

  /* ===================== CORE ===================== */

  private async execute<T extends object>(
    prompt: string,
    fallback: () => T,
  ): Promise<T> {
    if (!this.groqApiKey) {
      this.logger.warn('GROQ_API_KEY not set, using fallback');
      return fallback();
    }

    try {
      const response = await axios.post<GroqChatCompletionResponse>(
        this.groqBaseUrl,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content:
                'You are a strict JSON API. Respond ONLY with valid JSON. No explanations.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.groqApiKey}`,
          },
          timeout: 15000,
        },
      );

      const content = response.data.choices[0]?.message?.content;

      this.logger.debug(`Groq raw content: ${content}`);

      if (!content) {
        throw new Error('Empty content from Groq');
      }

      const parsed = this.safeJsonParse<T>(content);
      if (!parsed) {
        throw new Error(`Invalid JSON from LLM: ${content}`);
      }

      return parsed;
    } catch (error: unknown) {
      // Перевіряємо, чи це axios помилка
      if (
        typeof error === 'object' &&
        error !== null &&
        'isAxiosError' in error &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (error as any).isAxiosError === true
      ) {
        const axiosError = error as {
          response?: { status?: number; data?: any };
        };
        this.logger.error(
          'Groq Axios error',
          JSON.stringify(
            {
              status: axiosError.response?.status,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              data: axiosError.response?.data,
            },
            null,
            2,
          ),
        );
      } else {
        this.logger.error(
          'Unexpected error',
          error instanceof Error ? error.stack : String(error),
        );
      }

      return fallback();
    }
  }

  /* ===================== UTILS ===================== */

  private safeJsonParse<T extends object>(value: string): T | null {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
}
