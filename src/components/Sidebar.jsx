// Sidebar.jsx
import React from 'react';
import { AiOutlinePlus, } from 'react-icons/ai';
import { TbMoodEdit } from "react-icons/tb";
import { RiLogoutBoxLine } from "react-icons/ri";
import { userMenu } from "../data.jsx";
import { useAuth } from '../contexts/AuthContext.jsx';
import { Button } from './ui/button.jsx';
import { Link, useNavigate } from 'react-router-dom';


const Sidebar = () => {
    const { isAuthenticated, userInfo, logout, isLoadingUser } = useAuth();
    const navigate = useNavigate();
    
    // if userInfo exists and has role property, find menu
    const currentMenu = userInfo && userInfo.role ? 
        userMenu.find((menu) => menu.userRole === userInfo.role) :
        userMenu.find((menu) => menu.userRole === 'free'); // default use free role menu

    const handleLogout = (e) => {
        e.preventDefault();
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) { return null; }
    
    // if userInfo is loading, show loading state
    if (isLoadingUser) {
        return (
            <div className="w-20 h-screen bg-secondary/40 flex flex-col items-center py-4 space-y-6 sticky left-0 top-0">
                <div>
                    <TbMoodEdit size={33} />
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-sm text-gray-700">Loading...</div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="w-20 h-screen bg-secondary/40 flex flex-col items-center py-4 space-y-6 sticky left-0 top-0">

            <div>
                <TbMoodEdit size={33} />
            </div>

            {(!userInfo || userInfo.role !== 'super') && (
                <div className='mt-12'>
                    <Button asChild className='bg-white text-black shadow-md mb-2 p-2 rounded-lg transition-transform duration-200 hover:scale-150 hover:bg-white'>
                        <Link to={'/app'}>
                            <AiOutlinePlus size={20} />
                        </Link>
                    </Button>
                    <div className="text-sm text-gray-700 text-center">New</div>
                </div>
            )}

            <div className="flex flex-col items-center justify-between space-y-8 mt-18 text-gray-600 text-sm w-full">
                <div className='space-y-6'>
                    {currentMenu?.menu.map((item) => (
                        <SidebarItem
                            key={item.id}
                            path={item.path}
                            icon={item.icon}
                            label={item.menuItem}
                        />
                    ))}
                </div>
            </div>

            <div className='mt-auto text-sm text-gray-600 w-full'>
                <SidebarItem 
                    path={'/'} 
                    icon={<RiLogoutBoxLine/>} 
                    label="Logout" 
                    onClick={handleLogout}
                />
            </div>
        </div>
    );
};


const SidebarItem = ({ path, icon, label, onClick }) => (
    <Link 
        to={path} 
        className="w-full flex flex-col items-center justify-center py-1 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
        onClick={onClick}
    > 
        <div className="">
            {React.cloneElement(icon, { 
                size: 22,
            })}
        </div>
        <span className="text-sm text-center">{label}</span>
    </Link>
);

export default Sidebar;
