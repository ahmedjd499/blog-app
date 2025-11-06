import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticleService } from '../../services/article.service';
import { BaseService } from '../../services/base.service';
import { Article } from '../../models/article.model';

@Component({
  selector: 'app-article-form',
  templateUrl: './article-form.component.html',
  styleUrls: ['./article-form.component.css']
})
export class ArticleFormComponent implements OnInit {
  articleForm: FormGroup;
  isEditMode = false;
  articleId: string | null = null;
  loading = false;
  submitting = false;
  error = '';
  
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  currentImageUrl: string | null = null;
  
  tagInput = '';
  tags: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private articleService: ArticleService,
    private baseService: BaseService
  ) {
    this.articleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      content: ['', [Validators.required, Validators.minLength(50)]],
      image: [null]
    });
  }

  ngOnInit(): void {
    this.articleId = this.route.snapshot.paramMap.get('id');
    if (this.articleId) {
      this.isEditMode = true;
      this.loadArticle(this.articleId);
    }
  }

  loadArticle(id: string): void {
    this.loading = true;
    this.articleService.getArticleById(id).subscribe({
      next: (response) => {
        if (response.data) {
          const article = response.data;
          this.articleForm.patchValue({
            title: article.title,
            content: article.content
          });
          this.tags = article.tags || [];
          if (article.image) {
            this.currentImageUrl = this.baseService.getImageUrl(article.image);
          }
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

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      
      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    this.currentImageUrl = null;
    this.articleForm.patchValue({ image: null });
  }

  addTag(): void {
    const tag = this.tagInput.trim().toLowerCase();
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.tagInput = '';
    }
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
  }

  onSubmit(): void {
    if (this.articleForm.invalid) {
      Object.keys(this.articleForm.controls).forEach(key => {
        this.articleForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;
    this.error = '';

    const formData = new FormData();
    formData.append('title', this.articleForm.value.title);
    formData.append('content', this.articleForm.value.content);
    formData.append('tags', JSON.stringify(this.tags));
    
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    const request = this.isEditMode && this.articleId
      ? this.articleService.updateArticle(this.articleId, formData)
      : this.articleService.createArticle(formData);

    request.subscribe({
      next: (response) => {
        if (response.data) {
          this.router.navigate(['/articles', response.data._id]);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to save article';
        this.submitting = false;
        console.error(err);
      }
    });
  }

  get title() { return this.articleForm.get('title'); }
  get content() { return this.articleForm.get('content'); }
}
