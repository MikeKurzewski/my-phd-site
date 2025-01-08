export interface User {
  id: string;
  email: string;
  name: string;
  title: string;
  institution: string;
  department: string;
  bio: string;
  profileImage?: string;
  bannerImage?: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  mediaUrls: string[];
  startDate: string;
  endDate?: string;
  userId: string;
}

export interface Publication {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  publicationDate: string;
  venue: string;
  links: {
    pdf?: string;
    doi?: string;
    preprint?: string;
  };
  userId: string;
}