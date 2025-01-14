import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { ConnectivityService } from '../../../services/connectivity.service';
import { AccessService } from '../../../services/access.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface NewRole {
  roleKey: string;
  displayName: string;
  group?: string;
  projectId: string;
}

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.css']
})
export class ProtectedComponent implements OnInit {
  canFacture: boolean = false;
  canTestConnectivity: boolean = false;
  canResetLine: boolean = false;
  message: string = '';
  messageClass: string = '';
  canCreateRole: boolean = false;
  private projectId: string = '298723041083434695';
  showModal: boolean = false;
  newRole: NewRole = {
    roleKey: '',
    displayName: '',
    group: '',
    projectId: this.projectId
  };

  constructor(
    private connectivityService: ConnectivityService,
    private authService: AuthService,
    private accessService: AccessService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.checkRoles();
    this.loadUserMemberships();
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

  loadUserMemberships() {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      return;
    }

    this.authService.searchUserMemberships(userId).subscribe({
      next: (response) => {
        const requiredPermission = `project.role.write:${this.projectId}`;
        this.canCreateRole = (response as { result: string[] }).result.includes(requiredPermission);
      },
      error: (error) => {
        if (error.status === 404) {
          console.log('Usuario sin memberships');
          this.canCreateRole = false;
        } else {
          console.error('Error obteniendo memberships:', error);
        }
      }
    });
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

  crearRol() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newRole = {
      roleKey: '',
      displayName: '',
      group: '',
      projectId: this.projectId
    };
  }

  submitRole() {
    if (!this.newRole.roleKey || !this.newRole.displayName) {
      this.message = 'Role Key y Display Name son obligatorios';
      this.messageClass = 'error-message';
      return;
    }

    const token = localStorage.getItem('access_token');

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.post('http://localhost:3000/api/role', this.newRole, { headers })
      .subscribe({
        next: () => {
          this.message = 'Rol creado exitosamente';
          this.messageClass = 'success-message';
          this.closeModal();
        },
        error: (error) => {
          const errorMessage = error.error?.message?.split('(')[0]?.trim() || 'Error al crear el rol';
          this.message = errorMessage;
          this.messageClass = 'error-message';
          console.error('Error:', error);
        }
      });
  }
}