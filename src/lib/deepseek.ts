export const generatePRD = async (idea: string, category: string, targetAudience: string) => {
  try {
    const response = await fetch('/api/generate-prd-deepseek', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idea,
        category,
        targetAudience
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate PRD');
    }

    const result = await response.json();
    return result.prd;
  } catch (error) {
    console.error('Error generating PRD with Deepseek:', error);
    throw new Error('Failed to generate PRD. Please try again.');
  }
};
