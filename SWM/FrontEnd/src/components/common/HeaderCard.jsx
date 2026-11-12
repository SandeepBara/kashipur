import { useState } from "react";
import { FaInfoCircle, FaRegCopy, FaCheckCircle } from "react-icons/fa";

const HeaderCard = ({
  applicationNo,
  statusText,
  applicationType,
  statusColor,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(applicationNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // reset after 1.5s
  };

  return (
    <div className="bg-white shadow-sm p-4 sm:px-5 border border-slate-200 rounded-xl">
      <div className="flex flex-wrap justify-between items-center gap-4">
        {/* Icon and Info */}
        {applicationNo && (
          <div className="flex items-center gap-4">
            <div className="text-blue-600 text-2xl">
              <FaInfoCircle />
            </div>
            <div>
              <p className="text-slate-600 text-sm leading-6">
                Your applied application no. is{" "}
                <span className="font-bold text-teal-700 text-lg sm:text-xl break-all">
                  {applicationNo}
                </span>
                <button
                  onClick={handleCopy}
                  className="ml-2 text-gray-500 hover:text-blue-700 transition"
                  title="Copy Application No."
                >
                  {copied ? (
                    <FaCheckCircle className="inline-block text-green-600" />
                  ) : (
                    <FaRegCopy className="inline-block" />
                  )}
                </button>
                . You can use this for future reference.
              </p>
            </div>
          </div>
        )}

        {/* Status */}
        {statusText && (
          <div className="bg-emerald-50 px-4 py-2 border border-emerald-200 rounded-lg font-semibold text-emerald-800 text-sm">
            Current Status:{" "}
            <span className={`font-bold ${statusColor}`}>{statusText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeaderCard;
