import { User } from './user.model';

export interface Article {
  _id: string;
  title: string;
  content: string;
  image?: string;
  tags: string[];
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface ArticleCreateRequest {
  title: string;
  content: string;
  image?: File;
  tags: string[];
}

export interface ArticleResponse {
  success: boolean;
  message?: string;
  data?: Article;
}

export interface ArticlesResponse {
  success: boolean;
  data?: {
    articles: Article[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
