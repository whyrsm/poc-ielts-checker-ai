const API_URL = import.meta.env.VITE_API_URL;

// Health checks
export const pingServer = async () => {
  const response = await fetch(`${API_URL}/ping`);
  return response.json();
};

export const checkOpenAIConnection = async () => {
  const response = await fetch(`${API_URL}/essay/health`);
  return response.json();
};

// Essay services
export const checkEssay = async (essay, taskType) => {
  const response = await fetch(`${API_URL}/essay/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ essay, taskType })
  });
  return response.json();
};

// Speaking services (for future implementation)
export const checkSpeaking = async (audioData) => {
  const response = await fetch(`${API_URL}/speaking/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ audioData })
  });
  return response.json();
};