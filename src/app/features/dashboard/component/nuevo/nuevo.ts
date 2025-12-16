import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, query, where, getDocs } from '@angular/fire/firestore';
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
import { lastValueFrom } from 'rxjs';


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

  const nombre = (this.form.value.nombre || '').trim();
const apellidos = (this.form.value.apellidos || '').trim();
const observaciones = (this.form.value.observaciones || '').trim();

  // Mensaje dinámico 
  let mensaje = '';

  if (this.tipoSeleccionado === 'persona' && (!apellidos || apellidos.trim() === '')) {
    mensaje = '¿Deseas guardar esta persona sin apellidos?';
  }

  if (!observaciones || observaciones.trim() === '') {
    mensaje = mensaje
      ? mensaje + '\n y ¿sin observaciones?'
      : '¿Deseas guardar sin observaciones?';
  }

   // 2) Comprobación de duplicados (solo en creación, no en edición)
    const coleccion = this.tipoSeleccionado === 'persona' ? 'personas' : 'grupos';

    if (!this.modoEdicion) {
      // Query base: por usuario y nombre
      let q;
      if (this.tipoSeleccionado === 'persona') {
        // persona: mismo userId, nombre y apellidos
        q = query(
          collection(this.firestore, coleccion),
          where('userId', '==', usuarioId),
          where('nombre', '==', nombre),
          where('apellidos', '==', apellidos)
        );
      } else {
        // grupo: mismo userId y nombre
        q = query(
          collection(this.firestore, coleccion),
          where('userId', '==', usuarioId),
          where('nombre', '==', nombre)
        );
      }

      const dupSnap = await getDocs(q);

      if (!dupSnap.empty) {
        const msgDup =  this.tipoSeleccionado === 'persona'
            ? 'Ya existe una persona con ese nombre y apellidos. ¿Deseas guardarla igualmente?'
            : 'Ya existe un grupo con ese nombre. ¿Deseas guardarlo igualmente?';

        // Si ya había mensaje de campos vacíos, lo concatenamos
        mensaje = mensaje ? mensaje + '\n\n' + msgDup : msgDup;
        console.log('dupSnap empty?', dupSnap.empty, 'size:', dupSnap.size);
        console.log('mensaje final:', mensaje);
      }
    }

  //Si hay mensaje => abrir diálogo
  if (mensaje) {
    const ref = this.dialog.open(ConfirmDialog, {
    data: {
      title: 'Confirmación',  
      message: mensaje          
    }
  });
     const result = await lastValueFrom(ref.afterClosed());

    if (result !== 'ok') {
      // Usuario canceló
      return;
    }
  }

  // Construimos los datos
  const datos: any = {
    nombre,
    observaciones,
    userId: usuarioId
  };

  if (this.tipoSeleccionado === 'persona') {
    datos.apellidos = apellidos;
  }

  //const coleccion = this.tipoSeleccionado === 'persona' ? 'personas' : 'grupos';

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
