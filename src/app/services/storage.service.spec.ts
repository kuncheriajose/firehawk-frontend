import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { FilterState } from '../models/car.model';

describe('StorageService', () => {
  let service: StorageService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    
    // Mock localStorage
    const store: { [key: string]: string } = {};
    localStorageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);
    
    localStorageSpy.getItem.and.callFake((key: string) => store[key] || null);
    localStorageSpy.setItem.and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    localStorageSpy.removeItem.and.callFake((key: string) => {
      delete store[key];
    });

    Object.defineProperty(window, 'localStorage', {
      value: localStorageSpy,
      writable: true
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save filter state to localStorage', () => {
    const filterState: FilterState = {
      searchTerm: 'test',
      makeFilter: 'Toyota',
      fuelTypeFilter: 'gas',
      bodyStyleFilter: 'sedan',
      sortBy: 'price',
      sortDirection: 'asc',
      minPrice: 10000,
      maxPrice: 50000
    };

    service.saveFilterState(filterState);

    expect(localStorageSpy.setItem).toHaveBeenCalled();
    const callArgs = localStorageSpy.setItem.calls.mostRecent().args;
    expect(callArgs[0]).toContain('filters');
    expect(JSON.parse(callArgs[1])).toEqual(filterState);
  });

  it('should load filter state from localStorage', () => {
    const filterState: FilterState = {
      searchTerm: 'test',
      makeFilter: 'Toyota',
      fuelTypeFilter: '',
      bodyStyleFilter: '',
      sortBy: 'price',
      sortDirection: 'desc',
      minPrice: null,
      maxPrice: null
    };

    localStorageSpy.getItem.and.returnValue(JSON.stringify(filterState));
    const loaded = service.loadFilterState();

    expect(loaded).toEqual(filterState);
    expect(localStorageSpy.getItem).toHaveBeenCalled();
  });

  it('should return null when no filter state exists', () => {
    localStorageSpy.getItem.and.returnValue(null);
    const loaded = service.loadFilterState();

    expect(loaded).toBeNull();
  });

  it('should clear filter state from localStorage', () => {
    service.clearFilterState();
    expect(localStorageSpy.removeItem).toHaveBeenCalled();
  });

  it('should handle JSON parse errors gracefully', () => {
    localStorageSpy.getItem.and.returnValue('invalid json');
    
    spyOn(console, 'error');
    const loaded = service.loadFilterState();
    
    expect(loaded).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});

