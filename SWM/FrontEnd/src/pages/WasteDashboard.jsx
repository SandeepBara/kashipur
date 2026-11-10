import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
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

const WasteDashboard = () => {
  const token = getToken();

  const [summary, setSummary] = useState({});
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [monthlyCollection, setMonthlyCollection] = useState([]);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [rfIdData, setRfIdData] = useState([]);

  // ✅ Corrected async useEffect pattern
  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const response = await axios.post(
          swmDemandCollectionDueApi,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response?.data?.status) {
          setSummary(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching summary:", error);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [token]);

  // ✅ Monthly Collection API
  useEffect(() => {
    const fetchMonthlyCollection = async () => {
      setMonthlyLoading(true);
      try {
        const response = await axios.post(
          swmMonthlyCollectionApi,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response?.data?.status) {
          setMonthlyCollection(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching monthly collection:", error);
      } finally {
        setMonthlyLoading(false);
      }
    };

    fetchMonthlyCollection();
  }, [token]);

  // ✅ RFID Collection API
  useEffect(() => {
    const fetchMonthlyCollection = async () => {
      try {
        const response = await axios.post(
          swmRfIdMapNotMapApi,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response?.data?.status) {
          setRfIdData(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching monthly collection:", error);
      } 
    };

    fetchMonthlyCollection();
  }, [token]);

  // ✅ Safe percentage calculation
  const collectionPercent =
    summary?.totalTax > 0
      ? ((summary?.totalCollection / summary?.totalTax) * 100).toFixed(2)
      : 0;

  const consumerPercent =
    summary?.totalConsumer > 0
      ? ((summary?.totalCollectionProperty / summary?.totalConsumer) * 100).toFixed(2)
      : 0;

  // ✅ Dynamic line chart data (fallback to mock if empty)
  const lineData =
    monthlyCollection.length > 0
      ? monthlyCollection.map((item) => ({
          date: item.month,
          amount: item.amount,
        }))
      : [
          { date: "01-11-2025", amount: 18000 },
          { date: "02-11-2025", amount: 2000 },
          { date: "03-11-2025", amount: 3500 },
          { date: "04-11-2025", amount: 1000 },
          { date: "05-11-2025", amount: 5000 },
        ];

  const pieData = [
    {
      name: "Total Demand",
      value: parseFloat(summary?.totalTax ? summary.totalTax : 0),
    },
    {
      name: "Total Collection",
      value: parseFloat(summary?.totalCollection ? summary.totalCollection : 0),
    },
  ];

  console.log("pieData",pieData);

  const COLORS = ["#0088FE", "#FF4444"];

  return (
    <AdminLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span role="img" aria-label="dashboard">
              📊
            </span>{" "}
            Dashboard
          </h1>
        </div>

        {/* Summary Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-gray-500 font-semibold">DEMAND</h2>
            { summaryLoading ? (
                <ColorWaveLoader bars={9} height={26} />
                ):(
                    <>
                        <p className="text-xl font-bold text-blue-600">
                        ₹{summary?.totalTax?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                        {summary?.totalConsumer || 0} No. of Consumers
                        </p>
                    </>
                )
            }
            
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-gray-500 font-semibold">COLLECTION</h2>

            { summaryLoading ? (
                <ColorWaveLoader bars={9} height={26} />
                ):(
                    <>
                        <p className="text-xl font-bold text-green-600">
                        ₹{summary?.totalCollection?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                        {summary?.totalCollectionProperty || 0} No. of Consumers
                        </p>
                    </>
                )
            }
            
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-gray-500 font-semibold">BALANCE AMOUNT</h2>
            { summaryLoading ? (
                <ColorWaveLoader bars={9} height={26} />
                ):(
                    <>
                        <p className="text-xl font-bold text-red-600">
                        ₹{summary?.totalOutstanding?.toLocaleString() || 0}
                        </p>
                    </>
                )
            }
            
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-gray-500 font-semibold">PERCENTAGE</h2>
            <div className="flex flex-col">
                { summaryLoading ? (
                    <ColorWaveLoader bars={9} height={26} />
                    ):(
                        <>
                            <p className="text-blue-600 font-semibold">
                                Collection: {collectionPercent}%
                            </p>
                            <p className="text-green-600 font-semibold">
                                Consumer: {consumerPercent}%
                            </p>
                        </>
                    )
                }              
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-gray-500 font-semibold">Total Ward</h2>
            <div className="flex flex-col">
                { summaryLoading ? (
                    <ColorWaveLoader bars={9} height={26} />
                    ):(
                        <>
                            <p className="text-xl font-bold">
                            {summary?.total|| 0}
                            </p>
                        </>
                    )
                }              
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-gray-500 font-semibold">Total Consumer</h2>
            <div className="flex flex-col">
                { summaryLoading ? (
                    <ColorWaveLoader bars={9} height={26} />
                    ):(
                        <>
                            <p className="text-xl font-bold">
                            {summary?.totalConsumer|| 0}
                            </p>
                        </>
                    )
                }              
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-gray-500 font-semibold">RFID Installed</h2>
            <div className="flex flex-col">
                { rfIdData.length==0 ? (
                    <ColorWaveLoader bars={9} height={26} />
                    ):(
                        <>
                            <p className="text-xl font-bold">
                            {rfIdData?.mapData|| 0}
                            </p>
                        </>
                    )
                }              
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-gray-500 font-semibold">RFID Not Installed</h2>
            <div className="flex flex-col">
                { rfIdData.length==0 ? (
                    <ColorWaveLoader bars={9} height={26} />
                    ):(
                        <>
                            <p className="text-xl font-bold">
                            {rfIdData?.notMapData|| 0}
                            </p>
                        </>
                    )
                }              
            </div>
          </div>
        </motion.div>

        {/* Line Chart */}
        <div className="mt-8 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Monthly Collection Report
          </h2>
          {monthlyLoading ? (
            <ColorWaveLoader bars={9} height={26} />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#0088FE"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie Chart */}
        <div className="mt-8 bg-white shadow rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Percentage Wise Demand and Collection
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  `${name}: ₹${value?.toLocaleString()}`
                }
                outerRadius={100}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-8 bg-white shadow rounded-lg p-4">
          < VehicleTracker />
        </div>
      </div>
    </AdminLayout>
  );
};

export default WasteDashboard;
