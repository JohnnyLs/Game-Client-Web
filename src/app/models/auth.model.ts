export interface LoginRequest {
    nombreUsuario: string;
    contrasena: string;
  }
  
  export interface LoginResponse {
    idAdministrador: number;
    nombreUsuario: string;
  }