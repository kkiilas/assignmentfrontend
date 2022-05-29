import React from 'react'

const Extras = ({ extras }) => {
  if (!extras) {
    return null
  }

  return (
    <div>
      <h4>Extras</h4>
      {extras}
    </div>
  )
}

export default Extras
