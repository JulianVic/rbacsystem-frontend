import { Component, OnInit } from '@angular/core';
import { ConnectivityService } from '../services/connectivity.service';
import { AuthService } from '../auth/auth.service';

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
export class OperationsComponent implements OnInit {
  canResetLine = false;
  canTestConnectivity = false;
  canFacture = false;
  message = '';
  messageClass = '';

  constructor(
    private connectivityService: ConnectivityService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkPermissions();
  }

  private checkPermissions() {
    const userInfo = this.authService.getUserInfo();
    const roles = userInfo['urn:zitadel:iam:org:project:298723041083434695:roles'] || {};
    const userRole = Object.keys(roles)[0];

    this.canResetLine = ['admin', 'gerent', 'facilities'].includes(userRole);
    this.canTestConnectivity = ['support', 'facilities', 'gerent'].includes(userRole);
    this.canFacture = ['admin', 'gerent'].includes(userRole);
  }

  resetLine() {
    this.connectivityService.resetLine().subscribe({
      next: (response: any) => {
        this.showMessage(response.message, 'success');
      },
      error: (error) => {
        this.showMessage('Error al resetear la línea', 'error');
      }
    });
  }

  testConnectivity() {
    this.connectivityService.testConnectivity().subscribe({
      next: (response: any) => {
        this.showMessage(response.message, 'success');
      },
      error: (error) => {
        this.showMessage('Error al probar la conectividad', 'error');
      }
    });
  }

  facture() {
    this.connectivityService.facture().subscribe({
      next: (response: any) => {
        this.showMessage(response.message, 'success');
      },
      error: (error) => {
        this.showMessage('Error al generar la factura', 'error');
      }
    });
  }

  private showMessage(message: string, type: 'success' | 'error') {
    this.message = message;
    this.messageClass = `${type}-message`;
    setTimeout(() => {
      this.message = '';
      this.messageClass = '';
    }, 3000);
  }
} 