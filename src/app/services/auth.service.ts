import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl + 'admin/login';
  private loggedIn = false;
  private adminId: number | null = null;

  constructor(private http: HttpClient) {
    // Verificar si ya hay un estado de autenticación guardado (por ejemplo, en localStorage)
    const storedLoggedIn = localStorage.getItem('loggedIn');
    const storedAdminId = localStorage.getItem('adminId');
    if (storedLoggedIn === 'true' && storedAdminId) {
      this.loggedIn = true;
      this.adminId = Number(storedAdminId);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      tap(response => {
        // Si la solicitud es exitosa, actualizamos el estado de autenticación
        this.loggedIn = true;
        this.adminId = response.idAdministrador;
       
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('adminId', response.idAdministrador.toString());
      })
    );
  }

  logout(): void {
    this.loggedIn = false;
    this.adminId = null;
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('adminId');
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  getAdminId(): number | null {
    return this.adminId;
  }
}