export interface Car {
  id?: string;
  // Original dataset fields
  symboling?: number;
  normalizedLosses?: number | string;
  make?: string;
  fuelType?: string;
  aspiration?: string;
  numOfDoors?: string;
  bodyStyle?: string;
  driveWheels?: string;
  engineLocation?: string;
  wheelBase?: number | string;
  length?: number | string;
  width?: number | string;
  height?: number | string;
  curbWeight?: number | string;
  engineType?: string;
  numOfCylinders?: string;
  engineSize?: number | string;
  fuelSystem?: string;
  bore?: number | string;
  stroke?: number | string;
  compressionRatio?: number | string;
  horsepower?: number | string;
  peakRpm?: number | string;
  cityMpg?: number | string;
  highwayMpg?: number | string;
  price?: number | string;
  // Alternative dataset fields (Automobile.csv)
  name?: string;
  mpg?: number | string;
  cylinders?: number | string;
  displacement?: number | string;
  weight?: number | string;
  acceleration?: number | string;
  model_year?: number | string;
  origin?: string;
  [key: string]: any; // Allow additional dynamic properties
}

export interface FilterState {
  searchTerm: string;
  makeFilter: string;
  cylindersFilter: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

