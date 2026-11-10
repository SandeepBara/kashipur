import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import RemarksAccordion from "../../common/RemarksAccordion";
import BasicDetailsCard from "../../../modules/trade/details/BasicDetailsCard";
import DetailsTable from "../../../modules/trade/details/DetailsTable";
import LicenseModal from "../../../modules/trade/details/LicenseModal";
import PaymentDetailsTable from "../../../modules/trade/details/PaymentDetailsTable";
import { setTradeFormData } from "../../../store/slices/citizenTradeSlice";
import {
  tradeApplicationDetailsApi,
  tradeDocListApi,
  tradeDocUploadApi,
  tradeGetPaymentDueApi,
} from "../../../api/endpoints";
import { buildTradeView, licenseData } from "../../../modules/trade/data";
import SAFHeaderCard from "../../../modules/saf/components/SAFHeader";
import { useDispatch, useSelector } from "react-redux";
import { FaCommentDollar, FaEdit, FaEye, FaUpload } from "react-icons/fa";
import { formatTimeAMPM } from "../../../utils/common";
import ActionButton from "../../common/ActionButton";
import RemarksModal from "../../../modules/saf/components/RemarksModal";
import DocViewModal from "../../common/DocViewModal";
import DocUploadModal from "../../../modules/saf/components/DocUploadModal";
import PaymentModal from "../../../modules/trade/common/PaymentModal";

const ulbId = import.meta.env.VITE_REACT_APP_ULB_ID;

export default function TradeSearchDetails() {
  const { id, licenseType, applicationType } = useParams();
  const [isFrozen, setIsFrozen] = useState(false);
  const [headerData, setHeaderData] = useState([]);
  const [tradeDetails, setTradeDetails] = useState(true);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [remarks, setRemarks] = useState([]);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.citizenAuth.token);
  const [modals, setModals] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (applicationType) {
      if (applicationType) {
        dispatch(setTradeFormData({ applicationType }));
      }
    }
  }, [applicationType]);

  useEffect(() => {
    if (id) {
      fetchDetails();
    }
  }, [id, token]);

  const fetchDetails = async () => {
    if (!token) {
      console.warn("No token found.");
      return;
    }

    try {
      const response = await axios.post(
        tradeApplicationDetailsApi,
        { id: id, ulbId: ulbId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data?.data;
      setTradeDetails(data);
      setHeaderData({
        applicationNo: data?.applicationNo,
        statusText: data?.appStatus,
        applicationType: data?.assessmentType,
      });

      const updatedRemarks = data?.levelRemarks?.map((item) => ({
        roleCode: item?.senderRole,
        action: item?.actions,
        userName: item?.senderUserName,
        message: item?.senderRemarks,
        date: item?.createdAt
          ? new Date(item?.createdAt).toLocaleDateString()
          : "NA",
        time: item?.createdAt ? formatTimeAMPM(item.createdAt) : "NA",
      }));

      setRemarks(updatedRemarks);
    } catch (error) {
      console.error("Failed to fetch SAF details", error);
    }
  };

  const viewData = useMemo(() => buildTradeView(tradeDetails), [tradeDetails]);

  const ownerRows = useMemo(() => {
    const owners = tradeDetails?.owners;
    if (!Array.isArray(owners)) return [];
    return owners.map((o) => ({
      "Owner Name": o?.ownerName || "N/A",
      "Guardian Name": o?.guardianName || "N/A",
      "Mobile No": o?.mobileNo ? String(o.mobileNo) : "N/A",
      "Email Id": o?.email || "N/A",
    }));
  }, [tradeDetails]);

  const actions = [
    {
      label: "Proceed Payment",
      onClick: () => setModals("payment"),
      icon: <FaCommentDollar />,
      show: !tradeDetails?.paymentStatus,
    },
    {
      label: "View Trade License",
      onClick: () => setModals("viewTradeLicense"),
      icon: <FaEye />,
      show: true,
    },
    {
      label: "Upload Document",
      onClick: () => setModals("uploadDocuments"),
      icon: <FaUpload />, //(tradeDetails?.paymentStatus!=0) &&
      show: true,
    },
    {
      label: "View Document",
      onClick: () => setModals("viewDocuments"),
      icon: <FaEye />,
      show: true,
    },
    {
      label: "Edit",
      onClick: () =>
        navigate(
          `/citizen/trade/${licenseType}/edit/${id}/${
            applicationType || tradeDetails.applicationType
          }`
        ),
      icon: <FaEdit />,
      show: !tradeDetails?.paymentStatus,
    },
    {
      label: "Surrender",
      onClick: () =>
        navigate(`/citizen/trade/surrender-license/${id}/SURRENDER`),
      icon: <FaEdit />,
      show: true,
    },
    {
      label: "Renew",
      onClick: () => navigate(`/citizen/trade/renew-license/${id}/RENEWAL`),
      icon: <FaEdit />,
      show: true,
    },
  ];

  return (
    <div className="mx-auto container">
      <div
        className={`flex flex-col gap-4 ${
          isFrozen ? "pointer-events-none filter blur-sm" : ""
        }`}
      >
        {tradeDetails ? (
          <>
            <SAFHeaderCard
              applicationNo={headerData?.applicationNo}
              statusText={headerData?.statusText}
              applicationType={headerData?.applicationType}
              statusColor={
                headerData?.statusText?.toLowerCase().includes("pending")
                  ? "text-red-500"
                  : "text-green-600"
              }
            />
            <BasicDetailsCard data={viewData} />
            <DetailsTable
              title="Owner Details"
              columns={["Owner Name", "Guardian Name", "Mobile No", "Email Id"]}
              data={ownerRows}
            />
            <PaymentDetailsTable data={tradeDetails?.tranDtls} />
            <RemarksAccordion title="Remarks From Level" remarks={remarks} />
            <div className="flex flex-wrap justify-center gap-3">
              {actions.map((btn, i) => (
                <ActionButton key={i} {...btn} />
              ))}
            </div>
            {/* <div className="flex justify-center items-center gap-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-white leading-3"
                onClick={() => setShowLicenseModal(true)}
              >
                View Trade License
              </button>
              <Link
                to={`/citizen/trade/${licenseType}/edit/${id}/${applicationType}`}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full text-white leading-3"
              >
                Edit
              </Link>
            </div> */}
            <LicenseModal
              isOpen={modals === "viewTradeLicense"}
              onClose={() => setModals("")}
              tradeDetails={tradeDetails}
            />
            {modals === "payment" && (
              <PaymentModal
                id={id}
                open={modals === "payment"}
                onClose={() => setModals("")}
                apiUrl={tradeGetPaymentDueApi}
                token={token}
              />
            )}
            {modals === "uploadDocuments" && (
              <DocUploadModal
                id={id}
                onClose={() => setModals("")}
                fetchDataApi={tradeDocListApi}
                docUploadApi={tradeDocUploadApi}
                token={token}
                ulbId={ulbId}
              />
            )}
            {modals === "viewDocuments" && (
              <DocViewModal
                id={id}
                onClose={() => setModals("")}
                fetchDataApi={tradeDocListApi}
                token={token}
              />
            )}
            {modals === "postNext" && (
              <RemarksModal
                onClose={() => setModals("")}
                handelChange={(e) => setVerificationRemarks(e.target.value)}
                handleSubmit={forwardBackward}
                remarks={verificationRemarks}
                heading={`Enter Remarks`}
                btn={"Send"}
              />
            )}
          </>
        ) : (
          <div className="p-6 text-center">
            <span className="inline-block border-4 border-t-transparent border-blue-600 rounded-full w-8 h-8 animate-spin loader"></span>
            <p className="mt-2">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}
