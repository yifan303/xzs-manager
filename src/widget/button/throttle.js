import {Button} from 'antd'
import React from 'react'

var defaultTimeout = 1000
export default React.createClass({
  timeout:null,
  render(){
    var {onClick,timeout,...bProps} = this.props
    var rtimeout = timeout || defaultTimeout
    return (
      <Button {...bProps} onClick={e=>{
          if(this.timeout===null){
          onClick(e)
          this.timeout = window.setTimeout(()=>{
            this.timeout = null
          },rtimeout)
        }
      }}/>
    )
  }
})
