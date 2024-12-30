import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-callback',
  template: `
    <div *ngIf="loading">Procesando autenticación...</div>
    <div *ngIf="!loading && error">{{ error }}</div>
  `,
})
export class CallbackComponent implements OnInit {
  loading = true;
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.authService.tryLogin();
      await this.authService.loadUserProfile();
      this.router.navigate(['/']);
    } catch (error) {
      this.error = 'Error de autenticación';
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}