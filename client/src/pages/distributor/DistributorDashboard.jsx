import { useState, useRef, useEffect } from 'react';
import './distributordashboard.scss'

import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { IoIosMail } from "react-icons/io";

import AllProductList from '../../components/distributor/AllProductList';
import ProductSlider from '../../components/distributor/slider/ProductSlider';
import OfferSlider from '../../components/distributor/slider/OfferSlider';



const DistributorDashboard = () => {

  const  [dashboardData ,setDashboardData ] = useState({});
  const  [sliders,setSliders] =  useState([]);

  useEffect(() => {
  const fetchDistributorDashboardData = async () => {
    try {
      const response = await fetch("http://localhost:3000/distributor/dashboard/data", {
        method: "GET",
        credentials: "include", // ✅ include cookies (auth/session)
      });

      const data = await response.json();
      setDashboardData(data);
      setSliders(data.sliders);
    } catch (err) {
      console.error("Error fetching distributors:", err);
    }
  };

  fetchDistributorDashboardData();
}, []);


  const openWhatsApp = () => {
    const phoneNumber = '918888418736'; // Replace with actual number
    const message = 'Hello, I want to place an order.'; // Optional
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };


  return (
    <div className="distributor-dashboard">
  
    <div className='main-container'>
   
     <div className='whatsapp-div' onClick={openWhatsApp}>
          <WhatsAppIcon/> ORDER ON WHATSAPP
     </div>

    <section className='slider-section'>
       <OfferSlider offersList={dashboardData.offers} />
     
     {sliders.map((slider) => (
   <ProductSlider  key={slider._id}  productsList={slider.productList} title={slider.title}/>
   ))}

    </section>


     <section className='all-product-list'>
          <AllProductList/>
     </section>

    </div>
   
 <footer className="footer">
      © 2025 <strong>Silitzer-Pharma</strong> 
      <IoIosMail className='footer-icon'/>  
      <a href="mailto:support@silitzerpharma.com">Silitzerpharma@outlook.com</a>
    </footer>
  </div>
  )
}

export default DistributorDashboard