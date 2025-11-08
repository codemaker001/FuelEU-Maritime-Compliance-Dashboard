import React, { useState, useCallback } from 'react';
import { ComplianceBalance } from '../../../core/domain/types';
import { complianceService } from '../../../container';
import Card from '../common/Card';
import { TrendingUpIcon, TrendingDownIcon, BankIcon } from '../common/icons';

const BankingTab: React.FC = () => {
  const [balance, setBalance] = useState<ComplianceBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shipId, setShipId] = useState('S01');
  const [year, setYear] = useState(new Date().getFullYear());
  const [applyAmount, setApplyAmount] = useState<number | string>('');
  const [notification, setNotification] = useState('');

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotification('');
    try {
      const data = await complianceService.getComplianceBalance(shipId, year);
      setBalance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch balance.');
    } finally {
      setLoading(false);
    }
  }, [shipId, year]);

  const handleBankSurplus = async () => {
    if (!balance || balance.cb_after <= 0) return;
    setLoading(true);
    setError(null);
    try {
      await complianceService.bankSurplus(shipId, year, balance.cb_after);
      setNotification(`Successfully banked ${balance.cb_after.toLocaleString()} gCO₂eq.`);
      fetchBalance();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bank surplus.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFromBank = async () => {
    const amount = Number(applyAmount);
    if (amount <= 0) {
      setError("Please enter a positive amount to apply.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const newBalance = await complianceService.applyFromBank(shipId, year, amount);
      setBalance(newBalance);
      setNotification(`Successfully applied ${amount.toLocaleString()} gCO₂eq from bank.`);
      setApplyAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply from bank.');
    } finally {
      setLoading(false);
    }
  };
  
  const KpiCard = ({ title, value, icon, unit }: {title: string, value: number, icon: React.ReactNode, unit: string}) => (
      <Card>
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary truncate">{title}</p>
                <p className="mt-1 text-3xl font-bold text-light-text dark:text-dark-text">{value.toLocaleString()}</p>
                 <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{unit}</p>
            </div>
            <div className={`p-3 rounded-full ${value >= 0 ? 'bg-green-100 dark:bg-green-500/10 text-status-green' : 'bg-red-100 dark:bg-red-500/10 text-status-red'}`}>
                {icon}
            </div>
        </div>
      </Card>
  )
  
  const inputStyles = "mt-1 block w-full sm:w-auto rounded-md border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card shadow-sm focus:border-brand-primary focus:ring-brand-primary";
  const buttonStyles = "px-4 py-2 bg-brand-primary text-white font-semibold rounded-md shadow-sm hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:bg-gray-400 dark:focus:ring-offset-dark-bg";


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">Compliance Banking</h2>
      
      {notification && <div className="bg-green-100 dark:bg-green-500/10 border-l-4 border-status-green text-green-700 dark:text-green-300 p-4 rounded-lg" role="alert"><p>{notification}</p></div>}
      {error && <div className="bg-red-100 dark:bg-red-500/10 border-l-4 border-status-red text-red-700 dark:text-red-300 p-4 rounded-lg" role="alert"><p>{error}</p></div>}

      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="shipId" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Ship ID</label>
            <input type="text" id="shipId" value={shipId} onChange={(e) => setShipId(e.target.value)} className={inputStyles} />
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Year</label>
            <input type="number" id="year" value={year} onChange={(e) => setYear(parseInt(e.target.value))} className={inputStyles} />
          </div>
          <button onClick={fetchBalance} disabled={loading} className={buttonStyles}>
            {loading ? 'Fetching...' : 'Get Balance'}
          </button>
        </div>
      </Card>

      {balance && (
        <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard title="CB Before" value={balance.cb_before} icon={balance.cb_before >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />} unit="gCO₂eq"/>
            <KpiCard title="Applied from Bank" value={balance.applied} icon={<BankIcon />} unit="gCO₂eq"/>
            <KpiCard title="CB After" value={balance.cb_after} icon={balance.cb_after >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />} unit="gCO₂eq"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Bank Surplus">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">Bank the positive compliance balance for future use.</p>
            <button onClick={handleBankSurplus} disabled={loading || balance.cb_after <= 0} className="w-full px-4 py-2 bg-status-green text-white font-semibold rounded-md shadow-sm hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
              Bank Surplus ({balance.cb_after > 0 ? balance.cb_after.toLocaleString() : 0})
            </button>
          </Card>

          <Card title="Apply from Bank">
             <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">Apply a banked surplus to cover a compliance deficit.</p>
            <div className="flex items-center gap-2">
              <input type="number" value={applyAmount} onChange={e => setApplyAmount(e.target.value)} className="block w-full rounded-md border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card shadow-sm focus:border-brand-primary focus:ring-brand-primary" placeholder="Amount to apply" />
              <button onClick={handleApplyFromBank} disabled={loading || Number(applyAmount) <= 0} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 disabled:bg-gray-400">
                Apply
              </button>
            </div>
          </Card>
        </div>
        </>
      )}
    </div>
  );
};

export default BankingTab;