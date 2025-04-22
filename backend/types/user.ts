export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
  address?: string; // Optional, can be NULL if not provided
  mobile_number?: number; // Optional, can be NULL if not provided
  role: 'user'|'admin'; // Default is 'user'
  created_at: Date; // Timestamp
}

export type NewUser = Omit<User, 'id' | 'created_at'> ;