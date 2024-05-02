import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Source/Sidebar'
const Source_Outlet = () => {
    return (
    <div className="flex overflow-y-auto scrollbar-hide">
        <div>
        <Sidebar/>
        </div>
        <div className='basis-[100%] bg-main_color max-h-full'>
        {/* <Navbar/> */}
        <div>
            <Outlet>
            </Outlet>
        </div>
        </div>
    </div>
    )
}

export default Source_Outlet
