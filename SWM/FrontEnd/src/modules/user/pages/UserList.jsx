import { useParams } from "react-router-dom";
import UserCardList from "../components/UserCardList";
import AdminLayout from "../../../layout/AdminLayout.jsx";
import BreadCrumb from "../../../components/common/BreadCrumb";

const UserList = () => {
    const { userType } = useParams();

  return (
    <AdminLayout>
      <UserCardList userType={userType} />
    </AdminLayout>
  );
};

export default UserList;
