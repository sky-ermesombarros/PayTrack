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
import ColorPreferences from '../../Components/ColorPreferences'

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

//YEAR/MONTH GRAPH DATA
  const [timeState, setTimeState] = useState({
    yearConstraint: 2020,
    monthConstraint: 0
  })

  const lastMonth = () => setTimeState({...timeState, monthConstraint: timeState.monthConstraint ? (timeState.monthConstraint + 11)%12 : moment(Date.now()).month()})
  const thisMonth = () => setTimeState({...timeState, monthConstraint: moment(Date.now()).month()+1})
  const nextMonth = () => setTimeState({...timeState, monthConstraint: timeState.monthConstraint ? (timeState.monthConstraint +1)%12 : moment(Date.now()).month()+2})
  const lastYear = () => setTimeState({yearConstraint: timeState.yearConstraint -1, monthConstraint: 0})
  const thisYear = () => setTimeState({yearConstraint: moment(Date.now()).year(), monthConstraint: 0})
  const nextYear = () => setTimeState({yearConstraint: timeState.yearConstraint +1, monthConstraint: 0})

  const timeIntervalTotals = (yearConstraint, monthConstraint) =>{
    let categoryArrays = {
      housing: 0,
      insurance: 0,
      loan: 0,
      taxes: 0,
      family: 0,
      recreation: 0,
      income: 0,
      other: 0,
    }
    let categoryKeys = Object.keys(categoryArrays)
    let categoryValues = [0,0,0,0,0,0,0,0]
    eventState.events.forEach((event)=>{
      if(
        monthConstraint ? moment(event.date).year() == yearConstraint && moment(event.date).month() == monthConstraint-1
        :
        moment(event.date).year() == yearConstraint
      ){
        let indexOfCategory = categoryKeys.findIndex((category)=>category==event.extendedProps.category)
        event.extendedProps.isPayment ?
        categoryValues[indexOfCategory] = categoryValues[indexOfCategory] - event.extendedProps.amount
        :
        categoryValues[indexOfCategory] = categoryValues[indexOfCategory] + event.extendedProps.amount
      }
    })
    return(categoryValues.map((value)=>(Math.floor(value*100)/100)))
  }
  //Sum of EACH category in the given year, month, thrown into an array of numbers.
  const categorySumArr = timeIntervalTotals(timeState.yearConstraint, timeState.monthConstraint) 
  const positiveCatSumArr = categorySumArr.map((value)=>(Math.abs(value)))

//BAR CHART STUFF
const barData = [
  {category: 'Housing', monthTotal: categorySumArr[0], yearTotal:100},
  {category: 'Insurance', monthTotal: categorySumArr[1],yearTotal:100},
  {category: 'Loan', monthTotal: categorySumArr[2],yearTotal:100},
  {category: 'Taxes', monthTotal: categorySumArr[3],yearTotal:100},
  {category: 'Family', monthTotal: categorySumArr[4],yearTotal:100},
  {category: 'Recreation', monthTotal: categorySumArr[5],yearTotal:100},
  {category: 'Income', monthTotal: categorySumArr[6],yearTotal:100},
  {category: 'Other', monthTotal: categorySumArr[7],yearTotal:100},
  {category: 'All', monthTotal: categorySumArr.reduce((total, num)=>total+num),yearTotal:100},
]

//~~~~~~PIE CHART STUFF~~~~~~
  const [radiiState, setRadiiState] = useState({})
    
  let pieData = [
    [{category: 'Housing',value: Math.abs(categorySumArr[0]),fill: eventState.colorPreferences[0]}],
    [{category: 'Insurance',value: Math.abs(categorySumArr[1]),fill: eventState.colorPreferences[1]}],
    [{category: 'Loan',value: Math.abs(categorySumArr[2]),fill: eventState.colorPreferences[2]}],
    [{category: 'Taxes',value: Math.abs(categorySumArr[3]),fill: eventState.colorPreferences[3]}],
    [{category: 'Family',value: Math.abs(categorySumArr[4]),fill: eventState.colorPreferences[4]}],
    [{category: 'Recreation',value: Math.abs(categorySumArr[5]),fill: eventState.colorPreferences[5]}],
    [{category: 'Income',value: Math.abs(categorySumArr[6]),fill: eventState.colorPreferences[6]}],
    [{category: 'Other',value: Math.abs(categorySumArr[7]),fill: eventState.colorPreferences[7]}],        
  ]
  //pieChart Total.
  let total = arr => arr.reduce((a, b)=>a+b)
  const pieChartSum = total(positiveCatSumArr)

  let resetRadii = () => {
    let returnVal = {}
    pieData.forEach(monthlyMean => {
      returnVal = { ...returnVal, [monthlyMean[0].name]: 120 }
    })
    return returnVal
  }

  const addAngles = (startAngle, monthlyMean) => {
    const endAngle = startAngle + (monthlyMean[0].value / pieChartSum * 360)
    return [{ ...monthlyMean[0], startAngle, endAngle }]
  }
  const pieEnter = pie => setRadiiState({ ...resetRadii(), [pie.name]: 140 })
  const pieLeave = pie => setRadiiState({ ...radiiState, [pie.name]: 120 })

  useEffect(() => {
    setRadiiState(resetRadii())
  }, [])

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

  const testButton = () => {
    console.log(eventState)
    // console.log(moment(Date.now()()).year())
  }
  return(
    <>
      <div id="chartContainer">
        <button onClick={testButton}>Testing Button</button>
        <h2 className="center white-text">My Charts</h2>
        {/* <AddEventModal /> */}
        
        
        {/* BAR CHART, PIE CHART */}
        <div className="row white" style={{width:"96%"}}>
          <div className="row center">
            <h4>{"Expenditures by Category: "}
              {timeState.monthConstraint ? moment().month(timeState.monthConstraint-1).format("MMMM, ") : null}
              {timeState.yearConstraint}
            </h4>
            
            <div className="col s12 m6 l6">
              <button className="btn purple btn-small" onClick={lastMonth}>{"<"}</button>
              <span> </span>
              <button className="btn purple btn-small" onClick={thisMonth}>This Month</button>
              <span> </span>
              <button className="btn purple btn-small" onClick={nextMonth}>{">"}</button>
            </div>
            <div className="col s12 m6 l6">
              <button className="btn green btn-small" onClick={lastYear}>{"<<"}</button>
              <span> </span>
              <button className="btn green btn-small" onClick={thisYear}>This Year</button>
              <span> </span>
              <button className="btn green btn-small" onClick={nextYear}>{">>"}</button>
            </div>
          </div>
          <ColorPreferences/>
          {/* BAR CHART */}
          <div className="col s12 m7 l7">
            <BarChart
              width={window.screen.width < 900 ? window.screen.width*0.89 : window.screen.width*0.5}
              height={ window.screen.width <900 ? window.screen.height*0.3 : 350}
              data={barData}
              margin={{
                top: 20, right: 30, left: 0, bottom: 0,
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
          </div>{/* END BAR CHART */}
          
          {/* PIE CHART */}
          <div className="col s12 m5 l5">
            <PieChart width={window.screen.width < 900 ? window.screen.width*0.89 : window.screen.width*0.25}
               height={370} style={{ backgroundColor: '#FFFFFF' }}>
              <Tooltip />
              {
                (() => {
                  let startAngle = 0
                  let withAngles = pieData.map(monthlyMean => {
                    let monthlyMeanWithAngles = addAngles(startAngle, monthlyMean)
                    startAngle = monthlyMeanWithAngles[0].endAngle
                    return monthlyMeanWithAngles
                  })

                  let pies = withAngles.map((monthlyMean, index) => (
                    <Pie 
                      key={index}  
                      data={monthlyMean} 
                      dataKey='value' 
                      nameKey='category' 
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
          </div> {/* END PIECHART */}
        </div> 
        

        {/* LINE CHART */}
        <div className="row white">
          <LineChart 
            width={window.screen.width < 900 ? window.screen.width*0.89 : window.screen.width*0.5}
            height={ window.screen.width <900 ? window.screen.height*0.3 : 350}
            data={lineData} 
            style={{ backgroundColor: '#FFFFFF' }}>
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

    </div>
    </>
  )
}

export default MyCharts