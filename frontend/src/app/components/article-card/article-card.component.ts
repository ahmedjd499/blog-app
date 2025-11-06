import { Component, Input } from '@angular/core';
import { Article } from '../../models/article.model';
import { BaseService } from '../../services/base.service';

@Component({
  selector: 'app-article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.css']
})
export class ArticleCardComponent {
  @Input() article!: Article;

  constructor(private baseService: BaseService) {}

  getImageUrl(imagePath: string): string {
    return this.baseService.getImageUrl(imagePath);
  }

  getExcerpt(content: string, length: number = 150): string {
    if (!content) return '';
    return content.length > length ? content.substring(0, length) + '...' : content;
  }
}
