//app-routing.module.ts
import { NgModule } from '@angular/core';
  import { RouterModule, Routes } from '@angular/router';
  import { LoginComponent } from './components/login.component';
  import { CallbackComponent } from './components/callback.component';

  const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'callback', component: CallbackComponent },
  ];

  @NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
  })
  export class AppRoutingModule {}
