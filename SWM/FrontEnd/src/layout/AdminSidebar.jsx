import { useEffect, useState } from "react";
import * as FaIcons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as GiCash from "react-icons/gi";
import { hostInfo } from "../utils/common";
import RecursiveMenu from "../components/specific/RecursiveMenu";

const iconLibraries = {
  Fa: FaIcons,
  Fa6: Fa6Icons,
  Gi: GiCash,
};

const getAnyIcon = (iconName) => {
  if (!iconName) return <FaIcons.FaCogs />;
  const prefix = iconName.slice(0, 2);
  const lib = iconLibraries[prefix];
  const IconComponent = lib?.[iconName] || FaIcons.FaCogs;
  return <IconComponent />;
};

const AdminSidebar = ({
  sidebarRef,
  isCollapsed,
  setIsCollapsed,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const [menuItems, setMenuItems] = useState([]);
  const host = hostInfo();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userDetails"));
    if (user?.menuTree) {
      const mappedMenu = mapMenuTreeToMenuItems(user.menuTree);
      setMenuItems(mappedMenu);
    }
  }, []);

  const mapMenuTreeToMenuItems = (menuTree) =>
    menuTree.map((menu) => ({
      title: menu.name,
      icon: getAnyIcon(menu.icon),
      link:
        menu.url && menu.url !== "#"
          ? `${host}/${menu.url.trim().replace(/^\/+/, "")}`
          : undefined,
      subItems: menu.children?.length
        ? mapMenuTreeToMenuItems(menu.children)
        : undefined,
    }));

  return (
    <aside
      ref={sidebarRef}
      className={`
        fixed top-[72px] left-0
        h-[calc(100dvh-72px)]
        overflow-y-auto scrollbar-hide
        bg-slate-950 text-white z-30
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0 w-[min(20rem,calc(100vw-2rem))]" : "-translate-x-full w-[min(20rem,calc(100vw-2rem))]"}
        md:static md:translate-x-0
        ${isCollapsed ? "md:w-[4.5rem]" : "md:w-64"}
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between min-h-14 p-4 border-b border-slate-800">
        {!isCollapsed && (
          <span className="text-lg font-semibold tracking-wide"></span>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:block text-slate-400 hover:text-white"
        >
          {isCollapsed ? (
            <FaIcons.FaChevronRight />
          ) : (
            <FaIcons.FaChevronDown />
          )}
        </button>
      </div>

      {/* Menu */}
      <div className="p-2 mb-10">
        <RecursiveMenu items={menuItems} isCollapsed={isCollapsed} />
      </div>
    </aside>
  );
};

export default AdminSidebar;
