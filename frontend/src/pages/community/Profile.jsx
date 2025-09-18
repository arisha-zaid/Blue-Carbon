import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CommunityProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.getMyCommunityProfile();
        if (res?.success) {
          if (!isMounted) return;
          setProfile(res.data);
        } else {
          throw new Error(res?.message || "Failed to load profile");
        }
      } catch (err) {
        if (!isMounted) return;
        // If no profile exists, redirect to setup
        if (err?.status === 404) {
          navigate("/community/profile-setup", { replace: true });
          return;
        }
        setError(err?.message || "Failed to load profile");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[50vh] flex items-center justify-center text-gray-400">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-4 p-3 rounded bg-yellow-900/40 text-yellow-400 border border-yellow-700">
          {error}
        </div>
        <p className="text-sm text-gray-400">
          If you don't have a profile yet, please create one from the sidebar.
        </p>
      </div>
    );
  }

  if (!profile) return null;

  const p = profile;
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-100">Community Profile</h1>
        <p className="text-gray-400">Status: {p.profileStatus}</p>
      </header>

      <section className="bg-[#121110] border border-gray-800 rounded-2xl shadow p-6">
        <h3 className="font-semibold text-gray-100 mb-3">Basic Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Community Name" value={p.communityName} />
          <Field label="Community Type" value={p.communityType} />
          <Field label="Description" value={p.description} full />
        </div>
      </section>

      <section className="bg-[#121110] border border-gray-800 rounded-2xl shadow p-6">
        <h3 className="font-semibold text-gray-100 mb-3">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Address" value={p.location?.address} />
          <Field label="District" value={p.location?.district} />
          <Field label="State" value={p.location?.state} />
        </div>
      </section>

      <section className="bg-[#121110] border border-gray-800 rounded-2xl shadow p-6">
        <h3 className="font-semibold text-gray-100 mb-3">Demographics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field
            label="Total Population"
            value={p.demographics?.totalPopulation}
          />
          <Field
            label="Total Households"
            value={p.demographics?.totalHouseholds}
          />
        </div>
      </section>

      <section className="bg-[#121110] border border-gray-800 rounded-2xl shadow p-6">
        <h3 className="font-semibold text-gray-100 mb-3">Primary Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Name" value={p.contactInfo?.primaryContact?.name} />
          <Field label="Phone" value={p.contactInfo?.primaryContact?.phone} />
        </div>
      </section>
    </div>
  );
}

function Field({ label, value, full }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="px-3 py-2 rounded-lg border border-gray-700 bg-[#1a1a1a] text-gray-200">
        {value || "-"}
      </div>
    </div>
  );
}
