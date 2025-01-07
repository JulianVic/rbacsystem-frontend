// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTHORIZATION_ENDPOINT = 'https://myinstance1-crzbwj.us1.zitadel.cloud/oauth/v2/authorize';
  private readonly TOKEN_ENDPOINT = 'https://myinstance1-crzbwj.us1.zitadel.cloud/oauth/v2/token';
  private readonly CLIENT_ID = '300384420517489408';
  private readonly REDIRECT_URI = 'http://localhost:4200/callback/';
  private readonly SCOPE = 'openid profile email urn:zitadel:iam:org:project:298723041083434695:zitadel:aud';
  private userProfile: any;

  constructor(private http: HttpClient, private oauthService: OAuthService) {}

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
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      scope: this.SCOPE,
      state: state,
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
      redirect_uri: this.REDIRECT_URI,
      client_id: this.CLIENT_ID,
      code_verifier: codeVerifier!
    });

    return this.http.post(this.TOKEN_ENDPOINT, body.toString(), {
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
    if(this.userProfile) {
      return this.userProfile.info || this.userProfile;
    }
    return this.oauthService.getIdentityClaims();
  }
}
///