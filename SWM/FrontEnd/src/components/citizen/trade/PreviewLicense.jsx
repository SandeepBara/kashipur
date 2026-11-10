import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import FormCardPreview from "../../common/FormCardPreview";
import { fetchTradeMstrData, preparePayload } from "../../../utils/commonFunc";
import { applyTradeApi } from "../../../api/endpoints";
import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
} from "@nextui-org/react";
import { clearFormData } from "../../../store/slices/citizenTradeSlice";
import { useNavigate } from "react-router-dom";

const ulbId = import.meta.env.VITE_REACT_APP_ULB_ID;

export default function PreviewLicense() {
  const token = useSelector((state) => state.citizenAuth.token);
  const dispatch = useDispatch();
  const [mstrData, setMstrData] = useState([]);
  const [natureOfBusinessItems, setNatureOfBusinessItems] = useState([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [submissionMessage, setSubmissionMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTradeMstrData(setMstrData, token, setIsOptionsLoading);
  }, [token]);

  const formData = useSelector((state) => state.citizenTrade.tradeFormData);

  const fieldGroups = [
    {
      title: "Apply Licence (NEW LICENSE)",
      fields: [
        { label: "Application Type", value: formData.applicationType },
        { label: "Firm Type", value: formData.firmTypeId },
        {
          label: "Type of Ownership of Business Premises",
          value: formData.ownershipTypeId,
        },
      ],
    },
    {
      title: "Firm Details",
      fields: [
        { label: "Holding No", value: formData.holdingNo },
        { label: "Ward No", value: formData.wardMstrId },
        { label: "New Ward No", value: formData.newWardMstrId },
        { label: "Total Area (in Sq. Ft)", value: formData.areaInSqft },
        { label: "Firm Name", value: formData.firmName },
        {
          label: "Firm Establishment Date",
          value: formData.firmEstablishmentDate,
        },
        { label: "Business Address", value: formData.address },
        { label: "Landmark", value: formData.landmark },
        { label: "Pin Code", value: formData.pinCode },
        {
          label: "Owner of Business Premises",
          value: formData.premisesOwnerName,
        },
        { label: "Business Description", value: formData.firmDescription },
      ],
    },
  ];

  const ownerFields = formData.ownerDtl.map((owner, i) => ({
    title: `Owner ${i + 1}`,
    fields: [
      { label: "Owner Name", value: owner.ownerName },
      { label: "Guardian Name", value: owner.guardianName },
      { label: "Mobile No", value: owner.mobileNo },
      { label: "Email ID", value: owner.email },
    ],
  }));

  useEffect(() => {
    if (mstrData.itemType?.length && formData.natureOfBusiness.length) {
      const matchedItems = formData.natureOfBusiness
        .map((ele) =>
          mstrData.itemType.find(
            (item) => Number(item.tradeCode) === Number(ele.tradeItemTypeId)
          )
        )
        .filter(Boolean);

      setNatureOfBusinessItems(matchedItems);
    }
  }, [mstrData.itemType, formData.natureOfBusiness]);

  const natureOfBusinessField = {
    title: "Nature of Business",
    fields: [
      {
        label: "Nature of Business",
        value: natureOfBusinessItems || [],
        colSpan: 2,
      },
    ],
  };

  const paymentFields = [
    { label: "Payment Mode", value: formData.paymentMode },
    { label: "License For Years", value: formData.licenseForYears },
    { label: "License Fee", value: formData.licenseFee },
    { label: "Processing Fee", value: formData.processingFee },
    { label: "Service Charge", value: formData.serviceCharge },
    { label: "Total Amount", value: formData.totalAmount },
    ...(formData.paymentMode === "cheque" ||
    formData.paymentMode === "demand draft"
      ? [
          { label: "Cheque/DD Date", value: formData.chequeDate },
          { label: "Cheque/DD No", value: formData.chequeNo },
          { label: "Bank Name", value: formData.bankName },
          { label: "Branch Name", value: formData.branchName },
        ]
      : []),
  ];

  const handleSubmit = async () => {
    const payload = preparePayload(formData);
    payload.ulbId = ulbId;

    const res = await axios.post(applyTradeApi, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.data.status === true) {
      setSubmissionMessage(res.data.data.applicationNo);
      onOpen();
      toast.success(res.data.message);
    } else {
      for (const [field, messages] of Object.entries(res.data.errors)) {
        messages.forEach((msg) =>
          toast.error(msg || "Something went wrong, please try again.")
        );
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-100">
      {fieldGroups.map((group) => (
        <FormCardPreview
          key={group.title}
          title={group.title}
          formFields={group.fields}
        />
      ))}

      {ownerFields.map((group) => (
        <FormCardPreview
          key={group.title}
          title={group.title}
          formFields={group.fields}
        />
      ))}

      <FormCardPreview
        title={natureOfBusinessField.title}
        formFields={natureOfBusinessField.fields}
        colSpan={2}
      />

      <FormCardPreview title="Payment Details" formFields={paymentFields} />

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 shadow-md px-6 py-2 rounded-md text-white transition"
        >
          Submit
        </button>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (!open) {
            setSubmissionMessage("");
            navigate("/citizen/trade/search");
            dispatch(clearFormData());
          }
        }}
      >
        <ModalContent>
          {() => (
            <ModalBody className="flex flex-col justify-center items-center py-8">
              <div className="flex flex-col items-center gap-4">
                <div className="bg-green-100 p-4 rounded-full">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="12"
                      fill="#22c55e"
                      opacity="0.2"
                    />
                    <path
                      d="M7 13l3 3 7-7"
                      stroke="#22c55e"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h2 className="font-bold text-green-700 text-xl">
                  Application Submitted!
                </h2>
                <span className="text-gray-700">
                  Your Application Number is
                  <span className="ml-2 font-bold text-success-500">
                    {submissionMessage}
                  </span>
                </span>
                <span className="text-gray-500 text-sm">
                  Please save this number for future reference.
                </span>
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
