import { IComplianceRepository } from '../ports/IRepositories';
import { ComplianceBalance, BankRecord } from '../domain/types';

export class ComplianceService {
  constructor(private complianceRepository: IComplianceRepository) {}

  async getComplianceBalance(shipId: string, year: number): Promise<ComplianceBalance> {
    return this.complianceRepository.getComplianceBalance(shipId, year);
  }

  async bankSurplus(shipId: string, year: number, amount: number): Promise<BankRecord> {
    return this.complianceRepository.bankSurplus(shipId, year, amount);
  }

  async applyFromBank(shipId: string, year: number, amount: number): Promise<ComplianceBalance> {
    return this.complianceRepository.applyFromBank(shipId, year, amount);
  }
}