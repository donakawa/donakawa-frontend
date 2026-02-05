import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import RootLayout from '@/layouts/RootLayout';
import ProtectedLayout from '@/layouts/ProtectedLayout';

import SignupPage from '@/pages/SignupPage/SignupPage';
import LoginPage from '@/pages/LoginPage/LoginPage';
import HomePage from '@/pages/HomePage/HomePage';
import WishlistPage from '@/pages/WishlistPage/WishlistPage';
import ReportPage from '@/pages/ReportPage/ReportPage';
import PurchaseReviewPage from '@/pages/ReportPage/PurchaseReviewPage';
import ReviewWritePage from '@/pages/ReportPage/ReviewWritePage';
import ReportDetailPage from '@/pages/ReportPage/ReportDetailPage';
import MyPage from '@/pages/MyPage/MyPage';
import BudgetSettingPage from '@/pages/BudgetSettingPage/BudgetSettingPage';
import BudgetSummaryPage from '@/pages/BudgetSummaryPage/BudgetSummaryPage';
import ConsumptionPage from '@/pages/ConsumptionPage/ConsumptionPage';
import GoogleCallbackPage from '@/pages/LoginPage/GoogleCallbackPage';

const publicChildren: RouteObject[] = [
  { index: true, element: <SignupPage /> },
  { path: 'signup', element: <SignupPage /> },
  { path: 'login', element: <LoginPage /> },
  { path: 'auth/callback', element: <GoogleCallbackPage /> },
];

const protectedChildren: RouteObject[] = [
  { path: 'home', element: <HomePage /> },
  { path: 'budget/setting', element: <BudgetSettingPage /> },
  { path: 'budget/result', element: <BudgetSummaryPage /> },
  { path: 'consumption/:type', element: <ConsumptionPage /> },
  { path: 'wishlist', element: <WishlistPage /> },
  {
    path: 'report',
    children: [
      { index: true, element: <ReportPage /> },
      { path: 'review', element: <PurchaseReviewPage /> },
      { path: 'review/write', element: <ReviewWritePage /> },
      { path: 'detail', element: <ReportDetailPage /> },
    ],
  },
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
