// src/pages/Landing.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Trophy,
  Leaf,
  ShieldCheck,
  Award,
  BarChart3,
  Users,
  Building2,
  Globe2,
  Star,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Landing() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const toggleFAQ = (index) => setOpenFAQ(openFAQ === index ? null : index);

  // Dummy chart data
  const pieData = [
    { name: t('landing.stats.labels.mangroves'), value: 45 },
    { name: t('landing.stats.labels.seagrass'), value: 30 },
    { name: t('landing.stats.labels.wetlands'), value: 25 },
  ];
  const COLORS = ["#22c55e", "#16a34a", "#15803d"];

  const barData = [
    { year: "2021", credits: 400 },
    { year: "2022", credits: 650 },
    { year: "2023", credits: 900 },
    { year: "2024", credits: 1200 },
  ];

  const faqs = ['q1', 'q2', 'q3'].map((k) => ({
    q: t(`landing.faq.${k}.q`),
    a: t(`landing.faq.${k}.a`),
  }));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

    
    
      {/* ================= Landing Page ================= */}
<section className="w-full min-h-screen bg-gradient-to-r from-green-50 to-blue-50 flex flex-col lg:flex-row items-center justify-between px-10 lg:px-20 relative">

        <div className="absolute inset-0">
          <img
            src="/hero.jpeg"
            alt="Blue Carbon Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="flex-1 text-left relative z-10">
          <h1 className="text-6xl font-extrabold leading-tight">
            <span className="text-green-700 drop-shadow-md">{t('landing.hero.titleBlockchain')}</span>
            <br />
            <span className="text-green-700 drop-shadow-md">{t('landing.hero.titlePowered')}</span>
            <br />
            <span className="text-gray-900 font-black drop-shadow-lg">
              {t('landing.hero.titleRegistry')}
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-800 max-w-xl font-medium">
            {t('landing.hero.subtitle')}
          </p>

          {/* ✅ Now it directly navigates to Login page */}
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-lg bg-teal-600 text-white font-semibold shadow-md hover:scale-105 transition"
          >
            {t('landing.hero.loginRegister')}
          </button>

          <button className="px-6 py-3 rounded-lg border border-gray-500 text-gray-800 font-medium hover:bg-gray-50 transition ml-4">
            {t('landing.hero.watchDemo')}
          </button>
        </div>

        {/* Live Dashboard Card */}
        <div className="flex-1 mt-10 lg:mt-0 lg:ml-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-gray-900">
                {t('landing.live.title')}
              </h3>
              <span className="text-sm text-green-600 font-bold">{t('landing.live.indicator')}</span>
            </div>
            <p className="text-sm text-gray-600 mb-1 font-medium">
              {t('landing.live.latestVerification')}
            </p>
            <p className="text-lg font-black text-gray-900">
              {t('landing.live.projectName')}
            </p>
            <p className="text-xs text-gray-500 mb-4">{t('landing.live.txid', { id: '0x7f3a9b...' })}</p>

            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  {t('landing.live.creditValue')}
                </p>
                <p className="text-lg font-extrabold text-gray-900">
                  {t('landing.live.pricePerTon', { price: '24.50' })}
                </p>
                <p className="text-xs text-green-600 font-semibold">
                  {t('landing.live.changeToday', { percent: '12.3' })}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-2 font-medium">
              {t('landing.live.verification')}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-teal-600 h-3 rounded-full"
                style={{ width: "85%" }}
              ></div>
            </div>
            <p className="text-right text-xs text-gray-600 font-semibold mt-1">
              85%
            </p>
          </div>
        </div>
      </section>


{/* ✅ Wrapper for all sections except footer */}
    <div className="relative">
     {/* Single background image */}
  <img
    src="/sat.jpeg"
    alt="Background"
    className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
  />


      {/* ================= Features Section ================= */}
      <section className="py-16 px-8 bg-white">
        <h2 className="text-3xl font-bold text-green-800 text-center mb-12">
          🌟 {t('landing.features.title')}
        </h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <Leaf className="mx-auto text-green-600 w-10 h-10" />,
              key: 'aiEstimator',
            },
            {
              icon: <ShieldCheck className="mx-auto text-green-600 w-10 h-10" />,
              key: 'blockchainRegistry',
            },
            {
              icon: <Award className="mx-auto text-green-600 w-10 h-10" />,
              key: 'gamification',
            },
            {
              icon: <BarChart3 className="mx-auto text-green-600 w-10 h-10" />,
              key: 'analytics',
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-50 shadow-lg p-6 rounded-2xl text-center"
            >
              {f.icon}
              <h3 className="mt-4 font-semibold text-lg">{t(`landing.features.${f.key}.title`)}</h3>
              <p className="text-sm text-gray-600 mt-2">{t(`landing.features.${f.key}.desc`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= Stats Section ================= */}
      <section className="py-16 px-8 bg-green-50">
        <h2 className="text-3xl font-bold text-green-800 text-center mb-12">
          📊 {t('landing.stats.title')}
        </h2>
        <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="font-semibold mb-4 text-green-700">
              {t('landing.stats.projectDistribution')}
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="font-semibold mb-4 text-green-700">{t('landing.stats.yearlyGrowth')}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="credits" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ================= Top Performers ================= */}
      <section className="py-16 px-8 bg-green-50">
        <h2 className="text-3xl font-bold text-green-800 text-center mb-12">
          🏆 {t('landing.top.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Mangrove Guardians",
              score: "1200 CO₂ credits",
              desc: "Community-led mangrove restoration project.",
            },
            {
              name: "Seagrass Protectors",
              score: "950 CO₂ credits",
              desc: "Youth group conserving seagrass meadows.",
            },
            {
              name: "Coastal Green Warriors",
              score: "780 CO₂ credits",
              desc: "NGO-led initiative for wetland conservation.",
            },
          ].map((p, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white shadow-lg p-6 rounded-2xl text-center"
            >
              <Trophy className="mx-auto text-yellow-500 w-10 h-10" />
              <h3 className="mt-4 font-semibold text-lg">{p.name}</h3>
              <p className="text-green-600 font-bold mt-2">{p.score}</p>
              <p className="text-sm text-gray-600 mt-2">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= Stakeholders Section ================= */}
      <section className="py-16 px-8 bg-white">
        <h2 className="text-3xl font-bold text-green-800 text-center mb-12">
          👥 Our Stakeholders
        </h2>
        <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            {
              icon: <Users className="mx-auto text-green-600 w-10 h-10" />,
              title: "Community & NGOs",
              desc: "Grassroot organizations driving coastal restoration projects.",
            },
            {
              icon: <Building2 className="mx-auto text-green-600 w-10 h-10" />,
              title: "Corporates",
              desc: "Companies offsetting carbon footprint via verified credits.",
            },
            {
              icon: <Globe2 className="mx-auto text-green-600 w-10 h-10" />,
              title: "Government",
              desc: "Authorities ensuring compliance & policy support.",
            },
            {
              icon: <Star className="mx-auto text-green-600 w-10 h-10" />,
              title: "Investors",
              desc: "Impact investors funding sustainable blue carbon projects.",
            },
          ].map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-gray-50 shadow-lg p-6 rounded-2xl text-center"
            >
              {s.icon}
              <h3 className="mt-4 font-semibold text-lg">{s.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= Why Choose Us ================= */}
      <section className="py-16 px-8 bg-gray-100">
        <h2 className="text-3xl font-bold text-green-800 text-center mb-12">
          💡 Why Choose Us?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "100% Transparency",
              desc: "Every credit is backed by blockchain verification.",
            },
            {
              title: "AI-Driven Insights",
              desc: "Accurate CO₂ predictions for reliable impact reporting.",
            },
            {
              title: "Global Recognition",
              desc: "Trusted by communities, corporates & policymakers worldwide.",
            },
          ].map((w, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="bg-white shadow-lg p-6 rounded-2xl text-center"
            >
              <h3 className="font-semibold text-lg text-green-700">
                {w.title}
              </h3>
              <p className="text-sm text-gray-600 mt-2">{w.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= FAQ Section ================= */}
      <section className="py-16 px-8 bg-white">
        <h2 className="text-3xl font-bold text-green-800 text-center mb-12">
          ❓ Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="bg-gray-50 shadow-md p-6 rounded-xl cursor-pointer"
              onClick={() => toggleFAQ(i)}
            >
              <h3 className="font-semibold text-lg flex justify-between items-center">
                {f.q}
                <span>{openFAQ === i ? "-" : "+"}</span>
              </h3>
              {openFAQ === i && (
                <p className="text-sm text-gray-600 mt-3">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>
</div>
      {/* ================= Footer ================= */}
      <footer className="bg-green-800 text-white text-center py-6">
        <p>© 2025 Blue Carbon Registry. All rights reserved.</p>
      </footer>
    </div>
  );
}
