import React, { useEffect, useState } from 'react'
import axios from 'axios'

import {Chart} from 'react-google-charts'
import {AiOutlineWarning } from "react-icons/ai";
import { FaListUl } from "react-icons/fa";
import { MdOutlineManageHistory } from "react-icons/md";
import { FaThinkPeaks } from "react-icons/fa";
import { AiOutlinePieChart } from "react-icons/ai";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import Navbar from './Navbar';
import { FaTemperatureArrowDown } from "react-icons/fa6";


const MainPage = (all_sensor_data) => {
    const [projectDataLimit, setProjectDataLimit] = useState([]); 
    const [pieData, setPieData] = useState([]);
    const [activeStatus, setActiveStatus] = useState('ACTIVE'); 
    const [lastUpdated, setLastUpdated] = useState(); //last update
    const [peakValues, setPeakValues] = useState([]); //peak value
    const [leftoverKeys, setLeftoverKeys] = useState(0); //total parameters
    const [limit, setLimit] = useState(25); //for line graph limit
    const [selectedKey, SetSelectedKey] = useState(null); // line graph parameter selection
    const alldata = all_sensor_data.all_sensor_data

    const handleLimitChange = (e) =>
    {
        setLimit(parseInt(e.target.value));
    };

    const handleKeyClick = (key) =>
    {
        SetSelectedKey(key);
    
    };
  

    //for line graph
    useEffect(()=>
    {
        fetchProductDataLimit();
        const interval = setInterval(fetchProductDataLimit,5000);
        return() =>
        {
            clearInterval(interval);
        };
    },[limit]);
 

    
    // for line graph
    const fetchProductDataLimit = async () =>
    {
        try
        {
            const projectName = localStorage.getItem('Project');
            const response = await axios.post('http://43.204.133.45:4000/sensor/displayProjectDataLimit',{projectName,limit});
            if(response.data.success)
            {
                setProjectDataLimit(response.data.data);

                console.log('limited data',response.data.data)
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
    }

    // card data code
    let cardData = 'N/A';
    if(alldata && alldata.length > 0)
    {
        cardData = alldata[0];
    }


    //pie chart code
    useEffect(() => {
        if (alldata.length > 0) {
            const lastProjectData = alldata[0];
            const keysBeforeFilter = Object.keys(lastProjectData);
            const filteredkeys = keysBeforeFilter.filter(key => key !== '_id' && key !== '__v' && key !== 'Time')
            const pieChartData =filteredkeys.map(key => [key, parseFloat(lastProjectData[key])]); 
            setPieData([['Category', 'Value'], ...pieChartData]);
            setLastUpdated(lastProjectData.Time); // for last updated

            const peakValues = findPeakValue(lastProjectData); // for peak value
            setPeakValues(peakValues);

            const leftoverKeys = keysBeforeFilter.length - 3; //total parameters
            setLeftoverKeys(leftoverKeys);
        }
    }, [alldata]);

    console.log('pie data',pieData);

    const pieOptions = {
      
        is3D: true,
        legend:{
            position: 'bottom',
            textStyle:{
                fontSize: 7
            }
        },
        backgroundColor: 'transparent'
    };

    // function for checking the activity status
    const checkStatus = (data) =>
    {
      if(data.length > 0)
      {
          const lastDataTimestamp = new Date(data[0].Time);
          const currentTime = new Date().getTime();
          const timeElapsed = (currentTime - lastDataTimestamp) / 1000;

          console.log('last data time', lastDataTimestamp)
          console.log('current time',currentTime)
          console.log('time elapsed', timeElapsed)

      if(timeElapsed > 30) //30 seconds
      {
          setActiveStatus('INACTIVE');
      }
      else
      {
          setActiveStatus('ACTIVE');
      }
      }
    };

    // function to find peak value
    const findPeakValue = (data) =>
    {
        let maxValues = [];  
        let maxValue = -Infinity;
        
        for (const key in data)
        {
            if(data.hasOwnProperty(key) && key !== '_id' && key !== '__v' && key !== 'Time')
            {
                const value = parseFloat(data[key]);

                if(value > maxValue)
                {
                    maxValues = [{key,value}];
                    maxValue = value;
                }
                else if(value === maxValue)
                {
                    maxValues.push({key,value});
                }
            }
        }
        return maxValues;
    }

    //for custom scrollbar
    const customScrollbarStyle = {
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgb(153, 246, 228) transparent',
    };

    //render line chart
    const renderLineChart = () =>
    {
        const data = [['X', selectedKey]];
        projectDataLimit.forEach((item, index) =>{
            data.push([index + 1, parseFloat(item[selectedKey])]);
        });

        return(
            <Chart
            width = {'100%'}
            height = {'100%'}
            chartType = "LineChart"
            //loader = {<div>Loading Chart</div>}
            data = {data}
            options = {{
                hAxis: {
                    title: 'time',
                },
                vAxis: {
                    title: selectedKey,
                },
            }}
            rootProps = {{'data-testid' : '1'}}
            />
        );
    };
  return (
    <>
    <div className='flex'>
        <div className='w-full'>
            <div>
                <Navbar/>
            </div>
            {/* main content */}
            <div className='px-2'>
                <div className='sm:flex sm:h-[41vh] 2xl:h-[44vh] xxs:h-screen gap-4 mb-4'>
                    {/* parameter cards */}
                    <div className='sm:w-1/2 xxs:h-1/2 sm:h-full mb-2 grid grid-cols-3 gap-2 p-2 overflow-auto shadow-lg' style={customScrollbarStyle}>
                        {Object.keys(cardData)
                        .filter(key => key !== '_id' && key !== '__v' && key !== 'Time')
                        .map(key =>(
                           
                            <div key={key} className='grid grid-rows-2 h-[15vh] font-medium border-2 bg-[#fcb599] text-gray-700 hover:scale-105 duration-200 cursor-pointer shadow-lg  rounded-md'>
                                <div className='flex justify-center items-center'>
                                    <div className=''>
                                        <FaTemperatureArrowDown className='text-2xl mt-2 mr-4'/>
                                    </div>
                                    <div className='text-2xl font-bold'>
                                        {`${cardData[key]}`}
                                    </div>
                                </div>
                                <div className='flex items-center justify-center'>
                                    {`${key} `}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='sm:w-1/2 xxs:h-1/2 sm:h-full mb-4 flex gap-2'>
                        {/* pie chart */}
                        <div className='w-1/2 bg-white shadow-xl '>
                            <div className='flex justify-center items-center  h-1/6'>
                                <div className='mr-1'><AiOutlinePieChart size={25} /></div>
                                <div className='font-medium '>
                                    PIE VISUALIZATION
                                </div>
                            </div>
                            <div className='h-5/6'>
                                <Chart chartType='PieChart' width={'100%'} height={'100%'} data={pieData} options={pieOptions}/>
                            </div>
                        </div>
                        <div className='w-1/2 flex flex-col gap-2'>
                            <div className='bg-white h-1/2 flex flex-col gap-2 p-1 shadow-xl'>
                                <div className='flex h-1/2 gap-1'>
                                    {/* activity status */}
                                    <div className={`w-1/2 flex items-center justify-center text-white cursor-pointer rounded-md font-medium hover:scale-[1.03] duration-200 ${activeStatus === 'ACTIVE' ? ' bg-green-400' : ' bg-red-400 animate-background-blink' }`}>
                                        {
                                        activeStatus === 'ACTIVE' ? 
                                        <div className='mr-1'><IoMdCheckmarkCircleOutline size={25}/></div> :
                                        <div className='mr-1'><AiOutlineWarning size={25}/></div> 
                                        }
                                        <div>{activeStatus}</div>
                                    </div> 
                                    {/* total parameters */}
                                    <div className='bg-blue-400 w-1/2 cursor-pointer rounded-md hover:scale-[1.03] duration-200 text-white p-1 flex flex-col items-center justify-center'>
                                        <div className='flex items-center justify-center'>
                                            <div className='mr-1 flex items-center'><FaListUl size={15}/></div>
                                            <div className='text-xs font-medium flex items-center'>TOTAL PARAMETERS</div>
                                        </div>
                                        <div className='flex justify-center items-center font-bold'>
                                            {leftoverKeys}
                                        </div>
                                    </div>
                                </div>
                                {/* last updated */}
                                <div className='h-1/2 cursor-pointer rounded-md hover:scale-[1.015] duration-200 p-1 text-green-400'>
                                    <div className='flex justify-center font-medium text-xs'>
                                        <div className='mr-1'><MdOutlineManageHistory size={25}/></div>
                                        <div className='flex items-center'>RECENT UPDATE</div>
                                    </div>
                                    <div className='flex justify-center items-center font-bold text-xs'>{lastUpdated}</div>
                                </div>
                            </div>
                            {/* peak value */}
                            <div className='h-1/2 bg-white overflow-auto p-1 shadow-xl' style={customScrollbarStyle}>
                                <div className='flex items-center justify-center bg-white'>
                                    <div className='mr-1'><FaThinkPeaks size={20}/></div>
                                    <div className='text-xs font-bold'>PEAK VALUE</div>
                                </div>
                                {
                                    peakValues.map((peak, index) =>(
                                        <div key={index} className='bg-teal-300 rounded-md cursor-pointer hover:scale-[1.02] duration-200 h-1/3 mt-2 text-gray-700 flex items-center justify-center font-medium'>
                                            {`${peak.key}: ${peak.value}`}
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
                <div className='sm:flex sm:h-[41vh] 2xl:h-[44vh] xxs:h-screen gap-4 mb-4'>
                    <div className='sm:w-1/2 xxs:h-1/2 sm:h-full  mb-2 flex items-center justify-center bg-white shadow-lg'>
                        N/A
                    </div>
                    {/* line graph */}
                    <div className='sm:w-1/2 xxs:h-1/2 sm:h-full mb-4 bg-white shadow-lg'>
                        <div className='flex'>
                            <div className='flex border border-black w-[70%] overflow-auto' style={{scrollbarWidth : 'none'}}>
                                {
                                    Object.keys(cardData)
                                    .filter(key => key !== '_id' && key !== '__v' && key !== 'Time')
                                    .map(key => (
                                        <div key={key} onClick={() =>handleKeyClick(key)} className='border border-black'>
                                            {`${key}`}
                                        </div>
                                    ))
                                }
                            </div>
                            {/* graph limit */}
                            <div className='w-[30%] border border-black'>
                                <label htmlFor='limit'>LIMIT</label>
                                <select id='limit' value={limit} onChange={handleLimitChange}>
                                    <option value='25'>25</option>
                                    <option value='50'>50</option>
                                    <option value='75'>75</option>
                                    <option value='100'>100</option>
                                </select>
                            </div>
                        </div>
                        {/* render line graph */}
                        <div className='border border-black'>
                            {selectedKey && renderLineChart()}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</>
  )
}

export default MainPage
