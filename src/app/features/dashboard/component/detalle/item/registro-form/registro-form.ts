import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

// requeridos por html 
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'app-registro-form',
  standalone: true,
  templateUrl: './registro-form.html',
  styleUrls: ['./registro-form.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Material
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class RegistroForm implements OnInit {
   modoEdicion = false;
  form!: FormGroup;
  tipo!: 'personas' | 'grupos';
  id!: string;
  itemId!: string;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('tipo') as 'personas' | 'grupos';
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.itemId = this.route.snapshot.paramMap.get('itemId')!;

    this.form = this.fb.group({
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      observaciones: ['']
    });
  }

  async guardar() {
    if (this.form.invalid) return;

    const ref = collection(this.firestore, `${this.tipo}/${this.id}/items/${this.itemId}/registros`);
    const datos = {
      ...this.form.value,
      fecha: new Date(this.form.value.fecha),
      createdAt: serverTimestamp()
    };

    await addDoc(ref, datos);
    this.snackBar.open('Registro guardado', 'OK', { duration: 2000 });
    this.router.navigate([
      `/dashboard/detalle/${this.tipo}/${this.id}/items/${this.itemId}/registros`
    ]);
  }

  cancelar() {
    this.router.navigate([
      `/dashboard/detalle/${this.tipo}/${this.id}/items`
    ]);
  }

  cancelarRegistros() {
    this.router.navigate([
      `/dashboard/detalle/${this.tipo}/${this.id}/items/${this.itemId}/registros`
    ]);
  }
}