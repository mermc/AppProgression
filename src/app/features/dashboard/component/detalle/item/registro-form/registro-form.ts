import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection, doc, updateDoc, getDoc, addDoc, serverTimestamp } from '@angular/fire/firestore';
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
  styleUrls: ['./registro-form.scss'],
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
  registroId!: string | null; 

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('tipo') as 'personas' | 'grupos';
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.itemId = this.route.snapshot.paramMap.get('itemId')!;
    this.registroId = this.route.snapshot.paramMap.get('registroId');

    this.form = this.fb.group({
      fecha: [new Date(), Validators.required],
      observaciones: [''],
    });

    // Si hay registroId va a edición: cargar datos
    if (this.registroId) {
      this.modoEdicion = true;
      const ref = doc(
        this.firestore,
        `${this.tipo}/${this.id}/items/${this.itemId}/registros/${this.registroId}`
      );
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as any;
        // Aseguramos que fecha sea Date (por si es Timestamp)
        const fecha = data.fecha?.seconds
          ? new Date(data.fecha.seconds * 1000)
          : new Date(data.fecha);
        this.form.patchValue({
          fecha,
          observaciones: data.observaciones || ''
        });
      } else {
        this.snackBar.open('Registro no encontrado', 'Cerrar', { duration: 2000 });
        this.router.navigate([
          `/dashboard/detalle/${this.tipo}/${this.id}/items/${this.itemId}/registros`
        ]);
      }
    }
  }

    async guardar() {
    if (this.form.invalid) return;

    const basePath = `${this.tipo}/${this.id}/items/${this.itemId}/registros`;
    const datos = {
      ...this.form.value,
      fecha: new Date(this.form.value.fecha)
    };

    try {
      if (this.modoEdicion && this.registroId) {
        // EDICIÓN
        const ref = doc(this.firestore, `${basePath}/${this.registroId}`);
        await updateDoc(ref, {
          ...datos,
          updatedAt: serverTimestamp()
        });
        this.snackBar.open('Registro actualizado', 'OK', { duration: 2000 });
      } else {
        // CREACION
        const ref = collection(this.firestore, basePath);
        await addDoc(ref, {
          ...datos,
          createdAt: serverTimestamp()
        });
        this.snackBar.open('Registro creado', 'OK', { duration: 2000 });
      }

      this.router.navigate([
        `/dashboard/detalle/${this.tipo}/${this.id}/items/${this.itemId}/registros`
      ]);
    } catch (err) {
      console.error(err);
      this.snackBar.open('Error al guardar el registro', 'Cerrar', { duration: 3000 });
    }
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