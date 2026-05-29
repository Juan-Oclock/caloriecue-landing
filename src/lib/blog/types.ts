export interface BlogPostMeta {
  title: string;
  slug: string;
  description: string;
  date: string;
  dateModified?: string;
  author: string;
  coverImage?: string;
  coverImageAlt?: string;
  coverImageMobile?: string;
  imageCredit?: string;
  imageCreditUrl?: string;
  imagePosition?: "top" | "center" | "bottom";
  tags: string[];
  published: boolean;
  readingTime: number;
  faq?: Array<{ question: string; answer: string }>;
  tldr?: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}
