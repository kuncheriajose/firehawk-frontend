import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, doc, updateDoc, deleteDoc, query, orderBy, where, limit } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private firestore: Firestore = inject(Firestore);
  private carsCollection = collection(this.firestore, 'cars');

  // Live updates using Firestore real-time listeners
  getCars(): Observable<Car[]> {
    return collectionData(this.carsCollection, { idField: 'id' }) as Observable<Car[]>;
  }

  addCar(car: Car): Promise<any> {
    return addDoc(this.carsCollection, car);
  }

  updateCar(id: string, car: Partial<Car>): Promise<void> {
    const carDoc = doc(this.firestore, 'cars', id);
    return updateDoc(carDoc, car);
  }

  deleteCar(id: string): Promise<void> {
    const carDoc = doc(this.firestore, 'cars', id);
    return deleteDoc(carDoc);
  }

  getCarsWithFilters(filters: {
    make?: string;
    fuelType?: string;
    bodyStyle?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Observable<Car[]> {
    let q = query(this.carsCollection);
    
    if (filters.make) {
      q = query(q, where('make', '==', filters.make));
    }
    if (filters.fuelType) {
      q = query(q, where('fuelType', '==', filters.fuelType));
    }
    if (filters.bodyStyle) {
      q = query(q, where('bodyStyle', '==', filters.bodyStyle));
    }
    
    return collectionData(q, { idField: 'id' }) as Observable<Car[]>;
  }
}

