import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Angular Material + Forms
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

// Firebase Firestore
import { getFirestore, doc, setDoc } from 'firebase/firestore';
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
  db = getFirestore();

  constructor(private authService: AuthService, private router: Router) {}

  async onRegister() {
    try {
      // 1. Registrar el usuario en Auth (solo email y password)
      const userCredential = await this.authService.register(this.email, this.password);

      // 2. Enviar correo de verificación
      await sendEmailVerification(userCredential.user);

      // 3. Guardar datos extra en Firestore usando UID
      await setDoc(doc(this.db, 'usuarios', userCredential.user.uid), {
        nombre: this.nombre,
        apellidos: this.apellidos,
        email: this.email,
        creado: new Date()
      });

      alert('Cuenta creada correctamente. Ya puedes iniciar sesión.');
      this.router.navigate(['/login']);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }
}