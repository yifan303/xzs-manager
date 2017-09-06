import React from 'react'

var styles = {
  'height':"2rem",
  "lineHeight":"2rem",
  "fontSize":'.5rem',
  "textAlign":"center"
}

export default React.createClass({
  render(){
    return (
      <div style={styles}>将类目id填入标题中</div>
    )
  }
})
