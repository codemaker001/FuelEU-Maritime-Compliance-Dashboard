
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Route } from '../../../core/domain/types';
import { routeService } from '../../../container';
import Card from '../common/Card';

// Dummy data for filter options to avoid dependency on fetched data
const initialRoutes: Omit<Route, 'isBaseline'>[] = [
  { id: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500 },
  { id: 'R002', vesselType: 'BulkCarrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200 },
  { id: 'R003', vesselType: 'Tanker', fuelType: 'MGO', year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700 },
  { id: 'R004', vesselType: 'RoRo', fuelType: 'HFO', year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900, distance: 11800, totalEmissions: 4300 },
  { id: 'R005', vesselType: 'Container', fuelType: 'LNG', year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950, distance: 11900, totalEmissions: 4400 },
];

const RoutesTab: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ vesselType: 'All', fuelType: 'All', year: 'All' });
  const [notification, setNotification] = useState('');

  const fetchRoutes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await routeService.getRoutes();
      setRoutes(data);
    } catch (error) {
      console.error("Failed to fetch routes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutes();
  }, [fetchRoutes]);

  const handleSetBaseline = async (routeId: string) => {
    try {
      await routeService.setBaseline(routeId);
      setNotification(`Route ${routeId} has been set as the new baseline.`);
      setTimeout(() => setNotification(''), 3000);
      fetchRoutes(); // Refetch to update UI state
    } catch (error) {
      console.error("Failed to set baseline:", error);
    }
  };

  const filteredRoutes = useMemo(() => {
    return routes.filter(route => {
      const { vesselType, fuelType, year } = filters;
      return (
        (vesselType === 'All' || route.vesselType === vesselType) &&
        (fuelType === 'All' || route.fuelType === fuelType) &&
        (year === 'All' || route.year.toString() === year)
      );
    });
  }, [routes, filters]);

  const uniqueValues = useMemo(() => {
    const vesselTypes = ['All', ...new Set(initialRoutes.map(r => r.vesselType))];
    const fuelTypes = ['All', ...new Set(initialRoutes.map(r => r.fuelType))];
    const years = ['All', ...new Set(initialRoutes.map(r => r.year.toString()))];
    return { vesselTypes, fuelTypes, years };
  }, []);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Route Management</h2>
      
      {notification && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert">
          <p>{notification}</p>
        </div>
      )}

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="vesselType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Vessel Type</label>
            <select id="vesselType" onChange={e => setFilters({...filters, vesselType: e.target.value})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md">
              {uniqueValues.vesselTypes.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Type</label>
            <select id="fuelType" onChange={e => setFilters({...filters, fuelType: e.target.value})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md">
              {uniqueValues.fuelTypes.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
            <select id="year" onChange={e => setFilters({...filters, year: e.target.value})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm rounded-md">
              {uniqueValues.years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Route ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vessel / Fuel</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Year</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">GHG Intensity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fuel Cons. (t)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Distance (km)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Emissions (t)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-4">Loading...</td></tr>
              ) : (
                filteredRoutes.map((route) => (
                  <tr key={route.id} className={route.isBaseline ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{route.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{route.vesselType} / {route.fuelType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{route.year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{route.ghgIntensity.toFixed(2)} gCO₂e/MJ</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{route.fuelConsumption.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{route.distance.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{route.totalEmissions.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleSetBaseline(route.id)}
                        disabled={route.isBaseline}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        {route.isBaseline ? 'Baseline' : 'Set Baseline'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default RoutesTab;