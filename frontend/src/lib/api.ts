export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Basic interfaces derived from schemas/
export interface User {
  username: string;
  password?: string;
  name?: string;
  surname?: string;
}

export interface Camera {
  id: number;
  location?: string;
  ip?: string;
  model?: string;
  locationX?: number;
  locationY?: number;
}

export interface Vehicle {
  plate: string;
  badge?: string | null;
  userId?: string | null;
  vehicleTypeId?: number | null;
}

export interface Detection {
  plate: string;
  detectionDate: string;
  cameraId?: number;
  itvStatus?: string;
}

// Generic typed fetch that accepts a runtime validator
export async function fetchApi<T>(input: RequestInfo, init: RequestInit | undefined, validate: (v: any) => v is T): Promise<T> {
  const res = await fetch(input, init);
  const json = await res.json();

  if (json && typeof json === 'object' && 'success' in json) {
    const api = json as ApiResponse<any>;
    if (!api.success) throw new Error(api.error || 'API returned unsuccessful response');
    if (validate(api.data)) return api.data as T;
    throw new Error('Invalid API response shape (data)');
  }

  if (validate(json)) return json as T;

  throw new Error('Invalid API response shape');
}

// Simple runtime validators (can be extended)
export function isUserArray(v: any): v is User[] {
  return Array.isArray(v) && v.every((u) => u && typeof u.username === 'string');
}

export function isCameraArray(v: any): v is Camera[] {
  return Array.isArray(v) && v.every((c) => c && typeof c.id === 'number');
}

export function isVehicleArray(v: any): v is Vehicle[] {
  return Array.isArray(v) && v.every((c) => c && typeof c.plate === 'string');
}

export function isDetectionArray(v: any): v is Detection[] {
  return Array.isArray(v) && v.every((d) => d && typeof d.plate === 'string' && typeof d.detectionDate === 'string');
}

export function isAny(_: any): _ is any { return true; }
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  surname: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    username: string;
    name: string;
    surname: string;
    email?: string;
    picture?: string;
  };
  error?: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('API: Sending login request to:', `${API_BASE_URL}/user`);
      console.log('API: Login data:', { username: data.username, password: '***' });
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
      
      // Usar GET /user para obtener todos los usuarios y buscar el correcto
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('API: Response status:', response.status);
      console.log('API: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: Error response:', errorText);
        return {
          success: false,
          error: `Server error: ${response.status}`
        };
      }
      
      const result = await response.json();
      console.log('API: Response data:', result);
      
      // Verificar si la respuesta tiene el formato { success: true, data: [...] }
      const users = result.data || result;
      
      if (Array.isArray(users)) {
        // Buscar usuario por username
        const user = users.find((u: any) => u.username === data.username && u.password === data.password);
        if (user) {
          return {
            success: true,
            token: btoa(JSON.stringify({ username: user.username, name: user.name, surname: user.surname })),
            user: {
              username: user.username,
              name: user.name,
              surname: user.surname,
              email: user.email,
              picture: user.picture
            }
          };
        }
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
      
      return {
        success: false,
        error: 'Unexpected response format'
      };
    } catch (error) {
      console.error('API: Fetch error:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout. El servidor Node-RED puede tener un problema.'
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
