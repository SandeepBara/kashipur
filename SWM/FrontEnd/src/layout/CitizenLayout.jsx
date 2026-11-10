import { useEffect, useRef, useState } from "react";
import { citizenProfileApi, heartBeatApi, UlbApi } from "../api/endpoints";
import axios from "axios";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import CircularProgressAvatar from "../assets/images/CircularProgressAvatar";
import CitizenSidebar from "./CitizenSidebar";
import { logoutThunk, setCitizenUser } from "../store/slices/citizenAuthSlice";
import { useDispatch, useSelector } from "react-redux";
import defaultAvatar from "../assets/images/default-avatar.jpg";
import { clearAuth, getUserDetails } from "../utils/auth";
import toast from "react-hot-toast";
import EditProfileModal from "../components/citizen/settings/EditProfileModal";

export default function CitizenLayout({ children }) {
  const [ulbData, setUlbData] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.citizenAuth.token);
  const userDetails = useSelector((state) => state.citizenAuth.userDetails);
  const [userInfo,setUserInfo] = useState({});
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const closeModal = () => setIsModelOpen(false);
  const openModal = () => setIsModelOpen(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!token) {
      navigate("/citizen/auth", { replace: true });
    }

    const testHeartBeat = async () => {
      try {
        const { data } = await axios.post(
          heartBeatApi,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!data?.status || !data?.authenticated) {
          clearAuth();
          navigate("/citizen/auth", { replace: true });
        }
      } catch (err) {
        console.error("Error during heartbeat:", err);
      }
    };

    testHeartBeat();
    intervalRef.current = setInterval(testHeartBeat, 300000);
    return () => clearInterval(intervalRef.current);
  }, [token, navigate]);

  useEffect(()=>{
    if (token) {
      fetchUserInfo();
    }
  },[token]);
  
  useEffect(() => {
    const fetchUlbDtl = async () => {
      try {
        const res = await axios.post(UlbApi.replace("{id}", userInfo?.UlbId || 1), {});
        const ulb = res?.data?.data;
        if (ulb) {
          setUlbData(ulb);
        }
      } catch (err) {
        setUlbData({ ulb_name: "ULB Info" });
      }
    };

    fetchUlbDtl();
  }, []);

  const fetchUserInfo = async () => {
      try {
        const res = await axios.post(
          citizenProfileApi,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res?.data?.data) {
          setUserInfo(res.data.data);
        }
      } catch (err) {
        console.error("User info fetch error:", err);
      }
    };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try{
      const resultAction = await dispatch(
        logoutThunk({ token, navigateUrl: "/citizen/auth" })
      );

      if (logoutThunk.fulfilled.match(resultAction)) {
        const navigateUrl = resultAction.payload.navigateUrl;
        if (navigateUrl) {
          navigate(navigateUrl); // ✅ redirect to /citizen/auth
          toast.success("User Logout Successfully!", {
            position: "top-right",
          })
        }
      } else {
        console.error("Logout failed:", resultAction.payload);
      }
    }catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out", {
        position: "top-right",
      });
    }finally {
      setIsLoggingOut(false); // 👈 hide overlay
    }
  };

  const handleViewDetails = () => {
    navigate("/user/profile");
  };

  const updateProfile= async()=>{
    try{
      const res = await axios.post(citizenProfileApi, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if(res.data.status){
        const userDetails  = res?.data?.data;
        dispatch(setCitizenUser({ userDetails }));
      }
    }catch(error){
      console.log("error",error);
    }
  }

  const items = [
    {
      key: "Edit Profile",
      label: "Edit Profile",
      action: openModal,
    },
    {
      key: "Logout",
      label: "Logout",
      action: handleLogout,
    },
  ];

  const menuItems = [
    { label: "Dashboard", path: "/citizen" },
    { label: "My Application", path: "/citizen/application" },
    {
      label: "Property",
      badge: "Pro",
      children: [
        {
          label: "Saf",
          badge: "Pro",
          children: [
            {
              label: "Apply Saf",
              path: "/citizen/saf/apply-saf",
            },
          ],
        },
        {
          label: "Holding",
          badge: "Pro",
          children: [
            {
              label: "Search",
              path: "/citizen/holding/search",
            },
          ],
        },
      ],
    },
    {
      label: "Water",
      badge: 3,
      children: [
        {
          label: "Pay Water Tax",
          path: "/citizen/water/search",
        },
        {
          label: "Apply Water Connection",
          path: "/citizen/water/apply-connection",
        },
      ],
    },
    {
      label: "Trade",
      path: "/trade",
      children: [
        { label: "Apply License", path: "/citizen/trade/apply-license" },
        {
          label: "Search",
          path: "/citizen/trade/search",
        },
      ],
    },
    {
      label: "Solid Waste",
      children: [
        { label: "Apply Waste", path: "/citizen/holding/apply-saf3" },
        { label: "Pay Tax", path: "/citizen/holding/assessment3" },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Top Navbar - Fixed */}
      <nav className="z-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-b w-full">
        <div className="px-3 lg:px-5 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <a href="/" className="flex items-center ms-2">
                <img
                  src={ulbData?.logoImg}
                  alt={ulbData?.shortName}
                  className="me-3 h-16"
                />
                <span className="font-semibold dark:text-white text-xl sm:text-2xl whitespace-nowrap">
                  <div>
                    <h1 className="font-bold text-xl md:text-3xl">
                      {ulbData?.ulbName}
                    </h1>
                    <p className="text-sm md:text-lg">
                      {ulbData?.hindiUlbName}
                    </p>
                  </div>
                </span>
              </a>
            </div>
            <div className="flex items-center">
              <Dropdown>
                <DropdownTrigger>
                  <div className="relative shadow rounded-full w-14 h-14 overflow-hidden cursor-pointer">
                    <CircularProgressAvatar
                      progress={userInfo?.profileCompletion}
                      imageUrl={userInfo?.userImg ||defaultAvatar}
                      fallbackText="Citizen"
                      hoverText={`Progress: ${userInfo?.profileCompletion}%`}
                    />
                  </div>
                </DropdownTrigger>
                <DropdownMenu aria-label="Profile Actions">
                  {items.map((item) => (
                    <DropdownItem
                      key={item.key}
                      color={item.key === "Logout" ? "danger" : "default"}
                      className={item.key === "Logout" ? "text-danger" : ""}
                      onClick={item.action}
                    >
                      {item.label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar + Main Layout (below fixed navbar) */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <aside
          id="logo-sidebar"
          className="bg-white dark:bg-gray-800 px-3 py-4 border-gray-200 dark:border-gray-700 border-r w-64 h-full overflow-y-auto scrollbar-hide"
          aria-label="Sidebar"
        >
          <CitizenSidebar menuItems={menuItems} />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto scrollbar-hide">
          {children}
        </main>
      </div>

      {isModelOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white shadow-md p-4 sm:p-6 border border-gray-200 rounded-lg max-w-full sm:max-w-sm h-fit text-black">
            <EditProfileModal
              onSuccess={updateProfile}
              onClose={closeModal}
              user={userInfo}

            />
          </div>
        </div>
      )}
      {/* 🔒 Fullscreen Blocking Loader Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg font-semibold">Logging out...</p>
          </div>
        </div>
      )}
    </div>
  );
}
