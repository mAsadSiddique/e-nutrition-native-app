// Auth API Configuration
const AUTH_BASE_URL = 'https://api.yourapp.com'; // Change this to your actual API base URL

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Auth API Functions
export async function requestSignInEmail(email: string): Promise<void> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || 'Failed to send sign-in email');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred while sending sign-in email');
  }
}

export async function verifySignInCode(email: string, code: string): Promise<{ token: string }> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/auth/sign-in/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const result: ApiResponse<{ token: string }> = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || 'Invalid verification code');
    }

    if (!result.data?.token) {
      throw new Error('No authentication token received');
    }

    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred while verifying sign-in code');
  }
}

export async function requestSignUpEmail(name: string, email: string, password: string): Promise<void> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/auth/sign-up/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const result: ApiResponse = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || 'Failed to create account');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred while creating account');
  }
}

export async function verifySignUpCode(email: string, code: string): Promise<{ token: string }> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/auth/sign-up/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const result: ApiResponse<{ token: string }> = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || 'Invalid verification code');
    }

    if (!result.data?.token) {
      throw new Error('No authentication token received');
    }

    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred while verifying sign-up code');
  }
}

// New direct login function with email + password
export async function requestLogin(email: string, password: string): Promise<{ token: string }> {
  try {
    const response = await fetch(`${AUTH_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result: ApiResponse<{ token: string }> = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || 'Invalid email or password');
    }

    if (!result.data?.token) {
      throw new Error('No authentication token received');
    }

    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Network error occurred while signing in');
  }
}

// Export AUTH_BASE_URL for easy configuration changes
export { AUTH_BASE_URL };
