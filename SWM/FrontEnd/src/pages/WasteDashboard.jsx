import React, { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { motion } from "framer-motion";
import { FiActivity, FiBarChart2, FiCheckCircle, FiDollarSign, FiMapPin, FiRadio, FiTruck, FiUsers } from "react-icons/fi";
import AdminLayout from "../layout/AdminLayout";
import { getToken } from "../utils/auth";
import axios from "axios";
import {
  swmDemandCollectionDueApi,
  swmMonthlyCollectionApi,
  swmRfIdMapNotMapApi,
} from "../api/endpoints";
import ColorWaveLoader from "../components/common/ColorWaveLoader";
import VehicleTracker from "../components/common/VehicleLiveWithPathMap";

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

function MetricCard({ icon: Icon, label, value, detail, tone = "emerald", loading = false }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  };

  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
          {loading ? <div className="mt-4"><ColorWaveLoader bars={7} height={24} /></div> : <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]">{value}</p>}
          {detail && !loading && <p className="mt-1 text-xs text-slate-500">{detail}</p>}
        </div>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 ${tones[tone]}`}>
          <Icon size={19} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

const WasteDashboard = () => {
  const token = getToken();
  const [summary, setSummary] = useState({});
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [monthlyCollection, setMonthlyCollection] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(true);
  const [rfIdData, setRfIdData] = useState(null);
  const [rfIdLoading, setRfIdLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const response = await axios.post(swmDemandCollectionDueApi, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response?.data?.status) setSummary(response.data.data || {});
      } catch (error) {
        console.error("Error fetching SWM summary", error);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  useEffect(() => {
    const fetchMonthlyCollection = async () => {
      setMonthlyLoading(true);
      try {
        const response = await axios.post(swmMonthlyCollectionApi, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response?.data?.status) setMonthlyCollection(response.data.data || []);
      } catch (error) {
        console.error("Error fetching monthly collection", error);
      } finally {
        setMonthlyLoading(false);
      }
    };

    fetchMonthlyCollection();
  }, [token]);

  useEffect(() => {
    const fetchRfidSummary = async () => {
      setRfIdLoading(true);
      try {
        const response = await axios.post(swmRfIdMapNotMapApi, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response?.data?.status) setRfIdData(response.data.data || {});
      } catch (error) {
        console.error("Error fetching RFID summary", error);
      } finally {
        setRfIdLoading(false);
      }
    };

    fetchRfidSummary();
  }, [token]);

  const collectionPercent = summary?.totalTax > 0
    ? Math.min(100, Math.max(0, (summary.totalCollection / summary.totalTax) * 100))
    : 0;
  const consumerPercent = summary?.totalConsumer > 0
    ? Math.min(100, Math.max(0, (summary.totalCollectionProperty / summary.totalConsumer) * 100))
    : 0;
  const monthlyData = useMemo(() => (Array.isArray(monthlyCollection) ? monthlyCollection : []).map((item) => ({
    month: item.month,
    amount: Number(item.amount || 0),
  })), [monthlyCollection]);
  const demandData = [
    { name: "Collected", value: Number(summary?.totalCollection || 0), color: "#059669" },
    { name: "Outstanding", value: Math.max(Number(summary?.totalTax || 0) - Number(summary?.totalCollection || 0), 0), color: "#e2e8f0" },
  ];

  const chartTooltipStyle = {
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.10)",
  };

  return (
    <AdminLayout>
      <div className="mx-auto min-h-full max-w-[1600px] space-y-6 bg-slate-50 px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <header className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 px-5 py-6 text-white shadow-lg sm:px-8 sm:py-8">
          <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[34px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-28 right-44 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-50">
                <FiActivity size={14} /> Municipal operations
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Solid Waste Management</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/80 sm:text-base">Collection performance, field teams, vehicles and camera feeds in one operational view.</p>
            </div>
            <div className="flex items-center gap-2 self-start rounded-xl border border-white/15 bg-black/10 px-3 py-2 text-xs font-medium text-emerald-50 sm:self-auto">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Live operations
            </div>
          </div>
        </header>

        <section aria-label="Collection overview" className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={FiDollarSign} label="Total demand" value={formatCurrency(summary?.totalTax)} detail={`${formatNumber(summary?.totalConsumer)} registered consumers`} tone="blue" loading={summaryLoading} />
          <MetricCard icon={FiCheckCircle} label="Collected" value={formatCurrency(summary?.totalCollection)} detail={`${formatNumber(summary?.totalCollectionProperty)} consumers paid`} tone="emerald" loading={summaryLoading} />
          <MetricCard icon={FiActivity} label="Outstanding" value={formatCurrency(summary?.totalOutstanding)} detail="Pending collection amount" tone="rose" loading={summaryLoading} />
          <MetricCard icon={FiUsers} label="Consumers" value={formatNumber(summary?.totalConsumer)} detail={`${formatNumber(summary?.total)} wards in service area`} tone="violet" loading={summaryLoading} />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)]">
          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-slate-900"><FiBarChart2 className="text-emerald-700" /><h2 className="font-semibold">Monthly collection</h2></div>
                <p className="mt-1 text-xs text-slate-500">Collection trend across reporting periods</p>
              </div>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">INR</span>
            </div>
            {monthlyLoading ? <div className="py-8"><ColorWaveLoader bars={9} height={26} /></div> : monthlyData.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">No monthly collection data available yet.</div>
            ) : (
              <div className="h-64 w-full sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 5" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(value) => value >= 100000 ? `${(value / 100000).toFixed(1)}L` : value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
                    <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={chartTooltipStyle} />
                    <Line type="monotone" dataKey="amount" name="Collection" stroke="#059669" strokeWidth={3} dot={{ r: 3, fill: "#059669", strokeWidth: 2, stroke: "white" }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </article>

          <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div>
              <div className="flex items-center gap-2 text-slate-900"><FiDollarSign className="text-emerald-700" /><h2 className="font-semibold">Demand realization</h2></div>
              <p className="mt-1 text-xs text-slate-500">Collected amount compared with total demand</p>
            </div>
            <div className="relative mx-auto mt-2 h-48 max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={demandData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={86} paddingAngle={3} stroke="none" startAngle={90} endAngle={-270}>
                    {demandData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={chartTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{collectionPercent.toFixed(1)}%</span>
                <span className="text-[11px] text-slate-500">realized</span>
              </div>
            </div>
            <div className="mt-1 space-y-3">
              <div>
                <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-slate-600">Collection amount</span><span className="font-semibold text-slate-800">{formatCurrency(summary?.totalCollection)}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${collectionPercent}%` }} /></div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><span className="text-slate-500">Consumer collection coverage</span><span className="font-semibold text-slate-800">{consumerPercent.toFixed(1)}%</span></div>
            </div>
          </article>
        </section>

        <section aria-label="Service coverage" className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={FiMapPin} label="Wards" value={formatNumber(summary?.total)} detail="Administrative coverage" tone="cyan" loading={summaryLoading} />
          <MetricCard icon={FiRadio} label="RFID installed" value={formatNumber(rfIdData?.mapData)} detail="Registered and mapped" tone="emerald" loading={rfIdLoading} />
          <MetricCard icon={FiMapPin} label="RFID pending" value={formatNumber(rfIdData?.notMapData)} detail="Require installation or mapping" tone="amber" loading={rfIdLoading} />
          <MetricCard icon={FiTruck} label="Field monitoring" value="Live map" detail="Vehicles and collection team routes" tone="blue" />
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2"><FiMapPin className="text-emerald-700" /><h2 className="text-base font-semibold text-slate-900">Field operations</h2></div>
              <p className="mt-1 text-xs text-slate-500">Monitor vehicle movement, TC visits and consumer routes</p>
            </div>
            <span className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:self-auto"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Tracking active</span>
          </div>
          <div className="p-3 sm:p-5"><VehicleTracker /></div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default WasteDashboard;
