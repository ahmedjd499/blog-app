import { User } from './user.model';
import { Article } from './article.model';

export interface Like {
  _id: string;
  user: User;
  article: string | Article;
  createdAt: string;
  updatedAt?: string;
}

export interface LikeCreateRequest {
  articleId: string;
}

export interface LikeResponse {
  success: boolean;
  message: string;
  data: {
    liked: boolean;
    like?: Like;
    articleId: string;
    userId: string;
  };
}

export interface LikesResponse {
  success: boolean;
  data: {
    articleId: string;
    count: number;
    likes: Like[];
    likedBy: User[];
  };
}

export interface LikeCheckResponse {
  success: boolean;
  data: {
    liked: boolean;
    likeId: string | null;
  };
}

export interface UserLikesResponse {
  success: boolean;
  data: {
    userId: string;
    count: number;
    likes: Like[];
    articles: Article[];
  };
}
