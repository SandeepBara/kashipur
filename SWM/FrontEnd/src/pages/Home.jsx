import HomeCard from "../components/specific/HomeCard";
import Layout from "../layout/Layout";
import { FaHome, FaTint, FaIdCard, FaTrashAlt } from "react-icons/fa";
import HomeSlider from "../components/specific/HomeSlider";
import NoticeList from "../components/specific/NoticeList";
import OfficerList from "../components/specific/OfficerList";

const Home = () => {

  const cardData = [
    {
      title: "Property Tax",
      icon: FaHome,
      description: "Pay and manage your property tax online with ease.",
      buttons: [
        {
          label: "Pay Now",
          link: "/property-tax",
          className: "bg-primary text-white",
        },
        {
          label: "Re-assessment",
          link: "/reassessment",
          className: "bg-secondary text-white",
        },
      ],
    },
    {
      title: "Water Tax",
      icon: FaTint,
      description: "Pay water user charges and apply new connection.",
      buttons: [
        { label: "Pay Charges", link: "/water-tax" },
        { label: "Apply Connection", link: "/apply-water" },
      ],
    },
    {
      title: "Trade License",
      icon: FaIdCard,
      description:
        "Apply or renew your trade license quickly and track application.",
      buttons: [
        {
          label: "Apply",
          link: "/trade-license",
          className: "bg-accent text-black",
        },
        {
          label: "Renew",
          link: "/trade-renew",
          className: "bg-secondary text-white",
        },
      ],
    },
    {
      title: "Solid Waste",
      icon: FaTrashAlt,
      description: "Track waste collection services and complaints.",
      buttons: [
        {
          label: "Track Collection",
          link: "/waste-collection",
          className: "bg-primary text-white",
        },
      ],
    },
  ];

  return (
    <Layout title="Muncipal Services Ranchi - Home">
      <HomeSlider />
      {/* CARD CONTAINER */}
      <div className="py-10 px-4 md:px-8 bg-[#f8f9fa]">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          Important Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cardData.map((card, index) => (
            <HomeCard key={index} {...card} />
          ))}
        </div>
      </div>
      <div className="py-4 px-4 md:px-8 bg-[#f8f9fa]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">         
            <OfficerList />
            <NoticeList />
        </div>
      </div>
    </Layout>
  );
};

export default Home;
