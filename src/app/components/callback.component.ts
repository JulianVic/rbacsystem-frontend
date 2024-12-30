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
      const success = await this.authService.tryLogin();
      if (success) {
        this.router.navigate(['/']);
      } else {
        this.error = 'Error de autenticación';
      }
    } catch (error) {
      console.error('Error en callback:', error);
      this.error = 'Error de autenticación';
    } finally {
      this.loading = false;
    }
  }
}