import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  private apiUrl = 'http://localhost:3000/api/conn';

  constructor(
    private http: HttpClient,
    private oauthService: OAuthService
  ) {}

  private getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.oauthService.getAccessToken()}`
      })
    };
  }

  resetLine() {
    return this.http.put(`${this.apiUrl}/reset_line`, {}, this.getHeaders());
  }

  testConnectivity() {
    return this.http.get(`${this.apiUrl}/test_connectivity`, this.getHeaders());
  }

  facture() {
    return this.http.post(`${this.apiUrl}/facture`, {}, this.getHeaders());
  }
}