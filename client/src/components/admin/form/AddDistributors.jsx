import './style/adddistributors.scss'
import React, { useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddDistributors = ({handleAddNew , refreshDistributorsList}) => {
  const [name, setName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [drugLicenseNumber, setDrugLicenseNumber] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault();
    const distributorDetails = {
      name,
      gstNumber,
      address,
      email,
      phone,
      username,
      password,
      drugLicenseNumber
    };
    
        try {
      const response = await fetch(`${BASE_URL}/admin/savedistributor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ distributorDetails }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('distributorDetails add successful!...');
        refreshDistributorsList();
        handleAddNew();
    
      } else {
        alert(data.msg || 'failed to add');
      }
    } catch (error) {
      console.error('Error during fetch:', error);
      alert('Network error or server not responding.');
    } finally {
      
    }
  

  };

  return (
    <div className="distributor-form-container">
      <span className="title">Add Distributor <hr /></span>
      <form className="distributor-form" onSubmit={handleSubmit}>
     
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required />
        </div>

           <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
       
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>


        <div className="form-group">
          <label>Drug License Number</label>
          <input
            type="text"
            value={drugLicenseNumber}
            onChange={(e) => setDrugLicenseNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>GST Number</label>
          <input
            type="text"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>


        <button type="submit">Add Distributor</button>
      </form>
    </div>
  )
}

export default AddDistributors;
