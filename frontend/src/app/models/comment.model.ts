import { User } from './user.model';

export interface Comment {
  _id: string;
  content: string;
  author: User;
  article: string;
  parentComment?: string;
  replies?: Comment[];
  createdAt: Date;
}

export interface CommentCreateRequest {
  content: string;
  articleId: string;
  parentCommentId?: string;
}

export interface CommentResponse {
  success: boolean;
  message?: string;
  data?: Comment;
}

export interface CommentsResponse {
  success: boolean;
  data?: {
    articleId: string;
    count: number;
    comments: Comment[];
  };
}
