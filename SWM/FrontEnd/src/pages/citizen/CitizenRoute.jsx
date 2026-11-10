import { Suspense, useEffect } from "react";
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import CitizenDashboard from "./CitizenDashboard";
import CitizenLayout from "../../layout/CitizenLayout";
import PropertySearch from "../../components/citizen/holding/PropertySearch";
import MyApplication from "./MyApplication";
import { useDispatch, useSelector } from "react-redux";
import CitizenDetails from "../../components/citizen/holding/CitizenDetails";
import CitizenNewAssesment from "../../components/citizen/holding/CitizenNewAssesment";
import CitizenPreview from "../../components/citizen/holding/CitizenPreview";
import CitizenMutation from "../../components/citizen/holding/CitizenMutation";
import CitizenReAssesment from "../../components/citizen/holding/CitizenReAssesment";
import RenewLicense from "../../components/citizen/trade/RenewLicense";
import ApplyLicense from "../../components/citizen/trade/ApplyLicense";
import SurrenderLicense from "../../components/citizen/trade/surrender/SurrenderLicense";
import { logoutThunk } from "../../store/slices/citizenAuthSlice";
import ApplyConnection from "../../components/citizen/water/ApplyConnection";
import PreviewLicense from "../../components/citizen/trade/PreviewLicense";
import SearchTrade from "../../components/citizen/trade/SearchTrade";
import TradeSearchDetails from "../../components/citizen/trade/TradeSearchDetails";
import PreviewPage from "../../components/citizen/water/PreviewPage";
import ApplicationDetails from "../../components/citizen/water/ApplicationDetails";
import EditApplication from "../../components/citizen/water/EditApplication";
import { waterAppDetailApi } from "../../api/endpoints";
import CitizenSafEdit from "../../components/citizen/saf/CitizenSafEdit";

// import Preview from "./component/Preview";

export default function CitizenRoute() {
  const token = useSelector((state) => state.citizenAuth.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const expiry = JSON.parse(localStorage.getItem("expiry"));
    const timeout = expiry - Date.now();

    const timer = setTimeout(() => {
      dispatch(logoutThunk(token));
      navigate("/citizen/auth");
    }, timeout);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Suspense
        fallback={
          <div className="p-6 text-center">
            <span className="inline-block border-4 border-t-transparent border-blue-600 rounded-full w-8 h-8 animate-spin loader"></span>
            <p className="mt-2">Loading...</p>
          </div>
        }
      >
        <CitizenLayout>
          <Routes>
            <Route path="/" element={<CitizenDashboard />} />
            <Route path="/application" element={<MyApplication />} />

            {/* SAF Routes /saf/edit/:safId */}
            <Route path="/saf" element={<Outlet />}>
              <Route path="apply-saf" element={<CitizenNewAssesment />} />
              <Route path="edit/:safId" element={<CitizenSafEdit />} />
              <Route path="details/:safId" element={<CitizenDetails />} />
              <Route path="preview" element={<CitizenPreview />} />
            </Route>

            {/* Property Routes /holding/details/:propId */}
            <Route path="/holding" element={<Outlet />}>
              <Route path="search" element={<PropertySearch />} />
              <Route path="details/:propId" element={<CitizenDetails />} />
              <Route path="mutation/:propId" element={<CitizenMutation />} />
              <Route
                path="reassessment/:propId"
                element={<CitizenReAssesment />}
              />
            </Route>

            {/* Trade License Routes */}
            <Route path="/trade" element={<Outlet />}>
              <Route path="apply-license" element={<ApplyLicense />} />
              <Route path="search" element={<SearchTrade />} />
              <Route path=":licenseType" element={<ApplyLicense />} />
              <Route
                path=":licenseType/edit/:id/:applicationType"
                element={<ApplyLicense />}
              />
              <Route
                path="apply-license/preview"
                element={<PreviewLicense />}
              />
              <Route
                path=":licenseType/:id/:applicationType"
                element={<RenewLicense />}
              />
              <Route path="surrender-license" element={<SurrenderLicense />} />
              <Route
                path="search/details/:id"
                element={<TradeSearchDetails />}
              />
            </Route>

            {/* Water Connection Routes */}
            <Route path="/water" element={<Outlet />}>
              <Route path="apply-connection" element={<ApplyConnection />} />
              <Route path="apply/preview" element={<PreviewPage />} />
              <Route path="details/:id" element={<ApplicationDetails />} />
              <Route
                path="details/:id/edit"
                element={<EditApplication fetchApi={waterAppDetailApi} />}
              />
            </Route>
          </Routes>
        </CitizenLayout>
      </Suspense>
    </>
  );
}
