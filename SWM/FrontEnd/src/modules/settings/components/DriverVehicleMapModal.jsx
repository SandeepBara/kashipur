import React, { useEffect, useState } from 'react'
import { getToken } from '../../../utils/auth';
import axios from 'axios';
import { driverListApi, driverVehicleMappedApi, vehicleListApi } from '../../../api/endpoints';
import { Spinner } from '@nextui-org/react';
import { modalVariants } from "../../../utils/motionVariable";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";
import toast from "react-hot-toast";

function DriverVehicleMapModal({ vehicleId, driverId,disableOption, onClose, onSuccess }) {
    const token = getToken();
    const [isLoading, setIsLoading] = useState(true);
    const [vehicleList, setVehicleList] = useState([]);
    const [driverList, setDriverList] = useState([]);
    const [errors, setErrors] = useState({});
    const [isFrozen, setIsFrozen] = useState(false);
    const [imageFiles, setImageFiles] = useState([]);
    const [signatureFiles, setSignatureFiles] = useState([]);
    const [selectedWards, setSelectedWards] = useState([]);
    const [formData, setFormData] = useState({
        vehicleId: vehicleId || "",
        driverId: driverId || "",
    });

    const vehicleOptions = vehicleList.map((item) => ({
        value: item.id,
        label: item.vehicleNo
    }));

    const driverOptions = driverList.map((item) => ({
        value: item.id,
        label: item.driverName,
    }));

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const vehicleResponse = await axios.post(vehicleListApi, 
                { all: "all" },
                {
                    headers: { Authorization: `Bearer ${token}` },
                });
            setVehicleList(vehicleResponse.data.data);

            const driverResponse = await axios.post(driverListApi, 
                { all: "all" },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setDriverList(driverResponse.data.data);
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
        console.log(e.target);
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

    const handleFormSubmit = async () => {
        setIsFrozen(true);
        try {
            const res = await axios.post(driverVehicleMappedApi, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
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
                            Vehicle Driver Map
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
                            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2">
                                <div>
                                    <label className="block font-semibold text-gray-700 text-sm">
                                        Vehicle
                                    </label>
                                    <Select
                                        name="vehicleId"
                                        value={vehicleOptions.find(
                                            (opt) => opt.value === formData.vehicleId
                                        )}
                                        onChange={(selected)=>setFormData((prev)=>({...prev,vehicleId:selected}))}
                                        options={vehicleOptions}
                                        placeholder="Select Vehicle"
                                        isClearable
                                        isDisabled={disableOption=="vehicleId"}
                                    />
                                    {errors?.vehicleId && (
                                        <span className="text-red-500">{errors?.vehicleId}</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-semibold text-gray-700 text-sm">
                                        Driver
                                    </label>
                                    <Select
                                        name="driverId"
                                        value={driverOptions.find(
                                            (opt) => opt.value === formData.driverId
                                        )}
                                        onChange={(selected)=>setFormData((prev)=>({...prev,driverId:selected.value}))}
                                        options={driverOptions}
                                        placeholder="Select Driver"
                                        isClearable
                                        isDisabled={disableOption=="driverId"}
                                    />
                                    {errors?.driverId && (
                                        <span className="text-red-500">{errors?.driverId}</span>
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
                                    Map
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

export default DriverVehicleMapModal
