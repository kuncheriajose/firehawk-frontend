import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CarService } from '../services/car.service';
import { StorageService } from '../services/storage.service';
import { CsvService } from '../services/csv.service';
import { Car, FilterState } from '../models/car.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-car-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './car-list.component.html',
  styleUrl: './car-list.component.scss'
})
export class CarListComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<Car>([]);
  allCars: Car[] = [];
  filteredCars: Car[] = [];
  
  filterForm: FormGroup;
  private carsSubscription?: Subscription;
  
  // Available filter options (populated from data)
  makes: string[] = [];
  cylinders: string[] = [];
  
  // Sort state
  currentSort: { column: string; direction: 'asc' | 'desc' } = { column: '', direction: 'asc' };

  constructor(
    private carService: CarService,
    private storageService: StorageService,
    private csvService: CsvService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      makeFilter: [''],
      cylindersFilter: [''],
      sortBy: [''],
      sortDirection: ['asc']
    });
  }

  ngOnInit(): void {
    // Subscribe to live updates from Firestore
    this.carsSubscription = this.carService.getCars().subscribe(cars => {
      this.allCars = cars;
      // Auto-detect dataset format and set columns
      if (cars.length > 0) {
        this.setDisplayColumns(cars[0]);
        // Set default sort column based on dataset format
        if (!this.currentSort.column) {
          const firstColumn = this.displayedColumns[0];
          this.currentSort = { column: firstColumn || '', direction: 'asc' };
          this.filterForm.patchValue({ sortBy: firstColumn || '', sortDirection: 'asc' }, { emitEvent: false });
        }
      }
      this.extractFilterOptions(cars);
      
      // Load saved filter state after data is loaded
      const savedState = this.storageService.loadFilterState();
      if (savedState) {
        this.filterForm.patchValue(savedState);
        this.currentSort = {
          column: savedState.sortBy || this.displayedColumns[0] || '',
          direction: savedState.sortDirection || 'asc'
        };
      }
      
      this.applyFilters();
    });

    // Watch for filter changes
    this.filterForm.valueChanges.subscribe(() => {
      this.saveFilterState();
      this.applyFilters();
    });
  }

  private setDisplayColumns(sampleCar: Car): void {
    // Check if it's the alternative dataset format (Automobile.csv)
    if (sampleCar.name || sampleCar.mpg !== undefined || sampleCar.cylinders !== undefined) {
      this.displayedColumns = ['name', 'mpg', 'cylinders', 'displacement', 'horsepower', 'weight', 'acceleration', 'model_year', 'origin'];
    } else if (sampleCar.make !== undefined || sampleCar.bodyStyle !== undefined) {
      // Original automobile dataset format
      this.displayedColumns = ['make', 'bodyStyle', 'fuelType', 'driveWheels', 'engineSize', 'horsepower', 'cityMpg', 'highwayMpg', 'price'];
    } else {
      // Fallback: show all available fields
      this.displayedColumns = Object.keys(sampleCar).filter(key => key !== 'id' && sampleCar[key] !== null && sampleCar[key] !== undefined).slice(0, 9);
    }
  }

  ngOnDestroy(): void {
    if (this.carsSubscription) {
      this.carsSubscription.unsubscribe();
    }
  }

  private extractFilterOptions(cars: Car[]): void {
    const makesSet = new Set<string>();
    const cylindersSet = new Set<string>();

    cars.forEach(car => {
      // Original dataset format
      if (car.make) makesSet.add(car.make);
      if (car.numOfCylinders) {
        cylindersSet.add(String(car.numOfCylinders));
      }
      // Alternative dataset format - extract make from name
      if (car.name && !car.make) {
        const makeFromName = car.name.split(' ')[0];
        if (makeFromName) makesSet.add(makeFromName);
      }
      // Extract cylinders from alternative dataset
      if (car.cylinders) {
        cylindersSet.add(String(car.cylinders));
      }
    });

    this.makes = Array.from(makesSet).sort();
    this.cylinders = Array.from(cylindersSet).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.localeCompare(b);
    });
  }

  applyFilters(): void {
    const formValue = this.filterForm.value;
    // Create a shallow copy for filtering
    let filtered = [...this.allCars];

    // Search term filter (searches across multiple fields)
    if (formValue.searchTerm) {
      const searchLower = formValue.searchTerm.toLowerCase();
      filtered = filtered.filter(car =>
        Object.values(car).some(val =>
          val && val.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    // Make filter (handles both make and name fields)
    if (formValue.makeFilter) {
      filtered = filtered.filter(car => {
        if (car.make) {
          return car.make === formValue.makeFilter;
        }
        // For alternative dataset, extract make from name
        if (car.name) {
          const makeFromName = car.name.split(' ')[0];
          return makeFromName === formValue.makeFilter;
        }
        return false;
      });
    }

    // Cylinders filter (handles both numOfCylinders and cylinders fields)
    if (formValue.cylindersFilter) {
      filtered = filtered.filter(car => {
        if (car.numOfCylinders) {
          return String(car.numOfCylinders) === formValue.cylindersFilter;
        }
        // For alternative dataset, use cylinders field
        if (car.cylinders) {
          return String(car.cylinders) === formValue.cylindersFilter;
        }
        return false;
      });
    }

    // Apply sorting - prioritize currentSort over form value for manual sorting
    const sortColumn = this.currentSort.column || formValue.sortBy;
    const sortDirection = this.currentSort.direction || formValue.sortDirection || 'asc';
    
    if (sortColumn && filtered.length > 0) {
      this.sortData(filtered, sortColumn, sortDirection);
    }

    this.filteredCars = filtered;
    // Create a new array reference to ensure change detection
    this.dataSource.data = [...filtered];
  }

  sortData(data: Car[], column: string, direction: 'asc' | 'desc'): void {
    if (!column || data.length === 0) {
      return;
    }
    
    this.currentSort = { column, direction };
    this.filterForm.patchValue({ sortBy: column, sortDirection: direction }, { emitEvent: false });
    
    data.sort((a, b) => {
      const aVal = a[column as keyof Car];
      const bVal = b[column as keyof Car];
      
      // Handle null/undefined/empty values
      if (aVal === null || aVal === undefined || aVal === '') {
        return direction === 'asc' ? 1 : -1;
      }
      if (bVal === null || bVal === undefined || bVal === '') {
        return direction === 'asc' ? -1 : 1;
      }
      
      const aNum = this.parseNumber(aVal);
      const bNum = this.parseNumber(bVal);

      let comparison = 0;
      if (aNum !== null && bNum !== null) {
        comparison = aNum - bNum;
      } else {
        const aStr = String(aVal).toLowerCase().trim();
        const bStr = String(bVal).toLowerCase().trim();
        comparison = aStr.localeCompare(bStr);
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }

  onSort(column: string): void {
    if (!column || !this.displayedColumns.includes(column)) {
      return; // Don't sort if column is invalid
    }
    
    if (this.currentSort.column === column) {
      // Toggle direction for same column
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, start with ascending
      this.currentSort.column = column;
      this.currentSort.direction = 'asc';
    }
    // Update form values to match current sort state
    this.filterForm.patchValue({
      sortBy: this.currentSort.column,
      sortDirection: this.currentSort.direction
    }, { emitEvent: false });
    this.applyFilters();
  }

  clearFilters(): void {
    const defaultSortColumn = this.displayedColumns[0] || '';
    this.filterForm.reset({
      searchTerm: '',
      makeFilter: '',
      cylindersFilter: '',
      sortBy: defaultSortColumn,
      sortDirection: 'asc'
    });
    this.currentSort = { column: defaultSortColumn, direction: 'asc' };
    this.storageService.clearFilterState();
    this.applyFilters();
  }

  exportToCsv(): void {
    this.csvService.exportToCsv(this.filteredCars, 'car-database');
  }

  private saveFilterState(): void {
    const state: FilterState = this.filterForm.value;
    this.storageService.saveFilterState(state);
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? null : num;
  }

  getSortIcon(column: string): string {
    if (this.currentSort.column !== column) return 'unfold_more';
    return this.currentSort.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  getActiveFilterCount(): number {
    const formValue = this.filterForm.value;
    let count = 0;
    if (formValue.searchTerm) count++;
    if (formValue.makeFilter) count++;
    if (formValue.cylindersFilter) count++;
    return count;
  }
}

