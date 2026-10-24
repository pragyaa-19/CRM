import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Statecard from '../components/Statecard';
import Activity from '../components/Activity';
import Leads from '../components/Leads';
import AddNewLead from '../components/AddNewLead';
import AddEmployee from '../pages/AddEmployee';
import Header from '../components/Header';
import LeadModal from "../components/LeadModal";
import CurrentUser from '../components/CurrentUser';

export default function Dashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [leadRefresh, setLeadRefresh] = useState(0);

  return (
    
    <div className="flex h-screen bg-gray-50 font-sans">
      <CurrentUser onUserLoaded={setCurrentUser} />
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        currentUser={currentUser}
        onAddEmployeeClick={() => setIsModalOpen(true)}
      />
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top Header */}
        <Header isSidebarOpen={isSidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        currentUser={currentUser} />

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6">

          {/* Action Bar */}
          <AddNewLead
            onNewLeadClick={() => setIsLeadModalOpen(true)}
            currentUser={currentUser}
          />

          {/* KPI Grid */}
          <Statecard />

          {/* Main Data Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Recent Deals Table */}
            <Leads refresh={leadRefresh} />

            {/* Activity Feed / Placeholder */}
            <Activity refresh={leadRefresh} />

          </div>
        </div>
      </main>
      {isModalOpen && (
        <AddEmployee onClose={() => setIsModalOpen(false)} />
      )}
      {isLeadModalOpen && (
        <LeadModal
          onClose={() => setIsLeadModalOpen(false)}
          currentUser={currentUser}
          onLeadCreated={() => setLeadRefresh((prev) => prev + 1)}
        />
      )}
    </div>
  );
}