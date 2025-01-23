import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../auth/auth.service';
import { ConnectivityService } from '../../../services/connectivity.service';
import { AccessService } from '../../../services/access.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Role, NewRole, RoleResponse } from '../../../services/role.service';
import { UserService, CreateUserDto, UpdateUserDto, Gender } from '../../../services/user.service';
import { GrantsService } from '../../../services/grants.service';

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
  showOperationModal: boolean = false;
  roleMessage: string = '';
  roles: Role[] = [];
  showRolesModal: boolean = false;
  showEditModal: boolean = false;
  editingRole: Role = { roleKey: '', displayName: '', group: '' };
  editMessage: string = '';
  editMessageClass: string = '';
  showUserModal: boolean = false;
  showUsersModal: boolean = false;
  showEditUserModal: boolean = false;
  users: any[] = [];
  userMessage: string = '';
  editingUser: any = null;
  newUser: CreateUserDto = {
    profile: {
      givenName: '',
      familyName: '',
      gender: Gender.GENDER_UNSPECIFIED
    },
    email: {
      email: ''
    },
    password: {
      password: ''
    }
  };
  activeTab: 'human' | 'machine' = 'human';
  Gender = Gender;
  showGrantsModal: boolean = false;
  grants: any[] = [];
  showCreateGrantModal: boolean = false;
  selectedUserId: string = '';

  constructor(
    private connectivityService: ConnectivityService,
    private authService: AuthService,
    private accessService: AccessService,
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private grantsService: GrantsService
  ) {}

  ngOnInit() {
    if(!localStorage.getItem('access_token')){
      this.router.navigate(['/login']);
    }
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
      next: (response: any) => {
        const requiredPermission = `project.role.write:${this.projectId}`;
        this.canCreateRole = response?.result ? response.result.includes(requiredPermission) : false;
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
        this.message = 'Línea reiniciada exitosamente';
        this.messageClass = 'alert-success';
        this.showOperationModal = true;
      },
      error: () => {
        this.message = 'Error al reiniciar la línea';
        this.messageClass = 'alert-error';
        this.showOperationModal = true;
      }
    });
  }

  testConnectivity() {
    this.connectivityService.testConnectivity().subscribe({
      next: () => {
        this.message = 'Prueba de conectividad exitosa';
        this.messageClass = 'alert-success';
        this.showOperationModal = true;
      },
      error: () => {
        this.message = 'Error en la prueba de conectividad';
        this.messageClass = 'alert-error';
        this.showOperationModal = true;
      }
    });
  }

  facture() {
    this.connectivityService.facture().subscribe({
      next: () => {
        this.message = 'Facturación realizada exitosamente';
        this.messageClass = 'alert-success';
        this.showOperationModal = true;
      },
      error: () => {
        this.message = 'Error en la facturación';
        this.messageClass = 'alert-error';
        this.showOperationModal = true;
      }
    });
  }

  crearRol() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
    this.roleMessage = '';
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
      this.roleMessage = 'Role Key y Display Name son obligatorios';
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
          this.closeModal();
          this.message = 'Rol creado exitosamente';
          this.messageClass = 'alert-success';
          this.showOperationModal = true;
        },
        error: (error) => {
          this.closeModal();
          const errorMessage = error.error?.message?.split('(')[0]?.trim() || 'Error al crear el rol';
          this.message = errorMessage;
          this.messageClass = 'alert-error';
          this.showOperationModal = true;
        }
      });
  }

  closeOperationModal() {
    this.showOperationModal = false;
    this.message = '';
    this.messageClass = '';
  }

  consultarRoles() {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.get<RoleResponse>('http://localhost:3000/api/role', { headers })
      .subscribe({
        next: (response) => {
          this.roles = response.result.map((role: any) => ({
            roleKey: role.key,
            displayName: role.displayName,
            group: role.group || ''
          }));
          this.showRolesModal = true;
        },
        error: (error) => {
          console.error('Error al obtener roles:', error);
          this.message = 'Error al obtener los roles';
          this.messageClass = 'alert-error';
          this.showOperationModal = true;
        }
      });
  }

  closeRolesModal() {
    this.showRolesModal = false;
    this.roles = [];
  }

  editarRol(role: Role) {
    this.editingRole = { ...role };
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingRole = { roleKey: '', displayName: '', group: '' };
    this.editMessage = '';
  }

  guardarEdicion() {
    if (!this.editingRole.displayName) {
      this.editMessage = 'El Display Name es obligatorio';
      this.editMessageClass = 'alert-error';
      return;
    }

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    const body = {
      displayName: this.editingRole.displayName,
      group: this.editingRole.group
    };

    this.http.put(`http://localhost:3000/api/role/${this.editingRole.roleKey}`, body, { headers })
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.consultarRoles();
          this.message = 'Rol actualizado exitosamente';
          this.messageClass = 'alert-success';
          this.showOperationModal = true;
        },
        error: (error) => {
          this.closeEditModal();
          this.message = error.error?.message || 'Error al actualizar el rol';
          this.messageClass = 'alert-error';
          this.showOperationModal = true;
        }
      });
  }

  confirmarEliminarRol(role: Role) {
    if (confirm(`¿Está seguro que desea eliminar el rol "${role.displayName}"?`)) {
      this.eliminarRol(role);
    }
  }

  eliminarRol(role: Role) {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.delete(`http://localhost:3000/api/role/${role.roleKey}`, { headers })
      .subscribe({
        next: () => {
          this.roles = this.roles.filter(r => r.roleKey !== role.roleKey);
          this.message = 'Rol eliminado exitosamente';
          this.messageClass = 'alert-success';
          this.showOperationModal = true;
        },
        error: (error) => {
          console.error('Error al eliminar rol:', error);
          this.message = 'Error al eliminar el rol';
          this.messageClass = 'alert-error';
          this.showOperationModal = true;
        }
      });
  }

  crearUsuario() {
    this.showUserModal = true;
  }

  closeUserModal() {
    this.showUserModal = false;
    this.resetUserForm();
    this.userMessage = '';
  }

  resetUserForm() {
    this.newUser = {
      profile: {
        givenName: '',
        familyName: '',
        gender: Gender.GENDER_UNSPECIFIED
      },
      email: {
        email: ''
      },
      password: {
        password: ''
      }
    };
  }

  submitUser() {
    if (!this.newUser.profile.givenName || !this.newUser.profile.familyName || !this.newUser.email.email) {
      this.userMessage = 'Nombre, Apellido y Email son obligatorios';
      return;
    }

    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.closeUserModal();
        this.message = 'Usuario creado exitosamente';
        this.messageClass = 'alert-success';
        this.showOperationModal = true;
      },
      error: (error) => {
        this.closeUserModal();
        const errorMessage = error.error?.message || 'Error al crear el usuario';
        this.message = errorMessage;
        this.messageClass = 'alert-error';
        this.showOperationModal = true;
      }
    });
  }

  consultarUsuarios() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        console.log(response);
        this.users = response.result.map(user => ({
          ...user,
          profile: user.profile || {},
          email: user.email || {}
        }));
        this.showUsersModal = true;
        console.log(this.users);

      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
        this.message = 'Error al obtener los usuarios';
        this.messageClass = 'alert-error';
        this.showOperationModal = true;
      }
    });
  }

  closeUsersModal() {
    this.showUsersModal = false;
    this.users = [];
  }

  editarUsuario(user: any) {
    if (!user.human) {
      this.message = 'Solo se pueden editar usuarios humanos';
      this.messageClass = 'alert-error';
      this.showOperationModal = true;
      return;
    }

    this.editingUser = {
      id: user.userId,
      preferredLoginName: user.preferredLoginName,
      profile: {
        givenName: user.human.profile.givenName || '',
        familyName: user.human.profile.familyName || '',
        nickName: user.human.profile.nickName || '',
        displayName: user.human.profile.displayName || '',
        preferredLanguage: user.human.profile.preferredLanguage || '',
        gender: user.human.profile.gender || Gender.GENDER_UNSPECIFIED
      },
      email: {
        email: user.human.email?.email || '',
        isVerified: user.human.email?.isVerified || false
      }
    };
    
    this.showEditUserModal = true;
  }

  closeEditUserModal() {
    this.showEditUserModal = false;
    this.editingUser = null;
    this.userMessage = '';
  }

  guardarEdicionUsuario() {
    if (!this.editingUser.profile.givenName || !this.editingUser.profile.familyName) {
      this.userMessage = 'Nombre y Apellido son obligatorios';
      return;
    }

    const updateData: UpdateUserDto = {
      username: this.editingUser.preferredLoginName,
      profile: {
        givenName: this.editingUser.profile.givenName,
        familyName: this.editingUser.profile.familyName,
        displayName: `${this.editingUser.profile.givenName} ${this.editingUser.profile.familyName}`,
        gender: this.editingUser.profile.gender || Gender.GENDER_UNSPECIFIED
      },
      email: {
        email: this.editingUser.email.email,
        isVerified: this.editingUser.email.isVerified
      }
    };

    this.userService.updateUser(this.editingUser.id, updateData).subscribe({
      next: () => {
        this.closeEditUserModal();
        this.consultarUsuarios();
        this.message = 'Usuario actualizado exitosamente';
        this.messageClass = 'alert-success';
        this.showOperationModal = true;
      },
      error: (error) => {
        this.closeEditUserModal();
        this.message = error.error?.message || 'Error al actualizar el usuario';
        this.messageClass = 'alert-error';
        this.showOperationModal = true;
      }
    });
  }

  confirmarEliminarUsuario(user: any) {
    if (confirm(`¿Está seguro que desea eliminar el usuario "${user.human? user.human.profile.displayName : user.machine.name}"?`)) {
      this.eliminarUsuario(user.userId);
    }
  }

  eliminarUsuario(userId: string) {
    this.userService.deleteUser(userId).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.userId !== userId);
        this.message = 'Usuario eliminado exitosamente';
        this.messageClass = 'alert-success';
        this.showOperationModal = true;
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        this.message = 'Error al eliminar el usuario';
        this.messageClass = 'alert-error';
        this.showOperationModal = true;
      }
    });
  }

  filteredUsers(type: 'human' | 'machine'): any[] {
    return this.users.filter(user => {
      if (type === 'human') {
        return user.human !== undefined;
      } else {
        return user.machine !== undefined;
      }
    });
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    this.router.navigate(['/login']);
  }

  consultarAutorizaciones() {
    this.grantsService.findAll().subscribe({
      next: (response) => {
        this.grants = response.result;
        this.showGrantsModal = true;
      },
      error: (error) => {
        console.error('Error al obtener autorizaciones:', error);
        this.message = 'Error al obtener las autorizaciones';
        this.messageClass = 'alert-error';
        this.showOperationModal = true;
      }
    });
  }

  closeGrantsModal() {
    this.showGrantsModal = false;
    this.grants = [];
  }

  getUserDisplayName(entity: any): string {
    if (entity.human) {
      return entity.human.profile.displayName;
    } else if (entity.machine) {
      return entity.machine.name;
    } else if (entity.displayName) {
      return entity.displayName;
    } else if (entity.userType === 'TYPE_HUMAN') {
      return entity.displayName;
    }
    return entity.userName || 'Usuario sin nombre';
  }

  crearAutorizacion() {
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.users = response.result;
        this.showCreateGrantModal = true;
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
        this.message = 'Error al obtener los usuarios';
        this.messageClass = 'alert-error';
        this.showOperationModal = true;
      }
    });
  }

  closeCreateGrantModal() {
    this.showCreateGrantModal = false;
    this.selectedUserId = '';
  }

  submitGrant() {
    if (!this.selectedUserId) {
      this.message = 'Debe seleccionar un usuario';
      this.messageClass = 'alert-error';
      this.showOperationModal = true;
      return;
    }

    this.grantsService.createGrant(this.selectedUserId, this.projectId).subscribe({
      next: () => {
        this.closeCreateGrantModal();
        this.consultarAutorizaciones();
        this.message = 'Autorización creada exitosamente';
        this.messageClass = 'alert-success';
        this.showOperationModal = true;
      },
      error: (error) => {
        console.error('Error al crear autorización:', error);
        this.message = 'Error al crear la autorización';
        this.messageClass = 'alert-error';
        this.showOperationModal = true;
      }
    });
  }

  confirmarEliminarAutorizacion(grant: any) {
    if (confirm(`¿Está seguro que desea eliminar la autorización de "${this.getUserDisplayName(grant)}"?`)) {
      this.eliminarAutorizacion(grant.userId, grant.id);
    }
  }

  eliminarAutorizacion(userId: string, grantId: string) {
    this.grantsService.removeGrant(userId, grantId).subscribe({
      next: () => {
        this.grants = this.grants.filter(g => g.id !== grantId);
      },
      error: (error) => {
        console.error('Error al eliminar autorización:', error);
        this.message = 'Error al eliminar la autorización';
        this.messageClass = 'alert-error';
        this.showOperationModal = true;
      }
    });
  }
}