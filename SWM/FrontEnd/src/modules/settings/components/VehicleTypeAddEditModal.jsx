import React, { useEffect, useState } from 'react'
import { getToken } from '../../../utils/auth';
import axios from 'axios';
import { vehicleTypeAddApi, vehicleTypeDtlApi, vehicleTypeEditApi } from '../../../api/endpoints';
import { Spinner } from '@nextui-org/react';
import { modalVariants } from "../../../utils/motionVariable";
import { motion } from "framer-motion";
import { FaTimes } from 'react-icons/fa';
import InputField from '../../../components/common/InputField';
import toast from 'react-hot-toast';
import { validateForm } from '../../../utils/validation';

function VehicleTypeAddEditModal({ item, onClose, onSuccess }) {
    const token = getToken();
    const [isLoading, setIsLoading] = useState(false);
    const [isFrozen, setIsFrozen] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    const validationRules = {
        vehicleType: {
            required: true,
            regex: /^[A-Za-z0-9\-\,\_\s\(\)\/\.]+$/,
            message: "Vehicle Type must contain only letters and spaces.",
        },
    };


    useEffect(() => {
        if (token && item?.id) {
          fetchInitialData();
        }
    }, [token, item]);

    const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        vehicleTypeDtlApi,   
        {
            id:item?.id
        },    
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response?.data?.status) {
        setFormData({
          ...response?.data?.data,
        });
      }
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFormSubmit = async () => {
    const clientErrors = validateForm(formData, validationRules);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    const payload = {
      ...formData,
      ...(item?.id && { id: item.id }),
    };
    setIsFrozen(true);

    try {
      const url = item?.id ? vehicleTypeEditApi : vehicleTypeAddApi;

      const res = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res?.data?.status) {
        toast.success(res.data.message);
        onClose();
        onSuccess();
      } else {
        setErrors(res.data.errors || {});
      }
    } catch (err) {
      console.error("Submit error", err);
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
              {item?.id ? "Update" : "Add"} Vehicle Type
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
              className={`${
                isFrozen ? "pointer-events-none filter blur-sm" : ""
              } w-full space-y-4`}
            >
              <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <InputField
                  label="Vehicle Type"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  error={errors?.vehicleType}
                />                
                
              </div>

              <div className="flex justify-end pt-4">
                <button
                  className={`bg-blue-600 text-white px-6 py-2 rounded-md ${
                    isLoading
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700 transition"
                  }`}
                  onClick={handleFormSubmit}
                  disabled={isLoading}
                >
                  {item?.id ? "Update" : "Add"} Vehicle Type
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
  )
}

export default VehicleTypeAddEditModal
