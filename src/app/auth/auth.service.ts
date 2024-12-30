import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from './auth-config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userProfile: any = null;

  constructor(private oauthService: OAuthService) {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  async loadUserProfile(): Promise<any> {
    if (!this.userProfile) {
      this.userProfile = await this.oauthService.loadUserProfile();
    }
    return this.userProfile;
  }

  getUserInfo(): any {
    return this.userProfile || this.oauthService.getIdentityClaims();
  }

  login(): void {
    this.oauthService.initLoginFlow();
  }

  logout(): void {
    this.oauthService.logOut();
  }

  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  async tryLogin(): Promise<boolean> {
    return await this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }
  
}
