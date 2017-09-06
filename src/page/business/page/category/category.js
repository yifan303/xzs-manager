import React from 'react'
import Preview from '../preview'
import request from 'widget/request'
import ajax from 'widget/ajax'
import {Tabs,Col,Row,message,Button} from 'antd'
import styles from '../home/home.less'
import TButton from 'widget/button/throttle.js'

export default React.createClass({
  getInitialState(){
    return {
      version:"5.0",
      modules:[],
      preModule:[],
      config:[],
      list:null
    }
  },

  getModules(){
    this.setState({modules:[]})

    var floorPromise = ajax({
      url:'/requesthome/home',
      domain:"item",
      method:'post',
      data:{
        pageId:this.props.pageId+'',
        pageSize:1000,
        pageNum:0,
        filterStep:false
      }
    })
    floorPromise.then(result=>{
      if(result.success){
        var {modules} = this.state
        this.setState({modules:modules.concat(result.module||[])})
      }
    })
  },


  componentDidMount(){
    this.getModules()
  },
  render(){
    var {modules,config,version,preModule} = this.state
    return (
      <Row>
        <Col span={24}>

          <div onDragOver={e=>e.nativeEvent.preventDefault()} onDrop={e=>this.drop(e)}>
            <Preview
              pageId={this.props.pageId}
              modules={modules}
              onUpdate={e=>{
                this.setState({list:null},()=>{
                  this.getModules()
                })
              }}
              canAdd={true}
            />
          </div>
        </Col>
      </Row>

    )
  }
})
