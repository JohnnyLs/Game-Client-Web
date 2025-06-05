import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { PartidaDetailComponent } from './partida-detail/partida-detail.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: AppComponent, canActivate: [AuthGuard] },
  { path: 'partida/:idPartida', component: PartidaDetailComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

