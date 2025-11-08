import { IRouteRepository } from '../ports/IRepositories';
import { Route, ComparisonResult } from '../domain/types';

export class RouteService {
  constructor(private routeRepository: IRouteRepository) {}

  async getRoutes(): Promise<Route[]> {
    return this.routeRepository.getRoutes();
  }

  async setBaseline(routeId: string): Promise<Route> {
    return this.routeRepository.setBaseline(routeId);
  }

  async getComparison(): Promise<ComparisonResult> {
    return this.routeRepository.getComparison();
  }
}