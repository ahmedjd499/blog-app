import { Pipe, PipeTransform } from '@angular/core';
import { Article } from '../models/article.model';

export type SortField = 'title' | 'createdAt' | 'commentsCount' | 'likesCount';
export type SortOrder = 'asc' | 'desc';

@Pipe({
  name: 'sortArticles'
})
export class SortArticlesPipe implements PipeTransform {
  transform(articles: Article[], sortField: SortField, sortOrder: SortOrder): Article[] {
    if (!articles || articles.length === 0) {
      return articles;
    }

    const sortedArticles = [...articles];

    sortedArticles.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        
        case 'createdAt':
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          comparison = dateA - dateB;
          break;
        
        case 'commentsCount':
          const commentsA = a.commentsCount || 0;
          const commentsB = b.commentsCount || 0;
          comparison = commentsA - commentsB;
          break;
        
        case 'likesCount':
          const likesA = a.likesCount || 0;
          const likesB = b.likesCount || 0;
          comparison = likesA - likesB;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sortedArticles;
  }
}
