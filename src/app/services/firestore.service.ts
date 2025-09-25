import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  // Lee todos los mensajes de la colección 'prueba'
  getPruebas(): Observable<any[]> {
    const col = collection(this.firestore, 'prueba');
    return collectionData(col, { idField: 'id' });
  }

  // Añade un mensaje a la colección 'prueba'
  addMensaje(mensaje: string) {
    const col = collection(this.firestore, 'prueba');
    return addDoc(col, { mensaje });
  }
}
