import React, { useState } from 'react';
import './style/EmployeeRequests.scss';



// Placeholder components — create them separately
import LeaveRequests from '../../components/employee/Requests/LeaveRequests';
import CancelTaskRequests from '../../components/employee/Requests/CancelTaskRequests';

const EmployeeRequests = () => {
  const [activeTab, setActiveTab] = useState('leave');

  return (
    <div className='EmployeeRequests-div'>
      <div className='EmployeeRequests-nav'>
        <div
          className={`employee-nav-link ${activeTab === 'leave' ? 'active' : ''}`}
          onClick={() => setActiveTab('leave')}
        >
          Leave Requests
        </div>
        <div
          className={`employee-nav-link ${activeTab === 'cancel' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancel')}
        >
          Cancel Task Requests
        </div>
      </div>

      <div className='EmployeeRequests-container'>
        {activeTab === 'leave' && <LeaveRequests />}
        {activeTab === 'cancel' && <CancelTaskRequests />}
      </div>
    </div>
  );
};

export default EmployeeRequests;
