import React from 'react'
import Form from './Form'
import Packages from './Packages'
import Notification from './Notification'

const Home = () => {
  return (
    <div className="container bg-dark">
      <div className="container bg-dark bg-gradient">
        <div className="d-flex flex-column bg-dark min-vh-100 p-5">
          <div className="d-flex justify-content-center">
            <div className="d-flex flex-column align-items-center m-5">
              <Notification />
              <div className="d-grid">
                <h3 className="text-info">Upload a poetry.lock -file</h3>
                <Form />
              </div>
            </div>
          </div>
          <Packages />
        </div>
      </div>
    </div>
  )
}

export default Home
