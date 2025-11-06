import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { CommentService } from '../../services/comment.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { BaseService } from '../../services/base.service';
import { Article } from '../../models/article.model';
import { Comment } from '../../models/comment.model';
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
  
  private commentSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private commentService: CommentService,
    private socketService: SocketService,
    public authService: AuthService,
    private baseService: BaseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadArticle(id);
      this.loadComments(id);
      this.setupRealtimeComments(id);
    }
  }

  ngOnDestroy(): void {
    if (this.article) {
      this.socketService.leaveArticle(this.article._id);
    }
    this.commentSubscription?.unsubscribe();
  }

  loadArticle(id: string): void {
    this.loading = true;
    this.error = '';
    
    this.articleService.getArticleById(id).subscribe({
      next: (response) => {
        if (response.data) {
          this.article = response.data;
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
        if (response.data) {
          this.comments = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load comments:', err);
      }
    });
  }

  setupRealtimeComments(articleId: string): void {
    this.socketService.joinArticle(articleId);
    
    this.commentSubscription = this.socketService.onNewComment().subscribe({
      next: (comment: Comment) => {
        if (comment.article === articleId) {
          this.comments.unshift(comment);
        }
      }
    });
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
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    
    return currentUser.role === 'admin' || 
           currentUser.role === 'editor' ||
           currentUser._id === this.article.author._id;
  }

  getImageUrl(imagePath: string): string {
    return this.baseService.getImageUrl(imagePath);
  }
}
