import React from 'react'
import Home from './home'
import Normal from './normal'
import Category from './category'

export default React.createClass({
  componentDidMount(){
    this.props.params.changeBrumb(['修改页面'])
  },
  render(){
    var {pageId} = this.props.params
    if(pageId==30){
      return <Home pageId={pageId}/>
    }else{
      return <Category pageId={pageId}/>
    }
  }
})
