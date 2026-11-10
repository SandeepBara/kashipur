import React, { useEffect, useState } from 'react'
import { getToken } from '../../../utils/auth';
import { driverAddApi, driverDtlApi, driverEditApi } from '../../../api/endpoints';
import { Spinner } from '@nextui-org/react';
import { modalVariants } from "../../../utils/motionVariable";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import FileUpload from "../../../components/common/FileUpload";
import Select from "react-select";
import toast from "react-hot-toast";
import InputField from '../../../components/common/InputField';
import axios from 'axios';

function DriverAddEditModal({ item, onClose, onSuccess }) {
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
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        mobileNo: "",
        licenseNo: "",
        licenseValidUpto: "",
    });

    const fetchDetails = async () => {
        try {
            const res = await axios.post(driverDtlApi, { id: item?.id }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.status) {
                const data = res.data.data;
                setFormData({
                    firstName: data.firstName || "",
                    middleName: data.middleName || "",
                    lastName: data.lastName || "",
                    email: data.email || "",
                    mobileNo: data.mobileNo || "",
                    licenseNo: data.licenseNo || "",
                    licenseValidUpto: data.licenseValidUpto || "",
                });
            }
        } catch (error) {
            console.error("Error fetching Item details:", error);
        }
    };

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            if (item?.id) {
                await fetchDetails();
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

        if (imageFiles[0]?.file) {
            form.append("imgDoc", imageFiles[0].file);
        }
        setIsFrozen(true);
        try {
            let url = item?.id ? driverEditApi : driverAddApi;
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
                            {item?.id ? "Update" : "Add"} Driver
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
                                    label="First Name"
                                    name="firstName"
                                    required={true}
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    error={errors?.firstName}
                                />
                                <InputField
                                    label="Middle Name"
                                    name="middleName"
                                    value={formData.middleName}
                                    onChange={handleInputChange}
                                    error={errors?.middleName}
                                />
                                <InputField
                                    label="Last Name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    error={errors?.lastName}
                                />

                                <InputField
                                    label="Email"
                                    name="email"
                                    type='email'
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    error={errors?.email}
                                />

                                <InputField
                                    label="Contact No"
                                    name="mobileNo"
                                    type='number'
                                    required={true}
                                    minlength={10}
                                    maxlength={10}
                                    value={formData.mobileNo}
                                    onChange={handleInputChange}
                                    error={errors?.mobileNo}
                                />
                                <InputField
                                    label="License No"
                                    name="licenseNo"
                                    required={true}
                                    value={formData.licenseNo}
                                    onChange={handleInputChange}
                                    error={errors?.licenseNo}
                                />
                                <InputField
                                    label="Valid Upto"
                                    name="licenseValidUpto"
                                    type='date'
                                    required={true}
                                    value={formData.licenseValidUpto}
                                    onChange={handleInputChange}
                                    error={errors?.licenseValidUpto}
                                />
                            </div>

                            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <label className="block font-semibold text-gray-700 text-sm">
                                        Driver Image
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
                                    {item?.id ? "Update" : "Add"} Driver
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

export default DriverAddEditModal
