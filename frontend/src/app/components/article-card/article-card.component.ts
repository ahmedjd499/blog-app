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

  getImageUrl(imagePath: string | undefined | null): string {
    return this.baseService.getImageUrl(imagePath);
  }
}
