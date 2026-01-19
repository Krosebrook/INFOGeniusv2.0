
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface AppError {
  title: string;
  message: string;
  code?: string;
  originalError?: any;
}

export const logError = (error: any, context: string = 'App') => {
  // In a real application, this would send data to a service like Sentry or Datadog
  // For now, we log to console with timestamp and context
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${context}]`, error);
};

export const interpretError = (error: any): AppError => {
  const msg = error instanceof Error ? error.message : String(error);
  
  // Google GenAI Specific Errors
  if (msg.includes('404') || msg.includes('Requested entity was not found')) {
    return {
      title: 'Model Unavailable',
      message: 'The requested AI model is not accessible. This may be due to your API key permissions, regional availability, or the model being experimental.',
      code: 'MODEL_404',
      originalError: error
    };
  }

  if (msg.includes('403') || msg.includes('permission denied') || msg.includes('API key')) {
    return {
      title: 'Access Denied',
      message: 'Your API key does not have permission to access the requested resource. Please check your Google Cloud Console settings and ensure the key is active.',
      code: 'AUTH_403',
      originalError: error
    };
  }

  if (msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) {
    return {
      title: 'Quota Exceeded',
      message: 'You have reached the usage limit for the API. Please wait a moment before trying again.',
      code: 'QUOTA_429',
      originalError: error
    };
  }
  
  if (msg.includes('503') || msg.includes('overloaded') || msg.includes('unavailable')) {
    return {
      title: 'Service Busy',
      message: 'The AI servers are currently experiencing high traffic. Please try again shortly.',
      code: 'SERVER_503',
      originalError: error
    };
  }

  if (msg.includes('Safety') || msg.includes('blocked') || msg.includes('finishReason')) {
    return {
      title: 'Content Blocked',
      message: 'The request was blocked by AI safety filters. Please try modifying your prompt to be less sensitive.',
      code: 'SAFETY_BLOCK',
      originalError: error
    };
  }

  if (msg.includes('Failed to fetch') || msg.includes('Network') || msg.includes('connection')) {
      return {
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          code: 'NETWORK_ERR',
          originalError: error
      };
  }

  return {
    title: 'An Error Occurred',
    message: msg.length > 150 ? 'An unexpected error occurred during the operation. Please try again.' : msg,
    code: 'UNKNOWN',
    originalError: error
  };
};
