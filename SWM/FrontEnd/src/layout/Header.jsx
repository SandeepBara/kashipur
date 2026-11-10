import { format } from "date-fns";
import { useEffect, useState } from "react";
import { FaHome, FaInfoCircle, FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { FaUser } from "react-icons/fa6";

const Header = ({ ulbData }) => {
  const [currentDateTime, setCurrentDateTime] = useState(format(new Date(), "eeee, HH:mm:ss"));
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(format(new Date(), "eeee, HH:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      // If scroll is more than 10px, trigger the glass effect
      
      let scroll = true;
      if(window.scrollY < 1){
        scroll =false;
      }
      setIsScrolled(scroll);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-[1000] w-full transition-all duration-500 ease-in-out ${
      isScrolled 
        ? "bg-white/70 backdrop-blur-md shadow-lg py-1" 
        : "bg-header py-2 shadow-none"
    }`}>
      
      {/* ✅ TOP BAR (Desktop Only) */}
      {/* We use max-h to smoothly slide it out of view */}
      <div className={`hidden md:block border-b border-black/5 transition-all duration-500 overflow-hidden ${
        isScrolled ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
      }`}>
        <div className="flex justify-end items-center px-6 py-2 text-sm">
          {/* <a href="/login" className="hover:text-accent font-semibold transition-colors">Login</a> */}
          <div className="flex items-center space-x-4">
            <span className="bg-black/5 px-3 py-1 rounded-full text-xs font-mono">
              {currentDateTime}
            </span>
          </div>
        </div>
      </div>

      {/* ✅ MAIN HEADER */}
      <div className="px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 md:space-x-5 py-1">
            <a href="/" className="shrink-0">
              <img
                src={ulbData?.logoImg}
                alt="Logo"
                className={`transition-all duration-500 shadow-sm rounded-full border-2 border-white ${
                  isScrolled ? "h-10 w-10" : "h-14 w-14 md:h-20 md:w-20"
                }`}
              />
            </a>
            <div className="flex flex-col">
              <h1 className={`font-bold transition-all duration-500 leading-tight ${
                isScrolled ? "text-base md:text-xl text-gray-800" : "text-lg md:text-3xl"
              }`}>
                {ulbData?.ulbName}
              </h1>
              <div className={`transition-all duration-500 overflow-hidden ${
                isScrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
              }`}>
                <p className="text-[10px] md:text-sm text-gray-600 font-medium">
                  {ulbData?.hindiUlbName}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:block">
            <ul className={`flex space-x-8 font-bold items-center transition-colors duration-500 ${
              isScrolled ? "text-gray-800" : "text-inherit"
            }`}>
              <li className="flex items-center hover:text-red-500 cursor-pointer transition-colors">
                <FaHome size={18} className="mr-2" /> <a href="/" className="">Home</a> 
              </li>
              <li className="flex items-center hover:text-red-500 cursor-pointer transition-colors">
                <FaInfoCircle size={18} className="mr-2" /> <a href="/about-swm" className="">About SWM</a>
              </li>
              <li className="flex items-center hover:text-red-500 cursor-pointer transition-colors">
                <FaUser size={18} className="mr-2" /> <a href="/tc-list" className="">Know Your Tc</a> 
              </li>
              <li className="flex items-center hover:text-red-500 cursor-pointer transition-colors">
                <FaUserCircle size={18} className="mr-2" /> <a href="/login" className="">Login</a>                
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-black/5 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* ✅ MOBILE MENU DRAWER */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-2xl transition-all duration-300 ease-in-out overflow-hidden ${
        isMenuOpen ? "max-h-[350px] border-b shadow-2xl" : "max-h-0"
      }`}>
        <div className="flex flex-col p-6 space-y-5 font-bold text-gray-800">
          <a href="/" className="flex items-center py-2 border-b border-gray-50"><FaHome className="mr-4 text-red-500"/> Home</a>
          <a href="#" className="flex items-center py-2 border-b border-gray-50"><FaInfoCircle className="mr-4 text-red-500"/> Informasi Sampah</a>
          <a href="/login" className="flex items-center py-2"><FaUserCircle className="mr-4 text-red-500"/> Login</a>
        </div>
      </div>
    </header>
  );
};

export default Header;