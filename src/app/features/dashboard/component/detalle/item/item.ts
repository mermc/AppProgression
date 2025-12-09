import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  collectionData,
  serverTimestamp
} from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Timestamp } from 'firebase/firestore';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-item',
  standalone: true,
  templateUrl: './item.html',
  styleUrls: ['./item.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class Item implements OnInit {
  form: FormGroup;
  modoEdicion = false;
  itemId: string | null = null;           // id del item si estamos editando
  parentTipo!: 'personas' | 'grupos'; // 'personas' o 'grupos'
  parentId!: string;                  // id de la persona/grupo padre

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
  descripcion: ['', Validators.required],
  color: ['#2196f3'],
  fecha: [new Date().toISOString().substring(0, 10), Validators.required] // formato YYYY-MM-DD
});
  }
  


  async ngOnInit() {
    // esperamos los parámetros: tipo (personas|grupos), id(id de persona/grupo) y opcional id del item
    this.parentTipo = this.route.snapshot.paramMap.get('tipo') as 'personas' | 'grupos';
    this.parentId = this.route.snapshot.paramMap.get('id') || '';
    this.itemId = this.route.snapshot.paramMap.get('itemId');

    if (!this.parentTipo || !this.parentId) {
      this.snackBar.open('Faltan parámetros para crear el item', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/dashboard']);
      return;
    }

    if (this.itemId) {
      this.modoEdicion = true;
      const docRef = doc(this.firestore, `${this.parentTipo}/${this.parentId}/items/${this.itemId}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        this.form.patchValue(snap.data());
      } else {
        this.snackBar.open('Item no encontrado', 'Cerrar', { duration: 2000 });
        this.router.navigate([`/dashboard/detalle/${this.parentTipo}/${this.parentId}`]);
      }
    }
  }

  async guardar() {
    if (this.form.invalid) {
      this.snackBar.open('Completa los datos correctamente', 'Cerrar', { duration: 2000 });
      return;
    }

    const datos = {
  ...this.form.value,
  updatedAt: serverTimestamp(),
  fecha: new Date(this.form.value.fecha)
};

    try {
      const coleccionPath = `${this.parentTipo}/${this.parentId}/items`;

      if (this.modoEdicion && this.itemId) {
        // update
        await updateDoc(doc(this.firestore, `${coleccionPath}/${this.itemId}`), datos);
        this.snackBar.open('Item actualizado correctamente', 'OK', { duration: 2000 });
      } else {
        // create
        await addDoc(collection(this.firestore, coleccionPath), {
          ...datos,
          createdAt: serverTimestamp()
        });
        this.snackBar.open('Item creado correctamente', 'OK', { duration: 2000 });
      }

      // volver al detalle del padre
      this.router.navigate([`/dashboard/detalle/${this.parentTipo}/${this.parentId}/items`]);
    } catch (err) {
      console.error(err);
      this.snackBar.open('Error al guardar el item', 'Cerrar', { duration: 3000 });
    }
  }

  verRegistros(){
    this.router.navigate([`/dashboard/detalle/${this.parentTipo}/${this.parentId}/items/${this.itemId}/registros`]);
  }

  cancelar() {
  if (this.modoEdicion) {
    // Si estamos editando, volver a la lista de items
    this.router.navigate([
      `/dashboard/detalle/${this.parentTipo}/${this.parentId}/items`
    ]);
  } else {
    // Si estamos creando, volver al detalle del padre
    this.router.navigate([
      `/dashboard/detalle/${this.parentTipo}/${this.parentId}`
    ]);
  }
}
}
