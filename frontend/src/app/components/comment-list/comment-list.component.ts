import { Component, Input } from '@angular/core';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { Comment } from '../../models/comment.model';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.css']
})
export class CommentListComponent {
  @Input() comments: Comment[] = [];
  
  replyingTo: string | null = null;
  replyContent: { [key: string]: string } = {};

  constructor(
    private commentService: CommentService,
    public authService: AuthService
  ) {}

  startReply(commentId: string): void {
    this.replyingTo = commentId;
  }

  cancelReply(): void {
    this.replyingTo = null;
  }

  submitReply(parentCommentId: string, articleId: string): void {
    const content = this.replyContent[parentCommentId];
    
    if (!content?.trim() || !this.authService.isLoggedIn()) {
      return;
    }

    this.commentService.createComment({
      content: content,
      articleId: articleId,
      parentCommentId: parentCommentId
    }).subscribe({
      next: () => {
        this.replyContent[parentCommentId] = '';
        this.replyingTo = null;
      },
      error: (err) => {
        alert('Failed to post reply');
        console.error(err);
      }
    });
  }

  deleteComment(commentId: string): void {
    if (!confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c._id !== commentId);
      },
      error: (err) => {
        alert('Failed to delete comment');
        console.error(err);
      }
    });
  }

  canDeleteComment(comment: Comment): boolean {
    if (!this.authService.isLoggedIn()) {
      return false;
    }
    
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;
    
    return currentUser.role === UserRole.ADMIN || 
           currentUser.role === UserRole.EDITOR ||
           currentUser._id === comment.author._id;
  }

  getInitial(username: string): string {
    return username ? username.charAt(0).toUpperCase() : '?';
  }
}
