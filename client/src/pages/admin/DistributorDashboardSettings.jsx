import { useState ,useEffect } from 'react';
import './style/DistributorDashboardsettings.scss';

import OfferSliderList from '../../components/admin/list/OfferSliderList';
import ProductSliderList from '../../components/admin/list/ProductSliderList';

const DistributorDashboardSettings = () => {
  const [activeTab, setActiveTab] = useState("offer");


  return (
    <div className='DistributorDashboardsettings-container'>
      <nav className='Distributor-Das-set-nav'>
        <div className={activeTab === "offer" ? "nav-item nav-active" : "nav-item"} onClick={() => setActiveTab("offer")}>Offer Setting</div>
        <div className={activeTab === "slider" ? "nav-item nav-active" : "nav-item"} onClick={() => setActiveTab("slider")}>Slider Setting</div>
        <div className={activeTab === "categories" ? "nav-item nav-active" : "nav-item"} onClick={() => setActiveTab("categories")}>Categories Setting</div>
      </nav>

      <div className="tab-content">
        {activeTab === "offer" && (
              <OfferSliderList/>
        )}

        {activeTab === "slider" && (
          <ProductSliderList/>
        )}

        {activeTab === "categories" && (
          <div className="tab-pane">This is the Categories Setting section.</div>
        )}
      </div>
    </div>
  );
};

export default DistributorDashboardSettings;
