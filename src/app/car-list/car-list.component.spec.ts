import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarListComponent } from './car-list.component';
import { CarService } from '../services/car.service';
import { StorageService } from '../services/storage.service';
import { CsvService } from '../services/csv.service';
import { FormBuilder } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { Car, FilterState } from '../models/car.model';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('CarListComponent', () => {
  let component: CarListComponent;
  let fixture: ComponentFixture<CarListComponent>;
  let carService: jasmine.SpyObj<CarService>;
  let storageService: jasmine.SpyObj<StorageService>;
  let csvService: jasmine.SpyObj<CsvService>;
  let mockCars: Car[];

  beforeEach(async () => {
    mockCars = [
      {
        id: '1',
        make: 'Toyota',
        fuelType: 'gas',
        bodyStyle: 'sedan',
        price: 15000,
        horsepower: 120,
        cityMpg: 25,
        highwayMpg: 32
      },
      {
        id: '2',
        make: 'Honda',
        fuelType: 'gas',
        bodyStyle: 'hatchback',
        price: 18000,
        horsepower: 140,
        cityMpg: 28,
        highwayMpg: 35
      }
    ];

    const carServiceSpy = jasmine.createSpyObj('CarService', ['getCars']);
    const storageServiceSpy = jasmine.createSpyObj('StorageService', ['loadFilterState', 'saveFilterState', 'clearFilterState']);
    const csvServiceSpy = jasmine.createSpyObj('CsvService', ['exportToCsv']);

    await TestBed.configureTestingModule({
      imports: [CarListComponent, BrowserAnimationsModule],
      providers: [
        { provide: CarService, useValue: carServiceSpy },
        { provide: StorageService, useValue: storageServiceSpy },
        { provide: CsvService, useValue: csvServiceSpy },
        FormBuilder
      ]
    }).compileComponents();

    carService = TestBed.inject(CarService) as jasmine.SpyObj<CarService>;
    storageService = TestBed.inject(StorageService) as jasmine.SpyObj<StorageService>;
    csvService = TestBed.inject(CsvService) as jasmine.SpyObj<CsvService>;

    carService.getCars.and.returnValue(of(mockCars));
    storageService.loadFilterState.and.returnValue(null);

    fixture = TestBed.createComponent(CarListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cars from service on init', () => {
    expect(carService.getCars).toHaveBeenCalled();
    expect(component.allCars.length).toBe(2);
    expect(component.filteredCars.length).toBe(2);
  });

  it('should filter cars by make', () => {
    component.filterForm.patchValue({ makeFilter: 'Toyota' });
    component.applyFilters();
    
    expect(component.filteredCars.length).toBe(1);
    expect(component.filteredCars[0].make).toBe('Toyota');
  });

  it('should filter cars by search term', () => {
    component.filterForm.patchValue({ searchTerm: 'Honda' });
    component.applyFilters();
    
    expect(component.filteredCars.length).toBe(1);
    expect(component.filteredCars[0].make).toBe('Honda');
  });

  it('should sort cars by column', () => {
    component.onSort('price');
    
    expect(component.currentSort.column).toBe('price');
    expect(component.filteredCars[0].make).toBe('Toyota'); // Lower price first
  });

  it('should export filtered cars to CSV', () => {
    component.filterForm.patchValue({ makeFilter: 'Toyota' });
    component.applyFilters();
    component.exportToCsv();
    
    expect(csvService.exportToCsv).toHaveBeenCalledWith(jasmine.arrayContaining([
      jasmine.objectContaining({ make: 'Toyota' })
    ]), 'car-database');
  });

  it('should clear all filters', () => {
    component.filterForm.patchValue({
      searchTerm: 'test',
      makeFilter: 'Toyota',
      fuelTypeFilter: 'gas'
    });
    
    component.clearFilters();
    
    expect(component.filterForm.value.searchTerm).toBe('');
    expect(component.filterForm.value.makeFilter).toBe('');
    expect(storageService.clearFilterState).toHaveBeenCalled();
  });

  it('should restore filter state from localStorage on init', () => {
    const savedState: FilterState = {
      searchTerm: 'test',
      makeFilter: 'Toyota',
      cylindersFilter: '',
      sortBy: 'price',
      sortDirection: 'desc' as 'asc' | 'desc'
    };
    
    storageService.loadFilterState.and.returnValue(savedState);
    
    const newFixture = TestBed.createComponent(CarListComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();
    
    expect(newComponent.filterForm.value.searchTerm).toBe('test');
    expect(newComponent.filterForm.value.makeFilter).toBe('Toyota');
  });

  it('should count active filters correctly', () => {
    component.filterForm.patchValue({
      searchTerm: 'test',
      makeFilter: 'Toyota',
      minPrice: 10000
    });
    
    expect(component.getActiveFilterCount()).toBe(3);
  });
});

