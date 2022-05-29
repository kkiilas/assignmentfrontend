import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
// import Form from './components/Form'
// import Forms from './components/Forms'
// import Packages from './components/Packages'
import Package from './components/Package'

const App = () => {
  return (
    // <div className="container bg-dark">
    //   <div className="container bg-dark bg-gradient">
    //     <div className="d-flex flex-column bg-dark min-vh-100 p-5">
    //       <div className="d-flex justify-content-center">
    //         <div className="d-grid m-5">
    //           <h3 className="text-primary">Upload a poetry.lock -file</h3>
    //           {/* <Form /> */}
    //           <Forms />
    //         </div>
    //       </div>
    //       <Packages />
    //     </div>
    //   </div>
    <Routes>
      <Route path="/:name" element={<Package />} />
      <Route path="/" element={<Home />} />
    </Routes>
    // </div>
  )
}

export default App
