import React, { useEffect, useState } from 'react'
import { getToken } from '../../../utils/auth';
import axios from 'axios';
import { vehicleTypeListApi, vehicleTypeLockUnlockApi } from '../../../api/endpoints';
import { Button, Spinner } from '@nextui-org/react';
import { FaEdit, FaLock, FaUnlock } from 'react-icons/fa';
import PermissionWrapper from '../../../components/common/PermissionWrapper';
import CommonTable from '../../../components/common/CommonTable';
import VehicleTypeAddEditModal from '../components/VehicleTypeAddEditModal';
import { useLoading } from '../../../contexts/LoadingContext';

function VehicleTypeList() {
    const [dataList, setDataList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFrozen, setIsFrozen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [totalPage, setTotalPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItem, setTotalItem] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const { setIsLoadingGable } = useLoading();

    const token = getToken();

    useEffect(() => {
        if (token) fetchData();
    }, [page, itemsPerPage]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.post(
                vehicleTypeListApi,
                {
                    page,
                    perPage: itemsPerPage,
                    key: search.trim() || null,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const list = res.data.data || {};
            setDataList(list.data || []);
            setTotalPage(list.lastPage || 1);
            setTotalItem(list.total || 0);
        } catch (err) {
            console.error("Error fetching floor type list:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllData = async () => {
        try {
            const res = await axios.get(
                vehicleTypeListApi,
                {
                    page: 1,
                    perPage: totalItem,
                    key: search.trim() || null,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return res.data.data?.data || [];
        } catch (err) {
            console.error("Error fetching all occupancy types:", err);
            return [];
        }
    };

    const handleSearch = () => {
        setPage(1);
        fetchData();
    };

    const openAddEditModal = (item) => {
        setSelectedItem(item);
        setIsAddEditModalOpen(true);
    };

    const closeAddEditModal = () => {
        setSelectedItem(null);
        setIsAddEditModalOpen(false);
    };

    const itemLockUnlock =async (item)=>{
        setIsLoadingGable(true);
        try {
            const res = await axios.post(
                vehicleTypeLockUnlockApi,
                {
                    id:item.id,
                    lockStatus: !item?.lockStatus,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if(res?.data?.status){
                fetchData();
            }
        } catch (err) {
            console.error("Error fetching floor type list:", err);
        } finally {
            setIsLoadingGable(false);
        }
    }

    const headers = [
        { label: "#", key: "serial" },
        { label: "Vehicle Type", key: "vehicleType" },
        { label: "Total Vehicle", key: "totalActiveVehicle" },
        { label: "Action", key: "action" },
    ];

    const renderRow = (item, index, currentPage, perPage) => (
        <tr key={item.id} className="hover:bg-gray-50">
            <td className="px-3 py-2 border">
                {(currentPage - 1) * perPage + index + 1}
            </td>
            <td className="px-3 py-2 border">{item.vehicleType}</td>
            <td className="px-3 py-2 border">{item.totalActiveVehicle}</td>

            <td className="flex items-center gap-2 px-3 py-2 border">
                {!item?.lockStatus && (
                    <Button
                        size="sm"
                        className="edit"
                        onClick={() => openAddEditModal(item)}
                    >
                        <FaEdit className="mr-1" /> Edit
                    </Button>
                )}
                <Button
                    size="sm"
                    className={`delete text-white ${item.lockStatus ? "bg-green-600" : "bg-red-600"
                        }`}
                    onClick={() => itemLockUnlock(item)}
                >
                    {item.lockStatus ? (
                        <>
                            <FaUnlock className="mr-1" /> Unlock
                        </>
                    ) : (
                        <>
                            <FaLock className="mr-1" /> Lock
                        </>
                    )}
                </Button>
            </td>
        </tr>
    );
    return (
        <>
        {isLoading ? (
            <div className="flex justify-center items-center py-10 w-full">
            <Spinner size="lg" />
            </div>
        ) : (
            <div
            className={`${
                isFrozen ? "pointer-events-none filter blur-sm" : ""
            } w-full space-y-4`}
            >
            <PermissionWrapper>
                <CommonTable
                data={dataList}
                headers={headers}
                renderRow={renderRow}
                title="Vehicle Type List"
                totalPages={totalPage}
                currentPage={page}
                setPageNo={setPage}
                totalItem={totalItem}
                setItemsPerPage={setItemsPerPage}
                itemsPerPage={itemsPerPage}
                search={search}
                setSearch={setSearch}
                onSearch={handleSearch}
                fetchAllData={fetchAllData}
                actionButton={
                    <button
                    className="bg-green-600 px-4 py-1 rounded text-white write"
                    onClick={() => openAddEditModal(null)}
                    >
                    Add New
                    </button>
                }
                />
            </PermissionWrapper>
            </div>
        )}

        {/* Modal */}
        {isAddEditModalOpen && (
            <VehicleTypeAddEditModal
            onClose={closeAddEditModal}
            item={selectedItem}
            onSuccess={fetchData}
            />
        )}
        </>
    )
}

export default VehicleTypeList
