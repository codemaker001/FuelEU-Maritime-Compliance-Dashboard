
import { IPoolRepository } from '../ports/IRepositories';
import { PoolMember, PoolCreationResult } from '../domain/types';

export class PoolService {
  constructor(private poolRepository: IPoolRepository) {}

  async getPoolMembers(): Promise<PoolMember[]> {
    return this.poolRepository.getPoolMembers();
  }

  async createPool(members: PoolMember[]): Promise<PoolCreationResult> {
    return this.poolRepository.createPool(members);
  }
}
