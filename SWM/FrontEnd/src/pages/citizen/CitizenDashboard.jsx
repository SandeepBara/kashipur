import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { FaWater, FaHome, FaTrash, FaUser } from "react-icons/fa";
import { Card, CardContent } from "../../components/common/Card";

const data = [
  { name: "Water Tax", value: 3000, color: "#4F46E5" },
  { name: "Property Tax", value: 5000, color: "#22C55E" },
  { name: "Waste Tax", value: 1500, color: "#F59E0B" },
];

const citizenInfo = {
  name: "Ravi Kumar",
  address: "Ward 12, Gaya Nagar, Jharkhand",
  mobile: "9876543210",
  email: "ravi.kumar@example.com",
  propertyID: "PROP12345",
  totalDue: 9500,
};

export default function CitizenDashboard() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="mb-4 font-bold text-gray-800 text-3xl">
        Citizen Dashboard
      </h1>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <FaUser className="text-indigo-600 text-4xl" />
              <div>
                <h2 className="font-semibold text-xl">{citizenInfo.name}</h2>
                <p className="text-gray-600">{citizenInfo.address}</p>
                <p className="text-gray-600">Mobile: {citizenInfo.mobile}</p>
                <p className="text-gray-600">Email: {citizenInfo.email}</p>
                <p className="text-gray-600">
                  Property ID: {citizenInfo.propertyID}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="mb-4 font-semibold text-lg">Tax Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center space-x-4 p-4">
            <FaWater className="text-sky-500 text-3xl" />
            <div>
              <p className="text-gray-500">Water Tax</p>
              <h3 className="font-bold text-xl">₹ 3,000</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-4">
            <FaHome className="text-emerald-500 text-3xl" />
            <div>
              <p className="text-gray-500">Property Tax</p>
              <h3 className="font-bold text-xl">₹ 5,000</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center space-x-4 p-4">
            <FaTrash className="text-yellow-500 text-3xl" />
            <div>
              <p className="text-gray-500">Waste Tax</p>
              <h3 className="font-bold text-xl">₹ 1,500</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 font-semibold text-lg">Outstanding Summary</h3>
            <p className="text-gray-700 text-lg">
              Total Due: ₹{citizenInfo.totalDue}
            </p>
            <p className="mt-1 text-gray-500 text-sm">
              Last payment received on 12 July 2025 for Property Tax
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
