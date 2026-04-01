// Simple test script to verify the recommendations service
const {
  RecommendationsService,
} = require('./dist/recommendations/recommendations.service');

async function testRecommendations() {
  const service = new RecommendationsService();

  console.log('Testing text improvement...');
  const textResult = await service.improveText(
    'This is a sample text that could be better written.',
  );
  console.log('Text improvement result:', textResult);

  console.log('\nTesting category suggestion...');
  const categoryResult = await service.suggestCategory(
    'Need to schedule a meeting with the team',
  );
  console.log('Category suggestion result:', categoryResult);

  console.log('\nTesting tag recommendation...');
  const tagResult = await service.recommendTags(
    'Remember to buy groceries after work',
  );
  console.log('Tag recommendation result:', tagResult);
}

// Run the test
testRecommendations().catch(console.error);
