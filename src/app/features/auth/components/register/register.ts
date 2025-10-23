import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { FirestoreService } from '../../../../core/services/firestore.service'; 

// Angular Material + Forms
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

// Firebase Firestore
import { sendEmailVerification } from 'firebase/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ]
})
export class RegisterComponent {
  nombre = '';
  apellidos = '';
  email = '';
  password = '';

  constructor(
    private authService: AuthService, 
    private router: Router,
    private firestoreService: FirestoreService
  ) {}

  async onRegister() {
    try {
      console.log('Datos del formulario:', {
        nombre: this.nombre,
        apellidos: this.apellidos,
        email: this.email
      });

      // 1. Registrar el usuario en Firebase Authentication (solo email y password)
      const userCredential = await this.authService.register(this.email, this.password);
      const user = userCredential.user;

      // 2. Guardar datos extra (nombre, apellidos) en Firestore usando el UID
      await this.firestoreService.createUserProfile(user, {
        nombre: this.nombre,
        apellidos: this.apellidos
      });

      // 3. Enviar correo de verificación
      if (user) {
        await sendEmailVerification(user);
      }
      alert('Cuenta creada correctamente. Se ha enviado un correo de verificación a ' + this.email + '. Por favor, revisa tu bandeja de entrada y spam.');
      this.router.navigate(['/login']);
    } catch (err: any) {
      console.error('Error durante el registro:', err);

      // Puedes refinar los mensajes de error para el usuario
      if (err.code === 'auth/email-already-in-use') {
        alert('Este correo electrónico ya está registrado. Intenta iniciar sesión o usa otro correo.');
      } else {
        alert('Error al registrarse: ' + err.message);

      }

    }

  }

}
