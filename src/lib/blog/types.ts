export interface BlogPostMeta {
  title: string;
  slug: string;
  description: string;
  date: string;
  author: string;
  coverImage?: string;
  imageCredit?: string;
  imageCreditUrl?: string;
  tags: string[];
  published: boolean;
  readingTime: number;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}

export interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}
