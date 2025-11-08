
import { RouteService } from './core/application/routeService';
import { ComplianceService } from './core/application/complianceService';
import { PoolService } from './core/application/poolService';
import { mockApiAdapter } from './adapters/infrastructure/mockApiAdapter';

export const routeService = new RouteService(mockApiAdapter);
export const complianceService = new ComplianceService(mockApiAdapter);
export const poolService = new PoolService(mockApiAdapter);
