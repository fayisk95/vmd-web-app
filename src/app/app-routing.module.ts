import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UserRole } from './core/models/user.model';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'products',
    loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MANAGER] }
  },
  {
    path: 'invoices',
    loadChildren: () => import('./features/invoices/invoices.module').then(m => m.InvoicesModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MANAGER] }
  },
  {
    path: 'users',
    loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN] }
  },
  {
    path: 'vehicles',
    loadChildren: () => import('./features/vehicles/vehicles.module').then(m => m.VehiclesModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MANAGER] }
  },
  {
    path: 'clients',
    loadChildren: () => import('./features/clients/clients.module').then(m => m.ClientsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MANAGER] }
  },
  {
    path: 'trips',
    loadChildren: () => import('./features/trips/trips.module').then(m => m.TripsModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [UserRole.ADMIN, UserRole.MANAGER] }
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }