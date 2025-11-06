import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';

export interface InAppNotification {
  id: string;
  type: 'comment' | 'reply';
  title: string;
  message: string;
  articleId: string;
  articleTitle: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationPermission: NotificationPermission = 'default';
  private activeArticleRooms: Set<string> = new Set();
  private listenersSetup = false;
  private inAppNotifications: InAppNotification[] = [];
  private notificationsSubject = new BehaviorSubject<InAppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private socketService: SocketService,
    private authService: AuthService
  ) {
    this.checkNotificationSupport();
    
    // Wait for auth state and then setup listeners
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User is logged in, wait a bit for socket to connect
        setTimeout(() => {
          this.setupNotificationListeners();
        }, 1000);
      }
    });
  }

  private checkNotificationSupport(): void {
    if ('Notification' in window) {
      this.notificationPermission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (this.notificationPermission === 'granted') {
      return true;
    }

    if (this.notificationPermission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    this.notificationPermission = permission;
    return permission === 'granted';
  }

  private setupNotificationListeners(): void {
    if (this.listenersSetup) {
      console.log('✅ Listeners already setup, skipping...');
      return;
    }
    
    if (!this.socketService.isConnected()) {
      console.warn('⚠️ Socket not connected, waiting to setup listeners...');
      setTimeout(() => this.setupNotificationListeners(), 500);
      return;
    }
    
    this.listenersSetup = true;
    console.log('🔔 Setting up notification listeners...');
    
    // Listen for comment notifications when user is not in the article room
    this.socketService.onCommentNotification().subscribe({
      next: (data: any) => {
        console.log('📬 Comment notification received:', data);
        console.log('Active article rooms:', Array.from(this.activeArticleRooms));
        
        // Check if user is currently viewing the article
        const isViewingArticle = this.activeArticleRooms.has(data.article._id);
        
        // Add to in-app notifications
        this.addInAppNotification({
          id: `comment-${data.comment._id}`,
          type: 'comment',
          title: 'New Comment',
          message: data.message,
          articleId: data.article._id,
          articleTitle: data.article.title,
          timestamp: new Date(),
          read: false,
          data: data
        });
        
        if (!isViewingArticle) {
          this.showNotification(
            '💬 New Comment on Your Article',
            {
              body: data.message,
              tag: `comment-${data.comment._id}`,
              requireInteraction: false,
              data: {
                articleId: data.article._id,
                commentId: data.comment._id,
                url: `/articles/${data.article._id}`
              }
            }
          );
        }
      }
    });

    // Listen for reply notifications
    this.socketService.onReplyNotification().subscribe({
      next: (data: any) => {
        console.log('📬 Reply notification received:', data);
        console.log('Active article rooms:', Array.from(this.activeArticleRooms));
        
        const isViewingArticle = this.activeArticleRooms.has(data.article._id);
        
        // Add to in-app notifications
        this.addInAppNotification({
          id: `reply-${data.reply._id}`,
          type: 'reply',
          title: 'New Reply',
          message: data.message,
          articleId: data.article._id,
          articleTitle: data.article.title,
          timestamp: new Date(),
          read: false,
          data: data
        });
        
        if (!isViewingArticle) {
          this.showNotification(
            '↩️ New Reply to Your Comment',
            {
              body: data.message,
              tag: `reply-${data.reply._id}`,
              requireInteraction: false,
              data: {
                articleId: data.article._id,
                commentId: data.reply._id,
                url: `/articles/${data.article._id}`
              }
            }
          );
        }
      }
    });
  }

  private showNotification(title: string, options?: NotificationOptions): void {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return;
    }

    if (this.notificationPermission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    // Show notification if user is not viewing the article (even if tab is visible)
    // This allows notifications to appear when user is on a different page
    console.log('📱 Showing notification:', title);

    const notification = new Notification(title, options);

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      
      if (options?.data?.url) {
        window.location.href = options.data.url;
      }
      
      notification.close();
    };

    // Auto close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);
  }

  // Track which article room the user is currently viewing
  setActiveArticleRoom(articleId: string): void {
    this.activeArticleRooms.add(articleId);
    console.log('Active article rooms:', Array.from(this.activeArticleRooms));
  }

  removeActiveArticleRoom(articleId: string): void {
    this.activeArticleRooms.delete(articleId);
    console.log('Active article rooms:', Array.from(this.activeArticleRooms));
  }

  clearActiveRooms(): void {
    this.activeArticleRooms.clear();
  }

  isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  getPermissionStatus(): NotificationPermission {
    return this.notificationPermission;
  }

  private addInAppNotification(notification: InAppNotification): void {
    // Check if notification already exists
    const exists = this.inAppNotifications.some(n => n.id === notification.id);
    if (!exists) {
      this.inAppNotifications.unshift(notification);
      // Keep only last 50 notifications
      if (this.inAppNotifications.length > 50) {
        this.inAppNotifications = this.inAppNotifications.slice(0, 50);
      }
      this.notificationsSubject.next([...this.inAppNotifications]);
      this.updateUnreadCount();
    }
  }

  getNotifications(): InAppNotification[] {
    return [...this.inAppNotifications];
  }

  markAsRead(notificationId: string): void {
    const notification = this.inAppNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.notificationsSubject.next([...this.inAppNotifications]);
      this.updateUnreadCount();
    }
  }

  markAllAsRead(): void {
    this.inAppNotifications.forEach(n => n.read = true);
    this.notificationsSubject.next([...this.inAppNotifications]);
    this.updateUnreadCount();
  }

  clearNotification(notificationId: string): void {
    this.inAppNotifications = this.inAppNotifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next([...this.inAppNotifications]);
    this.updateUnreadCount();
  }

  clearAllNotifications(): void {
    this.inAppNotifications = [];
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const unreadCount = this.inAppNotifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  getUnreadCount(): number {
    return this.inAppNotifications.filter(n => !n.read).length;
  }
}
