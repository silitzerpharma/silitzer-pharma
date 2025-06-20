import { Outlet } from "react-router-dom";
import EmployeeNavbar from "../components/employee/EmployeeNavbar";
import { useState, useEffect } from "react";

const EmployeeLayout = () => {
  const [isActive, setIsActive] = useState(false);
  const [locationError, setLocationError] = useState(false); // ✅ NEW STATE

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("http://localhost:3000/employee/fieldactive", {
          method: "POST",
          credentials: "include",
        });
        const data = await res.json();
        if (data.isActive) {
          setIsActive(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkLogin();
  }, []);

  return (
    <div className="min-h-screen">
      <EmployeeNavbar
        isActive={isActive}
        setIsActive={setIsActive}
        locationError={locationError} // ✅ Pass to navbar
      />

      <main className="p-4">
        <Outlet
          context={{
            isActive,
            setIsActive,
            locationError,
            setLocationError, // ✅ Make available to children
          }}
        />
      </main>
    </div>
  );
};

export default EmployeeLayout;
