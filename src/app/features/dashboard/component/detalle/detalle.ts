import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, getDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-detalle',
  standalone: true,
  templateUrl: './detalle.html',
  styleUrls: ['./detalle.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class Detalle implements OnInit {

  tipo!: 'personas' | 'grupos';
  id!: string;
  form!: FormGroup;
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  async ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('tipo') as 'personas' | 'grupos';
    this.id = this.route.snapshot.paramMap.get('id')!;

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: [''],
      observaciones: ['']
    });

      console.log('[Detalle] Parámetros recibidos en ngOnInit:', {
    tipo: this.tipo,
    id: this.id
  });

    await this.cargarDatos();
  }

  async cargarDatos() {
    try {
      const ref = doc(this.firestore, `${this.tipo}/${this.id}`);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        this.form.patchValue(data);
      } else {
        this.snackBar.open('No se encontró el documento', 'Cerrar', { duration: 2000 });
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error(error);
      this.snackBar.open('Error al cargar los datos', 'Cerrar', { duration: 2000 });
    } finally {
      this.cargando = false;
    }
  }

  async guardarCambios() {
    try {
      const ref = doc(this.firestore, `${this.tipo}/${this.id}`);
      await updateDoc(ref, this.form.value);
      this.snackBar.open('Datos actualizados correctamente', 'OK', { duration: 2000 });
    } catch (error) {
      console.error(error);
      this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 2000 });
    }
  }

  async eliminar() {
    if (!confirm('¿Seguro que quieres eliminar este registro?')) return;
    try {
      const ref = doc(this.firestore, `${this.tipo}/${this.id}`);
      await deleteDoc(ref);
      this.snackBar.open('Eliminado correctamente', 'OK', { duration: 2000 });
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error(error);
      this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 2000 });
    }
  }

  volver() {
    this.router.navigate(['/dashboard']);
  }

  addItem() {
    console.log('[Detalle] Entrando en addItem()');
  console.log('[Detalle] Tipo actual:', this.tipo);
  console.log('[Detalle] ID actual:', this.id);
  // navegamos a la ruta para crear item del padre actual
  if (!this.tipo || !this.id) {
    this.snackBar.open('No se puede añadir item: faltan parámetros', 'Cerrar', { duration: 2000 });
    return;
  }
  const url = this.router.createUrlTree([`/dashboard/detalle/${this.tipo}/${this.id}/items`]).toString();
  console.log('[Detalle] URL generada con createUrlTree():', url);
  
  const ruta = `/dashboard/detalle/${this.tipo}/${this.id}/items`;
   console.log('[Detalle] Navegando a:', ruta);
  // ruta: /dashboard/detalle/:tipo/:id/item  (creación)
  this.router.navigate([ruta]);
 
}

verItems() {
  const ruta=`/dashboard/detalle/${this.tipo}/${this.id}/items`;
}
}