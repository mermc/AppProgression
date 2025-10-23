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
  const existingDoc = await getDoc(userRef);

  // Si el perfil ya existe, no lo recreamos.
  if (existingDoc.exists()) {
    console.log(`[FirestoreService] El perfil del usuario ${user.uid} ya existe. No se recreará.`);
    return;
  }

  console.log(`[FirestoreService] Creando perfil para UID: ${user.uid}`);
  console.log('[FirestoreService] Datos adicionales recibidos:', additionalData);

  const profileDisplayName =
    additionalData?.nombre && additionalData?.apellidos
      ? `${additionalData.nombre.trim()} ${additionalData.apellidos.trim()}`
      : additionalData?.nombre?.trim() || user.displayName || 'Usuario sin nombre';

  const profileData = {
    uid: user.uid,
    email: user.email || 'correo-no-disponible',
    nombre: additionalData?.nombre?.trim() || '',
    apellidos: additionalData?.apellidos?.trim() || '',
    displayName: profileDisplayName,
    createdAt: new Date(),
    lastSignInTime: new Date(),
  };

  try {
    await setDoc(userRef, profileData);
    console.log(`[FirestoreService] Perfil de usuario ${user.uid} creado exitosamente.`);
    console.log('[FirestoreService] Datos guardados:', profileData);
  } catch (error) {
    console.error(`[FirestoreService] Error al crear perfil para ${user.uid}:`, error);
    throw error;
  }
}
}