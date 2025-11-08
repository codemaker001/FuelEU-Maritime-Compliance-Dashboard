
import React, { useState, useEffect, useMemo } from 'react';
import { PoolMember, PoolCreationResult } from '../../../core/domain/types';
import { poolService } from '../../../container';
import Card from '../common/Card';
import { UsersIcon, CheckCircleIcon, XCircleIcon } from '../common/icons';

const PoolingTab: React.FC = () => {
  const [allMembers, setAllMembers] = useState<PoolMember[]>([]);
  const [pool, setPool] = useState<PoolMember[]>([]);
  const [poolResult, setPoolResult] = useState<PoolCreationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const data = await poolService.getPoolMembers();
        setAllMembers(data);
      } catch (err) {
        setError("Failed to fetch potential pool members.");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleToggleMember = (member: PoolMember) => {
    setPoolResult(null); // Reset result when pool changes
    setPool(prevPool =>
      prevPool.find(p => p.shipId === member.shipId)
        ? prevPool.filter(p => p.shipId !== member.shipId)
        : [...prevPool, member]
    );
  };
  
  const handleCreatePool = async () => {
      if(!isPoolValid) return;
      setLoading(true);
      setError(null);
      try {
        const result = await poolService.createPool(pool);
        setPoolResult(result);
      } catch(err) {
        setError(err instanceof Error ? err.message : "Failed to create pool.");
      } finally {
        setLoading(false);
      }
  }

  const poolSum = useMemo(() => pool.reduce((acc, member) => acc + member.adjustedCB, 0), [pool]);
  const isPoolValid = poolSum >= 0 && pool.length > 1;

  const resultTableData = useMemo(() => {
      if(!poolResult) return [];
      return poolResult.members.map(member => {
          const originalMember = allMembers.find(m => m.shipId === member.shipId);
          return {
              ...member,
              vesselType: originalMember?.vesselType || 'N/A'
          }
      })
  }, [poolResult, allMembers]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Compliance Pooling</h2>
      
      {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Available Ships">
          <div className="max-h-96 overflow-y-auto">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? <p>Loading ships...</p> : allMembers.map(member => (
                <li key={member.shipId} className="p-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{member.shipId} ({member.vesselType})</p>
                    <p className={`text-sm ${member.adjustedCB >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      CB: {member.adjustedCB.toLocaleString()}
                    </p>
                  </div>
                  <button onClick={() => handleToggleMember(member)} className={`px-3 py-1 text-sm rounded-full ${pool.find(p => p.shipId === member.shipId) ? 'bg-red-200 text-red-800 hover:bg-red-300' : 'bg-blue-200 text-blue-800 hover:bg-blue-300'}`}>
                    {pool.find(p => p.shipId === member.shipId) ? 'Remove' : 'Add'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card title="Current Pool">
            {pool.length > 0 ? (
                <>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-72 overflow-y-auto">
                    {pool.map(member => (
                        <li key={member.shipId} className="p-3">
                            <p className="font-medium">{member.shipId} ({member.vesselType})</p>
                            <p className={`text-sm ${member.adjustedCB >= 0 ? 'text-green-600' : 'text-red-600'}`}>{member.adjustedCB.toLocaleString()} gCO₂eq</p>
                        </li>
                    ))}
                </ul>
                <div className={`mt-4 p-4 rounded-md flex items-center justify-between ${isPoolValid ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                    <div className="flex items-center">
                        {isPoolValid ? <CheckCircleIcon className="h-6 w-6 text-status-green" /> : <XCircleIcon className="h-6 w-6 text-status-red" />}
                        <span className="ml-2 font-semibold text-lg">{isPoolValid ? 'Pool is Valid' : 'Pool is Invalid'}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium">Pool Sum</p>
                        <p className={`font-bold text-xl ${isPoolValid ? 'text-status-green' : 'text-status-red'}`}>{poolSum.toLocaleString()}</p>
                    </div>
                </div>
                 <button onClick={handleCreatePool} disabled={!isPoolValid || loading} className="mt-4 w-full px-4 py-2 bg-brand-primary text-white font-semibold rounded-md shadow-sm hover:bg-brand-secondary disabled:bg-gray-400">
                    {loading ? 'Processing...' : 'Create Pool'}
                </button>
                </>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <UsersIcon className="mx-auto h-12 w-12" />
                    <p className="mt-2">Select ships to form a pool.</p>
                </div>
            )}
        </Card>
      </div>
      
      {poolResult && (
          <Card title={`Pool Creation Successful (ID: ${poolResult.poolId})`}>
              <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Ship ID</th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Vessel Type</th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase">CB Before</th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase">CB After</th>
                              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Change</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {resultTableData.map(res => (
                              <tr key={res.shipId}>
                                  <td className="px-6 py-4 whitespace-nowrap font-medium">{res.shipId}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">{res.vesselType}</td>
                                  <td className="px-6 py-4 whitespace-nowrap">{res.cb_before.toLocaleString()}</td>
                                  <td className="px-6 py-4 whitespace-nowrap font-semibold">{res.cb_after.toLocaleString()}</td>
                                  <td className={`px-6 py-4 whitespace-nowrap font-semibold ${res.cb_after - res.cb_before >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {(res.cb_after - res.cb_before).toLocaleString()}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </Card>
      )}
    </div>
  );
};

export default PoolingTab;