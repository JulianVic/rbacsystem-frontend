import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('Interceptor running');
    const token = localStorage.getItem('access_token');
    console.log('Token found:', !!token);
    
    if (token) {
      const cloned = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Request headers:', cloned.headers.get('Authorization'));
      return next.handle(cloned);
    }
    return next.handle(request);
  }
}