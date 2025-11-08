
import { IRouteRepository, IComplianceRepository, IPoolRepository } from '../../core/ports/IRepositories';
import { Route, ComparisonResult, ComplianceBalance, BankRecord, PoolMember, PoolCreationResult } from '../../core/domain/types';
import { GHG_INTENSITY_TARGET } from '../../shared/constants';


const initialRoutes: Route[] = [
  { id: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500, isBaseline: true },
  { id: 'R002', vesselType: 'BulkCarrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200 },
  { id: 'R003', vesselType: 'Tanker', fuelType: 'MGO', year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700 },
  { id: 'R004', vesselType: 'RoRo', fuelType: 'HFO', year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900, distance: 11800, totalEmissions: 4300 },
  { id: 'R005', vesselType: 'Container', fuelType: 'LNG', year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950, distance: 11900, totalEmissions: 4400 },
  { id: 'R006', vesselType: 'Tanker', fuelType: 'HFO', year: 2025, ghgIntensity: 92.1, fuelConsumption: 5200, distance: 13000, totalEmissions: 4800 },
];

const mockPoolMembers: PoolMember[] = [
    { shipId: 'S01', vesselType: 'Container', adjustedCB: 50000 },
    { shipId: 'S02', vesselType: 'BulkCarrier', adjustedCB: -25000 },
    { shipId: 'S03', vesselType: 'Tanker', adjustedCB: -15000 },
    { shipId: 'S04', vesselType: 'RoRo', adjustedCB: 10000 },
    { shipId: 'S05', vesselType: 'Container', adjustedCB: -30000 },
];

class MockApiAdapter implements IRouteRepository, IComplianceRepository, IPoolRepository {
  private routes: Route[] = JSON.parse(JSON.stringify(initialRoutes));
  private bankRecords: BankRecord[] = [{ id: 'B001', shipId: 'S01', year: 2024, amount: 120000 }];
  private complianceBalances: Record<string, ComplianceBalance> = {};

  private async simulateLatency<T>(data: T, delay = 500): Promise<T> {
    return new Promise(resolve => setTimeout(() => resolve(data), delay));
  }

  async getRoutes(): Promise<Route[]> {
    return this.simulateLatency(this.routes);
  }

  async setBaseline(routeId: string): Promise<Route> {
    this.routes.forEach(r => r.isBaseline = r.id === routeId);
    const updatedRoute = this.routes.find(r => r.id === routeId);
    if (!updatedRoute) throw new Error("Route not found");
    return this.simulateLatency(updatedRoute);
  }

  async getComparison(): Promise<ComparisonResult> {
    const baseline = this.routes.find(r => r.isBaseline);
    if (!baseline) throw new Error("Baseline not set");

    const comparisonRoutes = this.routes
      .filter(r => !r.isBaseline)
      .map(r => {
        const percentDiff = ((r.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
        const compliant = r.ghgIntensity <= GHG_INTENSITY_TARGET;
        return { ...r, percentDiff, compliant };
      });

    return this.simulateLatency({ baseline, comparisonRoutes });
  }

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    const key = `${shipId}-${year}`;
    if (this.complianceBalances[key]) {
        return this.simulateLatency(this.complianceBalances[key]);
    }
    // Mock calculation
    const route = this.routes[Math.floor(Math.random() * this.routes.length)];
    const energyInScope = route.fuelConsumption * 41000;
    const cb = (GHG_INTENSITY_TARGET - route.ghgIntensity) * energyInScope;
    
    const newBalance: ComplianceBalance = {
        shipId,
        year,
        cb_before: parseFloat(cb.toFixed(2)),
        applied: 0,
        cb_after: parseFloat(cb.toFixed(2))
    };
    this.complianceBalances[key] = newBalance;
    return this.simulateLatency(newBalance);
  }
  
  async bankSurplus(shipId: string, year: number, amount: number): Promise<BankRecord> {
     if (amount <= 0) throw new Error("Cannot bank a non-positive amount.");
     const newRecord: BankRecord = { id: `B${this.bankRecords.length + 1}`, shipId, year, amount };
     this.bankRecords.push(newRecord);
     return this.simulateLatency(newRecord);
  }

  async applyFromBank(shipId: string, year: number, amount: number): Promise<ComplianceBalance> {
    const totalBanked = this.bankRecords
        .filter(r => r.shipId === shipId)
        .reduce((sum, record) => sum + record.amount, 0);

    if (amount > totalBanked) throw new Error("Amount exceeds available banked surplus.");
    
    // Simple logic to "spend" from bank. A real implementation would be more complex.
    this.bankRecords.push({ id: `B_APPLY_${Date.now()}`, shipId, year, amount: -amount });
    
    const balance = await this.getComplianceBalance(shipId, year);
    balance.applied = amount;
    balance.cb_after = balance.cb_before + amount;

    return this.simulateLatency(balance);
  }

  async getPoolMembers(): Promise<PoolMember[]> {
    return this.simulateLatency(mockPoolMembers);
  }

  async createPool(members: PoolMember[]): Promise<PoolCreationResult> {
    const sum = members.reduce((acc, m) => acc + m.adjustedCB, 0);
    if (sum < 0) throw new Error("Pool sum cannot be negative.");
    
    for (const member of members) {
      if (member.adjustedCB < 0) {
        // Here we would check the "cannot exit worse" rule, but for mock, we assume it's okay
      }
      if (member.adjustedCB > 0) {
         // Here we would check the "cannot exit negative" rule, but for mock, we assume it's okay
      }
    }

    // A very simplified greedy allocation
    let deficits = members.filter(m => m.adjustedCB < 0).sort((a,b) => a.adjustedCB - b.adjustedCB);
    let surpluses = members.filter(m => m.adjustedCB > 0).sort((a,b) => b.adjustedCB - a.adjustedCB);
    const results = [...members];
    
    for (const surplus of surpluses) {
        for (const deficit of deficits) {
            if (surplus.adjustedCB <= 0 || deficit.adjustedCB >= 0) continue;
            
            const transfer = Math.min(surplus.adjustedCB, Math.abs(deficit.adjustedCB));
            surplus.adjustedCB -= transfer;
            deficit.adjustedCB += transfer;
        }
    }
    
    const finalMembers = results.map(m => ({
        shipId: m.shipId,
        cb_before: mockPoolMembers.find(p => p.shipId === m.shipId)?.adjustedCB || 0,
        cb_after: m.adjustedCB
    }))

    return this.simulateLatency({ poolId: `P${Date.now()}`, members: finalMembers });
  }
}

export const mockApiAdapter = new MockApiAdapter();
