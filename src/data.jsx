import { 
    RiFileEditLine, 
    RiHistoryLine, 
    RiUserLine,  
    RiExchangeLine,
    RiTeamLine,
    RiShieldUserLine,
    RiFeedbackLine,
    RiFileListLine,
    RiAdminLine
  } from "react-icons/ri";
  import {
    AiOutlineHome,
    AiOutlineFolder,
    AiOutlineMore,
    AiOutlineTeam,
    AiOutlineQuestionCircle,
    AiOutlineSetting,
    AiOutlinePlus,
  } from 'react-icons/ai';
  
  export const userMenu = [
    {
      id: 1,
      userRole: 'free',
      menu: [
        // {
        //   id: 1,
        //   menuItem: 'New',
        //   icon: <RiFileEditLine/>,
        //   path: '/editor'
        // },
        {
          id: 2,
          menuItem: 'Documents',
          icon: <AiOutlineFolder/>,
          path: '/app/documents-history'
        },
        {
          id: 3,
          menuItem: 'Home',
          icon: <AiOutlineHome/>,
          path: '/app/home'
        },
        {
          id: 4,
          menuItem: 'Tokens',
          icon: <RiExchangeLine/>,
          path: '/app/tokens'
        }
        // {
        //   id: 5,
        //   menuItem: 'Settings',
        //   icon: <AiOutlineSetting/>,
        //   path: '/app/account-settings'
        // }
      ]
    },
    {
      id: 2,
      userRole: 'paid',
      menu: [
        // {
        //   id: 1,
        //   menuItem: 'Current Editing',
        //   icon: <RiFileEditLine />,
        //   path: '/editor'
        // },
        {
          id: 2,
          menuItem: 'Documents',
          icon: <AiOutlineFolder/>,
          path: '/app/documents-history'
        },
        {
          id: 3,
          menuItem: 'Home',
          icon: <AiOutlineHome/>,
          path: '/app/home'
        },
        {
          id: 4,
          menuItem: 'Tokens',
          icon: <RiExchangeLine/>,
          path: '/app/tokens'
        }
        // {
        //   id: 5,
        //   menuItem: 'Team',
        //   icon: <AiOutlineTeam/>,
        //   path: '/app/report'
        // },
        // {
        //   id: 6,
        //   menuItem: 'Settings',
        //   icon: <AiOutlineSetting/>,
        //   path: '/app/account-settings'
        // }
      ]
    },
    {
      id: 3,
      userRole: 'super',
      menu: [
        // {
        //   id: 1,
        //   menuItem: 'Admin Dashboard',
        //   icon: <RiAdminLine />,
        //   path: '/admin/user-management'
        // },
        {
          id: 2,
          menuItem: 'User Management',
          icon: <RiUserLine />,
          path: '/admin/user-management'
        },
        {
          id: 3,
          menuItem: 'Blacklist Requests',
          icon: <RiFileListLine />,
          path: '/admin/blacklist-requests'
        },
        {
          id: 4,
          menuItem: 'Complaint Review',
          icon: <RiFeedbackLine />,
          path: '/admin/complaint-review'
        },
        {
          id: 5,
          menuItem: 'Incorrection Report',
          icon: <RiShieldUserLine />,
          path: '/admin/incorrection-report'
        },
        // {
        //   id: 6,
        //   menuItem: 'System Settings',
        //   icon: <RiFileEditLine />,
        //   path: '/settings'
        // }
      ]
    }
  ];