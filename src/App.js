import React from 'react'
import Login from './Component/Logins/Login'
import { Route, Routes } from 'react-router-dom'
import Route_Page from './Component/Route/Route_Page'
import OutletPage from './Component/Route/OutletPage'
import Mainpage from './Component/skf/Mainpage'
import Graph from './Component/skf/Graph'
import Reports from './Component/skf/Reports'
import Settings from './Component/skf/Settings'
import Admin_Dashboard from './Component/Admin/Admin_Dashboard'
import SkfAdmin from './Component/skf/SkfAdmin'

const App = () => {
  const Access = localStorage.getItem('token');
  const data = JSON.parse(Access);
  const role = data ? data.role : 'N/A';
  const Access_Role = role === 'admin'

  return (
    <>
    <Routes>      
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Route_Page/>}>
          {!Access_Role ? ( 
            <Route path="/" element={<OutletPage/>}>
              <Route index element={<Mainpage />}/>
              <Route path="dashgraph" element={<Graph />} />
              <Route path="dashreports" element={<Reports/>} />
              <Route path="dashsettings" element={<Settings/>} />
            </Route>
          ): (
            <Route path="/" element={<OutletPage/>}>
              <Route index element={<Admin_Dashboard />} />
              <Route path="skfadmin" element={<SkfAdmin />} />
          </Route>
          )}

        </Route>
        <Route path="*" element={<div>Page Not Found</div>} />

      </Routes>
    </>
  )
}

export default App
