export const generatePRD = async (idea: string, category: string, targetAudience: string) => {
  try {
    const response = await fetch('/api/generate-prd', {
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
    console.error('Error generating PRD with Gemini:', error);
    throw new Error('Failed to generate PRD. Please try again.');
  }
};

export const enhanceIdea = async (rawIdea: string) => {
  try {
    const response = await fetch('http://localhost:8081/api/enhance-idea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rawIdea
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to enhance idea');
    }

    const result = await response.json();
    return result.enhancedIdea;
  } catch (error) {
    console.error('Error enhancing idea with Gemini:', error);
    throw new Error('Failed to enhance idea. Please try again.');
  }
};
