export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_photo_url: string | null;
  position: number;
  created_at: string;
};

export type ProjectGalleryItem = {
  id: string;
  project_id: string;
  media_url: string;
  media_type: "image" | "video";
  position: number;
};

export type ProjectSection = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  position: number;
};

export type Achievement = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  position: number;
  created_at: string;
};

export type ExperienceEntry = {
  id: string;
  role: string;
  organization: string;
  date_range: string | null;
  description: string | null;
  image_url: string | null;
  position: number;
  created_at: string;
};

export type About = {
  id: string;
  photo_url: string | null;
  bio: string | null;
  updated_at: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  submitted_at: string;
};

export type HomepageSettings = {
  id: string;
  projects_cover_url: string | null;
  achievements_cover_url: string | null;
  about_cover_url: string | null;
  experience_cover_url: string | null;
  updated_at: string;
};
