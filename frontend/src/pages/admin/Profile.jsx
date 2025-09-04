// src/pages/admin/Profile.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNotification } from "../../context/NotificationContext";
import {
  Camera,
  Save,
  RotateCcw,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Mail,
  User,
  LockKeyhole,
} from "lucide-react";

const DEFAULT_PROFILE = {
  name: "Admin User",
  email: "admin@bluecarbon.gov",
  title: "Platform Administrator",
  department: "Registry Operations",
  phone: "+91 90000 00000",
  twoFA: true,
  apiToken: "sk_admin_1234_xxxxx_abcdef",
};

export default function AdminProfile() {
  const { addNotification } = useNotification();
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);
  const [revealToken, setRevealToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState("");
  const fileRef = useRef(null);

  // Password form
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const canChangePwd = useMemo(
    () => pwd.current && pwd.next && pwd.confirm && pwd.next === pwd.confirm && pwd.next.length >= 8,
    [pwd]
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin_profile");
      if (stored) setProfile(JSON.parse(stored));
      const avatar = localStorage.getItem("admin_avatar");
      if (avatar) setAvatarUrl(avatar);
    } catch {}
  }, []);

  const maskedToken = useMemo(() => {
    const token = profile.apiToken || "";
    if (revealToken) return token;
    if (!token) return "";
    const tail = token.slice(-4);
    return "•".repeat(Math.max(0, token.length - 4)) + tail;
  }, [profile.apiToken, revealToken]);

  const onPickAvatar = () => fileRef.current?.click();

  const onAvatarChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result.toString());
      localStorage.setItem("admin_avatar", reader.result.toString());
      addNotification("Avatar updated ✅", "success");
    };
    reader.readAsDataURL(f);
  };

  const copyToken = async () => {
    try {
      await navigator.clipboard.writeText(profile.apiToken || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch {}
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem("admin_profile", JSON.stringify(profile));
      addNotification("Profile saved ✅", "success");
    } catch {
      addNotification("Failed to save profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  const resetProfile = () => {
    setProfile(DEFAULT_PROFILE);
    addNotification("Reverted to defaults.", "info");
  };

  const toggle2FA = () => {
    setProfile((p) => ({ ...p, twoFA: !p.twoFA }));
    addNotification(`2FA ${!profile.twoFA ? "enabled" : "disabled"}`, "success");
  };

  const changePassword = (e) => {
    e.preventDefault();
    if (!canChangePwd) {
      addNotification("Enter valid password fields (min 8 chars).", "error");
      return;
    }
    setPwd({ current: "", next: "", confirm: "" });
    addNotification("Password updated ✅", "success");
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Admin Profile</h1>
        <p className="text-gray-600 mt-1">Manage your account, security, and preferences.</p>
      </header>

      {/* Top card */}
      <section className="bg-white rounded-2xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar */}
          <div className="relative w-28 h-28">
            <img
              src={
                avatarUrl ||
                "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=500&auto=format&fit=crop"
              }
              alt="avatar"
              className="w-28 h-28 rounded-2xl object-cover border"
            />
            <button
              onClick={onPickAvatar}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gray-900 text-white hover:opacity-90"
              title="Change avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onAvatarChange} />
          </div>

          {/* Basics */}
          <form onSubmit={saveProfile} className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Full Name"
                value={profile.name}
                onChange={(v) => setProfile((p) => ({ ...p, name: v }))}
                icon={<User className="w-4 h-4 text-gray-500" />}
              />
              <Field
                label="Email"
                value={profile.email}
                onChange={(v) => setProfile((p) => ({ ...p, email: v }))}
                icon={<Mail className="w-4 h-4 text-gray-500" />}
              />
              <Field
                label="Title"
                value={profile.title}
                onChange={(v) => setProfile((p) => ({ ...p, title: v }))}
              />
              <Field
                label="Department"
                value={profile.department}
                onChange={(v) => setProfile((p) => ({ ...p, department: v }))}
              />
              <Field
                label="Phone"
                value={profile.phone}
                onChange={(v) => setProfile((p) => ({ ...p, phone: v }))}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:brightness-110 disabled:opacity-60"
              >
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Profile"}
              </button>
              <button
                type="button"
                onClick={resetProfile}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button
                type="button"
                onClick={toggle2FA}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
              >
                <ShieldCheck className="w-4 h-4" /> {profile.twoFA ? "Disable 2FA" : "Enable 2FA"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Security / Password */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
            <LockKeyhole className="w-5 h-5 text-emerald-600" /> Change Password
          </h3>
          <form onSubmit={changePassword} className="space-y-4">
            <PasswordField
              label="Current Password"
              value={pwd.current}
              onChange={(v) => setPwd((s) => ({ ...s, current: v }))}
            />
            <PasswordField
              label="New Password"
              value={pwd.next}
              onChange={(v) => setPwd((s) => ({ ...s, next: v }))}
            />
            <PasswordField
              label="Confirm New Password"
              value={pwd.confirm}
              onChange={(v) => setPwd((s) => ({ ...s, confirm: v }))}
            />
            <div className="text-xs text-gray-500 -mt-2">
              Must be at least 8 characters and include a mix of letters/numbers.
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={!canChangePwd}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:opacity-90 disabled:opacity-40"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* API Token */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h3 className="font-semibold text-gray-900 mb-4 inline-flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-emerald-600" /> API Token
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Personal Admin Token</div>
              <button
                onClick={() => setRevealToken((s) => !s)}
                className="text-sm text-gray-600 hover:underline inline-flex items-center gap-1"
              >
                {revealToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}{" "}
                {revealToken ? "Hide" : "Show"}
              </button>
            </div>
            <div className="rounded-xl border px-3 py-2 font-mono text-sm text-gray-900 flex items-center justify-between">
              <span className="truncate">{profile.apiToken ? maskedToken : "—"}</span>
              <button
                onClick={copyToken}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-gray-700 hover:bg-gray-100 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Never share your token. Rotate credentials regularly. Store secrets server-side in production.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-white rounded-2xl shadow p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <ul className="space-y-3 text-sm text-gray-700">
          <li>Signed in from Chrome on Windows (2 hours ago)</li>
          <li>Updated registry policy “MRV v2.1” (yesterday)</li>
          <li>Approved project “Mangrove Revival – Bay East” (2 days ago)</li>
          <li>Issued 500 tCO₂ to ACME Industries (last week)</li>
        </ul>
      </section>
    </div>
  );
}

/* Reusable fields */
function Field({ label, value, onChange, placeholder, icon }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <div className="relative">
        {icon ? <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div> : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${icon ? "pl-9" : "pl-3"} pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500`}
        />
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="••••••••"
          className="w-full pr-10 pl-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}