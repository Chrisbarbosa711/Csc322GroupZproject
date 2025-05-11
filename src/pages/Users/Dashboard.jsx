import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Separator } from '@/components/ui/separator';
import UserProfile from '@/components/UserPofile';
import Account from '@/components/Account';
import DashboardStats from '@/components/DashboardStats';
import RecentEdits from '@/components/RecentEdits';
import InvitationList from '@/components/InvitationList';

const Dashboard = () => {
  const { userInfo, isLoadingUser } = useAuth();

  return (
    <div className="flex flex-row min-h-screen">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <Navbar />

        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-3xl font-semibold">
              Welcome, <span>{userInfo?.username || 'User'}</span>
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Whether you're here to refine your drafts or collaborate on documents, we've got you covered.
            </p>
          </div>
          
          <Separator className="my-4" />
          
          {isLoadingUser ? (
            <div className="flex items-center justify-center p-10 h-[calc(100vh-200px)]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-lg">Loading your dashboard...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column - User profile and account */}
              <div className="lg:col-span-1 space-y-6">
                <UserProfile userInfo={userInfo} />
                <Account />
              </div>
              
              {/* Right column - Stats, Recent edits, and Invitations */}
              <div className="lg:col-span-2 space-y-6">
                <DashboardStats />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RecentEdits />
                  <InvitationList />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
