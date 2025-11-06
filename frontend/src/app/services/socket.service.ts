import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Comment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private readonly socketUrl = environment.socketUrl || environment.apiUrl.replace('/api', '');

  constructor(private authService: AuthService) {}

  connect(): void {
    if (this.socket?.connected) return;

    const token = this.authService.getAccessToken();
    
    this.socket = io(this.socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.io connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.io disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.io connection error:', error.message);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinArticle(articleId: string): void {
    this.socket?.emit('joinArticle', articleId);
  }

  leaveArticle(articleId: string): void {
    this.socket?.emit('leaveArticle', articleId);
  }

  onNewComment(): Observable<Comment> {
    return new Observable(observer => {
      this.socket?.on('newComment', (comment: Comment) => {
        observer.next(comment);
      });
    });
  }

  onCommentNotification(): Observable<any> {
    return new Observable(observer => {
      this.socket?.on('commentNotification', (notification: any) => {
        observer.next(notification);
      });
    });
  }

  emitTyping(articleId: string): void {
    this.socket?.emit('typing', articleId);
  }

  emitStopTyping(articleId: string): void {
    this.socket?.emit('stopTyping', articleId);
  }

  onTyping(): Observable<{ userId: string }> {
    return new Observable(observer => {
      this.socket?.on('typing', (data: { userId: string }) => {
        observer.next(data);
      });
    });
  }

  onStopTyping(): Observable<{ userId: string }> {
    return new Observable(observer => {
      this.socket?.on('stopTyping', (data: { userId: string }) => {
        observer.next(data);
      });
    });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
