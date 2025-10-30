import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-nuevo',
  standalone: true,
  templateUrl: './nuevo.html',
  styleUrls: ['./nuevo.css'],
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule]
})
export class Nuevo implements OnInit {
  tipoSeleccionado: 'persona' | 'grupo' | '' = '';
  form: FormGroup;
  modoEdicion = false;
  id: string | null = null;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: [''],
      observaciones: ['']
    });
  }

  async ngOnInit() {
    this.tipoSeleccionado = (this.route.snapshot.paramMap.get('tipo') as 'persona' | 'grupo') || '';
    this.id = this.route.snapshot.paramMap.get('id');

    if (this.id) {
      this.modoEdicion = true;
      const docRef = doc(this.firestore, `${this.tipoSeleccionado}s/${this.id}`);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        this.form.patchValue(snap.data());
      }
    }
  }

  seleccionarTipo(tipo: 'persona' | 'grupo') {
    this.tipoSeleccionado = tipo;
  }

  async guardar() {
    if (!this.tipoSeleccionado || this.form.invalid) {
      this.snackBar.open('Completa los datos correctamente', 'Cerrar', { duration: 2000 });
      return;
    }

    const datos = this.form.value;
    const coleccion = this.tipoSeleccionado === 'persona' ? 'personas' : 'grupos';

    try {
      if (this.modoEdicion && this.id) {
        await updateDoc(doc(this.firestore, `${coleccion}/${this.id}`), datos);
        this.snackBar.open('Actualizado correctamente', 'OK', { duration: 2000 });
      } else {
        await addDoc(collection(this.firestore, coleccion), datos);
        this.snackBar.open('Creado correctamente', 'OK', { duration: 2000 });
      }
      this.router.navigate(['/dashboard']);
    } catch (err) {
      console.error(err);
      this.snackBar.open('Error al guardar', 'Cerrar', { duration: 2000 });
    }
  }

  cancelar() {
    this.router.navigate(['/nuevo']);
  }
}
