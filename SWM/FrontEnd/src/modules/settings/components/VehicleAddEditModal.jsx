import React, { useEffect, useState } from 'react'
import { getToken } from '../../../utils/auth';
import axios from 'axios';
import { getWardListApi, vehicleAddApi, vehicleDtlApi, vehicleEditApi, vehicleTypeListApi, vehicleWardMappedApi } from '../../../api/endpoints';
import { Spinner } from '@nextui-org/react';
import { modalVariants } from "../../../utils/motionVariable";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import FileUpload from "../../../components/common/FileUpload";
import Select from "react-select";
import toast from "react-hot-toast";
import InputField from '../../../components/common/InputField';

function VehicleAddEditModal({ item, onClose, onSuccess }) {
  const token = getToken();

  const [isLoading, setIsLoading] = useState(true);
  const [vehicleTypeList, setVehicleTypeList] = useState([]);
  const [ulbWardList, setUlbWardList] = useState([]);
  const [reportTo, setReportTo] = useState([]);
  const [errors, setErrors] = useState({});
  const [isFrozen, setIsFrozen] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [signatureFiles, setSignatureFiles] = useState([]);
  const [selectedWards, setSelectedWards] = useState([]);

  const [formData, setFormData] = useState({
    vehicleTypeId: "",
    vehicleNo: "",
    wardIds: [],
  });

  const vehicleTypeOptions = vehicleTypeList.map((role) => ({
    value: role.id,
    label: role.vehicleType,
  }));

  const fetchWardList = async () => {
    try {
      const res = await axios.get(getWardListApi, {
        headers: { Authorization: `Bearer ${token}` },
        params: { all: "all" },
      });
      if (res.data.status) setUlbWardList(res.data.data);
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  const fetchVehicleWardMap = async () => {
    try {
      const res = await axios.post(
        vehicleWardMappedApi,
        { vehicleId: item?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.status) {
        const wardIds = res.data.data.map((val) => parseInt(val.id));
        setSelectedWards(wardIds);
        setFormData((prev) => ({ ...prev, wardIds }));
      }
    } catch (error) {
      console.error("Error fetching item wards:", error);
    }
  };

  const fetchDetails = async () => {
    try {
      const res = await axios.post(vehicleDtlApi, { id: item?.id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.status) {
        const data = res.data.data;
        setFormData({
          id:data?.id,
          gpsId:data?.gpsId,
          vehicleNo: data.vehicleNo || "",
          vehicleTypeId: data.vehicleTypeId || "",
          wardIds: [],
        });
      }
    } catch (error) {
      console.error("Error fetching Item details:", error);
    }
  };

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const roleRes = await axios.post(vehicleTypeListApi,
        { all: "all" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setVehicleTypeList(roleRes.data.data);

      await fetchWardList();

      if (item?.id) {
        await fetchDetails();
        await fetchVehicleWardMap();
      }
    } catch (error) {
      console.error("Error during initial data fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchInitialData();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors && errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleWardChange = (e) => {
    const value = parseInt(e.target.value);
    const updated = e.target.checked
      ? [...selectedWards, value]
      : selectedWards.filter((v) => v !== value);

    setSelectedWards(updated);
    setFormData((prev) => ({ ...prev, wardIds: updated }));
  };

  const selectAllWard = (e) => {
    const isChecked = e.target.checked;
    if (!isChecked) {
      setSelectedWards([]);
    } else {
      const allWardIds = ulbWardList.map((item) => parseInt(item?.id));
      setSelectedWards(allWardIds);
    }
  };

  const handleFormSubmit = async () => {
    const form = new FormData();

    Object.keys(formData).forEach((key) => {
      if (
        key !== "wardIds" &&
        formData[key] !== null &&
        formData[key] !== undefined
      ) {
        form.append(key, formData[key]);
      }
    });

    selectedWards.forEach((id, index) => {
      form.append(`wardIds[${index}]`, id);
    });

    if (imageFiles[0]?.file) {
      form.append("imgDoc", imageFiles[0].file);
    }
    // if(item?.id){
    //   form.append("id", item?.id);
    // }
    setIsFrozen(true);
    try {
      let url = item?.id ? vehicleEditApi : vehicleAddApi;
      const res = await axios.post(url, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.status === true) {
        toast.success(res.data.message, { position: "top-right" });
        onClose();
        onSuccess();
      } else {
        setErrors(res.data.errors || {});
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsFrozen(false);
    }
  };
  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-75 p-4">
      {isLoading ? (
        <Spinner />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={modalVariants}
          transition={{ duration: 0.5 }}
          className="flex flex-col bg-white shadow-lg p-6 rounded-lg w-full max-w-6xl max-h-[80vh]"
        >
          <div className="flex flex-shrink-0 justify-between items-center mb-4">
            <h2 className="font-bold text-lg">
              {item?.id ? "Update" : "Add"} Vehicle
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="relative flex-grow pr-2 overflow-y-auto">
            <div
              className={`${isFrozen ? "pointer-events-none filter blur-sm" : ""
                } w-full space-y-4`}
            >
              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <InputField
                  label="Vehicle No"
                  name="vehicleNo"
                  required={true}
                  value={formData.vehicleNo}
                  onChange={handleInputChange}
                  error={errors?.vehicleNo}
                />

                <div>
                  <label className="block font-semibold text-gray-700 text-sm">
                    Vehicle Type <span className='text-red-500'>*</span>
                  </label>
                  <Select
                    name="vehicleTypeId"
                    required
                    value={vehicleTypeOptions.find(
                      (opt) => opt.value == formData.vehicleTypeId
                    )}
                    onChange={(selected)=>setFormData((prev)=>({...prev,vehicleTypeId:selected.value}))}
                    options={vehicleTypeOptions}
                    placeholder="Select Vehicle Type"
                    isClearable
                  />
                  {errors?.vehicleTypeId && (
                    <span className="text-red-500">{errors?.vehicleTypeId}</span>
                  )}
                </div>
                <InputField
                  label="GPS Id"
                  name="gpsId"
                  value={formData.gpsId}
                  onChange={handleInputChange}
                  error={errors?.gpsId}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-700">
                  Select Ward <span className='text-red-500'>*</span> <input type="checkbox" onChange={selectAllWard} />
                </label>
                {errors?.wardIds && (
                  <span className="text-red-500">{errors?.wardIds}</span>
                )}
                <div className="gap-2 grid grid-cols-4 p-2 border border-gray-200 rounded">
                  {ulbWardList.map((ward) => (
                    <label
                      key={ward.id}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        value={ward.id}
                        checked={selectedWards.includes(ward.id)}
                        onChange={handleWardChange}
                      />
                      <span>{ward.wardNo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block font-semibold text-gray-700 text-sm">
                    Vehicle Image
                  </label>
                  <FileUpload
                    name="imgDoc"
                    files={imageFiles}
                    setFiles={setImageFiles}
                    allowMultiple={false}
                    acceptedFileTypes={["image/png", "image/jpeg"]}
                  />
                  {errors?.imgDoc && (
                    <span className="text-red-500">{errors?.imgDoc}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  className={`bg-blue-600 text-white px-6 py-2 rounded-md ${isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700 transition"
                    }`}
                  onClick={handleFormSubmit}
                  disabled={isLoading}
                >
                  {item?.id ? "Update" : "Add"} Vehicle
                </button>
              </div>
            </div>
            {isFrozen && (
              <div className="z-10 absolute inset-0 flex justify-center items-center bg-white/40 backdrop-blur-sm">
                <div className="font-semibold text-gray-800 text-lg">
                  Processing...
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default VehicleAddEditModal
