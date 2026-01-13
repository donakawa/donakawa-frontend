import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import RootLayout from '@/layouts/RootLayout';
import ProtectedLayout from '@/layouts/ProtectedLayout';

import SignupPage from '@/pages/SignupPage/SignupPage';
import LoginPage from '@/pages/LoginPage/LoginPage';
import HomePage from '@/pages/HomePage/HomePage';
import WishlistPage from '@/pages/WishlistPage/WishlistPage';
import ReportPage from '@/pages/ReportPage/ReportPage';
import MyPage from '@/pages/MyPage/MyPage';

const publicChildren: RouteObject[] = [
  { index: true, element: <SignupPage /> },
  { path: 'signup', element: <SignupPage /> },
  { path: 'login', element: <LoginPage /> },
];

const protectedChildren: RouteObject[] = [
  { path: 'home', element: <HomePage /> },
  { path: 'wishlist', element: <WishlistPage /> },
  { path: 'report', element: <ReportPage /> },
  { path: 'mypage', element: <MyPage /> },
];

const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      ...publicChildren,
      {
        element: <ProtectedLayout />,
        children: protectedChildren,
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
