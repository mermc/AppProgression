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
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from './nuevo-confirm-dialog';


@Component({
  selector: 'app-nuevo',
  standalone: true,
  templateUrl: './nuevo.html',
  styleUrls: ['./nuevo.scss'],
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
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private dialog: MatDialog
  ) {
    // Creamos el formulario con todos los campos,
    // pero luego ignoraremos "apellidos" si es un grupo.
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

  const usuario = await this.authService.getCurrentUser();
  if (!usuario) {
    this.snackBar.open('No se pudo obtener el usuario autenticado', 'Cerrar', { duration: 2000 });
    return;
  }

  const usuarioId = usuario.uid;

  const nombre = this.form.value.nombre;
  const apellidos = this.form.value.apellidos;
  const observaciones = this.form.value.observaciones;

  // Mensaje dinámico de advertencia
  let mensaje = '';

  if (this.tipoSeleccionado === 'persona' && (!apellidos || apellidos.trim() === '')) {
    mensaje = '¿Deseas guardar esta persona sin apellidos?';
  }

  if (!observaciones || observaciones.trim() === '') {
    mensaje = mensaje
      ? mensaje + '\n y ¿sin observaciones?'
      : '¿Deseas guardar sin observaciones?';
  }

  //Si hay mensaje => abrir diálogo
  if (mensaje) {
    const ref = this.dialog.open(ConfirmDialog, {
    data: {
      title: 'Confirmación',  
      message: mensaje          
    }
  });
    const result = await ref.afterClosed().toPromise();

    if (result !== 'ok') {
      // Usuario canceló
      return;
    }
  }

  // Construimos los datos
  let datos: any = {
    nombre,
    observaciones,
    userId: usuarioId
  };

  if (this.tipoSeleccionado === 'persona') {
    datos.apellidos = apellidos;
  }

  const coleccion = this.tipoSeleccionado === 'persona' ? 'personas' : 'grupos';

  try {
    if (this.modoEdicion && this.id) {
      await updateDoc(doc(this.firestore, `${coleccion}/${this.id}`), datos);
    } else {
      await addDoc(collection(this.firestore, coleccion), datos);
    }

    this.router.navigate(['/dashboard']);
  } catch (err) {
    console.error(err);
    this.snackBar.open('Error al guardar', 'Cerrar', { duration: 2000 });
  }
}


  cancelar() {
    this.router.navigate(['/dashboard']);
  }
}
