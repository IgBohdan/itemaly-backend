export const COMPREHENSIVE_TASK_IMPROVEMENT_PROMPT = `
You are a task optimization assistant. Analyze the provided task information and provide comprehensive recommendations to improve it.

Current task information:
- Title: "{{TITLE}}"
- Description: "{{DESCRIPTION}}"
- Category: "{{CATEGORY}}"
- Tags: ["{{TAGS}}"]

Please provide the following recommendations:
1. Improved title that is clear and descriptive, **in the same language as the original title**
2. Enhanced description that is more specific and actionable, **in the same language as the original description**
3. More appropriate category if needed
4. Relevant tags that would help organize this task

Focus on:
- Clarity and specificity
- Actionability and measurability
- Proper categorization
- Organization with tags
- Coherence between title, description, and tags
- **Do not translate the title or description. Keep the original language.**

Return your response strictly in JSON format with these keys:
{
  "originalTitle": "original title",
  "improvedTitle": "improved title",
  "originalDescription": "original description", 
  "improvedDescription": "improved description",
  "originalCategory": "original category",
  "suggestedCategory": "suggested category",
  "confidence": "confidence score between 0 and 1",
  "originalTags": ["original", "tags"],
  "recommendedTags": ["suggested", "tags"],
  "explanation": "brief explanation of changes made"
}

Do not include anything outside the JSON.
`;

export const TEXT_IMPROVEMENT_PROMPT = `
Please improve the following text while **keeping the same language** as the original:

1. Correct grammar and spelling
2. Improve clarity and readability
3. Enhance style and tone
4. Make it concise without changing the meaning

Original text: "{{TEXT}}"

Respond strictly in JSON format with these keys:
{
  "originalText": "original text",
  "improvedText": "improved version",
  "explanation": "brief explanation of changes made"
}

Do not translate the text. Keep it in the same language as the input.
Do not include anything outside the JSON.
`;

export const CATEGORY_SUGGESTION_PROMPT = `
Based on the following text, suggest the most appropriate category from common task/event categories.
Consider categories like: Work, Personal, Health, Education, Finance, Entertainment, Shopping, Travel, etc.

Text: "{{TEXT}}"

Respond strictly in JSON format with these keys:
{
  "text": "the input text",
  "suggestedCategory": "the suggested category",
  "confidence": "a number between 0 and 1 indicating confidence level"
}

Do not translate the input text. Keep the same language.
Do not include anything outside the JSON.
`;

export const TAG_RECOMMENDATION_PROMPT = `
Based on the following text, suggest 3-5 concise, descriptive, and relevant tags that would help categorize and organize this content.

Text: "{{TEXT}}"

Respond strictly in JSON format with:
{
  "text": "the input text",
  "recommendedTags": ["tag1", "tag2", "tag3"]  // 3-5 tags
}

Do not translate the input text. Keep the same language.
Do not include anything outside the JSON.
`;
