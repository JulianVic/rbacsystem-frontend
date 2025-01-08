import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ConnectivityService } from '../services/connectivity.service';
import { AccessService } from '../services/access.service';
@Component({
  selector: 'app-operations',
  template: `
    <div class="operations-container">
      <h3>Operations Available</h3>

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

  constructor(
    private connectivityService: ConnectivityService,
    private authService: AuthService,
    private accessService: AccessService
  ) {}

  ngOnInit() {
    this.checkRoles();
  }

  checkRoles() {
    const userRoles = this.authService.getUserRoles();
    if (!userRoles) {
      console.error('No se encontraron roles de usuario');
      return;
    }

    this.canResetLine = this.accessService.hasAccess('reset_line', userRoles);
    this.canTestConnectivity = this.accessService.hasAccess('test_connectivity', userRoles);
    this.canFacture = this.accessService.hasAccess('facture', userRoles);
  }

  resetLine() {
    this.connectivityService.resetLine().subscribe({
      next: () => {
        this.message = 'Line reset successfully';
        this.messageClass = 'success-message';
      },
      error: () => {
        this.message = 'Error resetting line';
        this.messageClass = 'error-message';
      }
    });
  }

  testConnectivity() {
    this.connectivityService.testConnectivity().subscribe({
      next: () => {
        this.message = 'Connectivity test successful';
        this.messageClass = 'success-message';
      },
      error: () => {
        this.message = 'Error testing connectivity';
        this.messageClass = 'error-message';
      }
    });
  }

  facture() {
    this.connectivityService.facture().subscribe({
      next: () => {
        this.message = 'Facture successful';
        this.messageClass = 'success-message';
      },
      error: () => {
        this.message = 'Error facturing';
        this.messageClass = 'error-message';
      }
    });
  }
}