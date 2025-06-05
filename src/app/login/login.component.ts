import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest } from '../models/auth.model';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { CommonModule } from '@angular/common'; // Importar CommonModule

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule] // Asegurar que imports sea un array
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    const credentials: LoginRequest = {
      nombreUsuario: this.username,
      contrasena: this.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['']);
      },
      error: (err) => {
        this.errorMessage = 'Usuario o contraseña incorrectos. Por favor, intenta de nuevo.';
        console.error('Error en el login:', err);
      }
    });
  }
}