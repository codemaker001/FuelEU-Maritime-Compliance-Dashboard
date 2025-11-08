import { Route, ComparisonResult, ComplianceBalance, BankRecord, PoolMember, PoolCreationResult } from '../domain/types';

export interface IRouteRepository {
  getRoutes(): Promise<Route[]>;
  setBaseline(routeId: string): Promise<Route>;
  getComparison(): Promise<ComparisonResult>;
}

export interface IComplianceRepository {
  getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance>;
  bankSurplus(shipId: string, year: number, amount: number): Promise<BankRecord>;
  applyFromBank(shipId: string, year: number, amount: number): Promise<ComplianceBalance>;
}

export interface IPoolRepository {
  getPoolMembers(): Promise<PoolMember[]>;
  createPool(members: PoolMember[]): Promise<PoolCreationResult>;
}