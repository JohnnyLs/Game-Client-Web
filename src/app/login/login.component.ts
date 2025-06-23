import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/auth.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false; // Bandera para controlar el modal de carga

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.isLoading = true; // Mostrar modal
    this.errorMessage = ''; // Limpiar mensaje de error

    const credentials: LoginRequest = {
      nombreUsuario: this.username,
      contrasena: this.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false; // Ocultar modal
        this.router.navigate(['']);
      },
      error: (err) => {
        this.isLoading = false; // Ocultar modal
        this.errorMessage = 'Usuario o contraseña incorrectos. Por favor, intenta de nuevo.';
        console.error('Error en el login:', err);
      }
    });
  }
}