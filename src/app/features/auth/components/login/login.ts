import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

// módulos de Angular Material y FormsModule
//En Angular standalone, cada componente debe importar los módulos que necesita
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { sendEmailVerification } from 'firebase/auth';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../../core/services/firestore.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ]
})
export class LoginComponent {
  // Variables que almacenan lo que el usuario escribe en el formulario
  email = '';
  password = '';
  verificationMessage = ''; // Mensaje si el usuario no ha verificado su correo
  errorMessage = '';        // Mensaje si ocurre algún error en el login
  lastUser: any = null;
  // Se inyectan los servicios de autenticación y de rutas
  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService, // Inyectado
    private router: Router
  ) {}


  // Método que se llama al enviar el formulario (iniciar sesión)
  async onLogin() {
    // Limpiar mensajes previos
    this.errorMessage = '';
    this.verificationMessage = '';
    try {
      // Intenta autenticar al usuario con el email y la contraseña introducidos
      const userCredential = await this.authService.login(this.email, this.password);
      const user = userCredential.user;
      this.lastUser = user; // Para reenviar email si es necesario

      // Al iniciar sesión, aseguramos que el perfil exista o se actualice (ej. lastSignInTime).
      // No pasamos 'nombre' ni 'apellidos' aquí, ya que deberían estar en Firestore.

      // Si el usuario ha verificado el correo electrónico
      if (user.emailVerified) {
        this.router.navigate(['/dashboard']); // Cambia la ruta si tu página principal es distinta
      } else {
        // Si NO ha verificado el correo, se muestra un mensaje en pantalla
        this.verificationMessage = 'Por favor, verifica tu correo electrónico antes de iniciar sesión.';
      }
    } catch (err: any) {
      // Si ocurre un error (credenciales incorrectas, usuario no existe, etc), se muestra el mensaje
      this.errorMessage = 'Error: ' + err.message;
    }
  }

  // Método para reenviar el email de verificación
  async resendVerificationEmail() {
    if (this.lastUser) {
      try {
        await sendEmailVerification(this.lastUser);
        // Mensaje de confirmación
        this.verificationMessage = 'Correo de verificación reenviado. Revisa tu bandeja de entrada y spam.';
      } catch (err: any) {
        this.errorMessage = 'Error al reenviar el correo: ' + err.message;
      }
    } else {
      this.errorMessage = 'Necesitas iniciar sesión primero para reenviar el correo de verificación.';
    }
  }

  // Método para navegar a la pantalla de registro si el usuario no tiene cuenta
  goToRegister() {
    this.router.navigate(['/register']);
  }

  // Limpia el error al cambiar email/contraseña
  clearError() {
    this.errorMessage = '';
  }
}
