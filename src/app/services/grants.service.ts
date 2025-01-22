import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoleResponse } from './role.service';

export interface Grant {
  id: string;
  roleKey: string;
  grantId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GrantsService {
  private apiUrl = 'http://localhost:3000/api/user';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    });
  }
  getRoles(): Observable<RoleResponse> {
    return this.http.get<RoleResponse>('http://localhost:3000/api/role', { headers: this.getHeaders() });
  }

  getGrant(userId: string, grantId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/grants/${grantId}`, { headers: this.getHeaders() });
  }

  updateGrant(userId: string, grantId: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}/grants/${grantId}`, data, { headers: this.getHeaders() });
  }

  removeGrant(userId: string, grantId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/grants/${grantId}`, { headers: this.getHeaders() });
  }
} 