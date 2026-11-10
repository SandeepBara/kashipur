import React, { useEffect, useState } from 'react';
import Layout from "../layout/Layout";
import { FaPhoneAlt, FaMapMarkerAlt, FaUserTie, FaSearch } from "react-icons/fa";
import axios from 'axios';
import { tcListApi } from '../api/endpoints';
import { Spinner } from '@nextui-org/react';

const TcInfo = () => {
  const [tcList, setTcList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTc = async () => {
      try {
        setLoading(true);
        const response = await axios.post(tcListApi);
        if (response?.data?.status) {
          setTcList(response?.data?.data);
        }
      } catch (error) {
        console.error("Error fetching TC list:", error);
      } finally {
        setLoading(false);
      }
    };
    getTc();
  }, []); // ✅ Added empty dependency array to prevent infinite loops

  return (
    <Layout title="Tax Collector Information - Municipal Services">
      <div className="bg-[#f8f9fa] min-h-screen py-10 px-4 md:px-12">
        
        {/* Header Section */}
        <div className="max-w-7xl mx-auto mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
            Tax Collector Directory
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find and contact the assigned Tax Collector for your ward to assist with property tax and municipal queries.
          </p>
          <div className="h-1 w-24 bg-red-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Status Handling */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="lg" color="danger" label="Fetching TC Directory..." />
            </div>
          ) : tcList?.length > 0 ? (
            <div className={`flex flex-wrap gap-8 ${tcList.length <= 2 ? 'justify-center' : 'justify-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}`}>
                {tcList.map((tc) => (
                    <div 
                    key={tc.id} 
                    className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-gray-100 w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.33%-1.5rem)] xl:w-[calc(25%-1.5rem)] max-w-sm"
                    >
                    {/* ... rest of your card code (Profile Image Section & Information Section) ... */}
                    
                    <div className="relative h-48 bg-gradient-to-r from-gray-800 to-gray-700 flex items-center justify-center overflow-hidden">
                        <img 
                        src={tc?.userImg || 'https://via.placeholder.com/150'} 
                        alt={tc?.name} 
                        className="w-32 h-32 rounded-full border-4 border-white/30 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute bottom-0 w-full bg-black/40 backdrop-blur-sm py-1 text-center">
                        <span className="text-white text-[10px] font-medium uppercase tracking-widest flex items-center justify-center">
                            <FaUserTie className="mr-2" /> {tc?.roleName || 'Tax Collector'}
                        </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-red-600 transition-colors">
                        {tc?.name}
                        </h3>
                        
                        <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center mr-3">
                            <FaPhoneAlt className="text-red-600 text-sm" />
                            </div>
                            <span className="font-medium text-sm">{tc?.phoneNo || 'N/A'}</span>
                        </div>

                        <div className="flex items-start text-gray-600">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 mt-1">
                            <FaMapMarkerAlt className="text-blue-600 text-sm" />
                            </div>
                            <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Assigned Wards</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {tc?.wardMaps?.length > 0 ? (
                                tc.wardMaps.map((ward, idx) => (
                                    <span 
                                    key={idx} 
                                    className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200"
                                    >
                                    Ward {ward?.wardNo}
                                    </span>
                                ))
                                ) : (
                                <span className="text-[10px] italic text-gray-400">No Wards Assigned</span>
                                )}
                            </div>
                            </div>
                        </div>
                        </div>

                        <a 
                        href={`tel:${tc?.phoneNo}`}
                        className="block text-center w-full mt-6 bg-gray-900 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 transition-all active:scale-95"
                        >
                        Call Collector
                        </a>
                    </div>
                    </div>
                ))}
                </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">No Tax Collectors found for this region.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TcInfo;