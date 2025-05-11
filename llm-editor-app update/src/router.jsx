import {createBrowserRouter, redirect} from 'react-router-dom'
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EditorPage from './pages/Users/EditorPage'
import Dashboard from './pages/Users/Dashboard'
import HistoryPage from './pages/Users/HistoryPage'
import TokenPage from './pages/Users/TokenPage'
// import SettingPage from './pages/Users/SettingPage'
import ManagementPage from './pages/Admin/ManagementPage'
import BlacklistPage from './pages/Admin/BlacklistPage'
import IncorrectionPage from './pages/Admin/IncorrectionPage'
import ComplaintPage from './pages/Admin/ComplaintPage'
import Error404 from './pages/Error404'
import ProtectedRoute from './components/ProtectedRoute'

// 检查超级管理员的路由守卫
const superUserGuard = async () => {
  // 获取本地存储中的token
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      // 从后端获取用户信息
      const response = await fetch('http://localhost:8000/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // 如果是超级管理员，重定向到管理页面
        if (data && data.role === 'super') {
          return redirect('/admin/user-management');
        }
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  }
  
  return null;
};

export const router = createBrowserRouter([
    {
      path: '/',
      element: <LandingPage/>
    },
    {
      path: '/app',
      element: <ProtectedRoute><EditorPage/></ProtectedRoute>,
      loader: superUserGuard
    },
    {
      path: '/login',
      element: <LoginPage/>
    },
    {
      path: '/signup',
      element: <SignupPage/>
    },
    {
      path: '/app/home',
      element: <ProtectedRoute><Dashboard/></ProtectedRoute>,
      loader: superUserGuard
    },
    {
      path: '/app/documents-history',
      element: <ProtectedRoute><HistoryPage/></ProtectedRoute>,
      loader: superUserGuard
    },
    {
      path: '/app/tokens',
      element: <ProtectedRoute><TokenPage/></ProtectedRoute>,
      loader: superUserGuard
    },
    // {
    //   path: '/app/account-settings',
    //   element: <SettingPage/>
    // },
    {
      path: '/admin/user-management',
      element: <ProtectedRoute requiredRole="super"><ManagementPage/></ProtectedRoute>
    },
    {
      path: '/admin/blacklist-requests',
      element: <ProtectedRoute requiredRole="super"><BlacklistPage/></ProtectedRoute>
    },
    {
      path: '/admin/incorrection-report',
      element: <ProtectedRoute requiredRole="super"><IncorrectionPage/></ProtectedRoute>
    },
    {
      path: '/admin/complaint-review',
      element: <ProtectedRoute requiredRole="super"><ComplaintPage/></ProtectedRoute>
    },
    {
      path: '*',
      element: <Error404/>
    }
  ]);
