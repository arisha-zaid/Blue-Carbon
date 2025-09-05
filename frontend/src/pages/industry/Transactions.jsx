// src/pages/transactions/Transactions.jsx
import React, { useState } from 'react';

const TransactionsStyles = () => (
  <style>{`
    .transactions-container { min-height:100vh; background:#f9fafb; color:#1f2937; font-family:ui-sans-serif,sans-serif; padding:24px; }

    .transactions-header { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; margin-bottom:24px; }
    .transactions-header h2 { font-size:1.5rem; font-weight:700; margin:0; }
    .transactions-header p { color:#6b7280; margin:4px 0 0; }

    .transaction-filters { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:16px; }
    .filter-button { padding:8px 16px; border-radius:.5rem; border:1px solid #e5e7eb; background:#fff; cursor:pointer; transition:all 0.2s; font-weight:500; }
    .filter-button.active { background:#3b82f6; color:white; border-color:#3b82f6; }
    .filter-button:hover { background:#eff6ff; }

    .transactions-table { width:100%; border-collapse:collapse; background:#fff; border-radius:.75rem; overflow:hidden; box-shadow:0 1px 2px rgba(0,0,0,0.05); }
    .transactions-table th, .transactions-table td { padding:12px 16px; text-align:left; font-size:.875rem; color:#1f2937; }
    .transactions-table th { background:#f3f4f6; font-weight:600; }
    .transactions-table tr:nth-child(even){background:#f9fafb;}
    .transactions-status { padding:4px 8px; border-radius:.5rem; font-weight:500; font-size:.75rem; color:white; display:inline-block; }
    .status-buy { background:#2563eb; }
    .status-sell { background:#16a34a; }
    .status-pending { background:#f59e0b; }
    .status-failed { background:#ef4444; }
  `}</style>
);

const Transactions = () => {
  const [filter, setFilter] = useState('All');

  const transactionData = [
    { id: 'TXN001', type: 'Buy', project: 'Mangrove Credit', date: '2025-09-01', amount: '$150', status: 'Buy' },
    { id: 'TXN002', type: 'Sell', project: 'Seagrass Credit', date: '2025-09-02', amount: '$90', status: 'Sell' },
    { id: 'TXN003', type: 'Buy', project: 'Coral Credit', date: '2025-09-03', amount: '$200', status: 'Pending' },
    { id: 'TXN004', type: 'Sell', project: 'Forest Credit', date: '2025-09-04', amount: '$120', status: 'Failed' },
  ];

  const filters = ['All', 'Buy', 'Sell', 'Pending', 'Failed'];

  const filteredData = filter === 'All' ? transactionData : transactionData.filter(item => item.status === filter || item.type === filter);

  return (
    <div className="transactions-container">
      <TransactionsStyles />

      <div className="transactions-header">
        <h2>Transaction History</h2>
        <p>All your marketplace transactions are listed below.</p>
      </div>

      <div className="transaction-filters">
        {filters.map(f => (
          <button
            key={f}
            className={`filter-button ${filter===f?'active':''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <table className="transactions-table">
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Type</th>
            <th>Project</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(txn => (
            <tr key={txn.id}>
              <td>{txn.id}</td>
              <td>{txn.type}</td>
              <td>{txn.project}</td>
              <td>{txn.date}</td>
              <td>{txn.amount}</td>
              <td>
                <span className={`transactions-status status-${txn.status.toLowerCase()}`}>
                  {txn.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transactions;
