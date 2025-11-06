import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  mobileMenuOpen = false;
  showNotificationPrompt = false;
  showNotificationDropdown = false;
  unreadCount = 0;

  constructor(
    public authService: AuthService,
    private router: Router,
    public notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Check if we should show notification prompt
    if (this.authService.isLoggedIn() && this.notificationService.isNotificationSupported()) {
      const permission = this.notificationService.getPermissionStatus();
      this.showNotificationPrompt = permission === 'default';
    }

    // Subscribe to unread count
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  async enableNotifications(): Promise<void> {
    const granted = await this.notificationService.requestPermission();
    if (granted) {
      this.showNotificationPrompt = false;
      alert('✅ Notifications enabled! You\'ll receive alerts when users comment on your articles.');
    } else {
      alert('❌ Notification permission denied. You can enable it later in your browser settings.');
    }
  }

  dismissNotificationPrompt(): void {
    this.showNotificationPrompt = false;
  }

  toggleNotificationDropdown(): void {
    this.showNotificationDropdown = !this.showNotificationDropdown;
    if (this.showNotificationDropdown) {
      // Mark all as read when opening
      setTimeout(() => {
        this.notificationService.markAllAsRead();
      }, 1000);
    }
  }

  closeNotificationDropdown(): void {
    this.showNotificationDropdown = false;
  }

  navigateToArticle(articleId: string): void {
    this.closeNotificationDropdown();
    this.router.navigate(['/articles', articleId]);
  }

  clearNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.notificationService.clearNotification(notificationId);
  }

  clearAllNotifications(): void {
    this.notificationService.clearAllNotifications();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.router.navigate(['/login']);
      }
    });
  }
}
