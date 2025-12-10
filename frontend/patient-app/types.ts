export interface User {
  name: string;
  age: number;
  id: string;
  tags: string[];
  avatarUrl: string;
}

export interface Task {
  id: string;
  date: string; // MM.DD
  fullDate: string; // YYYY-MM-DD
  status: 'completed' | 'pending' | 'missed';
  title?: string;
  description?: string;
  image?: string;
}

export interface MoodEntry {
  day: number;
  value: number; // 0-100
}
