import { Component } from '@angular/core';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <button (click)="login()">Login with ZITADEL</button>
    </div>
  `
})
export class LoginComponent {
  constructor(private authService: AuthService) {}

  login() {
    this.authService.initiateLogin();
  }
}