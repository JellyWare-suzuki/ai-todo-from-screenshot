export interface Screenshot {
  id: string;
  image_url: string;
  analyzed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Todo {
  id: string;
  screenshot_id: string | null;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}
