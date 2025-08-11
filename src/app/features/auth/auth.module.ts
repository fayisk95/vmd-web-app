import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthRoutingModule } from './auth-routing.module';
import { SharedModule } from '../../shared/shared.module';

import { LoginComponent } from './components/login/login.component';
import { AuthLayoutComponent } from './components/auth-layout/auth-layout.component';

@NgModule({
  declarations: [
    LoginComponent,
    AuthLayoutComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AuthRoutingModule,
    SharedModule
  ]
})
export class AuthModule { }