export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  project: string | Project;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}