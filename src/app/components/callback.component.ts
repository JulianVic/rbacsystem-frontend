import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service'; 

@Component({
  selector: 'app-callback',
  template: '<div>Processing authentication...</div>'
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];

      if (code && state) {
        this.authService.handleCallback(code, state).subscribe({
          next: (response) => {
            // Guarda los tokens y redirige
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('id_token', response.id_token);
            this.router.navigate(['/protected']);
          },
          error: (error) => {
            console.error('Authentication error:', error);
            this.router.navigate(['/login']);
          }
        });
      }
    });
  }
}