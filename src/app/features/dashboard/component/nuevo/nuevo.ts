import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-nuevo',
  standalone: true,
  templateUrl: './nuevo.html',
  styleUrls: ['./nuevo.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class Nuevo {
  tipoSeleccionado: 'persona' | 'grupo' | '' = '';
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: [''],
      observaciones: ['']
    });
  }


  seleccionarTipo(tipo: 'persona' | 'grupo') {
    console.log('dentro de nuevo');
    this.tipoSeleccionado = tipo;
  }

  async guardar() {
    if (!this.tipoSeleccionado || this.form.invalid) {
      this.snackBar.open('Completa los datos correctamente', 'Cerrar', { duration: 2000 });
      return;
    }

    const datos = this.form.value;
    const coleccion = this.tipoSeleccionado === 'persona' ? 'personas' : 'grupos';
    const ref = collection(this.firestore, coleccion);

    // Si es grupo, eliminamos el campo apellidos
    if (this.tipoSeleccionado === 'grupo') {
      delete datos.apellidos;
    }

    await addDoc(ref, datos);

    this.snackBar.open(`${this.tipoSeleccionado} creada correctamente`, 'OK', { duration: 2000 });
    this.router.navigate(['/dashboard']);
  }

  cancelar() {
    this.router.navigate(['/dashboard']);
  }
}
