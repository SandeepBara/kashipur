import React from 'react';
import Layout from "../layout/Layout";
import { FaRecycle, FaTruck, FaTrashRestore, FaLeaf, FaGlobeAmericas, FaUsers } from "react-icons/fa";

const AboutSWM = () => {
  const features = [
    {
      icon: <FaTruck className="text-blue-600" />,
      title: "Door-to-Door Collection",
      desc: "Daily waste collection from households and commercial establishments using GPS-enabled vehicles."
    },
    {
      icon: <FaRecycle className="text-green-600" />,
      title: "Waste Segregation",
      desc: "Promoting the separation of Dry (Recyclable) and Wet (Biodegradable) waste at the source."
    },
    {
      icon: <FaLeaf className="text-emerald-600" />,
      title: "Composting Units",
      desc: "Converting organic waste into nutrient-rich compost for local parks and agricultural use."
    },
    {
      icon: <FaTrashRestore className="text-orange-600" />,
      title: "Material Recovery",
      desc: "Systematic sorting of non-biodegradable waste to ensure maximum recycling efficiency."
    }
  ];

  return (
    <Layout title="About Waste Management - Municipal Corporation">
      {/* 1. Hero Section */}
      <section className="relative bg-gray-900 text-white py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
            Towards a <span className="text-green-400">Cleaner & Greener</span> City
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Our Solid Waste Management (SWM) system is dedicated to sustainable urban living through 
            innovation, community participation, and efficient resource recovery.
          </p>
        </div>
      </section>

      {/* 2. Our Mission (Mirror Effect Card) */}
      <section className="py-16 px-4 md:px-12 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[#f8f9fa] border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm flex flex-col md:flex-row items-center gap-10">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <FaGlobeAmericas className="text-blue-500 mr-3" /> Our Mission
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                To implement an integrated waste management framework that minimizes landfill dependency 
                and maximizes recycling. We aim to achieve 100% waste segregation at the source 
                to transform our city into a model of environmental sustainability.
              </p>
              <ul className="space-y-3">
                {['Eco-friendly disposal', 'Community awareness', 'Modern technology'].map((item, i) => (
                  <li key={i} className="flex items-center text-sm font-bold text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-50">
                  <p className="text-3xl font-bold text-green-600">95%</p>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Daily Collection</p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-50">
                  <p className="text-3xl font-bold text-blue-600">40+</p>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">SWM Vehicles</p>
               </div>
               <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-50 col-span-2">
                  <p className="text-3xl font-bold text-orange-600">Zero Waste</p>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter">Our Ultimate Goal</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Workflow */}
      <section className="py-16 bg-[#f0f2f5] px-4 md:px-12">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">How We Manage Your Waste</h2>
          <div className="h-1 w-20 bg-green-500 mx-auto mt-4"></div>
        </div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl hover:shadow-xl transition-all group">
              <div className="text-4xl mb-6 transform group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Call to Action */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-gray-900 rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <FaRecycle size={150} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-6">Be a Part of the Change</h2>
            <p className="text-gray-400 mb-8">
                Every piece of waste you segregate helps us move closer to a healthier planet. 
                Start today by separating your wet and dry waste.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-full font-bold transition-all">
                    Register Complaint
                </button>
                <button className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-full font-bold transition-all">
                    View Schedule
                </button>
            </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutSWM;