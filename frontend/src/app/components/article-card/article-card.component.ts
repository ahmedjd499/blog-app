import { Component, Input, OnInit } from '@angular/core';
import { Article } from '../../models/article.model';
import { BaseService } from '../../services/base.service';
import { LikeService } from '../../services/like.service';

@Component({
  selector: 'app-article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.css']
})
export class ArticleCardComponent implements OnInit {
  @Input() article!: Article;
  likesCount = 0;

  constructor(
    private baseService: BaseService,
    private likeService: LikeService
  ) {}

  ngOnInit(): void {
    if (this.article && this.article._id) {
      this.loadLikes();
    }
  }

  loadLikes(): void {
    this.likeService.getLikesByArticle(this.article._id).subscribe({
      next: (response) => {
        if (response.data) {
          this.likesCount = response.data.count;
        }
      },
      error: (err) => {
        console.error('Failed to load likes:', err);
      }
    });
  }

  getImageUrl(imagePath: string | undefined | null): string {
    return this.baseService.getImageUrl(imagePath);
  }
}
