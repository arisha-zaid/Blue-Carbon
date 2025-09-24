// src/pages/industry/Marketplace.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNotification } from "../../context/NotificationContext";
import transactionAPI from "../../services/transactionAPI";
import { getProjects } from "../../store/projects";
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
  Maximize2,
  Minimize2,
} from "lucide-react";

// Map modal (Leaflet) imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icons for Vite/ESM
const iconRetinaUrl = new URL(
  "leaflet/dist/images/marker-icon-2x.png",
  import.meta.url
).toString();
const iconUrl = new URL(
  "leaflet/dist/images/marker-icon.png",
  import.meta.url
).toString();
const shadowUrl = new URL(
  "leaflet/dist/images/marker-shadow.png",
  import.meta.url
).toString();
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

// Helper: invalidate map size after open/fullscreen changes so it fills container
function MapInvalidator({ fullscreen, open }) {
  const map = useMap();
  React.useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 360); // match transition duration
    return () => clearTimeout(t);
  }, [fullscreen, open, map]);
  return null;
}

// Helper: re-center map to given lat/lng when item changes
function MapRecenter({ lat, lng }) {
  const map = useMap();
  React.useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.setView([lat, lng]);
    }
  }, [lat, lng, map]);
  return null;
}

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

// Mark mock listings so Buy button can be disabled for them
const MOCK_LISTINGS_WITH_SOURCE = MOCK_LISTINGS.map((l) => ({
  ...l,
  source: "mock",
}));

const TYPES = ["All", "Mangroves", "Seagrass", "Wetlands", "Agroforestry"];
const SORTS = [
  { id: "pop", label: "Popularity", fn: (a, b) => b.rating - a.rating },
  {
    id: "price_asc",
    label: "Price: Low to High",
    fn: (a, b) => a.price - b.price,
  },
  {
    id: "price_desc",
    label: "Price: High to Low",
    fn: (a, b) => b.price - a.price,
  },
  {
    id: "tons_desc",
    label: "Tons Available",
    fn: (a, b) => b.tonsAvailable - a.tonsAvailable,
  },
];

export default function Marketplace() {
  const { addNotification } = useNotification();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortId, setSortId] = useState("pop");
  const [buy, setBuy] = useState({ open: false, item: null, tons: "" });
  const [backendProjects, setBackendProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Map modal state
  const [mapModal, setMapModal] = useState({
    open: false,
    item: null,
    fullscreen: false,
  });

  // Fetch real projects from backend so purchases have valid ObjectIds
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const res = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5000/api"
          }/projects`
        );
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          const mapped = data.data.map((p) => ({
            id: p._id, // MongoDB ObjectId
            name: p.name,
            type: p.type,
            location: p.location?.city || p.location?.country || "",
            price: p.creditPrice || 25 + Math.random() * 6, // fallback pricing
            rating: 4.3, // placeholder
            verified: !!p.verification?.isVerified,
            tonsAvailable: p.availableCredits ?? 1000, // fallback
            thumbnail:
              (Array.isArray(p.images) && p.images[0]) ||
              "https://images.unsplash.com/photo-1529112431328-88da9f2e2ea8?q=80&w=1600&auto=format&fit=crop",
            source: "backend",
            // pass coordinates for map
            coordinates: {
              latitude:
                p.location?.coordinates?.latitude ?? p.location?.lat ?? null,
              longitude:
                p.location?.coordinates?.longitude ?? p.location?.lng ?? null,
            },
          }));
          setBackendProjects(mapped);
        }
      } catch (e) {
        console.warn("Failed to load backend projects", e);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // Map user-added projects into marketplace items
    const userProjects = (getProjects() || [])
      .filter((p) =>
        [
          "Pending MRV",
          "MRV Complete",
          "Approved",
          "Blockchain Anchored",
          "Certificate Issued",
        ].includes(p.status)
      )
      .map((p) => {
        // Normalize thumbnail: fix relative uploads to absolute
        let thumbnail = p.thumb;
        if (
          thumbnail &&
          typeof thumbnail === "string" &&
          thumbnail.startsWith("/uploads/")
        ) {
          thumbnail = `${window.location.protocol}//${window.location.hostname}:5000${thumbnail}`;
        }
        return {
          id: String(p.id),
          name: p.name || "Untitled Project",
          type: p.type || "Mangroves",
          location: p.location || "",
          price: 25 + Math.random() * 6, // mock price band
          rating: 4 + Math.random() * 1, // mock rating
          verified:
            p.status === "Blockchain Anchored" ||
            p.status === "Certificate Issued",
          tonsAvailable: Math.max(100, Math.round((p.predictedCO2 || 300) * 3)),
          thumbnail:
            thumbnail ||
            "https://images.unsplash.com/photo-1529112431328-88da9f2e2ea8?q=80&w=1600&auto=format&fit=crop",
          // normalized coordinates (from client-side created projects)
          coordinates: p.coordinates
            ? {
                latitude: p.coordinates.latitude,
                longitude: p.coordinates.longitude,
              }
            : p.lat && p.lng
            ? { latitude: p.lat, longitude: p.lng }
            : null,
        };
      });

    let list = [...backendProjects, ...userProjects, ...MOCK_LISTINGS].filter(
      (l) => {
        const matchesQ =
          !q ||
          l.name.toLowerCase().includes(q) ||
          (l.location || "").toLowerCase().includes(q) ||
          String(l.id).toLowerCase().includes(q);
        const matchesType = type === "All" ? true : l.type === type;
        const matchesVerified = verifiedOnly ? l.verified : true;
        return matchesQ && matchesType && matchesVerified;
      }
    );

    const sorter = SORTS.find((s) => s.id === sortId) || SORTS[0];
    return list.sort(sorter.fn);
  }, [query, type, verifiedOnly, sortId]);

  const openBuy = (item) => setBuy({ open: true, item, tons: "" });
  const closeBuy = () => setBuy({ open: false, item: null, tons: "" });

  const confirmBuy = async () => {
    const tons = parseFloat(buy.tons);
    if (!tons || tons <= 0) {
      addNotification("Enter a valid tonnage.", "error");
      return;
    }
    if (tons > buy.item.tonsAvailable) {
      addNotification("Requested tons exceed availability.", "error");
      return;
    }

    // Validate project ID format (must be a MongoDB ObjectId)
    const projectId = String(buy.item.id || "");
    const isValidObjectId = /^[a-fA-F0-9]{24}$/i.test(projectId);
    if (!isValidObjectId) {
      addNotification(
        "This listing is demo-only and cannot be purchased. Please select a real project with a valid ID.",
        "error"
      );
      return;
    }

    try {
      // Create a real transaction using the API
      const transactionData = {
        projectId,
        amount: tons,
        type: "purchase",
        pricePerUnit: buy.item.price,
        description: `Purchase of ${tons} tCO₂ from ${buy.item.name}`,
      };

      const response = await transactionAPI.createTransaction(transactionData);

      if (response.success) {
        const cost = (tons * buy.item.price).toFixed(2);
        addNotification(
          `Transaction created! Purchased ${tons} tCO₂ for $${cost} ✅`,
          "success"
        );

        // Optionally redirect to transactions page
        // window.location.href = '/industry/transactions';
      } else {
        addNotification(response.message || "Transaction failed", "error");
      }
    } catch (error) {
      console.error("Transaction error:", error);
      addNotification(error.message || "Failed to create transaction", "error");
    }

    closeBuy();
  };

  return (
    // <div className="space-y-6">
    //   {/* Header */}
    //   <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    //     <div>
    //       <h1 className="text-3xl font-bold">Marketplace</h1>
    //       <p className="text-gray-600 mt-1">
    //         Discover verified blue carbon credits and build your portfolio.
    //       </p>
    //     </div>
    //   </header>

    //   {/* Toolbar */}
    //   <div className="bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row md:items-center gap-3">
    //     <div className="relative flex-1">
    //       <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
    //       <input
    //         value={query}
    //         onChange={(e) => setQuery(e.target.value)}
    //         placeholder="Search by project, id, or location"
    //         className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
    //       />
    //     </div>

    //     <div className="flex items-center gap-2">
    //       <Filter className="w-4 h-4 text-gray-600" />
    //       <select
    //         value={type}
    //         onChange={(e) => setType(e.target.value)}
    //         className="py-2 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
    //       >
    //         {TYPES.map((t) => (
    //           <option key={t} value={t}>
    //             {t}
    //           </option>
    //         ))}
    //       </select>
    //     </div>

    //     <label className="inline-flex items-center gap-2 text-sm text-gray-700">
    //       <input
    //         type="checkbox"
    //         checked={verifiedOnly}
    //         onChange={(e) => setVerifiedOnly(e.target.checked)}
    //       />
    //       Verified only
    //     </label>

    //     <div className="flex items-center gap-2">
    //       <SlidersHorizontal className="w-4 h-4 text-gray-600" />
    //       <div className="relative">
    //         <ArrowUpDown className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
    //         <select
    //           value={sortId}
    //           onChange={(e) => setSortId(e.target.value)}
    //           className="pl-9 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
    //         >
    //           {SORTS.map((s) => (
    //             <option key={s.id} value={s.id}>
    //               {s.label}
    //             </option>
    //           ))}
    //         </select>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Grid */}
    //   <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    //     {filtered.length === 0 ? (
    //       <div className="col-span-full text-center text-gray-500 py-16">
    //         No listings match your filters.
    //       </div>
    //     ) : (
    //       filtered.map((l) => <ListingCard key={l.id} item={l} onBuy={() => openBuy(l)} />)
    //     )}
    //   </section>

    //   {/* Buy modal */}
    //   {buy.open && buy.item ? (
    //     <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    //       <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
    //         <div className="p-4 border-b flex items-center justify-between">
    //           <h3 className="font-semibold">Quick Purchase</h3>
    //           <button
    //             onClick={closeBuy}
    //             className="p-1 rounded-lg hover:bg-gray-100 text-gray-600"
    //           >
    //             <X className="w-4 h-4" />
    //           </button>
    //         </div>

    //         <div className="p-4 space-y-4">
    //           <div className="text-sm text-gray-600">{buy.item.id}</div>
    //           <div className="font-semibold text-gray-900">{buy.item.name}</div>
    //           <div className="text-sm text-gray-600 flex items-center gap-2">
    //             <MapPin className="w-4 h-4" /> {buy.item.location}
    //           </div>
    //           <div className="flex items-center justify-between">
    //             <div className="text-sm text-gray-600">Price</div>
    //             <div className="font-semibold">${buy.item.price.toFixed(2)} / tCO₂</div>
    //           </div>
    //           <div className="flex items-center justify-between">
    //             <div className="text-sm text-gray-600">Available</div>
    //             <div className="font-semibold">{buy.item.tonsAvailable.toLocaleString()} t</div>
    //           </div>

    //           <div>
    //             <label className="block text-sm text-gray-600 mb-1">Tonnage</label>
    //             <input
    //               value={buy.tons}
    //               onChange={(e) => setBuy((b) => ({ ...b, tons: e.target.value }))}
    //               placeholder="e.g., 250"
    //               className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
    //             />
    //             {!!parseFloat(buy.tons) && (
    //               <div className="text-xs text-gray-500 mt-1">
    //                 Estimated cost: $
    //                 {(parseFloat(buy.tons) * buy.item.price).toFixed(2)}
    //               </div>
    //             )}
    //           </div>
    //         </div>

    //         <div className="p-4 border-t flex items-center justify-end gap-3">
    //           <button onClick={closeBuy} className="px-4 py-2 rounded-lg border hover:bg-gray-100">
    //             Cancel
    //           </button>
    //           <button
    //             onClick={confirmBuy}
    //             className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110"
    //           >
    //             <ShoppingCart className="w-4 h-4" /> Confirm Purchase
    //           </button>
    //         </div>
    //       </div>
    //     </div>
    //   ) : null}
    // </div>
    <div className="min-h-screen bg-[#121212] text-gray-200 p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Marketplace</h1>
          <p className="text-gray-400 mt-1">
            Discover verified blue carbon credits and build your portfolio.
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-[#1a1a1a] rounded-2xl shadow p-4 flex flex-col md:flex-row md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by project, id, or location"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] 
                   text-gray-200 placeholder-gray-500
                   focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_8px_#14b8a6] 
                   hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6] 
                   transition-all duration-300"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="py-2 px-3 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200
                   focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_8px_#14b8a6]
                   hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6]
                   transition-all duration-300"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Verified Checkbox */}
        <label className="inline-flex items-center gap-2 text-sm text-gray-200">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="accent-teal-500 hover:accent-teal-400"
          />
          Verified only
        </label>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <div className="relative">
            <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={sortId}
              onChange={(e) => setSortId(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200
                     focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_8px_#14b8a6]
                     hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6]
                     transition-all duration-300"
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
          filtered.map((l) => (
            <ListingCard
              key={l.id}
              item={l}
              onBuy={() => openBuy(l)}
              onShowLocation={() => setMapModal({ open: true, item: l })}
              className="bg-[#1a1a1a] text-gray-200 border border-gray-700 hover:border-teal-500 transition-colors duration-300 hover:shadow-[0_0_2px_#14b8a6]"

            />
          ))
        )}
      </section>

      {/* Buy Modal */}
      {buy.open && buy.item && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] rounded-2xl shadow-xl w-full max-w-md overflow-hidden text-gray-200">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold">Quick Purchase</h3>
              <button
                onClick={closeBuy}
                className="p-1 rounded-lg hover:bg-gray-800 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="text-sm text-gray-400">{buy.item.id}</div>
              <div className="font-semibold text-white">{buy.item.name}</div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {buy.item.location}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">Price</div>
                <div className="font-semibold text-white">
                  ${buy.item.price.toFixed(2)} / tCO₂
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">Available</div>
                <div className="font-semibold text-white">
                  {buy.item.tonsAvailable.toLocaleString()} t
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Tonnage
                </label>
                <input
                  value={buy.tons}
                  onChange={(e) =>
                    setBuy((b) => ({ ...b, tons: e.target.value }))
                  }
                  placeholder="e.g., 250"
                  className="w-full px-3 py-2 rounded-lg border border-gray-700 bg-[#121212] text-gray-200
                         focus:ring-teal-500 focus:border-teal-500 focus:shadow-[0_0_8px_#14b8a6]
                         hover:border-teal-500 hover:shadow-[0_0_6px_#14b8a6]
                         transition-all duration-300"
                />
                {!!parseFloat(buy.tons) && (
                  <div className="text-xs text-gray-400 mt-1">
                    Estimated cost: $
                    {(parseFloat(buy.tons) * buy.item.price).toFixed(2)}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 flex items-center justify-end gap-3">
              <button
                onClick={closeBuy}
                className="px-4 py-2 rounded-lg border border-gray-600 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmBuy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:brightness-110"
              >
                <ShoppingCart className="w-4 h-4" /> Confirm Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {mapModal.open && mapModal.item && (
        <div className="fixed inset-0 z-[10050] bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div
            className={`bg-[#1a1a1a] rounded-2xl border border-gray-800 overflow-hidden text-gray-200 transition-all duration-300 ${
              mapModal.fullscreen ? "w-[98vw] h-[92vh]" : "w-[520px] h-[420px]"
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <div>
                <h3 className="font-semibold text-white">Project Location</h3>
                <p className="text-xs text-gray-400">{mapModal.item.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setMapModal((m) => ({ ...m, fullscreen: !m.fullscreen }))
                  }
                  className="p-2 text-gray-400 hover:text-white"
                  title={
                    mapModal.fullscreen
                      ? "Exit full screen"
                      : "View full screen"
                  }
                >
                  {mapModal.fullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() =>
                    setMapModal({ open: false, item: null, fullscreen: false })
                  }
                  className="p-2 text-gray-400 hover:text-white"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="h-[calc(100%-64px)]">
              {(() => {
                const latRaw = mapModal.item.coordinates?.latitude ?? 20;
                const lngRaw = mapModal.item.coordinates?.longitude ?? 77;
                const lat =
                  typeof latRaw === "string" ? parseFloat(latRaw) : latRaw;
                const lng =
                  typeof lngRaw === "string" ? parseFloat(lngRaw) : lngRaw;
                const hasCoords =
                  mapModal.item.coordinates &&
                  mapModal.item.coordinates.latitude != null &&
                  mapModal.item.coordinates.longitude != null;
                return (
                  <MapContainer
                    key={`${mapModal.item?.id ?? mapModal.item?.name}-${
                      mapModal.fullscreen
                    }`}
                    center={[Number(lat), Number(lng)]}
                    zoom={hasCoords ? 9 : 4}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <MapInvalidator
                      fullscreen={mapModal.fullscreen}
                      open={mapModal.open}
                    />
                    <MapRecenter lat={Number(lat)} lng={Number(lng)} />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {hasCoords && (
                      <Marker position={[Number(lat), Number(lng)]}>
                        <Popup>
                          <div className="text-sm">
                            <div className="font-semibold">
                              {mapModal.item.name}
                            </div>
                            <div className="text-gray-600">
                              {mapModal.item.location}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ListingCard({ item, onBuy, onShowLocation, className = "" }) {
  const hasCoords = !!(
    item?.coordinates &&
    item.coordinates.latitude != null &&
    item.coordinates.longitude != null
  );

  return (
    <div
      className={`bg-[#1a1a1a] rounded-2xl  hover:border-teal-600 group overflow-hidden  ${className}`}
    >
      {/* Image */}
      <div className="relative h-44">
        <img
          src={item.thumbnail}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-black/60 text-white text-xs">
          <Leaf className="w-3 h-3" /> {item.type}
        </div>
        {item.verified && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-teal-600 text-white text-xs">
            <ShieldCheck className="w-3 h-3" /> Verified
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-4 space-y-3">
        <div className="text-xs text-gray-400">{item.id}</div>
        <div className="font-semibold text-white">{item.name}</div>
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> {item.location}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-xs text-gray-500">Price</div>
            <div className="font-semibold text-white">
              ${item.price.toFixed(2)}/t
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Available</div>
            <div className="font-semibold text-white">
              {item.tonsAvailable.toLocaleString()} t
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Rating</div>
            <div className="font-semibold text-white">{item.rating}★</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => onShowLocation?.()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800 transition-all duration-200"
            title={
              hasCoords
                ? "Show location on map"
                : "Open map (no coordinates, centered on default)"
            }
          >
            <MapPin className="w-4 h-4" /> Show location
          </button>

          <button
            onClick={onBuy}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white hover:brightness-110 transition-all duration-200"
          >
            <ShoppingCart className="w-4 h-4" /> Buy Credits
          </button>
        </div>
      </div>
    </div>
  );
}
