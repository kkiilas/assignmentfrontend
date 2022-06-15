import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Package from './components/Package'

const App = () => {
  return (
    <Routes>
      <Route path="/packages/:id" element={<Package />} />
      <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
