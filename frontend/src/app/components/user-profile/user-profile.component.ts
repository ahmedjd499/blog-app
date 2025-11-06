import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ArticleService } from '../../services/article.service';
import { User, UserRole } from '../../models/user.model';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  articles: Article[] = [];
  loading = false;
  error = '';
  isOwnProfile = false;
  
  stats = {
    totalArticles: 0,
    totalComments: 0,
    totalViews: 0
  };

  constructor(
    private route: ActivatedRoute,
    public authService: AuthService,
    private articleService: ArticleService
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    const currentUser = this.authService.currentUserValue;
    
    if (!userId && currentUser) {
      // View own profile
      this.user = currentUser;
      this.isOwnProfile = true;
      this.loadUserArticles(currentUser._id);
    } else if (userId) {
      // View another user's profile
      this.isOwnProfile = currentUser?._id === userId;
      this.loadUserProfile(userId);
      this.loadUserArticles(userId);
    }
  }

  loadUserProfile(userId: string): void {
    // For now, we'll just use the current user
    // In a real app, you'd have a user service to fetch any user's profile
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser._id === userId) {
      this.user = currentUser;
    }
  }

  loadUserArticles(userId: string): void {
    this.loading = true;
    this.error = '';
    
    // Get all articles and filter by author
    this.articleService.getArticles(1, 100).subscribe({
      next: (response) => {
        if (response.data) {
          this.articles = response.data.articles.filter(
            article => article.author._id === userId
          );
          this.stats.totalArticles = this.articles.length;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load articles';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getRoleBadgeClass(): string {
    if (!this.user) return 'bg-gray-100 text-gray-700';
    
    switch (this.user.role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-700';
      case UserRole.EDITOR:
        return 'bg-blue-100 text-blue-700';
      case UserRole.WRITER:
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  getUserInitial(): string {
    return this.user?.username ? this.user.username.charAt(0).toUpperCase() : '?';
  }
}
