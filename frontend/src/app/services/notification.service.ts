import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { SocketService } from './socket.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export interface InAppNotification {
  id: string;
  type: 'comment' | 'reply' | 'like';
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
  private apiUrl = environment.apiUrl + '/notifications';

  constructor(
    private http: HttpClient,
    private socketService: SocketService,
    private authService: AuthService
  ) {
    this.checkNotificationSupport();
    
    // Wait for auth state and then setup listeners
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User is logged in, fetch old notifications and setup listeners
        // Use longer delay and Promise.resolve to avoid ExpressionChangedAfterItHasBeenCheckedError
        Promise.resolve().then(() => {
          setTimeout(() => {
            this.fetchNotifications();
            this.setupNotificationListeners();
          }, 1500);
        });
      } else {
        // User logged out, clear notifications
        Promise.resolve().then(() => {
          this.clearAllNotifications();
        });
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
        
        // Check if user is currently viewing the article
        const isViewingArticle = this.activeArticleRooms.has(data.article._id);
        
        // Fetch notifications from backend to get the saved notification with proper ID
        // This will update our local list with the persisted notification
        setTimeout(() => this.fetchNotifications(), 500);
        
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
      
        const isViewingArticle = this.activeArticleRooms.has(data.article._id);
        
        // Fetch notifications from backend to get the saved notification with proper ID
        // This will update our local list with the persisted notification
        setTimeout(() => this.fetchNotifications(), 500);
        
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

    // Listen for like notifications
    this.socketService.onLikeNotification().subscribe({
      next: (data: any) => {
        console.log('👍 Like notification received:', data);
        
        const isViewingArticle = this.activeArticleRooms.has(data.article._id);
        
        // Fetch notifications from backend to get the saved notification with proper ID
        setTimeout(() => this.fetchNotifications(), 500);
        
        if (!isViewingArticle) {
          this.showNotification(
            '❤️ Someone Liked Your Article',
            {
              body: data.message,
              tag: `like-${data.like._id}`,
              requireInteraction: false,
              data: {
                articleId: data.article._id,
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
  }

  removeActiveArticleRoom(articleId: string): void {
    this.activeArticleRooms.delete(articleId);
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
    // Check if notification already exists (check by article and comment combo to avoid duplicates)
    const exists = this.inAppNotifications.some(n => 
      n.articleId === notification.articleId && 
      n.message === notification.message
    );
    if (!exists) {
      this.inAppNotifications.unshift(notification);
      // Keep only last 50 notifications
      if (this.inAppNotifications.length > 50) {
        this.inAppNotifications = this.inAppNotifications.slice(0, 50);
      }
      this.notificationsSubject.next([...this.inAppNotifications]);
      this.updateUnreadCount();
      
      // Save to backend for persistence
      this.saveNotificationToBackend(notification);
    }
  }

  private saveNotificationToBackend(notification: InAppNotification): void {
    // Don't save if it came from backend (it already has a backend ID)
    if (notification.data?._id) {
      return;
    }
    
    // For new notifications from Socket.io, they'll be saved by the backend automatically
    // We don't need to manually save them here
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
    
    // Sync with backend
    this.http.put(`${this.apiUrl}/read-all`, {}).subscribe({
      next: () => console.log('✅ All notifications marked as read on server'),
      error: (err) => console.error('❌ Error marking all as read:', err)
    });
  }

  clearNotification(notificationId: string): void {
    this.inAppNotifications = this.inAppNotifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next([...this.inAppNotifications]);
    this.updateUnreadCount();
    
    // Sync with backend
    this.http.delete(`${this.apiUrl}/${notificationId}`).subscribe({
      next: () => {},
      error: (err) => console.error('❌ Error deleting notification:', err)
    });
  }

  clearAllNotifications(): void {
    this.inAppNotifications = [];
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
    
    // Sync with backend only if user is logged in
    if (this.authService.isLoggedIn()) {
      this.http.delete(`${this.apiUrl}`).subscribe({
        next: () => {},
        error: (err) => console.error('❌ Error deleting all notifications:', err)
      });
    }
  }

  fetchNotifications(): void {
    if (!this.authService.isLoggedIn()) {
      return;
    }
    
    this.http.get<any>(`${this.apiUrl}`).subscribe({
      next: (response) => {
        
        // Convert backend notifications to InAppNotification format
        const notifications: InAppNotification[] = response.data.notifications.map((n: any) => ({
          id: n._id, // Use MongoDB _id directly
          type: n.type,
          title: n.title,
          message: n.message,
          articleId: n.article,
          articleTitle: n.articleTitle,
          timestamp: new Date(n.createdAt),
          read: n.read,
          data: n
        }));
        
        this.inAppNotifications = notifications;
        this.notificationsSubject.next([...this.inAppNotifications]);
        this.updateUnreadCount();
      },
      error: (err) => {
        console.error('❌ Error fetching notifications:', err);
      }
    });
  }

  private updateUnreadCount(): void {
    const unreadCount = this.inAppNotifications.filter(n => !n.read).length;
    // Use Promise.resolve to defer the update and avoid ExpressionChangedAfterItHasBeenCheckedError
    Promise.resolve().then(() => {
      this.unreadCountSubject.next(unreadCount);
    });
  }

  getUnreadCount(): number {
    return this.inAppNotifications.filter(n => !n.read).length;
  }
}
