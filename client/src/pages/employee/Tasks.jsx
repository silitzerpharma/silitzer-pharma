import React, { useState } from 'react';
import './style/Tasks.scss';

import { useOutletContext } from 'react-router-dom';

import TasksList from '../../components/employee/Task/TasksList';
import AddTask from '../../components/employee/Task/AddTask';
import ScheduledTasks from '../../components/employee/Task/ScheduledTasks';
import PendingTasks from '../../components/employee/Task/PendingTasks';

const Tasks = () => {
  const [activeTab, setActiveTab] = useState('today');
  const { isActive, setIsActive } = useOutletContext();

  return (
    <div className='Tasks'>
      <nav className='tasks-nav'>
        <div
          className={`tasks-nav-link ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          Todys Tasks
        </div>
             <div
          className={`tasks-nav-link ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Tasks
        </div>
        <div
          className={`tasks-nav-link ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Add Tasks
        </div>
        <div
          className={`tasks-nav-link ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Scheduled Tasks
        </div>
      </nav>

      <div className='tasks-container'>
        {activeTab === 'today' && (
          <div className='todys-tasks'>
            <TasksList isActive={isActive} />
          </div>
        )}
        {activeTab === 'add' && (
          <div className='add-tasks'>
            <AddTask isActive={isActive} />
          </div>
        )}
        {activeTab === 'history' && (
          <div className='tasks-history'>
            <ScheduledTasks />
          </div>
        )}
        {activeTab === 'pending' && (
          <div className='pending-tasks'>
            <PendingTasks isActive={isActive} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
