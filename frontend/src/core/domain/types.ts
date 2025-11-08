export interface Route {
  id: string;
  vesselType: 'Container' | 'BulkCarrier' | 'Tanker' | 'RoRo';
  fuelType: 'HFO' | 'LNG' | 'MGO';
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline?: boolean;
}

export interface ComparisonResult {
  baseline: Route;
  comparisonRoutes: (Route & { percentDiff: number; compliant: boolean })[];
}

export interface ComplianceBalance {
  shipId: string;
  year: number;
  cb_before: number;
  applied: number;
  cb_after: number;
}

export interface BankRecord {
  id: string;
  shipId: string;
  year: number;
  amount: number;
}

export interface PoolMember {
  shipId: string;
  vesselType: 'Container' | 'BulkCarrier' | 'Tanker' | 'RoRo';
  adjustedCB: number; // cb_before
}

export interface PoolCreationResult {
  poolId: string;
  members: {
    shipId: string;
    cb_before: number;
    cb_after: number;
  }[];
}