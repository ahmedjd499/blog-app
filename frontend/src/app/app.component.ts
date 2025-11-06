import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Blog Platform';

  constructor(
    public authService: AuthService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    // Subscribe to auth changes and manage socket connection
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.socketService.connect();
      } else {
        this.socketService.disconnect();
      }
    });
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }
}
