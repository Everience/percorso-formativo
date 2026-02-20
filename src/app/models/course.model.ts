export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  position_row: number;
  display_order: number;
}

export interface Resource {
  id: number;
  course_id: number;
  platform: string;
  video_url: string;
  title: string;
}
