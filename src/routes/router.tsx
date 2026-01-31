import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import RootLayout from '@/layouts/RootLayout';
import ProtectedLayout from '@/layouts/ProtectedLayout';

import SignupPage from '@/pages/SignupPage/SignupPage';
import LoginPage from '@/pages/LoginPage/LoginPage';
import HomePage from '@/pages/HomePage/HomePage';
import AIChatPage from '@/pages/HomePage/AIChatPage';
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
import FindPasswordPage from '@/pages/FindPasswordPage/FindPasswordPage';
// import BudgetSettingPage from '@/pages/BudgetSettingPage/BudgetSettingPage';
// import BudgetSummaryPage from '@/pages/BudgetSummaryPage/BudgetSummaryPage';
import ProfileSettingPage from '@/pages/MyPage/ProfileSettingPage';
import NicknameSettingPage from '@/pages/MyPage/components/Nickname';
import PasswordFlowPage from '@/pages/MyPage/components/Password/Passward';
import GoalPage from '@/pages/MyPage/components/Goal/GoalPage';

const publicChildren: RouteObject[] = [
  { index: true, element: <SignupPage /> },
  { path: 'signup', element: <SignupPage /> },
  { path: 'login', element: <LoginPage /> },
  { path: 'auth/callback', element: <GoogleCallbackPage /> },
  { path: 'find-password', element: <FindPasswordPage /> },
];

const protectedChildren: RouteObject[] = [
  { path: 'home', element: <HomePage /> },
  { path: 'budget/setting', element: <BudgetSettingPage /> },
  { path: 'budget/result', element: <BudgetSummaryPage /> },
  { path: 'consumption/:type', element: <ConsumptionPage /> },
  { path: 'ai-chat', element: <AIChatPage /> },
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
  {
    path: 'mypage',
    children: [
      { index: true, element: <MyPage /> },
      { path: 'goal', element: <GoalPage /> },
      { path: 'completed', element: <ReportDetailPage enableMock /> },
      {
        path: 'setting',
        children: [
          { index: true, element: <ProfileSettingPage /> },
          { path: 'nickname', element: <NicknameSettingPage /> },
          { path: 'password', element: <PasswordFlowPage /> },
        ],
      },
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
