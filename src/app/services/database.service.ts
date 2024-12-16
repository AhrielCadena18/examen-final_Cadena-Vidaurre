import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { collectionData, Firestore, collection, addDoc, doc, updateDoc, deleteDoc, setDoc, query, where, DocumentData, getDoc, docData, orderBy } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root', // Asegúrate de que DatabaseService se provee en la raíz
})
export class DatabaseService {
  private storage = getStorage(); // Inicializa Firebase Storage

  constructor(
    private firestore: Firestore,
    private http: HttpClient) { } // Inyección correcta de HttpClient

  fetchLocalCollection(collection: string): Observable<any> {
    return this.http.get('db/' + collection + '.json');
  }

  // Recuperar un documento por su ID, incluyendo el UID como parte de los datos
  getDocumentById(collectionName: string, documentId: string): Observable<any> {
    const docRef = doc(this.firestore, `${collectionName}/${documentId}`);
    return docData(docRef, { idField: 'id' }); // Incluye el UID como parte de los datos
  }

  // Función para recuperar varios documentos según un campo específico
  getDocumentsByField(collectionName: string, field: string, value: any): Observable<DocumentData[]> {
    const collectionRef = collection(this.firestore, collectionName);
    const queryRef = query(collectionRef, where(field, '==', value));
    return collectionData(queryRef, { idField: 'id' });
  }

  // retorna una coleccion de firestore
  fetchFirestoreCollection(collectionName: string): Observable<any[]> {
    const collectionRef = collection(this.firestore, collectionName);
    return collectionData(collectionRef, { idField: 'id' }); // Retorna los datos incluyendo el ID
  }

 

  // Método para agregar un documento a una colección en Firestore
  addFirestoreDocument(collectionName: string, data: any): Promise<any> {
    const collectionRef = collection(this.firestore, collectionName);
    return addDoc(collectionRef, data);  // Añade un nuevo documento con los datos proporcionados
  }

  // Método para actualizar un documento existente en una colección en Firestore
  updateFirestoreDocument(collectionName: string, uuid: string, data: any): Promise<void> {
    const docRef = doc(this.firestore, `${collectionName}/${uuid}`);
    return updateDoc(docRef, data);  // Actualiza el documento con los datos proporcionados
  }

  // Método para eliminar un documento de una colección en Firestore
  deleteFirestoreDocument(collectionName: string, uuid: string): Promise<void> {
    const docRef = doc(this.firestore, `${collectionName}/${uuid}`);
    return deleteDoc(docRef);  // Elimina el documento con el UUID proporcionado
  }

  //metodo para ver una todos los documentos de una coleccion especificando un sort
  
fetchFirestoreCollectionSort(collectionName: string, field: string, order: 'asc' | 'desc'): Observable<any[]> {
  const collectionRef = collection(this.firestore, collectionName);
  const queryRef = query(collectionRef, orderBy(field, order));
  return collectionData(queryRef, { idField: 'id' });
}


async uploadPhoto(file: File, userId: string): Promise<string> {
  try {
    // Crear referencia en el almacenamiento
    const storageRef = ref(this.storage, `user_photos/${userId}/${file.name}`);

    // Subir el archivo
    const snapshot = await uploadBytes(storageRef, file);

    // Obtener el enlace de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('Foto subida y enlace obtenido:', downloadURL);
    return downloadURL; // Devuelve el enlace de descarga
  } catch (error) {
    console.error('Error subiendo la foto:', error);
    throw error; // Lanza el error para manejo externo
  }
}

}
