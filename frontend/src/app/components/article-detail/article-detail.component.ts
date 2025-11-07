import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { CommentService } from '../../services/comment.service';
import { LikeService } from '../../services/like.service';
import { SocketService } from '../../services/socket.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { BaseService } from '../../services/base.service';
import { Article } from '../../models/article.model';
import { Comment } from '../../models/comment.model';
import { UserRole } from '../../models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  article: Article | null = null;
  comments: Comment[] = [];
  loading = false;
  error = '';
  
  newComment = '';
  submittingComment = false;
  
  likesCount = 0;
  userHasLiked = false;
  submittingLike = false;
  
  private commentSubscription?: Subscription;
  private likeSubscription?: Subscription;
  private unlikeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private commentService: CommentService,
    private likeService: LikeService,
    private socketService: SocketService,
    private notificationService: NotificationService,
    public authService: AuthService,
    private baseService: BaseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadArticle(id);
      this.loadComments(id);
      this.checkUserLikeStatus(id);
      this.setupRealtimeComments(id);
      this.setupRealtimeLikes(id);
      // Mark this article as active for notification purposes
      this.notificationService.setActiveArticleRoom(id);
    }
  }

  ngOnDestroy(): void {
    if (this.article) {
      this.socketService.leaveArticle(this.article._id);
      // Remove from active article rooms
      this.notificationService.removeActiveArticleRoom(this.article._id);
    }
    this.commentSubscription?.unsubscribe();
    this.likeSubscription?.unsubscribe();
    this.unlikeSubscription?.unsubscribe();
  }

  loadArticle(id: string): void {
    this.loading = true;
    this.error = '';
    
    this.articleService.getArticleById(id).subscribe({
      next: (response) => {
        if (response.data) {
          this.article = response.data;
          // Set likesCount from article data
          this.likesCount = this.article.likesCount || 0;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load article';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadComments(articleId: string): void {
    this.commentService.getCommentsByArticle(articleId).subscribe({
      next: (response) => {
        if (response.data?.comments) {
          this.comments = response.data.comments;
        }
      },
      error: (err) => {
        console.error('Failed to load comments:', err);
      }
    });
  }

  setupRealtimeComments(articleId: string): void {
    // Ensure socket is connected before joining
    if (!this.socketService.isConnected()) {
      this.socketService.connect();
    }
    
    // Small delay to ensure connection is established
    setTimeout(() => {
      this.socketService.joinArticle(articleId);
      console.log('Joined article room:', articleId);
    }, 500);
    
    this.commentSubscription = this.socketService.onNewComment().subscribe({
      next: (comment: Comment) => {
        console.log('New comment received:', comment);
        // Convert article ID to string for comparison
        const commentArticleId = typeof comment.article === 'string' 
          ? comment.article 
          : (comment.article as any)?._id || comment.article;
        
        if (commentArticleId === articleId) {
          // Check if comment is a reply or top-level comment
          if (comment.parentComment) {
            // It's a reply - find parent and add to its replies array
            this.addReplyToParent(comment);
          } else {
            // It's a top-level comment
            const exists = this.comments.some(c => c._id === comment._id);
            if (!exists) {
              this.comments.unshift(comment);
              console.log('Top-level comment added to list');
            }
          }
        }
      }
    });
  }

  private addReplyToParent(reply: Comment): void {
    const parentId = typeof reply.parentComment === 'string' 
      ? reply.parentComment 
      : (reply.parentComment as any)?._id;
    
    // Recursively find and add reply to parent comment
    const addToParent = (comments: Comment[]): boolean => {
      for (const comment of comments) {
        if (comment._id === parentId) {
          // Found the parent - add reply if not exists
          if (!comment.replies) {
            comment.replies = [];
          }
          const exists = comment.replies.some(r => r._id === reply._id);
          if (!exists) {
            comment.replies.push(reply);
            console.log('Reply added to parent comment');
          }
          return true;
        }
        // Check nested replies
        if (comment.replies && comment.replies.length > 0) {
          if (addToParent(comment.replies)) {
            return true;
          }
        }
      }
      return false;
    };
    
    addToParent(this.comments);
  }

  submitComment(): void {
    if (!this.newComment.trim() || !this.article || !this.authService.isLoggedIn()) {
      return;
    }

    this.submittingComment = true;
    
    this.commentService.createComment({
      content: this.newComment,
      articleId: this.article._id
    }).subscribe({
      next: (response) => {
        this.newComment = '';
        this.submittingComment = false;
        // Comment will be added via socket.io real-time update
      },
      error: (err) => {
        this.submittingComment = false;
        alert('Failed to post comment');
        console.error(err);
      }
    });
  }

  deleteArticle(): void {
    if (!this.article || !confirm('Are you sure you want to delete this article?')) {
      return;
    }

    this.articleService.deleteArticle(this.article._id).subscribe({
      next: () => {
        this.router.navigate(['/articles']);
      },
      error: (err) => {
        alert('Failed to delete article');
        console.error(err);
      }
    });
  }

  canEditArticle(): boolean {
    if (!this.article || !this.authService.isLoggedIn()) {
      return false;
    }
    
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return false;
    
    return currentUser.role === UserRole.ADMIN || 
           currentUser.role === UserRole.EDITOR ||
           currentUser._id === this.article.author._id;
  }

  checkUserLikeStatus(articleId: string): void {
    // Only check if current user liked this article
    if (this.authService.isLoggedIn()) {
      this.likeService.checkUserLike(articleId).subscribe({
        next: (response) => {
          if (response.data) {
            this.userHasLiked = response.data.liked;
          }
        },
        error: (err) => {
          console.error('Failed to check like status:', err);
        }
      });
    }
  }

  setupRealtimeLikes(articleId: string): void {
    this.likeSubscription = this.socketService.onLikeArticle().subscribe({
      next: (data: any) => {
        if (data.articleId === articleId) {
          this.likesCount++;
          // Update userHasLiked if current user liked
          const currentUser = this.authService.currentUserValue;
          if (currentUser && data.userId === currentUser._id) {
            this.userHasLiked = true;
          }
        }
      }
    });

    this.unlikeSubscription = this.socketService.onUnlikeArticle().subscribe({
      next: (data: any) => {
        if (data.articleId === articleId) {
          this.likesCount--;
          // Update userHasLiked if current user unliked
          const currentUser = this.authService.currentUserValue;
          if (currentUser && data.userId === currentUser._id) {
            this.userHasLiked = false;
          }
        }
      }
    });
  }

  toggleLike(): void {
    if (!this.article || !this.authService.isLoggedIn() || this.submittingLike) {
      return;
    }

    this.submittingLike = true;

    this.likeService.toggleLike({ articleId: this.article._id }).subscribe({
      next: (response) => {
        this.submittingLike = false;
        // Like state will be updated via socket.io real-time update
      },
      error: (err) => {
        this.submittingLike = false;
        console.error('Failed to toggle like:', err);
      }
    });
  }

  getImageUrl(imagePath: string | undefined | null): string {
    return this.baseService.getImageUrl(imagePath);
  }
}
