import React from 'react'
import request from 'widget/request'
import Preview from '../preview'

export default React.createClass({
  getInitialState(){
    return {
      modules:[]
    }
  },
  requesthome(){
    var promise = request({
      url:'/requesthome/homepage',
      domain:'item',
      method:'post',
      data:{
        pageId:this.props.pageId+""
      }
    })
    promise.then(res=>{
      var result = JSON.parse(res)
      if(result.success){
        this.setState({modules:result.module})
      }
    })
  },
  componentDidMount(){
    this.requesthome()
  },
  render(){
    var {modules} = this.state
    return (
      <div>
        <Preview
          pageId={this.props.pageId}
          modules={modules}
          onUpdate={e=>this.requesthome()}
        />
      </div>
    )
  }
})
