// src/pages/transactions/Transactions.jsx
import React, { useState, useEffect } from "react";
import transactionAPI from "../../services/transactionAPI";

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
  const [filter, setFilter] = useState("All");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await transactionAPI.getTransactions();

        if (response.success) {
          // Transform API data to match UI format
          const transformedData = response.data.map((tx) => ({
            id: tx._id,
            type: tx.type === "purchase" ? "Buy" : "Sell",
            project: tx.project?.name || `Project ${tx.projectId}`,
            date: new Date(tx.createdAt).toLocaleDateString(),
            amount: `$${(tx.amount * tx.pricePerUnit).toFixed(2)}`,
            status:
              tx.status === "completed"
                ? tx.type === "purchase"
                  ? "Buy"
                  : "Sell"
                : tx.status === "pending"
                ? "Pending"
                : tx.status === "failed"
                ? "Failed"
                : tx.status,
          }));
          setTransactions(transformedData);
        } else {
          setError("Failed to load transactions");
        }
      } catch (err) {
        console.error("Transaction fetch error:", err);
        setError(err.message || "Failed to load transactions");
        // Fallback to empty array if API fails
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filters = ["All", "Buy", "Sell", "Pending", "Failed"];

  const filteredData =
    filter === "All"
      ? transactions
      : transactions.filter(
          (item) => item.status === filter || item.type === filter
        );

  return (
    // <div className="transactions-container">
    //   <TransactionsStyles />

    //   <div className="transactions-header">
    //     <h2>Transaction History</h2>
    //     <p>All your marketplace transactions are listed below.</p>
    //   </div>

    //   <div className="transaction-filters">
    //     {filters.map(f => (
    //       <button
    //         key={f}
    //         className={`filter-button ${filter===f?'active':''}`}
    //         onClick={() => setFilter(f)}
    //       >
    //         {f}
    //       </button>
    //     ))}
    //   </div>

    //   <table className="transactions-table">
    //     <thead>
    //       <tr>
    //         <th>Transaction ID</th>
    //         <th>Type</th>
    //         <th>Project</th>
    //         <th>Date</th>
    //         <th>Amount</th>
    //         <th>Status</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {filteredData.map(txn => (
    //         <tr key={txn.id}>
    //           <td>{txn.id}</td>
    //           <td>{txn.type}</td>
    //           <td>{txn.project}</td>
    //           <td>{txn.date}</td>
    //           <td>{txn.amount}</td>
    //           <td>
    //             <span className={`transactions-status status-${txn.status.toLowerCase()}`}>
    //               {txn.status}
    //             </span>
    //           </td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
    //     <div className="transactions-container bg-[#1a1a1a] text-white rounded-2xl shadow-lg p-6 space-y-6">
    //   {/* Header */}
    //   <div className="transactions-header">
    //     <h2 className="text-2xl font-bold">Transaction History</h2>
    //     <p className="text-gray-400 mt-1">All your marketplace transactions are listed below.</p>
    //   </div>

    //   {/* Filters */}
    //   <div className="transaction-filters flex flex-wrap gap-3">
    //     {filters.map((f) => (
    //       <button
    //         key={f}
    //         onClick={() => setFilter(f)}
    //         className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
    //           filter === f
    //             ? "bg-teal-600 text-white"
    //             : "bg-gray-800 text-gray-300 hover:bg-gray-700"
    //         }`}
    //       >
    //         {f}
    //       </button>
    //     ))}
    //   </div>

    //   {/* Table */}
    //   <div className="overflow-x-auto rounded-lg shadow-inner">
    //     <table className="w-full table-auto border-collapse">
    //       <thead className="bg-gray-800 text-gray-400 text-left">
    //         <tr>
    //           <th className="px-4 py-2 text-sm">Transaction ID</th>
    //           <th className="px-4 py-2 text-sm">Type</th>
    //           <th className="px-4 py-2 text-sm">Project</th>
    //           <th className="px-4 py-2 text-sm">Date</th>
    //           <th className="px-4 py-2 text-sm">Amount</th>
    //           <th className="px-4 py-2 text-sm">Status</th>
    //         </tr>
    //       </thead>
    //       <tbody className="divide-y divide-gray-700">
    //         {filteredData.map((txn) => (
    //           <tr key={txn.id} className="hover:bg-gray-900 transition-colors">
    //             <td className="px-4 py-2 text-sm text-gray-300">{txn.id}</td>
    //             <td className="px-4 py-2 text-sm text-gray-300">{txn.type}</td>
    //             <td className="px-4 py-2 text-sm text-gray-300">{txn.project}</td>
    //             <td className="px-4 py-2 text-sm text-gray-300">{txn.date}</td>
    //             <td className="px-4 py-2 text-sm text-gray-300">{txn.amount}</td>
    //             <td className="px-4 py-2 text-sm">
    //               <span
    //                 className={`px-2 py-1 rounded-full text-xs font-semibold ${
    //                   txn.status.toLowerCase() === "completed"
    //                     ? "bg-teal-600 text-white"
    //                     : txn.status.toLowerCase() === "pending"
    //                     ? "bg-yellow-500 text-black"
    //                     : "bg-red-600 text-white"
    //                 }`}
    //               >
    //                 {txn.status}
    //               </span>
    //             </td>
    //           </tr>
    //         ))}
    //       </tbody>
    //     </table>
    //   </div>
    // </div>

    <div className="transactions-container bg-[#1a1a1a] text-white rounded-2xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="transactions-header">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <p className="text-gray-400 mt-1">
          All your marketplace transactions are listed below.
        </p>
      </div>

      {/* Filters */}
      <div className="transaction-filters flex flex-wrap gap-3">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-teal-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-inner">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-800 text-gray-400 text-left">
            <tr>
              <th className="px-4 py-2 text-sm">Transaction ID</th>
              <th className="px-4 py-2 text-sm">Type</th>
              <th className="px-4 py-2 text-sm">Project</th>
              <th className="px-4 py-2 text-sm">Date</th>
              <th className="px-4 py-2 text-sm">Amount</th>
              <th className="px-4 py-2 text-sm">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {/* {filteredData.map((txn) => {
          let borderClass = "";
          let hoverClass = "";
          switch (txn.status.toLowerCase()) {
            case "buy":
              borderClass = "border-blue-500 text-blue-400";
              hoverClass = "hover:bg-blue-500 hover:text-white";
              break;
            case "sell":
              borderClass = "border-emerald-500 text-emerald-400";
              hoverClass = "hover:bg-emerald-500 hover:text-white";
              break;
            case "failed":
              borderClass = "border-rose-500 text-rose-400";
              hoverClass = "hover:bg-rose-500 hover:text-white";
              break;
            case "pending":
              borderClass = "border-text-yellow-300 text-yellow-300";
              hoverClass = "hover:bg-yellow-300 hover:text-black";
              break;
            default:
              borderClass = "border-gray-500 text-gray-300";
              hoverClass = "hover:bg-gray-500 hover:text-white";
          }

          return (
            <tr key={txn.id} className={`hover:bg-${hoverClass}-900 transition-colors`}>
              <td className="px-4 py-2 text-sm text-gray-300">{txn.id}</td>
              <td className="px-4 py-2 text-sm text-gray-300">{txn.type}</td>
              <td className="px-4 py-2 text-sm text-gray-300">{txn.project}</td>
              <td className="px-4 py-2 text-sm text-gray-300">{txn.date}</td>
              <td className="px-4 py-2 text-sm text-gray-300">{txn.amount}</td>
              <td className="px-4 py-2 text-sm">
                <span
                  className={`inline-block w-20 text-center rounded-full border px-2 py-1 text-xs font-semibold transition-all duration-200 ${borderClass} ${hoverClass}`}
                >
                  {txn.status}
                </span>
              </td>
            </tr>
          );
        })} */}
            {filteredData.map((txn) => (
              <tr key={txn.id} className="transition-colors">
                <td className="px-4 py-2 text-sm text-gray-300">{txn.id}</td>
                <td className="px-4 py-2 text-sm text-gray-300">{txn.type}</td>
                <td className="px-4 py-2 text-sm text-gray-300">
                  {txn.project}
                </td>
                <td className="px-4 py-2 text-sm text-gray-300">{txn.date}</td>
                <td className="px-4 py-2 text-sm text-gray-300">
                  {txn.amount}
                </td>
                <td className="px-4 py-2 text-sm">
                  <span
                    className={`
          inline-block w-24 text-center rounded-full border px-2 py-1 text-xs font-semibold transition-all duration-200
          ${
            txn.status.toLowerCase() === "buy"
              ? "border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              : ""
          }
          ${
            txn.status.toLowerCase() === "sell"
              ? "border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
              : ""
          }
          ${
            txn.status.toLowerCase() === "failed"
              ? "border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white"
              : ""
          }
          ${
            txn.status.toLowerCase() === "pending"
              ? "border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-black"
              : ""
          }
        `}
                  >
                    {txn.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Transactions;
