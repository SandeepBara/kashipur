import { Helmet } from "react-helmet";
import Footer from "./Footer";
import Header from "./Header";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { UlbApi } from "../api/endpoints";
import { useEffect, useState } from "react";
import axios from "axios";

const Layout = ({
  children,
  title = "Municipal Services",
  description = "Official portal for Municipal Corporation - Property Tax, Water Charges, Trade License and more services online.",
  keywords = "Municipal Services, Property Tax, Water Charges, Trade License, Jharkhand, Municipal",
  author = "Municipal Corporation",
}) => {
  const [ulbData, setUlbData] = useState(null);
  const ulbId = 1;
  // Fetch ULB data
  useEffect(() => {
    const fetchUlbDtl = async () => {
      // if (!ulbId) return;
      try {
        const res = await axios.post(UlbApi.replace("{id}", ulbId), {});
        const ulb = res?.data?.data;
        if (ulb) {
          setUlbData(ulb);
        }
      } catch (err) {
        setUlbData({ ulb_name: "ULB Info" });
      }
    };

    fetchUlbDtl();
  }, [ulbId]);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <title>{title}</title>
      </Helmet>

      <div className="flex flex-col bg-white min-h-screen text-[#222222]">
        <Header ulbData={ulbData} />
        <main className="page-header">{children}</main>
        <Footer ulbData={ulbData} />
      </div>
    </>
  );
};

export default Layout;
