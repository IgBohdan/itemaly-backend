import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';

interface TextImprovementRequest {
  text: string;
}

interface CategorySuggestionRequest {
  text: string;
}

interface TagRecommendationRequest {
  text: string;
}

interface TaskImprovementRequest {
  title: string;
  description: string;
  category?: string;
  tags?: string[];
}

interface TaskImprovementResponse {
  originalTitle: string;
  improvedTitle: string;
  originalDescription: string;
  improvedDescription: string;
  originalCategory: string;
  suggestedCategory: string;
  confidence: number;
  originalTags: string[];
  recommendedTags: string[];
  explanation: string;
}

@ApiTags('recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post('improve-task-comprehensive')
  @ApiOperation({
    summary: 'Get comprehensive task improvement recommendations',
  })
  @ApiResponse({ status: 200, description: 'Returns improved task details' })
  async improveTaskComprehensive(@Body() request: TaskImprovementRequest) {
    return this.recommendationsService.improveTaskComprehensive(
      request.title,
      request.description,
      request.category,
      request.tags,
    );
  }

  @Post('improve-text')
  @ApiOperation({ summary: 'Get text improvement recommendations' })
  @ApiResponse({
    status: 200,
    description: 'Returns improved text and suggestions',
  })
  async improveText(@Body() request: TextImprovementRequest) {
    return this.recommendationsService.improveText(request.text);
  }

  @Post('suggest-category')
  @ApiOperation({ summary: 'Get category suggestions for text' })
  @ApiResponse({ status: 200, description: 'Returns recommended categories' })
  async suggestCategory(@Body() request: CategorySuggestionRequest) {
    return this.recommendationsService.suggestCategory(request.text);
  }

  @Post('recommend-tags')
  @ApiOperation({ summary: 'Get tag recommendations for text' })
  @ApiResponse({ status: 200, description: 'Returns recommended tags' })
  async recommendTags(@Body() request: TagRecommendationRequest) {
    return this.recommendationsService.recommendTags(request.text);
  }
}
