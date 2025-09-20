import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GroupsComponent } from './pages/groups/groups.component';
import { ChannelsComponent } from './pages/channels/channels.component';
import { AdminComponent } from './pages/admin/admin.component';
import { SuperAdminComponent } from './pages/super-admin/super-admin.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'groups', component: GroupsComponent },
  { path: 'channels/:groupId', component: ChannelsComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'super', component: SuperAdminComponent },
  { path: '**', component: NotFoundComponent },
];
