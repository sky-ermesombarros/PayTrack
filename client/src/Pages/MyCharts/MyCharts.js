import React, { useState, useEffect } from 'react'

import {
  BarChart,  Bar,  Cell,  ReferenceLine,
  LineChart,  Line,  
  PieChart,  Pie,
  CartesianGrid,
  XAxis,  YAxis,  Tooltip,  Legend
} from 'recharts'

import moment from 'moment'
import UserAPI from '../../utils/UserAPI'
import EventAPI from '../../utils/EventAPI'

import './myCharts.css'
// import AddEventModal from '../../Components/AddEventModal'
//I like "pop up from bottom", multi-step addEventModal style a lot. --David
//If anyone else is working on this, please use my code from MyCalendar to make it functional and usable on both pages!

const {getColors} = UserAPI
const {getEvents} = EventAPI

const MyCharts = () => {

  const [eventState, setEventState] = useState({
    events: [],
    colorPreferences: [],
  })

  //NO FILTERING for charts as of now 3/19/2020
  const getEventData = () =>{
    let colorPreferences = []
    getColors(token)
    .then(({data})=>{
      //got color preferences, now need all this user's events.
      colorPreferences = data.colorPreferences
      getEvents(token)
      .then(({data})=>{
        let filteredArray = []
        data.forEach((event)=>{filteredArray.push(event)
          // //Check if category is turned on
          // if ((event.category=="housing" && filters.categoryFilter[0])
          // ||(event.category =="insurance" && filters.categoryFilter[1])
          // ||(event.category=="loan" && filters.categoryFilter[2])
          // ||(event.category=="taxes" && filters.categoryFilter[3])
          // ||(event.category=="family" && filters.categoryFilter[4])
          // ||(event.category=="recreation" && filters.categoryFilter[5])
          // ||(event.category=="income" && filters.categoryFilter[6])
          // ||((event.category=="other" || event.category == "") && filters.categoryFilter[7])
          // ) {
          //   if (filters.yearFilter === "all years"){
          //     //check if "all years" is on
          //   filteredArray.push(event)
          //   }
          //   else if (moment(event.eventDate).year() === parseInt(filters.yearFilter)){
          //     //check if event matches year filter.
          //     if(filters.monthFilter ===12){
          //       //no month filter: pushes everything w/ selected year.
          //       filteredArray.push(event)
          //     } else if (parseInt(filters.monthFilter) === moment(event.eventDate).month()){
          //       //month filter: pushes everything w/ selected year and month.
                // filteredArray.push(event)
              // }
            // }
          // }
        })
        let events = filteredArray.sort((a, b)=>a.eventDate > b.eventDate ? 1 : -1)
        // let amounts = []
        // let cumSum = []
        let myEvents=[]
        if (events.length) {
          events.forEach((event) => {            
              //push each event's amount as positive or negative to amounts arr
              // amounts.push(event.isPayment ? -event.amount : event.amount)

              //determine backgroundColor using user preferences.
              const colorFunction = (category) =>{
                let color
                switch (category) {
                  case "housing": color=colorPreferences[0]
                  break;
                  case "insurance": color=colorPreferences[1]
                  break;
                  case "loan": color=colorPreferences[2]
                  break;
                  case "taxes": color=colorPreferences[3]
                  break;
                  case "family": color=colorPreferences[4]
                  break;
                  case "recreation": color=colorPreferences[5]
                  break;
                  case "income": color=colorPreferences[6]
                  break;
                  case "other": color=colorPreferences[7]
                  break;
                  default: color=colorPreferences[7]
                }
                return color
              }
              //create event objects to populate table.
              let calendarEvent = {
                id: event._id,
                groupId: event.groupId,
                title: event.title, 
                date: event.eventDate,
                allDay: true, 
                backgroundColor: colorFunction(event.category), //call some functions using user preferences for colors here.
                borderColor: 'black',
                textColor: 'white',
                extendedProps: {
                  amount: event.amount,
                  isPayment: event.isPayment,
                  frequency: event.frequency,
                  category: event.category,
                  notes: event.notes,
                  url: event.website,
                  author: event.author,
                  groupStartDate: event.groupStartDate,
                  groupEndDate: event.groupEndDate,
                  eventNumber: event.eventNumber,
                  groupTotal: event.groupTotal
                }
              }
              myEvents.push(calendarEvent)
          }) //end forEach Event function.

          // amounts.forEach((amount, index, arr)=>{
          //   let sum = 0
          //   for(let i = 0; i<=index; i++){
          //     sum = sum + arr[i]
          //   }
          //   cumSum.push(sum)
          // })
        } else {
          console.log("You have no events.")
        }
        setEventState({...eventState, events: myEvents, colorPreferences: colorPreferences})
      })
      .catch(e=>console.error(e))
    })
    .catch(e=>console.error(e))
  }
  //on pageload, getEventData.
  let token = JSON.parse(JSON.stringify(localStorage.getItem("token")))
  useEffect(()=>{
    getEventData()
  }, [])

  const monthlyAvgCategories = () =>{
    const categoryMonthAverage = {
      housing: 0,
      insurance: 0,
      loan: 0,
      taxes: 0,
      family: 0,
      recreation: 0,
      income: 0,
      other: 0,
    }
    console.log(eventState.events)
  }
  monthlyAvgCategories()


//BAR CHART STUFF
const barData = [
  {category: 'Housing', monthTotal: -4000, yearTotal:100},
  {category: 'Insurance', monthTotal: -3000,yearTotal:100},
  {category: 'Loan', monthTotal: -2000,yearTotal:100},
  {category: 'Taxes', monthTotal: -1000,yearTotal:100},
  {category: 'Family', monthTotal: -200,yearTotal:100},
  {category: 'Recreation', monthTotal: -500,yearTotal:100},
  {category: 'Income', monthTotal: 3000,yearTotal:100},
  {category: 'Other', monthTotal: -200,yearTotal:100},
  {category: 'All', monthTotal: -200,yearTotal:100},
]


//~~~~~~LINE GRAPH STUFF~~~~~~
  const [chartState, setChartState] = useState({
    variable: ''
  })

  const lineData = [
  {month: 'January', monthExpense: 400, monthIncome: 800, monthBalance: 400},
  {month: 'February', monthExpense: 300, monthIncome: 900, monthBalance: 500},
  {month: 'March', monthExpense: 300, monthIncome: 200, monthBalance: 600},
  {month: 'April', monthExpense: 200, monthIncome: 500, monthBalance: 700},
  {month: 'June', monthExpense: 300, monthIncome: 750, monthBalance: 800},
  {month: 'July', monthExpense: 300, monthIncome: 750, monthBalance: 900},
  {month: 'August', monthExpense: 300, monthIncome: 750, monthBalance: 500},
  {month: 'September', monthExpense: 300, monthIncome: 750, monthBalance: 600},
  {month: 'October', monthExpense: 300, monthIncome: 750, monthBalance: 700},
  {month: 'November', monthExpense: 300, monthIncome: 750, monthBalance: 800},
  {month: 'December', monthExpense: 198, monthIncome: 975, monthBalance: 900},]

//~~~~~~PIE CHART STUFF~~~~~~
  const [radiiState, setRadiiState] = useState({})
  
  let meanMonthlyAmount = [
    [{name: 'Housing',value: 350,fill: eventState.colorPreferences[0]}],
    [{name: 'Insurance',value: 400,fill: eventState.colorPreferences[1]}],
    [{name: 'Loan',value: 95,fill: eventState.colorPreferences[2]}],
    [{name: 'Taxes',value: 150,fill: eventState.colorPreferences[3]}],
    [{name: 'Family',value: 112,fill: eventState.colorPreferences[4]}],
    [{name: 'Recreation',value: 112,fill: eventState.colorPreferences[5]}],
    [{name: 'Income',value: 112,fill: eventState.colorPreferences[6]}],
    [{name: 'Other',value: 112,fill: eventState.colorPreferences[7]}],        
  ]

  let resetRadii = () => {
    let returnVal = {}
    meanMonthlyAmount.forEach(monthlyMean => {
      returnVal = { ...returnVal, [monthlyMean[0].name]: 120 }
    })
    return returnVal
  }

  const income = 2700
  const addAngles = (startAngle, monthlyMean) => {
    const endAngle = startAngle + (monthlyMean[0].value / income * 360)
    return [{ ...monthlyMean[0], startAngle, endAngle }]
  }
  const pieEnter = pie => setRadiiState({ ...resetRadii(), [pie.name]: 140 })
  const pieLeave = pie => setRadiiState({ ...radiiState, [pie.name]: 120 })

  useEffect(() => {
    setRadiiState(resetRadii())
  }, [])

  const testButton = () => {
    console.log(eventState)
  }
  return(
    <>
      <div className="container">
        <button onClick={testButton}>Testing Button</button>
        <h2 className="center white-text">My Charts</h2>
        {/* <AddEventModal /> */}
        
        {/* BAR CHART */}
        <div className="row white">
          <h5 className="center">Expenditures by Category: March</h5>
          <div className="row">
            <button>Last Month</button>
            <button>This Month</button>
            <button>Next Month</button>
            <span> </span>
            <button>Last Year</button>
            <button>This Year</button>
            <button>Next Year</button>
          </div>
            <BarChart
            width={700}
            height={400}
            data={barData}
            margin={{
              top: 20, right: 30, left: 20, bottom: 5,
            }}
          >
            <ReferenceLine y={0} stroke="#000" />
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis />
            <Bar dataKey="monthTotal" fill="#8884d8" label={{ position: 'top' }}>
              {
                barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={eventState.colorPreferences[index]} />
                ))
              }
            </Bar>
          </BarChart>
        </div>

        {/* LINE CHART */}
        <div className="row white">
          <LineChart width={600} height={400} data={lineData} style={{ backgroundColor: '#FFFFFF' }}>
            <CartesianGrid stroke="#ccc" />
            <XAxis datakey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="monthExpense" stroke="#AA2200" />
            <Line type="monotone" dataKey="monthIncome" stroke="#DDDDDD" />
            <Line type="monotone" dataKey="monthBalance" stroke="#0000FF" />
          </LineChart>
        </div>

        {/* PIE CHART */}
        <div className="row white">
          <h5 className="center">Expenditures by Category: March</h5>
          <div className="row">
            <button>Last Month</button>
            <button>This Month</button>
            <button>Next Month</button>
            <span> </span>
            <button>Last Year</button>
            <button>This Year</button>
            <button>Next Year</button>
          </div>
          <PieChart width={600} height={400} style={{ backgroundColor: '#FFFFFF' }}>
            <Tooltip />
            {
              (() => {
                let startAngle = 0
                let withAngles = meanMonthlyAmount.map(monthlyMean => {
                  let monthlyMeanWithAngles = addAngles(startAngle, monthlyMean)
                  startAngle = monthlyMeanWithAngles[0].endAngle
                  return monthlyMeanWithAngles
                })

                let pies = withAngles.map((monthlyMean, index) => (
                  <Pie 
                    key={index}  
                    data={monthlyMean} 
                    dataKey='value' 
                    nameKey='name' 
                    cx='50%' 
                    cy='50%' 
                    outerRadius= {radiiState[monthlyMean[0].name]} 
                    label 
                    fill={monthlyMean[0].fill} 
                    startAngle={monthlyMean[0].startAngle} 
                    endAngle={monthlyMean[0].endAngle} 
                    onMouseEnter={pieEnter}
                    onMouseLeave={pieLeave}
                    on />
                ))
                // console.log(pies) 
                return pies
              })()
            }
          </PieChart>
        </div>
    </div>
    </>
  )
}

export default MyCharts