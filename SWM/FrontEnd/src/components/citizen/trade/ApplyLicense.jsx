import { useEffect, useRef, useState } from "react";
import FormCard from "../../common/FormCard";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchNewWardByOldWard,
  fetchTradeMstrData,
  preparePayload,
} from "../../../utils/commonFunc";
import { ownerFields, paymentFields } from "../../../modules/trade/data";
import {
  setNatureOfBusiness,
  setTradeFormData,
  updateFormField,
  updateOwnerDetail,
} from "../../../store/slices/citizenTradeSlice";
import axios from "axios";
import {
  getTradeTaxDetailsApi,
  testTradePayloadApi,
  tradeApplicationDetailsApi,
  validateHoldingNoApi,
} from "../../../api/endpoints";
import toast from "react-hot-toast";

const ulbId = import.meta.env.VITE_REACT_APP_ULB_ID;

export default function ApplyLicense() {
  const token = useSelector((state) => state.citizenAuth.token);
  const dispatch = useDispatch();
  const [mstrData, setMstrData] = useState([]);
  const [paymentMode, setPaymentMode] = useState("");
  const [newWardList, setNewWardList] = useState([]);
  const formData = useSelector((state) => state.citizenTrade.tradeFormData);
  const navigate = useNavigate();
  const debounceTimer = useRef(null);
  const [errors, setErrors] = useState({});
  const { id, licenseType, applicationType } = useParams();
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [validationError, setValidationError] = useState({});

  // Fetch details on mount
  useEffect(() => {
    if (mstrData.itemType) {
      fetchLicenseDetails();
    }
    // eslint-disable-next-line
  }, [id, token, mstrData]);

  const fetchLicenseDetails = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        tradeApplicationDetailsApi,
        { id: id, ulbId: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status === true) {
        const d = response.data.data;

        // Map API response to tradeFormData structure
        const mapped = {
          applicationType: applicationType,
          firmTypeId: d.firmTypeId?.toString() ?? null,
          ownershipTypeId: d.ownershipTypeId?.toString() ?? null,
          priviesLicenseId: d.priviesLicenseId?.toString() ?? null,
          wardMstrId: d.wardMstrId?.toString() ?? null,
          newWardMstrId: d.newWardMstrId?.toString() ?? null,
          firmName: d.firmName ?? "",
          firmDescription: d.firmDescription ?? "",
          firmEstablishmentDate: d.firmEstablishmentDate ?? "",
          premisesOwnerName: d.premisesOwnerName ?? "",
          areaInSqft: d.areaInSqft ?? "",
          address: d.address ?? "",
          pinCode: d.pinCode ?? "",
          licenseForYears: d.licenseForYears?.toString() ?? "",
          isTobaccoLicense: d.isTobaccoLicense ? 1 : 0,
          holdingNo: d.holdingNo ?? "",
          natureOfBusiness:
            typeof d.natureOfBusiness === "string" &&
            d.natureOfBusiness.trim() !== ""
              ? d.natureOfBusiness
                  .split(",")
                  .map((item) => ({
                    tradeItemTypeId: mstrData.itemType
                      ?.find((ele) => ele.tradeItem.trim() === item.trim())
                      ?.id.toString(),
                  }))
                  .filter(Boolean) // Remove undefined if not found
              : [],
          ownerDtl: Array.isArray(d.owners)
            ? d.owners.map((o) => ({
                ownerName: o.ownerName ?? "",
                guardianName: o.guardianName ?? "",
                mobileNo: o.mobileNo ?? "",
                emailId: o.email ?? "",
              }))
            : [],
          taxDetails: d.taxDetails ?? {},
        };
        dispatch(setTradeFormData(mapped));
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching license details:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTradeMstrData(setMstrData, token, { ulbId: ulbId }, (state) => {
      setIsOptionsLoading(state);
    });
  }, [token]);

  useEffect(() => {
    if (formData.wardMstrId) {
      fetchNewWardByOldWard(formData.wardMstrId, token, ulbId).then(
        setNewWardList
      );
    }
  }, [formData.wardMstrId]);

  useEffect(() => {
    if (applicationType) {
      dispatch(setTradeFormData({ applicationType }));
    } else {
      dispatch(setTradeFormData({ applicationType: "NEW LICENSE" }));
    }
  }, [applicationType]);

  useEffect(() => {
    if (formData.wardMstrId) {
      fetchNewWardByOldWard(formData.wardMstrId, token, ulbId).then(
        setNewWardList
      );
      // Reset newWardMstrId when wardMstrId changes
      dispatch(updateFormField({ name: "newWardMstrId", value: "" }));
    }
  }, [formData.wardMstrId, token, ulbId, dispatch]);

  const fieldGroups = [
    {
      title: `Apply Licence (${formData.applicationType})`,
      fields: [
        {
          name: "applicationType",
          label: "Application Type",
          type: "text",
          value: formData.applicationType,
          required: true,
          isDisabled: true,
        },
        {
          name: "firmTypeId",
          label: "Firm Type",
          type: "select",
          value: formData.firmTypeId || "",
          required: true,
          options: mstrData.firmType,
          optionLabelKey: "firmType",
          optionValueKey: "id",
        },
        {
          name: "ownershipTypeId",
          label: "Type of Ownership of Business Premises",
          type: "select",
          value: formData.ownershipTypeId || "",
          required: true,
          options: mstrData.ownershipType,
          optionLabelKey: "ownershipType",
          optionValueKey: "id",
        },
      ],
    },
    {
      title: "Firm Details",
      fields: [
        {
          name: "holdingNo",
          label: "Holding No",
          type: "text",
          value: formData.holdingNo,
          error: validationError?.holdingNo || "",
          required: true,
          charRegex: /^[A-Za-z0-9\s,.\-\/#]$/,
          regex: /^[A-Za-z0-9\s,.\-\/#]{0,20}$/,
          onBlur: (e) => validateHoldingNo(e.target.value),
        },
        {
          name: "wardMstrId",
          label: "Ward No",
          type: "select",
          value: formData.wardMstrId,
          options: mstrData.wardList,
          optionLabelKey: "wardNo",
          optionValueKey: "id",
        },
        {
          name: "newWardMstrId",
          label: "New Ward No",
          type: "select",
          value: formData.newWardMstrId,
          options: newWardList,
          optionLabelKey: "wardNo",
          optionValueKey: "id",
        },
        {
          name: "areaInSqft",
          label: "Total Area(in Sq. Ft)",
          type: "text",
          value: formData.areaInSqft,
        },
        {
          name: "firmName",
          label: "Firm Name",
          type: "text",
          value: formData.firmName,
          colSpan: 4,
        },
        {
          name: "firmEstablishmentDate",
          label: "Firm Establishment Date",
          type: "date",
          value: formData.firmEstablishmentDate,
        },
        {
          name: "address",
          label: "Business Address",
          type: "text",
          value: formData.address,
        },
        {
          name: "landmark",
          label: "Landmark",
          type: "text",
          value: formData.landmark,
        },
        {
          name: "pinCode",
          label: "Pin Code",
          type: "text",
          value: formData.pinCode,
        },
        {
          name: "premisesOwnerName",
          label: "Owner of Business Premises",
          type: "text",
          value: formData.premisesOwnerName,
        },
        {
          name: "firmDescription",
          label: "Business Description",
          type: "text",
          value: formData.firmDescription,
          colSpan: 3,
        },
      ],
    },
  ];

  const natureOfBusinessField = {
    name: "natureOfBusiness",
    label: "Nature of Business",
    type: "select",
    isMulti: true,
    options: mstrData.itemType,
    optionLabelKey: "tradeItem",
    optionValueKey: "tradeCode",
    value: formData.natureOfBusiness?.map((n) => {
      return n?.tradeItemTypeId || [];
    }),
    colSpan: 4,
    selectedList: filterBySelected(
      mstrData?.itemType,
      formData?.natureOfBusiness
    ),
  };

  function filterBySelected(originalList, selected) {
    const selectedIds = selected.map((s) => s.tradeItemTypeId?.toString());
    return originalList
      ?.filter((o) => selectedIds.includes(o.id.toString()))
      .map((o) => o.tradeItem);
  }

  const chequeFields = ["chequeDate", "chequeNo", "bankName", "branchName"].map(
    (name) => ({
      name,
      label: name.replace(/([A-Z])/g, " $1"),
      type: name === "chequeDate" ? "date" : "text",
    })
  );

  const handleSubmit = async () => {
    const newErrors = {};

    // Validate required fields in fieldGroups
    fieldGroups.forEach((group) => {
      group.fields.forEach((field) => {
        if (
          field.required &&
          (!formData[field.name] ||
            formData[field.name].toString().trim() === "")
        ) {
          newErrors[field.name] = "This field is required";
        }
      });
    });

    // Validate owner details
    formData.ownerDtl.forEach((owner, idx) => {
      ownerFields.forEach((name) => {
        if (!owner[name] || owner[name].toString().trim() === "") {
          newErrors[`owner_${idx}_${name}`] = "This field is required";
        }
      });
    });

    // Validate Nature of Business
    if (!formData.natureOfBusiness || formData.natureOfBusiness.length === 0) {
      newErrors.natureOfBusiness = "Please select at least one business type";
    }

    // Validate Licence Required for the Year fields
    paymentFields.forEach((field) => {
      if (
        field.required &&
        (!formData[field.name] || formData[field.name].toString().trim() === "")
      ) {
        newErrors[field.name] = "This field is required";
      }
    });
    // If paymentMode is cheque or demand draft, validate cheque fields
    if (paymentMode === "cheque" || paymentMode === "demand draft") {
      chequeFields.forEach((field) => {
        if (
          !formData[field.name] ||
          formData[field.name].toString().trim() === ""
        ) {
          newErrors[field.name] = "This field is required";
        }
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      const payload = preparePayload(formData);
      payload.ulbId = ulbId;

      const response = await axios.post(testTradePayloadApi, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status !== true) {
        const apiErrors = response.data.errors || {};
        // Flatten and join all error messages
        const errorMessages = Object.values(apiErrors).flat().join(" ");
        toast.error(errorMessages, { duration: 10000 });
        // Optionally, set field errors for UI display
        const formattedErrors = {};
        Object.keys(apiErrors).forEach((key) => {
          formattedErrors[key] = apiErrors[key].join(", ");
        });
        setErrors(formattedErrors);
        return;
      } else {
        toast.success("Payload validated successfully!");
        navigate("/citizen/trade/apply-license/preview");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("An error occurred while submitting the form.");
    }
  };

  const fetchTaxDetails = async () => {
    try {
      const payload = {
        applicationType: formData.applicationType,
        firmEstablishmentDate: formData.firmEstablishmentDate,
        areaInSqft: formData.areaInSqft,
        licenseForYears: formData.licenseForYears,
        isTobaccoLicense: 0,
      };

      const response = await axios.post(getTradeTaxDetailsApi, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check for validation error from API
      if (response.data.status === false && response.data.errors) {
        // Combine all error messages into a single string
        const errorMessages = Object.values(response.data.errors)
          .flat()
          .join(" ");
        toast.error(errorMessages, { duration: 10000 });
        return;
      }

      dispatch(setTradeFormData(response.data.data));
    } catch (error) {
      console.error("Error fetching tax details:", error);
      toast.error("An error occurred while fetching tax details.", {
        duration: 10000,
      });
    }
  };

  useEffect(() => {
    // Clear any previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Only run when all required fields are filled
    if (
      formData.applicationType &&
      formData.firmEstablishmentDate &&
      formData.areaInSqft &&
      formData.licenseForYears
    ) {
      debounceTimer.current = setTimeout(() => {
        fetchTaxDetails();
      }, 500); // 500ms delay
    }

    // Cleanup on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [
    formData.applicationType,
    formData.firmEstablishmentDate,
    formData.areaInSqft,
    formData.licenseForYears,
  ]);

  const validateHoldingNo = async (holdingNo) => {
    if (!holdingNo) {
      return;
    }
    try {
      const response = await axios.post(
        validateHoldingNoApi,
        { holdingNo, ulbId: ulbId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response?.data?.status) {
        const data = response?.data?.data;
        // {(name, value) => dispatch(updateFormField({ name, value }))}

        toast.success("Valid Holding Number");
        dispatch(
          updateFormField({ name: "wardMstrId", value: data?.wardMstrId })
        );
        dispatch(updateFormField({ name: "owners", value: data?.owners }));
        dispatch(
          updateFormField({ name: "newWardMstrId", value: data?.newWardMstrId })
        );
      } else {
        toast.error("Invalid Holding Number");
        setValidationError((prev) => ({
          ...prev,
          holdingNo: ["Invalid Holding No"],
        }));
        dispatch(updateFormField({ name: holdingNo, value: "" }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-2 text-gray-700 text-lg">
      {fieldGroups.map(({ title, fields }) => (
        <FormCard
          key={title}
          title={title}
          formFields={fields.map((f) => ({
            ...f,
            error: errors[f.name],
          }))}
          loading={
            fields.some(
              (f) =>
                f.type === "select" &&
                Array.isArray(f.options) &&
                f.options === mstrData[f.optionLabelKey?.toLowerCase() || ""]
            )
              ? isOptionsLoading
              : false
          }
          onChange={(name, value) => dispatch(updateFormField({ name, value }))}
        />
      ))}
      <h2 className="flex items-center gap-2 bg-gradient-to-r from-blue-700 to-blue-400 shadow-md p-3 rounded-md font-bold text-white text-lg uppercase tracking-wide">
        Owner Details
      </h2>
      {formData.ownerDtl.map((owner, i) => (
        <FormCard
          key={i}
          title=""
          formFields={ownerFields.map((name) => ({
            name,
            label: name
              .replace(/([A-Z])/g, " $1") // Adds space before capitals
              .replace(/^./, (str) => str.toUpperCase()), // Capitalizes first letter
            type: "text",
            value: owner[name] || "",
            error: errors[`owner_${i}_${name}`],
          }))}
          onChange={(name, value) =>
            dispatch(updateOwnerDetail({ index: i, name, value }))
          }
        />
      ))}
      <FormCard
        title="Nature Of Business"
        formFields={[
          {
            ...natureOfBusinessField,
            error: errors[natureOfBusinessField.name],
          },
        ]}
        onChange={(name, value) => dispatch(setNatureOfBusiness(value))}
      />
      <FormCard
        title="Licence Required for the Year"
        formFields={[
          ...paymentFields,
          ...(paymentMode === "cheque" || paymentMode === "demand draft"
            ? chequeFields
            : []),
        ].map((f) => ({
          ...f,
          value: formData[f.name] || "",
          error: errors[f.name],
        }))}
        onChange={(name, value) => {
          if (name === "paymentMode") setPaymentMode(value);
          dispatch(updateFormField({ name, value }));
        }}
      />
      <div className="flex justify-center items-end">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 px-4 rounded-full text-white"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
