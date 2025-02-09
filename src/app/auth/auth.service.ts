// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { AccessService } from '../services/access.service';
import { authConfig } from './auth-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTHORIZATION_ENDPOINT = 'https://myinstance1-crzbwj.us1.zitadel.cloud/oauth/v2/authorize';
  private readonly TOKEN_ENDPOINT = authConfig.tokenEndpoint;
  private readonly CLIENT_ID = authConfig.clientId;
  private readonly REDIRECT_URI = authConfig.redirectUri;
  private readonly SCOPE = authConfig.scope;

  private userRoles: any = null;

  private readonly ZITADEL_DOMAIN = 'myinstance1-crzbwj.us1.zitadel.cloud';

  constructor(
    private http: HttpClient, 
    private oauthService: OAuthService,
    private accessService: AccessService
  ) {}

  private async generateCodeVerifier(): Promise<string> {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await window.crypto.subtle.digest('SHA-256', data);
    return this.base64URLEncode(new Uint8Array(hash));
  }

  private base64URLEncode(buffer: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  public async initiateLogin(): Promise<void> {
    const state = this.generateRandomState();
    const codeVerifier = await this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    localStorage.setItem('code_verifier', codeVerifier);
    localStorage.setItem('state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID ?? '',
      redirect_uri: this.REDIRECT_URI ?? '',
      scope: this.SCOPE ?? '',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    window.location.href = `${this.AUTHORIZATION_ENDPOINT}?${params.toString()}`;
  }

  public handleCallback(code: string, state: string): Observable<any> {
    const savedState = localStorage.getItem('state');
    const codeVerifier = localStorage.getItem('code_verifier');

    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.REDIRECT_URI ?? '',
      client_id: this.CLIENT_ID ?? '',
      code_verifier: codeVerifier!
    });

    return this.http.post<any>(this.TOKEN_ENDPOINT ?? '', body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }

  private generateRandomState(): string {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  public getUserRoles() {
    if (this.userRoles) {
      return this.userRoles;
    }

    const idToken = localStorage.getItem('access_token');//
    if (!idToken) {
      console.log('No se encontró token ID');
      return null;
    }

    try {
      const tokenPayload1 = JSON.parse(atob(idToken.split('.')[1]));      
      const roles = tokenPayload1['urn:zitadel:iam:org:project:roles'];
      const role = roles ? Object.keys(roles)[0] : null;
      
      this.userRoles = {
        role: role,
        experienceLevel: 'junior',
      };
      return this.userRoles;
    } catch (error) {
      console.error('Error decodificando el token:', error);
      return null;
    }
  }

  public hasAccess(operation: string): boolean {
    const userRoles = this.getUserRoles();
    if (!userRoles) return false;
    
    return this.accessService.hasAccess(operation, userRoles);
  }

  public searchUserMemberships(userId: string) {
    // const endpoint = `https://${this.ZITADEL_DOMAIN}/auth/v1/permissions/zitadel/me/_search`;  *endpoint de zitadel*
    const endpoint = `http://localhost:3000/api/auth/permissions/zitadel/me`;  //endpoint de backend

    return this.http.get(endpoint, { 
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Accept': 'application/json'
      })
    });
  }

  public getUserIdFromToken(): string | null {
    const idToken = localStorage.getItem('id_token');
    if (!idToken) return null;

    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      return payload.sub;
    } catch (error) {
      console.error('Error decodificando el token:', error);
      return null;
    }
  }

  // public hasAdminRole(memberships: any): boolean {
  //   const adminRoles = [
  //       'IAM_OWNER',
  //       'IAM_ORG_MANAGER',
  //       'ORG_OWNER',
  //       'PROJECT_OWNER'
  //   ];

  //   return memberships?.result?.some((membership: any) => 
  //       membership.roles?.some((role: string) => 
  //           adminRoles.includes(role)
  //       )
  //   ) || false;
  // }
}