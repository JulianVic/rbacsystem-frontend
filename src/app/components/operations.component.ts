// protected.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ConnectivityService } from '../services/connectivity.service';

@Component({
  selector: 'app-operations',
  template: `
    <div class="operations-container">
      <h3>Operaciones Disponibles</h3>
      
      <div class="buttons-container">
        <button *ngIf="canResetLine" (click)="resetLine()" class="operation-button">
          Reset Line
        </button>

        <button *ngIf="canTestConnectivity" (click)="testConnectivity()" class="operation-button">
          Test Connectivity
        </button>

        <button *ngIf="canFacture" (click)="facture()" class="operation-button">
          Facture
        </button>
      </div>

      <div *ngIf="message" [class]="messageClass">
        {{ message }}
      </div>
    </div>
  `,
  styles: [`
    .operations-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    .buttons-container {
      display: flex;
      gap: 10px;
      margin: 20px 0;
    }
    .operation-button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background-color: #007bff;
      color: white;
      cursor: pointer;
    }
    .operation-button:hover {
      background-color: #0056b3;
    }
    .success-message {
      color: green;
      padding: 10px;
      background-color: #e8f5e9;
      border-radius: 4px;
    }
    .error-message {
      color: red;
      padding: 10px;
      background-color: #ffebee;
      border-radius: 4px;
    }
  `]
})
export class ProtectedComponent implements OnInit {
  canFacture: boolean = false;
  canTestConnectivity: boolean = false;
  canResetLine: boolean = false;
  message: string = '';
  messageClass: string = '';
  userRoles: string[] = [];

  constructor(private connectivityService: ConnectivityService, private authService: AuthService) {}

  ngOnInit() {
    this.checkRoles();
  }

  checkRoles() {
    const userInfo = this.authService.getUserRoles() || {};
    console.log('User Info:', userInfo);
    
    const roles = ['facture'];
    console.log('Roles:', roles);

    this.canFacture = Array.isArray(roles) && roles.includes('facture');
    this.canTestConnectivity = Array.isArray(roles) && roles.includes('test_connectivity');
    this.canResetLine = Array.isArray(roles) && roles.includes('reset_line');
  }

  resetLine() {
    this.connectivityService.resetLine().subscribe({
      next: (response) => this.message = 'Line reset successfully',
      error: (err) => this.message = 'Error resetting line'
    });
  }

  testConnectivity() {
    this.connectivityService.testConnectivity().subscribe({
      next: (response) => this.message = 'Connectivity test successful',
      error: (err) => this.message = 'Error testing connectivity'
    });
  }

  facture() {
    this.connectivityService.facture().subscribe({
      next: (response) => this.message = 'Facture successful',
      error: (err) => this.message = 'Error facturing'
    });
  }

  // ngOnInit() {
  //   this.protectedService.getProtectedData().subscribe({
  //     next: (response) => this.data = console.log(response),
  //     error: (err) => this.error = 'Error accessing protected data'
  //   });
  // }
}