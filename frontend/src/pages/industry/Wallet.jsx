// src/pages/industry/Wallet.jsx
import React, { useMemo, useState } from "react";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Copy,
  Check,
  Download,
  Upload,
  BadgeDollarSign,
} from "lucide-react";

const MOCK_ACTIVITY = [
  { id: "W-20250902-01", type: "Deposit", amount: 420, unit: "t", when: "2 Sep 2025, 14:10" },
  { id: "W-20250901-05", type: "Purchase", amount: 250, unit: "t", when: "1 Sep 2025, 18:44" },
  { id: "W-20250828-03", type: "Withdrawal", amount: 120, unit: "t", when: "28 Aug 2025, 09:20" },
  { id: "W-20250822-09", type: "Sale", amount: 60, unit: "t", when: "22 Aug 2025, 11:05" },
];

export default function IndustryWallet() {
  const [primaryAddress] = useState("0x7aB3...A91c");
  const [custodyAddress] = useState("0xC0de...F00d");
  const [balanceTons, setBalanceTons] = useState(1420);
  const [spotPrice] = useState(31.7);
  const [copied, setCopied] = useState("");
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");

  const estUsd = useMemo(() => balanceTons * spotPrice, [balanceTons, spotPrice]);

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1200);
    } catch {
      // noop
    }
  };

  const deposit = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    setBalanceTons((b) => b + n);
    setShowDeposit(false);
    setAmount("");
  };

  const withdraw = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0 || n > balanceTons) return;
    setBalanceTons((b) => b - n);
    setShowWithdraw(false);
    setAmount("");
  };

  return (
    // <div className="space-y-8">
    //   {/* Header */}
    //   <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    //     <div>
    //       <h1 className="text-3xl font-bold">Wallet</h1>
    //       <p className="text-gray-600 mt-1">Manage your blue carbon credits and addresses.</p>
    //     </div>
    //     <div className="flex items-center gap-3">
    //       <button
    //         onClick={() => setShowDeposit(true)}
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110"
    //       >
    //         <Download className="w-4 h-4" /> Deposit
    //       </button>
    //       <button
    //         onClick={() => setShowWithdraw(true)}
    //         className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
    //       >
    //         <Upload className="w-4 h-4" /> Withdraw
    //       </button>
    //     </div>
    //   </header>

    //   {/* Balance card */}
    //   <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    //     <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow p-6 text-white lg:col-span-2">
    //       <div className="flex items-center justify-between">
    //         <div className="text-emerald-100">Portfolio Balance</div>
    //         <div className="p-2 rounded-lg bg-white/10">
    //           <WalletIcon className="w-5 h-5" />
    //         </div>
    //       </div>
    //       <div className="mt-2 text-4xl font-extrabold">{balanceTons.toLocaleString()} tCO₂</div>
    //       <div className="mt-2 text-emerald-100">
    //         Est. value: <span className="font-semibold">${Math.round(estUsd).toLocaleString()}</span>{" "}
    //         at <span className="font-semibold">${spotPrice.toFixed(2)}/t</span>
    //       </div>

    //       <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
    //         <Metric label="This Month Purchases" value="+1,020 t" tone="text-emerald-100" />
    //         <Metric label="This Month Sells" value="-180 t" tone="text-emerald-100" />
    //         <Metric label="Net Change" value="+840 t" tone="text-emerald-100" />
    //       </div>
    //     </div>

    //     {/* Receive card */}
    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <div className="flex items-center justify-between mb-2">
    //         <div className="font-semibold text-gray-900">Receive Credits</div>
    //         <div className="text-sm text-gray-500">Primary Address</div>
    //       </div>

    //       <div className="rounded-xl border p-4">
    //         <div className="text-xs text-gray-500">Address</div>
    //         <div className="mt-1 font-mono text-sm text-gray-900">{primaryAddress}</div>
    //         <div className="mt-3 flex items-center justify-between">
    //           <div className="inline-flex items-center gap-2 text-sm text-gray-700">
    //             <QrCode className="w-4 h-4" /> QR Code
    //           </div>
    //           <button
    //             onClick={() => copy(primaryAddress, "primary")}
    //             className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-gray-100 text-sm"
    //           >
    //             {copied === "primary" ? (
    //               <>
    //                 <Check className="w-4 h-4" /> Copied
    //               </>
    //             ) : (
    //               <>
    //                 <Copy className="w-4 h-4" /> Copy
    //               </>
    //             )}
    //           </button>
    //         </div>
    //       </div>

    //       <div className="mt-4 text-xs text-gray-500">
    //         Send only Blue Carbon credits (tCO₂) to this address. Deposits are reflected after
    //         network confirmation.
    //       </div>
    //     </div>
    //   </section>

    //   {/* Activity + Custody */}
    //   <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    //     <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
    //       <div className="flex items-center justify-between mb-4">
    //         <div className="font-semibold text-gray-900">Recent Activity</div>
    //         <div className="text-sm text-gray-500">Last 10 entries</div>
    //       </div>
    //       <div className="overflow-hidden rounded-xl border">
    //         <table className="w-full text-left">
    //           <thead className="bg-gray-50 text-gray-600 text-sm">
    //             <tr>
    //               <th className="py-3 px-4">ID</th>
    //               <th className="py-3 px-4">Type</th>
    //               <th className="py-3 px-4">Amount</th>
    //               <th className="py-3 px-4">When</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {MOCK_ACTIVITY.map((a) => (
    //               <tr key={a.id} className="border-t">
    //                 <td className="py-3 px-4 text-gray-900 font-medium">{a.id}</td>
    //                 <td className="py-3 px-4">
    //                   <Tag type={a.type} />
    //                 </td>
    //                 <td className="py-3 px-4">
    //                   <span className="font-semibold">{a.amount.toLocaleString()}</span> {a.unit}
    //                 </td>
    //                 <td className="py-3 px-4">{a.when}</td>
    //               </tr>
    //             ))}
    //           </tbody>
    //         </table>
    //       </div>
    //     </div>

    //     {/* Custody/Settlement box */}
    //     <div className="bg-white rounded-2xl shadow p-6">
    //       <div className="flex items-center justify-between mb-2">
    //         <div className="font-semibold text-gray-900">Custody & Settlement</div>
    //         <div className="text-sm text-gray-500">Escrow/Off-Exchange</div>
    //       </div>

    //       <div className="rounded-xl border p-4">
    //         <div className="text-xs text-gray-500">Custody Address</div>
    //         <div className="mt-1 font-mono text-sm text-gray-900">{custodyAddress}</div>
    //         <div className="mt-3 flex items-center justify-between">
    //           <div className="inline-flex items-center gap-2 text-sm text-gray-700">
    //             <BadgeDollarSign className="w-4 h-4" /> Settlement-ready
    //           </div>
    //           <button
    //             onClick={() => copy(custodyAddress, "custody")}
    //             className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border hover:bg-gray-100 text-sm"
    //           >
    //             {copied === "custody" ? (
    //               <>
    //                 <Check className="w-4 h-4" /> Copied
    //               </>
    //             ) : (
    //               <>
    //                 <Copy className="w-4 h-4" /> Copy
    //               </>
    //             )}
    //           </button>
    //         </div>
    //       </div>

    //       <div className="mt-4 text-xs text-gray-500">
    //         Use custody address for large block trades or settlement with verified vendors.
    //       </div>
    //     </div>
    //   </section>

    //   {/* Deposit modal */}
    //   {showDeposit ? (
    //     <Modal title="Deposit Credits" onClose={() => setShowDeposit(false)}>
    //       <NumberInput label="Amount (tCO₂)" value={amount} onChange={setAmount} />
    //       <div className="mt-4 flex items-center justify-end gap-3">
    //         <button onClick={() => setShowDeposit(false)} className="px-4 py-2 rounded-lg border hover:bg-gray-100">
    //           Cancel
    //         </button>
    //         <button
    //           onClick={deposit}
    //           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110"
    //         >
    //           <ArrowDownLeft className="w-4 h-4" /> Confirm Deposit
    //         </button>
    //       </div>
    //     </Modal>
    //   ) : null}

    //   {/* Withdraw modal */}
    //   {showWithdraw ? (
    //     <Modal title="Withdraw Credits" onClose={() => setShowWithdraw(false)}>
    //       <NumberInput label="Amount (tCO₂)" value={amount} onChange={setAmount} />
    //       <div className="mt-4 flex items-center justify-end gap-3">
    //         <button onClick={() => setShowWithdraw(false)} className="px-4 py-2 rounded-lg border hover:bg-gray-100">
    //           Cancel
    //         </button>
    //         <button
    //           onClick={withdraw}
    //           className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
    //         >
    //           <ArrowUpRight className="w-4 h-4" /> Confirm Withdrawal
    //         </button>
    //       </div>
    //     </Modal>
    //   ) : null}
    // </div>

    <div className="space-y-8">
  {/* Header */}
  <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-gray-100">Wallet</h1>
      <p className="text-gray-400 mt-1">Manage your blue carbon credits and addresses.</p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => setShowDeposit(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-600
        text-emerald-600 hover:bg-emerald-600 hover:text-white hover:brightness-110"
      >
        <Download className="w-4 h-4" /> Deposit
      </button>
      <button
        onClick={() => setShowWithdraw(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg  border border-rose-600
        text-rose-600 hover:bg-rose-600 hover:text-white hover:brightness-110"
      >
        <Upload className="w-4 h-4" /> Withdraw
      </button>
    </div>
  </header>

  {/* Balance card */}
  <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="bg-teal-600/20 rounded-2xl shadow-lg p-6 text-white lg:col-span-2 border border-teal-500/60 ring-1 ring-teal-500/50 hover:ring-teal-500 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="text-emerald-100">Portfolio Balance</div>
        <div className="p-2 rounded-lg bg-white/10">
          <WalletIcon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-2 text-4xl font-extrabold">{balanceTons.toLocaleString()} tCO₂</div>
      <div className="mt-2 text-emerald-100">
        Est. value: <span className="font-semibold">${Math.round(estUsd).toLocaleString()}</span>{" "}
        at <span className="font-semibold">${spotPrice.toFixed(2)}/t</span>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Metric label="This Month Purchases" value="+1,020 t" tone="text-emerald-100" />
        <Metric label="This Month Sells" value="-180 t" tone="text-emerald-100" />
        <Metric label="Net Change" value="+840 t" tone="text-emerald-100" />
      </div>
    </div>

    {/* Receive card */}
    <div className="bg-[#1a1a1a] rounded-2xl shadow p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-100">Receive Credits</div>
        <div className="text-sm text-gray-400">Primary Address</div>
      </div>

      <div className="rounded-xl border border-gray-700 p-4">
        <div className="text-xs text-gray-400">Address</div>
        <div className="mt-1 font-mono text-sm text-gray-100">{primaryAddress}</div>
        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm text-gray-300">
            <QrCode className="w-4 h-4" /> QR Code
          </div>
          <button
            onClick={() => copy(primaryAddress, "primary")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-600 hover:bg-gray-800 text-sm"
          >
            {copied === "primary" ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-300" /> Copy
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Send only Blue Carbon credits (tCO₂) to this address. Deposits are reflected after network confirmation.
      </div>
    </div>
  </section>

  {/* Activity + Custody */}
  <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="bg-[#1a1a1a] rounded-2xl shadow p-6 lg:col-span-2 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="font-semibold text-gray-100">Recent Activity</div>
        <div className="text-sm text-gray-400">Last 10 entries</div>
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-700">
        <table className="w-full text-left text-gray-200">
          <thead className="bg-gray-800 text-gray-400 text-sm">
            <tr>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">When</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ACTIVITY.map((a) => (
              <tr key={a.id} className="border border-gray-700 hover:bg-[#222]
             transition">
                <td className="py-3 px-4 font-medium">{a.id}</td>
                <td className="py-3 px-4">
                  <Tag type={a.type} />
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold">{a.amount.toLocaleString()}</span> {a.unit}
                </td>
                <td className="py-3 px-4">{a.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Custody/Settlement box */}
    <div className="bg-[#1a1a1a] rounded-2xl shadow p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-100">Custody & Settlement</div>
        <div className="text-sm text-gray-400">Escrow/Off-Exchange</div>
      </div>

      <div className="rounded-xl border border-gray-700 p-4">
        <div className="text-xs text-gray-400">Custody Address</div>
        <div className="mt-1 font-mono text-sm text-gray-100">{custodyAddress}</div>
        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-sm text-gray-300">
            <BadgeDollarSign className="w-4 h-4" /> Settlement-ready
          </div>
          <button
            onClick={() => copy(custodyAddress, "custody")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-600 hover:bg-gray-800 text-sm"
          >
            {copied === "custody" ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-gray-300" /> Copy
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Use custody address for large block trades or settlement with verified vendors.
      </div>
    </div>
  </section>
</div>

  );
}

function Metric({ label, value, tone = "text-gray-600" }) {
  return (
    <div>
      <div className={`text-sm ${tone}`}>{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}

function Tag({ type }) {
  const map = {
    Deposit: "bg-emerald-50 text-emerald-700",
    Purchase: "bg-blue-50 text-blue-700",
    Withdrawal: "bg-amber-50 text-amber-700",
    Sale: "bg-rose-50 text-rose-700",
  };
  const tone = map[type] || "bg-gray-100 text-gray-700";
  return <span className={`px-2 py-1 rounded-full text-xs ${tone}`}>{type}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-600">
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., 250"
        className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}