
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
    return <div className="text-center p-8">Loading comparison data...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!data) {
    return <div className="text-center p-8">No data available.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Baseline Comparison</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card title="GHG Intensity Comparison (gCO₂e/MJ)">
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.3)" />
                            <XAxis dataKey="name" stroke="#9ca3af"/>
                            <YAxis stroke="#9ca3af" domain={['dataMin - 2', 'dataMax + 2']}/>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(31, 41, 55, 0.8)',
                                    borderColor: '#4b5563',
                                    color: '#f3f4f6'
                                }}
                            />
                            <Legend />
                            <ReferenceLine y={GHG_INTENSITY_TARGET} label={{ value: `Target: ${GHG_INTENSITY_TARGET}`, position: 'insideTopLeft', fill: '#f59e0b' }} stroke="#f59e0b" strokeDasharray="3 3" />
                            <Bar dataKey="ghgIntensity" name="GHG Intensity" fill="#42A5F5" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card title={`Baseline: ${data.baseline.id}`}>
                <div className="space-y-2 text-sm">
                    <p><strong>Vessel Type:</strong> {data.baseline.vesselType}</p>
                    <p><strong>Fuel Type:</strong> {data.baseline.fuelType}</p>
                    <p><strong>Year:</strong> {data.baseline.year}</p>
                    <p><strong>GHG Intensity:</strong> <span className="font-semibold">{data.baseline.ghgIntensity.toFixed(2)} gCO₂e/MJ</span></p>
                </div>
            </Card>
        </div>
      </div>
      
      <Card title="Comparison Details">
         <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Route ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">GHG Intensity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">% Difference</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Compliant</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {data.comparisonRoutes.map((route) => (
                <tr key={route.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{route.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{route.ghgIntensity.toFixed(2)} gCO₂e/MJ</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${route.percentDiff > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {route.percentDiff.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      {route.compliant ? <CheckCircleIcon /> : <XCircleIcon />}
                      <span className="ml-2">{route.compliant ? 'Yes' : 'No'}</span>
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