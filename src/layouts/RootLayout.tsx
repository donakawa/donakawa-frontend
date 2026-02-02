import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  return (
    // <div className="AppContainer">
    <div className="AppContainer relative flex min-h-screen flex-col">
      <Outlet />
    </div>
  );
}
