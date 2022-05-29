import React from 'react'
import Form from './Form'
import Packages from './Packages'

const Home = () => {
  return (
    <div className="container bg-dark">
      <div className="container bg-dark bg-gradient">
        <div className="d-flex flex-column bg-dark min-vh-100 p-5">
          <div className="d-flex justify-content-center">
            <div className="d-grid m-5">
              <h3 className="text-info">Upload a poetry.lock -file</h3>
              <Form />
            </div>
          </div>
          <Packages />
        </div>
      </div>
    </div>
  )
}

export default Home
