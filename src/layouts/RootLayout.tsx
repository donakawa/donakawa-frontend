import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    <div className="AppContainer">
      {/* 나중에 Header 들어갈 자리 */}
      <Outlet />
      {/* 나중에 NavBar 들어갈 자리 */}
    </div>
  );
}
