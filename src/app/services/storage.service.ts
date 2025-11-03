import { Injectable } from '@angular/core';
import { FilterState } from '../models/car.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly FILTER_STATE_KEY = 'carDatabase_filters';

  saveFilterState(state: FilterState): void {
    try {
      localStorage.setItem(this.FILTER_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving filter state:', error);
    }
  }

  loadFilterState(): FilterState | null {
    try {
      const stored = localStorage.getItem(this.FILTER_STATE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading filter state:', error);
      return null;
    }
  }

  clearFilterState(): void {
    try {
      localStorage.removeItem(this.FILTER_STATE_KEY);
    } catch (error) {
      console.error('Error clearing filter state:', error);
    }
  }
}

