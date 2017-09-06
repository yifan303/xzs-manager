import React from 'react'
import "c3/c3.css"
import c3 from 'c3'

export default React.createClass({
  componentDidMount(){
    c3.generate({bindto: this.refs.chart,...this.props});
  },
  componentWillReceiveProps(props){
    if(JSON.stringify(props)!==JSON.stringify(this.props)){
      c3.generate({bindto: this.refs.chart,...this.props});
    }
  },
  render(){
    return (
      <div ref="chart"></div>
    )
  }
})
