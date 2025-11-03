import { Injectable } from '@angular/core';
import { Car } from '../models/car.model';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class CsvService {
  exportToCsv(cars: Car[], filename: string = 'car-database-export'): void {
    // Convert cars to CSV format
    const csv = Papa.unparse(cars, {
      header: true,
      skipEmptyLines: true
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}

