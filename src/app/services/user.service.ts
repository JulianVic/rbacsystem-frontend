import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum Gender {
  GENDER_UNSPECIFIED = 'GENDER_UNSPECIFIED',
  GENDER_FEMALE = 'GENDER_FEMALE',
  GENDER_MALE = 'GENDER_MALE',
  GENDER_DIVERSE = 'GENDER_DIVERSE',
}

export interface SendCodeDto {
  urlTemplate?: string;
}

export interface EmailDto {
  email: string;
  sendCode?: SendCodeDto;
  isVerified?: boolean;
}

export interface PhoneDto {
  phone?: string;
  sendCode?: SendCodeDto;
  isVerified?: boolean;
}

export interface ProfileDto {
  givenName: string;
  familyName: string;
  nickName?: string;
  displayName?: string;
  preferredLanguage?: string;
  gender?: Gender;
}

export interface PasswordDto {
  password: string;
  changeRequired?: boolean;
}

export interface OrganizationDto {
  orgId?: string;
  orgDomain?: string;
}

export interface MetadataDto {
  key: string;
  value: string;
}

export interface HashedPasswordDto {
  hash: string;
  changeRequired?: boolean;
}

export interface IdpLinkDto {
  idpId: string;
  userId: string;
  userName: string;
}

export interface CreateUserDto {
  userId?: string;
  username?: string;
  organization?: OrganizationDto;
  profile: ProfileDto;
  email: EmailDto;
  phone?: PhoneDto;
  metadata?: MetadataDto[];
  password: PasswordDto;
  hashedPassword?: HashedPasswordDto;
  idpLinks?: IdpLinkDto[];
  totpSecret?: string;
}

export interface UpdateUserDto {
  username: string;
  profile: ProfileDto;
  email: EmailDto;
  phone?: PhoneDto;
  password?: {
    currentPassword: string;
    password?: PasswordDto;
    hashedPassword?: HashedPasswordDto;
    verificationCode?: string;
  };
}

export interface UserResponse {
  result: any[];
  details: {
    totalResult: number;
  };
}

// ... existing code ...

export interface UpdateUserDto {
  username: string;
  profile: ProfileDto;
  email: EmailDto;
  phone?: PhoneDto;
  password?: PasswordUpdateDto;
}

export interface ProfileDto {
  givenName: string;
  familyName: string;
  nickName?: string;
  displayName?: string;
  preferredLanguage?: string;
  gender?: Gender;
}

export interface EmailDto {
  email: string;
  sendCode?: SendCodeDto;
  isVerified?: boolean;
}

export interface SendCodeDto {
  urlTemplate?: string;
}

export interface PhoneDto {
  phone?: string;
  sendCode?: SendCodeDto;
  isVerified?: boolean;
}

export interface PasswordUpdateDto {
  password?: PasswordDto;
  hashedPassword?: HashedPasswordDto;
  currentPassword: string;
  verificationCode?: string;
}

export interface PasswordDto {
  password: string;
  changeRequired?: boolean;
}

export interface HashedPasswordDto {
  hash: string;
  changeRequired?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/user';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    });
  }

  createUser(user: CreateUserDto): Observable<any> {
    return this.http.post(this.apiUrl, user, { headers: this.getHeaders() });
  }

  getUsers(): Observable<UserResponse> {
    return this.http.get<UserResponse>(this.apiUrl, {
      headers: this.getHeaders(),
    });
  }

  updateUser(userId: string, user: UpdateUserDto): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${userId}`, user, {
      headers: this.getHeaders(),
    });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${userId}`, {
      headers: this.getHeaders(),
    });
  }
}
