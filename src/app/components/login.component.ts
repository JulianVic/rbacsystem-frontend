import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div *ngIf="!isAuthenticated; else loggedIn">
      <button (click)="login()">Login</button>
    </div>

    <ng-template #loggedIn>
      <h2>Welcome, {{ userInfo?.name || 'Usuario' }}</h2>
      <p>Email: {{ userInfo?.email || 'No disponible' }}</p>
      <p>ID de Usuario: {{ userInfo?.sub || 'N/A' }}</p>
      <button (click)="logout()">Cerrar sesión</button>
    </ng-template>
  `,
})
export class LoginComponent implements OnInit {
  userInfo: any = null;
  isAuthenticated = false;

  constructor(private authService: AuthService) {}

  async ngOnInit(): Promise<void> {
    this.isAuthenticated = this.authService.isAuthenticated();

    if (this.isAuthenticated) {
      this.userInfo = await this.authService.getUserInfo();
      console.log('Información del usuario:', this.userInfo);
    }
  }

  login(): void {
    this.authService.login();
  }

  logout(): void {
    this.authService.logout();
  }
}
