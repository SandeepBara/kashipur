import { useEffect, useState } from "react";
import emptyApplicationImage from "../../assets/images/NoDocument.png";
import { citizenApplicationListApi } from "../../api/endpoints";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function MyApplication() {
  const token = useSelector((state) => state.citizenAuth.token);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (token) {
      fetchApplications();
    }
  }, [token]);

  const fetchApplications = async () => {
    try {
      const response = await axios.post(
        citizenApplicationListApi,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.status === true) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const renderTable = (title, columns, data, keyPrefix, urlPrefix) => (
    <div className="bg-white shadow-lg border rounded-xl overflow-hidden">
      <h3 className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 font-semibold text-white text-lg leading-4">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-left">
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-2 font-semibold">
                  {col}
                </th>
              ))}
              <th className="px-4 py-2 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((app, idx) => (
              <tr
                key={`${keyPrefix}-${idx}`}
                className="hover:bg-gray-50 border-b transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-4 py-2 text-gray-700">
                    {
                      {
                        "Application No":
                          app.appNo || app.safNo || app.newHoldingNo || "NA",
                        Status: app.appStatus || "NA",
                        "Assessment Type": app.assessmentType || "NA",
                        "Apply Date": app.applyDate || "NA",
                        ULB: app.ulbName || "NA",
                      }[col]
                    }
                  </td>
                ))}

                {/* Action buttons */}
                <td className="px-4 py-2 text-center">
                  <Link
                    to={`${urlPrefix}/${app.id}` || "#"}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-white text-sm transition"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="">
      {applications &&
      (applications.saf?.length ||
        applications.property?.length ||
        applications.waterApplication?.length ||
        applications.consumer?.length ||
        applications.tradeLicense?.length) ? (
        <div className="flex flex-col gap-6">
          {applications.saf?.length > 0 &&
            renderTable(
              "SAF Applications",
              [
                "Application No",
                "Status",
                "Assessment Type",
                "Apply Date",
                "ULB",
              ],
              applications.saf,
              "saf",
              "/citizen/saf/details"
              // "/citizen/holding/details"
            )}

          {applications.property?.length > 0 &&
            renderTable(
              "Property Applications",
              ["Application No", "Assessment Type", "ULB"],
              applications.property,
              "property",
              "/citizen/holding/details"
              // "/citizen/saf/details"
            )}

          {applications.waterApplication?.length > 0 &&
            renderTable(
              "Water Applications",
              ["Application No", "ULB"],
              applications.waterApplication,
              "water",
              "/citizen/water/details"
            )}

          {applications.consumer?.length > 0 &&
            renderTable(
              "Consumer Applications",
              ["Application No", "ULB"],
              applications.consumer,
              "consumer"
            )}

          {applications.tradeLicense?.length > 0 &&
            renderTable(
              "Trade License Applications",
              ["Application No", "ULB"],
              applications.tradeLicense,
              "trade",
              "/citizen/trade/search/details"
            )}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-16 text-center">
          <img
            src={emptyApplicationImage}
            alt="No Applications"
            className="mb-6 max-w-[220px] h-auto"
          />
          <h2 className="font-bold text-gray-800 text-2xl">
            No Applications Found
          </h2>
          <p className="mt-2 text-gray-500">
            Looks like you haven&apos;t submitted any applications yet.
          </p>
        </div>
      )}
    </div>
  );
}
