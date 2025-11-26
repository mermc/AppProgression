import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  deleteDoc
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { query, orderBy } from 'firebase/firestore';
import { RegistroList } from '../item/registro-list/registro-list';



@Component({
  selector: 'app-itemlist',
  standalone: true,
  templateUrl: './item-list.html',
  styleUrls: ['./item-list.css'],
  imports: [CommonModule, MatButtonModule, MatCardModule]
})
export class ItemList implements OnInit {
  tipo!: 'personas' | 'grupos';
  parentId!: string;
  items$!: Observable<any[]>;
  id!: string;
  itemId!: string;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.tipo = this.route.snapshot.paramMap.get('tipo') as 'personas' | 'grupos';
    this.parentId = this.route.snapshot.paramMap.get('id')!;
    this.id = this.route.snapshot.paramMap.get('id')!;

    const itemsRef = collection(this.firestore, `${this.tipo}/${this.parentId}/items`);
    const q = query(itemsRef, orderBy('fecha', 'desc'));
    this.items$ = collectionData(q, { idField: 'id' }).pipe(
    map(items =>
    items.map(item => ({
      ...item,
      fecha: item['fecha']?.toDate ? item['fecha'].toDate() : item['fecha']
    }))
  )
);
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
  
  const ruta = `/dashboard/detalle/${this.tipo}/${this.id}/items/nuevo`;
   console.log('[Detalle] Navegando a:', ruta);
  // ruta: /dashboard/detalle/:tipo/:id/item  (creación)
  this.router.navigate([ruta]);
 
}

  toggleRegistros(item: any) {
    item.showRegistros = !item.showRegistros;
  }

  nuevoRegistro(itemId: string) {
  this.router.navigate([
    `/dashboard/detalle/${this.tipo}/${this.parentId}/items/${itemId}/registros/nuevo`
  ]);
}

  editarItem(itemId: string) {
    this.router.navigate([`/dashboard/detalle/${this.tipo}/${this.parentId}/items/${itemId}`]);
  }

  async eliminarItem(itemId: string) {
    if (!confirm('¿Eliminar este item?')) return;
    try {
      const ref = doc(this.firestore, `${this.tipo}/${this.parentId}/items/${itemId}`);
      await deleteDoc(ref);
      this.snackBar.open('Item eliminado', 'OK', { duration: 2000 });
    } catch (err) {
      console.error(err);
      this.snackBar.open('Error al eliminar el item', 'Cerrar', { duration: 2000 });
    }
  }



  verRegistros(itemId: string) {
  this.router.navigate([`/dashboard/detalle/${this.tipo}/${this.parentId}/items/${itemId}/registros`]);
}



  volver() {
    this.router.navigate([`/dashboard/detalle/${this.tipo}/${this.parentId}`]);
  }

}
