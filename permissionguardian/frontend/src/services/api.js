import axios from 'axios';

// Use the product service endpoint.
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial: Send HttpOnly auth cookies with requests
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

// Response interceptor to unwrap success format and handle standardized error responses
apiClient.interceptors.response.use(
  (response) => {
    // If response follows the standardized wrapper { success: true, data: ... }
    if (response.data && response.data.success === true && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const data = error.response.data;
      const status = error.response.status;

      let msg = null;
      let code = 'SERVER_ERROR';

      if (data) {
        if (typeof data === 'string') {
          msg = data;
        } else if (data.error && typeof data.error === 'object' && data.error.message) {
          msg = data.error.message;
          code = data.error.code || code;
        } else if (typeof data.error === 'string') {
          msg = data.error;
        } else if (data.message) {
          msg = data.message;
        }
      }

      if (!msg) {
        if (status === 429) {
          msg = 'Too many requests or temporary security lockout. Please wait a moment before retrying.';
          code = 'RATE_LIMIT_EXCEEDED';
        } else if (status === 401) {
          msg = 'Invalid credentials or session expired.';
          code = 'UNAUTHORIZED';
        } else if (status === 403) {
          msg = 'Access forbidden.';
          code = 'FORBIDDEN';
        } else if (status === 404) {
          msg = 'The requested resource was not found.';
          code = 'NOT_FOUND';
        } else {
          msg = `Server returned error (${status}).`;
        }
      }

      const newError = new Error(msg);
      newError.code = code;
      newError.statusCode = status;
      return Promise.reject(newError);
    }
    return Promise.reject(error);
  }
);

/**
 * Analyzes Google Play Store app permissions given a URL
 * @param {string} url - Google Play Store URL or Package ID
 * @returns {Promise<Object>} Analyzed app data
 */
export async function analyzeAppPermissions(url) {
  try {
    const response = await apiClient.post('/analyze', { url });
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the analysis service.');
    }
    throw new Error(error.message || 'An unexpected error occurred while analyzing the app.');
  }
}

export async function analyzeApplicationUrl(url, playStore = false) {
  try {
    const response = await apiClient.post(playStore ? '/analyze/playstore' : '/analyze/url', { url });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Unable to analyze this application URL.');
  }
}

export async function analyzeApkFile(file, category = 'Utility') {
  try {
    const response = await apiClient.post('/analyze/apk', file, { 
      headers: { 
        'Content-Type': file.type || 'application/octet-stream', 
        'X-File-Name': file.name, 
        'X-App-Category': category 
      }, 
      timeout: 60000 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Unable to analyze this APK.');
  }
}

export async function compareAnalyses(beforeAnalysisId, afterAnalysisId) {
  try {
    const response = await apiClient.post('/compare', { beforeAnalysisId, afterAnalysisId });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Unable to compare these analyses.');
  }
}

export async function askSecurityAssistant(analysisId, question, history = []) {
  try {
    const response = await apiClient.post(`/analysis/${analysisId}/assistant`, { question, history });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'The Security Assistant is unavailable.');
  }
}

// FEATURE 1: Attack Simulator API Call
export async function simulatePrivacyImpactApi(payload) {
  try {
    if (typeof payload === 'string') {
      const response = await apiClient.get(`/analysis/${payload}/attack-simulation`);
      return response.data;
    }
    const response = await apiClient.post('/simulate/privacy-impact', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Unable to generate Privacy Impact Simulation.');
  }
}

// FEATURE 2: Time Machine API Call
export async function compareVersionsApi(before, after) {
  try {
    const payload = typeof before === 'string' && typeof after === 'string'
      ? { beforeAnalysisId: before, afterAnalysisId: after }
      : { before, after };
    const response = await apiClient.post('/compare/versions', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Unable to run Time Machine version comparison.');
  }
}

// AUTHENTICATION API CALLS

export async function loginApi(email, password, rememberMe = false) {
  try {
    const response = await apiClient.post('/auth/login', { email, password, rememberMe });
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the security server.');
    }
    throw error;
  }
}

export async function googleAuthApi(payload = {}) {
  try {
    const response = await apiClient.post('/auth/google', payload);
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the security server.');
    }
    throw error;
  }
}

export async function registerApi(name, email, password, confirmPassword) {
  try {
    const response = await apiClient.post('/auth/register', { name, email, password, confirmPassword });
    return response.data;
  } catch (error) {
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Unable to connect to the security server.');
    }
    throw error;
  }
}

export async function logoutApi() {
  try {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Unable to complete logout request.');
  }
}

export async function getMeApi() {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  } catch (error) {
    return null;
  }
}

export async function forgotPasswordApi(email) {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Unable to complete request.');
  }
}

export async function resetPasswordApi(email, token, newPassword, confirmPassword) {
  try {
    const response = await apiClient.post('/auth/reset-password', { email, token, newPassword, confirmPassword });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Unable to complete request.');
  }
}
