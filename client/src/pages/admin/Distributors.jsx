import React, { useState, useEffect } from "react";
import DistributorsTable from "../../components/admin/tables/DistributorsTable";
import AddDistributors from "../../components/admin/form/AddDistributors";
import ShowMessage from "../../components/common/ShowMessage";
import "./style/Pages.scss";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Distributors = () => {
  const [isAddingDistributors, setIsAddingDistributors] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [msgData, setMsgData] = useState({
    show: false,
    status: null,
    message: '',
    warnings: [],
  });

  const [totalDistributors, setTotalDistributors] = useState(0);

  const refreshDistributorsList = () => setRefreshFlag((prev) => !prev);

  const handleAddNew = () => {
    setIsAddingDistributors(!isAddingDistributors);
  };

  // 🔁 Fetch total distributor count
  useEffect(() => {
    const fetchDistributorCount = async () => {
      try {
        const response = await fetch(`${BASE_URL}/admin/distributors/data`,{
            method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setTotalDistributors(data.totalCount || 0); // adjust key if API response is different
      } catch (error) {
        console.error("Failed to fetch distributor count", error);
      }
    };

    fetchDistributorCount();
  }, [refreshFlag]); // re-fetch when refreshFlag changes

  return (
    <div className="page">
      <div className="page-title">Distributors</div>
      <div className="page-nav">
        <button className="nav-btn" onClick={handleAddNew}>
          {isAddingDistributors ? "View Distributors" : "Add New"}
        </button>
        <div>
          Distributors Total : {totalDistributors}
        </div>
      </div>

      {isAddingDistributors ? (
        <AddDistributors
          handleAddNew={handleAddNew}
          refreshDistributorsList={refreshDistributorsList}
          setMsgData={setMsgData}
        />
      ) : (
        <DistributorsTable
          refreshFlag={refreshFlag}
          refreshDistributorsList={refreshDistributorsList}
        />
      )}

      {msgData.show && (
        <ShowMessage
          status={msgData.status}
          message={msgData.message}
          warnings={msgData.warnings}
          onClose={() => setMsgData({ ...msgData, show: false })}
        />
      )}
    </div>
  );
};

export default Distributors;
