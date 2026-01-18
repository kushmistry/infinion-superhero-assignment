import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on an auth page
      // This prevents redirect loops during login attempts
      const currentPath = window.location.pathname;
      const isOnAuthPage = currentPath.includes('/login') ||
                          currentPath.includes('/register') ||
                          currentPath.includes('/forgot-password') ||
                          currentPath.includes('/reset-password');

      if (!isOnAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API response types
export interface APIResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

// Authentication API
export const authAPI = {
  register: (data: { email: string; first_name: string; last_name: string; password: string }) =>
    api.post<APIResponse>('/api/v1/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<APIResponse>('/api/v1/auth/login', data),

  forgotPassword: (data: { email: string }) =>
    api.post<APIResponse>('/api/v1/auth/forgot-password', data),

  resetPassword: (data: { token: string; new_password: string }) =>
    api.post<APIResponse>('/api/v1/auth/reset-password', data),

  verifyResetToken: (data: { token: string }) =>
    api.post<APIResponse>('/api/v1/auth/verify-reset-token', data),

  getCurrentUser: () =>
    api.get<APIResponse>('/api/v1/auth/me'),
};

// User types
export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// Superhero types
export interface Superhero {
  id: number;
  name: string;
  response_status?: string;
  intelligence?: number;
  strength?: number;
  speed?: number;
  durability?: number;
  power?: number;
  combat?: number;
  full_name?: string;
  alter_egos?: string;
  place_of_birth?: string;
  first_appearance?: string;
  publisher?: string;
  alignment?: string; // 'good' | 'bad' | 'neutral'
  aliases?: string;
  gender?: string;
  race?: string;
  height_feet?: string;
  height_cm?: string;
  weight_lbs?: string;
  weight_kg?: string;
  eye_color?: string;
  hair_color?: string;
  occupation?: string;
  base?: string;
  group_affiliation?: string;
  relatives?: string;
  image_url?: string;
  is_favorite?: boolean;
}

export interface SuperheroListResponse {
  items: Superhero[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// Team types
export interface Team {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
  superheroes?: Superhero[];
}

export interface TeamCreateRequest {
  name: string;
  description?: string;
  superhero_ids: number[];
}

export interface TeamComparisonResult {
  team1: {
    id: number;
    name: string;
    stats: {
      total_power: number;
      average_power: number;
      total_intelligence: number;
      total_strength: number;
      total_speed: number;
      total_durability: number;
      total_power_stat: number;
      total_combat: number;
      average_intelligence: number;
      average_strength: number;
      average_speed: number;
      average_durability: number;
      average_power_stat: number;
      average_combat: number;
      alignment_distribution: {
        good: number;
        bad: number;
        neutral: number;
      };
      member_count: number;
    };
    score: number;
  };
  team2: {
    id: number;
    name: string;
    stats: {
      total_power: number;
      average_power: number;
      total_intelligence: number;
      total_strength: number;
      total_speed: number;
      total_durability: number;
      total_power_stat: number;
      total_combat: number;
      average_intelligence: number;
      average_strength: number;
      average_speed: number;
      average_durability: number;
      average_power_stat: number;
      average_combat: number;
      alignment_distribution: {
        good: number;
        bad: number;
        neutral: number;
      };
      member_count: number;
    };
    score: number;
  };
  winner: {
    team_id: number | null;
    team_name: string;
    score: number;
  };
  explanation: string;
  reasons: string[];
}

// Superhero API
export const superheroAPI = {
  getAll: (params?: { page?: number; page_size?: number; search?: string; alignment?: string }) =>
    api.get<APIResponse<SuperheroListResponse>>('/api/v1/superheroes', { params }),

  getById: (id: number) =>
    api.get<APIResponse<Superhero>>(`/api/v1/superheroes/${id}`),

  update: (id: number, data: Partial<Superhero>) =>
    api.put<APIResponse<Superhero>>(`/api/v1/superheroes/${id}`, data),
};

// Favorites API
export const favoritesAPI = {
  getAll: () =>
    api.get<APIResponse<Superhero[]>>('/api/v1/favorites'),

  add: (superhero_id: number) =>
    api.post<APIResponse>(`/api/v1/favorites/${superhero_id}`),

  remove: (superhero_id: number) =>
    api.delete<APIResponse>(`/api/v1/favorites/${superhero_id}`),

  check: (superhero_id: number) =>
    api.get<APIResponse<{ is_favorite: boolean }>>(`/api/v1/favorites/check/${superhero_id}`),
};

// Teams API
export const teamsAPI = {
  getAll: () =>
    api.get<APIResponse<Team[]>>('/api/v1/teams'),

  getById: (id: number) =>
    api.get<APIResponse<Team>>(`/api/v1/teams/${id}`),

  create: (data: TeamCreateRequest) =>
    api.post<APIResponse<Team>>('/api/v1/teams', data),

  update: (id: number, data: Partial<TeamCreateRequest>) =>
    api.put<APIResponse<Team>>(`/api/v1/teams/${id}`, data),

  delete: (id: number) =>
    api.delete<APIResponse>(`/api/v1/teams/${id}`),

  recommendBalanced: (count: number = 5) =>
    api.get<APIResponse<Superhero[]>>(`/api/v1/teams/recommendations/balanced?count=${count}`),

  recommendPower: (min_value: number = 50, count: number = 5) =>
    api.get<APIResponse<Superhero[]>>(`/api/v1/teams/recommendations/power?min_value=${min_value}&count=${count}`),

  recommendRandom: (count: number = 5) =>
    api.get<APIResponse<Superhero[]>>(`/api/v1/teams/recommendations/random?count=${count}`),

  compare: (team1_id: number, team2_id: number) =>
    api.get<APIResponse<TeamComparisonResult>>(`/api/v1/teams/compare?team1_id=${team1_id}&team2_id=${team2_id}`),
};