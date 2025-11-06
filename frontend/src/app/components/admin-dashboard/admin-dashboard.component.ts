import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { BaseService } from '../../services/base.service';
import { User, UserRole } from '../../models/user.model';

interface UserWithStats extends User {
  articleCount?: number;
  commentCount?: number;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent extends BaseService implements OnInit {
  users: UserWithStats[] = [];
  loading = false;
  error = '';
  successMessage = '';

  userRoles = Object.values(UserRole);

  stats = {
    totalUsers: 0,
    totalArticles: 0,
    totalComments: 0,
    adminCount: 0,
    editorCount: 0,
    writerCount: 0,
    readerCount: 0
  };

  constructor(
    http: HttpClient,
    private authService: AuthService
  ) {
    super(http);
  }

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';
    
    this.get<any>('/admin/users').subscribe({
      next: (response) => {
        if (response.data && response.data.users) {
          this.users = response.data.users;
          this.stats.totalUsers = this.users.length;
          this.calculateRoleCounts();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadStats(): void {
    this.get<any>('/admin/stats').subscribe({
      next: (response) => {
        if (response.data) {
          this.stats.totalUsers = response.data.totalUsers || 0;
          this.stats.totalArticles = response.data.totalArticles || 0;
          this.stats.totalComments = response.data.totalComments || 0;
        }
      },
      error: (err) => {
        console.error('Failed to load stats:', err);
      }
    });
  }

  calculateRoleCounts(): void {
    this.stats.adminCount = this.users.filter(u => u.role === UserRole.ADMIN).length;
    this.stats.editorCount = this.users.filter(u => u.role === UserRole.EDITOR).length;
    this.stats.writerCount = this.users.filter(u => u.role === UserRole.WRITER).length;
    this.stats.readerCount = this.users.filter(u => u.role === UserRole.READER).length;
  }

  updateUserRole(userId: string, newRole: UserRole): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && userId === currentUser._id) {
      alert('You cannot change your own role!');
      return;
    }

    this.put(`/admin/users/${userId}/role`, { role: newRole }).subscribe({
      next: (response: any) => {
        this.successMessage = 'User role updated successfully';
        const user = this.users.find(u => u._id === userId);
        if (user) {
          user.role = newRole;
          this.calculateRoleCounts();
        }
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        alert('Failed to update user role');
        console.error(err);
      }
    });
  }

  deleteUser(userId: string): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && userId === currentUser._id) {
      alert('You cannot delete your own account!');
      return;
    }

    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    this.delete(`/admin/users/${userId}`).subscribe({
      next: () => {
        this.successMessage = 'User deleted successfully';
        this.users = this.users.filter(u => u._id !== userId);
        this.stats.totalUsers = this.users.length;
        this.calculateRoleCounts();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        alert('Failed to delete user');
        console.error(err);
      }
    });
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-700';
      case UserRole.EDITOR:
        return 'bg-blue-100 text-blue-700';
      case UserRole.WRITER:
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  isCurrentUser(userId: string): boolean {
    const currentUser = this.authService.currentUserValue;
    return currentUser ? currentUser._id === userId : false;
  }
}
