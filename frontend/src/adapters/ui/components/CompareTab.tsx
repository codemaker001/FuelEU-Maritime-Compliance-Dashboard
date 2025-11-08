import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { ComparisonResult } from '../../../core/domain/types';
import { routeService } from '../../../container';
import { GHG_INTENSITY_TARGET } from '../../../shared/constants';
import Card from '../common/Card';
import { CheckCircleIcon, XCircleIcon } from '../common/icons';

const CompareTab: React.FC = () => {
  const [data, setData] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await routeService.getComparison();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = data ? [
    { name: data.baseline.id, ghgIntensity: data.baseline.ghgIntensity, type: 'Baseline' },
    ...data.comparisonRoutes.map(r => ({ name: r.id, ghgIntensity: r.ghgIntensity, type: 'Comparison' }))
  ] : [];

  if (loading) {
    return <div className="text-center p-8 text-light-text-secondary dark:text-dark-text-secondary">Loading comparison data...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-status-red">Error: {error}</div>;
  }

  if (!data) {
    return <div className="text-center p-8 text-light-text-secondary dark:text-dark-text-secondary">No baseline is set. Please set a baseline route first.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Baseline Comparison</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card title="GHG Intensity Comparison (gCO₂e/MJ)">
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.1)" />
                            <XAxis dataKey="name" stroke="var(--light-text-secondary)" />
                            <YAxis stroke="var(--light-text-secondary)" domain={['dataMin - 2', 'dataMax + 2']}/>
                            <Tooltip
                                cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}
                                contentStyle={{
                                    backgroundColor: 'var(--dark-card)',
                                    borderColor: 'var(--dark-border)',
                                    color: 'var(--dark-text)'
                                }}
                            />
                            <Legend />
                            <ReferenceLine y={GHG_INTENSITY_TARGET} label={{ value: `Target: ${GHG_INTENSITY_TARGET}`, position: 'insideTopLeft', fill: '#f59e0b' }} stroke="#f59e0b" strokeDasharray="3 3" />
                            <Bar dataKey="ghgIntensity" name="GHG Intensity" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card title={`Baseline: ${data.baseline.id}`}>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">Vessel Type:</span> 
                        <span className="font-semibold">{data.baseline.vesselType}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">Fuel Type:</span> 
                        <span className="font-semibold">{data.baseline.fuelType}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">Year:</span>
                        <span className="font-semibold">{data.baseline.year}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-light-border dark:border-dark-border">
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">GHG Intensity:</span>
                        <span className="font-bold text-lg text-brand-primary">{data.baseline.ghgIntensity.toFixed(2)}</span>
                    </div>
                </div>
            </Card>
        </div>
      </div>
      
      <Card title="Comparison Details">
         <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-light-border dark:divide-dark-border">
            <thead className="bg-gray-50 dark:bg-dark-card/50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Route ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">GHG Intensity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">% Difference</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Compliant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {data.comparisonRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">{route.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">{route.ghgIntensity.toFixed(2)} gCO₂e/MJ</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${route.percentDiff > 0 ? 'text-status-red' : 'text-status-green'}`}>
                    {route.percentDiff.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      {route.compliant ? <CheckCircleIcon /> : <XCircleIcon />}
                      <span className="ml-2 text-light-text-secondary dark:text-dark-text-secondary">{route.compliant ? 'Yes' : 'No'}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CompareTab;