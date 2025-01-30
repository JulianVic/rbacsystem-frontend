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

  getGrant(userId: string, grantId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/grants/${grantId}`, { headers: this.getHeaders() });
  }

  createGrant(userId: string, projectId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/grants`, { projectId }, { headers: this.getHeaders() });
  }

  updateGrant(userId: string, grantId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/grants/${grantId}`, data, { headers: this.getHeaders() });
  }

  removeGrant(userId: string, grantId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}/grants/${grantId}`, { headers: this.getHeaders() });
  }

  findAll(): Observable<any> {
    const body = {
      projectIdQuery: {
        projectId: "298723041083434695"
      }
    };
    return this.http.post(`${this.apiUrl}/grants`, body, { headers: this.getHeaders() });
  }
} 