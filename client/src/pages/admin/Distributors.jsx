import React, { useState } from "react";
import DistributorsTable from "../../components/admin/tables/DistributorsTable";
import AddDistributors from "../../components/admin/form/AddDistributors";
import "./style/Pages.scss";

const Distributors = () => {
  const [isAddingDistributors, setIsAddingDistributors] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);


  const refreshDistributorsList = () => setRefreshFlag((prev) => !prev);

  const handleAddNew = () => {
    setIsAddingDistributors(!isAddingDistributors);
  };




  return (
    <div className="page">
        <div className="page-title">Distributors</div>
  <div className="page-nav">
         <button className="nav-btn" onClick={handleAddNew}>
          {isAddingDistributors ? "View Distributors" : "Add New"}
        </button>
        <div>
         Distributors Total : 34
        </div>

      </div>





      {isAddingDistributors ? (
        <AddDistributors
          handleAddNew={handleAddNew}
          refreshDistributorsList={refreshDistributorsList}
        />
      ) : (
        <DistributorsTable
          refreshFlag={refreshFlag} refreshDistributorsList={refreshDistributorsList}
        />
      )}
    </div>
  );
};

export default Distributors;
