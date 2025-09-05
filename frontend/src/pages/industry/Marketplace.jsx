// src/pages/industry/Marketplace.jsx
import React, { useMemo, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import {
  Search,
  SlidersHorizontal,
  Filter,
  ArrowUpDown,
  ShoppingCart,
  ShieldCheck,
  MapPin,
  Leaf,
  X,
} from "lucide-react";

const MOCK_LISTINGS = [
  {
    id: "BC-101",
    name: "Mangrove Shield – Delta North",
    type: "Mangroves",
    location: "Gujarat, IN",
    price: 27.8,
    rating: 4.7,
    verified: true,
    tonsAvailable: 1800,
    thumbnail:
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "BC-128",
    name: "Seagrass Bloom – West Coast",
    type: "Seagrass",
    location: "Goa, IN",
    price: 26.2,
    rating: 4.4,
    verified: true,
    tonsAvailable: 950,
    thumbnail:
      "https://images.unsplash.com/photo-1585343525945-7201a72e6ce9?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "BC-139",
    name: "Wetland Horizon – Estuary",
    type: "Wetlands",
    location: "Kerala, IN",
    price: 24.9,
    rating: 4.1,
    verified: false,
    tonsAvailable: 2200,
    thumbnail:
      "https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=1600&auto=format&fit=crop",
  },
  {
    id: "BC-144",
    name: "Mangrove Revival – Bay East",
    type: "Mangroves",
    location: "Odisha, IN",
    price: 28.9,
    rating: 4.8,
    verified: true,
    tonsAvailable: 640,
    thumbnail:
      "https://images.unsplash.com/photo-1603449279430-6f6f7b9b7f68?q=80&w=1600&auto=format&fit=crop",
  },
];

const TYPES = ["All", "Mangroves", "Seagrass", "Wetlands"];
const SORTS = [
  { id: "pop", label: "Popularity", fn: (a, b) => b.rating - a.rating },
  { id: "price_asc", label: "Price: Low to High", fn: (a, b) => a.price - b.price },
  { id: "price_desc", label: "Price: High to Low", fn: (a, b) => b.price - a.price },
  { id: "tons_desc", label: "Tons Available", fn: (a, b) => b.tonsAvailable - a.tonsAvailable },
];

export default function Marketplace() {
  const { addNotification } = useNotification();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortId, setSortId] = useState("pop");
  const [buy, setBuy] = useState({ open: false, item: null, tons: "" });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = MOCK_LISTINGS.filter((l) => {
      const matchesQ =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.location.toLowerCase().includes(q) ||
        l.id.toLowerCase().includes(q);
      const matchesType = type === "All" ? true : l.type === type;
      const matchesVerified = verifiedOnly ? l.verified : true;
      return matchesQ && matchesType && matchesVerified;
    });
    const sorter = SORTS.find((s) => s.id === sortId) || SORTS[0];
    return list.sort(sorter.fn);
  }, [query, type, verifiedOnly, sortId]);

  const openBuy = (item) => setBuy({ open: true, item, tons: "" });
  const closeBuy = () => setBuy({ open: false, item: null, tons: "" });

  const confirmBuy = () => {
    const tons = parseFloat(buy.tons);
    if (!tons || tons <= 0) {
      addNotification("Enter a valid tonnage.", "error");
      return;
    }
    if (tons > buy.item.tonsAvailable) {
      addNotification("Requested tons exceed availability.", "error");
      return;
    }
    const cost = (tons * buy.item.price).toFixed(2);
    addNotification(`Purchased ${tons} tCO₂ for $${cost} ✅`, "success");
    closeBuy();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-gray-600 mt-1">
            Discover verified blue carbon credits and build your portfolio.
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by project, id, or location"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
          />
          Verified only
        </label>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-600" />
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={sortId}
              onChange={(e) => setSortId(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-16">
            No listings match your filters.
          </div>
        ) : (
          filtered.map((l) => <ListingCard key={l.id} item={l} onBuy={() => openBuy(l)} />)
        )}
      </section>

      {/* Buy modal */}
      {buy.open && buy.item ? (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Quick Purchase</h3>
              <button
                onClick={closeBuy}
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-sm text-gray-600">{buy.item.id}</div>
              <div className="font-semibold text-gray-900">{buy.item.name}</div>
              <div className="text-sm text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {buy.item.location}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Price</div>
                <div className="font-semibold">${buy.item.price.toFixed(2)} / tCO₂</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Available</div>
                <div className="font-semibold">{buy.item.tonsAvailable.toLocaleString()} t</div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Tonnage</label>
                <input
                  value={buy.tons}
                  onChange={(e) => setBuy((b) => ({ ...b, tons: e.target.value }))}
                  placeholder="e.g., 250"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                />
                {!!parseFloat(buy.tons) && (
                  <div className="text-xs text-gray-500 mt-1">
                    Estimated cost: $
                    {(parseFloat(buy.tons) * buy.item.price).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t flex items-center justify-end gap-3">
              <button onClick={closeBuy} className="px-4 py-2 rounded-lg border hover:bg-gray-100">
                Cancel
              </button>
              <button
                onClick={confirmBuy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110"
              >
                <ShoppingCart className="w-4 h-4" /> Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ListingCard({ item, onBuy }) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden group">
      <div className="relative h-44">
        <img
          src={item.thumbnail}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
        />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 text-white text-xs">
          <Leaf className="w-3 h-3" /> {item.type}
        </div>
        {item.verified && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 text-white text-xs">
            <ShieldCheck className="w-3 h-3" /> Verified
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="text-xs text-gray-500">{item.id}</div>
        <div className="font-semibold text-gray-900">{item.name}</div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> {item.location}
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-500">Price</div>
            <div className="font-semibold">${item.price.toFixed(2)}/t</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Available</div>
            <div className="font-semibold">{item.tonsAvailable.toLocaleString()} t</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Rating</div>
            <div className="font-semibold">{item.rating}★</div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            onClick={onBuy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90"
          >
            <ShoppingCart className="w-4 h-4" /> Buy Credits
          </button>
        </div>
      </div>
    </div>
  );
}