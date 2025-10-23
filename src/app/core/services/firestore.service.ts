import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  doc,
  getDoc,
  setDoc
} from '@angular/fire/firestore';
import { User } from 'firebase/auth';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  /**
   * Crea o actualiza el perfil del usuario en Firestore
   * @param user Usuario autenticado (Firebase Auth)
   * @param additionalData Datos adicionales como nombre/apellidos
   */
  async createUserProfile(
    user: User,
    additionalData?: { nombre?: string; apellidos?: string; [key: string]: any }
  ): Promise<void> {
    if (!user) {
      console.error('createUserProfile: El objeto de usuario es nulo o indefinido.');
      return;
    }

    const userRef = doc(this.firestore, 'usuarios', user.uid);

    console.log(`[FirestoreService] Intentando crear/actualizar perfil para UID: ${user.uid}`);
    console.log('[FirestoreService] Datos adicionales recibidos:', additionalData);

    // Verificar si el documento ya existe
    const existingDoc = await getDoc(userRef);

    // Determinar displayName
    let profileDisplayName = 'Usuario sin nombre';
    if (additionalData?.nombre && additionalData?.apellidos) {
      profileDisplayName = `${additionalData.nombre} ${additionalData.apellidos}`;
    } else if (additionalData?.nombre) {
      profileDisplayName = additionalData.nombre;
    } else if (user.displayName) {
      profileDisplayName = user.displayName;
    }

    // Evitar sobreescritura de datos válidos con vacíos
    const profileData = {
      uid: user.uid,
      email: user.email || 'correo-no-disponible',
      displayName: profileDisplayName,
      nombre: additionalData?.nombre ?? existingDoc.data()?.['nombre'] ?? null,
      apellidos: additionalData?.apellidos ?? existingDoc.data()?.['apellidos'] ?? null,
      createdAt: existingDoc.exists()
        ? existingDoc.data()?.['createdAt']
        : new Date(),
      lastSignInTime: new Date()
    };

    try {
      await setDoc(userRef, profileData, { merge: true });
      console.log(`[FirestoreService] Perfil de usuario ${user.uid} creado/actualizado exitosamente.`);
      console.log('[FirestoreService] Datos guardados:', profileData);
    } catch (error) {
      console.error(`[FirestoreService]Error al crear/actualizar perfil para ${user.uid}:`, error);
      throw error;
    }
  }
}
