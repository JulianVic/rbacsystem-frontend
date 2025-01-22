import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewRole {
    roleKey: string;
    displayName: string;    
    group?: string;
    projectId: string;
  }
  
export interface Role {
    roleKey: string;
    displayName: string;
    group?: string;
  }
  
export interface RoleResponse {
    details: {
      totalResult: string;
      viewTimestamp: string;
    };
    result: Array<{
      key: string;
      displayName: string;
      group?: string;
      details: {
        sequence?: string;
        creationDate?: string;
        changeDate?: string;
        resourceOwner?: string;
      };
    }>;
  }

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private apiUrl = 'http://localhost:3000/api/role';
  
  constructor(private http: HttpClient) {}

  getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  createRole(newRole: NewRole): Observable<any> {
    return this.http.post(this.apiUrl, newRole, { headers: this.getHeaders() });
  }

  getRoles(): Observable<RoleResponse> {
    return this.http.get<RoleResponse>(this.apiUrl, { headers: this.getHeaders() });
  }

  updateRole(roleKey: string, role: Partial<Role>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${roleKey}`, role, { headers: this.getHeaders() });
  }

  deleteRole(roleKey: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${roleKey}`, { headers: this.getHeaders() });
  }
} 