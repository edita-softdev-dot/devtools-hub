export interface Link {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category?: string;
  sortOrder: number;
  isActive: boolean;
  tags?: string[];
  environment?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface CreateLinkRequest {
  title: string;
  url: string;
  description?: string;
  icon?: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
  tags?: string[];
  environment?: string;
}

export type UpdateLinkRequest = Partial<CreateLinkRequest>;
