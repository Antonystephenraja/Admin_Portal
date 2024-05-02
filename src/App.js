import React, { useEffect, useState } from 'react'
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
import Bpcl_MainPage from './Component/Bpcl/Bpcl_MainPage'
import BpclAdmin from './Component/Bpcl/BpclAdmin'
import GraphPage from './Component/Source/Graph'
import Reports_Page from './Component/Source/Reports'
import Source_Outlet from './Component/Route/Source_Outlet'
import Settings_Page from './Component/Source/Settings_Page'
import Source_MainPage from './Component/Source/MainPage'
import axios from 'axios'
const App = () => {
const [Tof_data,setTofdata]=useState('')
const [projectData, setProjectData] = useState([]);


  let controls =localStorage.getItem("Controles");

  useEffect(()=>{
    fetch_tof_fata();
    fetchProductData();
  const data = setInterval(fetch_tof_fata,2000)
  const sensors =setInterval(fetchProductData,5000)
  return()=>{
    clearInterval(data)
    clearInterval(sensors)
  }
  },[])
const fetch_tof_fata =async()=>{
  try{
    const response = await fetch("http://43.204.133.45:4000/sensor/BPCL_READ");
    const info = await response.json();
    setTofdata(info.data)

  }catch(error){
    console.error("Error fetching data",error)
  }
}




const fetchProductData = async () =>
    {
        try
        {
            const projectName = localStorage.getItem('Project');
            const response = await axios.post('http://43.204.133.45:4000/sensor/displayProjectData',{projectName});
            if(response.data.success)
            {
                setProjectData(response.data.data);
                const modifiedData = response.data.data.map(item =>
                  {
                    if(item.Time && typeof item.Time === 'string')
                    {
                    const dateParts = item.Time.split(/[,\s:/]+/);
                    const day = parseInt(dateParts[0]); 
                    const month = parseInt(dateParts[1]); 
                    const year = parseInt(dateParts[2]);  
                    let hours = parseInt(dateParts[3]);
                    const minutes = parseInt(dateParts[4]);
                    const seconds = parseInt(dateParts[5]);
                    const meridian = dateParts[6];

                    if (meridian === 'pm' && hours !== 12) {
                        hours += 12;
                    }
                    const date = new Date(year, month - 1, day, hours, minutes, seconds);
                    const unixTimestamp = date.getTime();
                    return { ...item, Time: unixTimestamp };
                  }
                  else
                  {
                      return item;
                  }
                }
              );    
            }
            else
            {
                console.log('cant fetch project data');
            }
        }
        catch(error)
        {
            console.log(error);
        }
    };


  return (
    <>
      <Routes>      
        <Route path="/login" element={<Login />} />
          <Route path="/" element={<Route_Page/>}>
            {controls === "SKF" ? ( 
              <Route path="/" element={<OutletPage/>}>
                <Route index element={<Mainpage />}/>
                <Route path="dashgraph" element={<Graph />} />
                <Route path="dashreports" element={<Reports/>} />
                <Route path="dashsettings" element={<Settings/>} />
              </Route>
            ):null}{controls === 'ADMIN' ?(
              <Route path="/" element={<OutletPage/>}>
              <Route index element={<Admin_Dashboard />} />
              <Route path="skfadmin" element={<SkfAdmin />} />
              <Route path="Bpcl_Admin" element={<BpclAdmin 
              Tof ={Tof_data}
              />} />
            </Route>
            ):null}
            {controls === 'BPCL' ?(
              <Route path="/" element={<OutletPage/>}>
              <Route index element={<Bpcl_MainPage />} />
              <Route path="skfadmin" element={<SkfAdmin />} />
            </Route>
            ):null}
            {(controls !== "SKF" && controls !== "ADMIN") && (
              <Route path="/" element={<Source_Outlet/>}>
                <Route index element={<Source_MainPage 
                all_sensor_data = {projectData}
                />} />
                <Route path="Graph" element={<GraphPage/>} />
                <Route path="Report" element={<Reports_Page/>} />
                <Route path="Settings" element={<Settings_Page/>} />
              </Route>
            )}
          </Route>
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </>
  )
}

export default App
