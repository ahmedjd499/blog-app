import { Component, OnInit } from '@angular/core';
import { ArticleService } from '../../services/article.service';
import { AuthService } from '../../services/auth.service';
import { Article } from '../../models/article.model';
import { UserRole } from '../../models/user.model';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { SortField, SortOrder } from '../../pipes/sort-articles.pipe';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.css']
})
export class ArticleListComponent implements OnInit {
  articles: Article[] = [];
  loading = false;
  error = '';
  userRoles = UserRole;
  
  // Pagination
  currentPage = 1;
  pageSize = 9;
  totalArticles = 0;
  totalPages = 0;
  
  // Search and filters
  searchTerm = '';
  selectedTag = '';
  availableTags: string[] = [];
  private searchSubject = new Subject<string>();
  
  // Sorting
  sortField: SortField = 'createdAt';
  sortOrder: SortOrder = 'desc';

  constructor(
    private articleService: ArticleService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadArticles();
    
    // Debounce search input
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadArticles();
    });
  }

  loadArticles(): void {
    this.loading = true;
    this.error = '';
    
    this.articleService.getArticles(this.currentPage, this.pageSize, this.searchTerm, this.selectedTag)
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.articles = response.data.articles;
            this.totalArticles = response.data.pagination.total;
            this.totalPages = response.data.pagination.pages;
            this.extractTags();
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

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onTagFilter(tag: string): void {
    this.selectedTag = tag;
    this.currentPage = 1;
    this.loadArticles();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTag = '';
    this.currentPage = 1;
    this.loadArticles();
  }

  onSortChange(field: SortField): void {
    if (this.sortField === field) {
      // Toggle order if same field
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      // New field, default to descending
      this.sortField = field;
      this.sortOrder = field === 'title' ? 'asc' : 'desc';
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadArticles();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get pages(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  private extractTags(): void {
    const tagSet = new Set<string>();
    this.articles.forEach(article => {
      article.tags?.forEach(tag => tagSet.add(tag));
    });
    this.availableTags = Array.from(tagSet).sort();
  }
}
