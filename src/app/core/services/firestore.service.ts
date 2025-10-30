import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  async createUserProfile(
    user: User,
    additionalData?: { nombre?: string; apellidos?: string; [key: string]: any }
  ): Promise<void> {
    if (!user) return;

    const userRef = doc(this.firestore, 'usuarios', user.uid);
    const existingDoc = await getDoc(userRef);
    if (existingDoc.exists()) return;

    const profileData = {
      uid: user.uid,
      email: user.email || 'correo-no-disponible',
      nombre: additionalData?.nombre?.trim() || '',
      apellidos: additionalData?.apellidos?.trim() || '',
      createdAt: new Date(),
      lastSignInTime: new Date(),
    };

    await setDoc(userRef, profileData);
  }
}
