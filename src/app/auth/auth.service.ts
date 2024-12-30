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
    this.oauthService.loadDiscoveryDocument();
  }

  async tryLogin(): Promise<boolean> {
    try {
      const loggedIn = await this.oauthService.tryLoginCodeFlow();
      if (this.isAuthenticated()) {
        await this.loadUserProfile();
      }
      return this.isAuthenticated();
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async loadUserProfile(): Promise<any> {
    try {
      if (this.oauthService.hasValidAccessToken()) {
        this.userProfile = await this.oauthService.loadUserProfile();
        return this.userProfile;
      }
      return null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  getUserInfo(): any {
    if (this.userProfile) {
      return this.userProfile.info || this.userProfile;
    }
    return this.oauthService.getIdentityClaims();
  }

  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  login(): void {
    this.oauthService.initLoginFlow();
  }

  logout(): void {
    this.oauthService.logOut();
    this.userProfile = null;
  }
}
