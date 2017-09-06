import React from 'react'
import Preview from '../preview'
import request from 'widget/request'
import ajax from 'widget/ajax'
import {Tabs,Col,Row,message,Button} from 'antd'
import styles from './home.less'
import TButton from 'widget/button/throttle.js'

const PAGE_VERSION = '1000'
const versions = ['0','1','2.0','3.0','4.0','5.0']

// 5.0新增的模块
const banVersion = [27,28,29,15,30,31,32]
// 在旧版本中不可使用
const banVersionMap = {
  '0':banVersion,
  '1':banVersion,
  '2.0':banVersion,
  '3.0':banVersion,
  '4.0':banVersion,
  '5.0':[]
}

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
    var {version} = this.state
    if(parseInt(version)>4){
      return this.getNewModules()
    }
    return this.getOldModules()
  },
  getNewModules(){
    this.setState({modules:[]})
    var {version} = this.state
    var barPromise = ajax({
      url:"/requesthome/hometabbar",
      domain:'item',
      method:'post'
    })
    barPromise.then(result=>{
      if(result.success){
        var {modules} = this.state
        modules.unshift(result.module)
        this.setState({modules})
      }
    })

    var floorPromise = ajax({
      url:'/requesthome/home',
      domain:"item",
      method:'post',
      data:{
        pageId:this.props.pageId+'',
        version:parseInt(version),
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
  getOldModules(){
    var {version,list} = this.state
    this.setState({modules:[]})

    var floorPromise = request({
      url:'/requesthome/homepage',
      domain:'item',
      method:'post',
      data:{
        pageId:this.props.pageId+"",
        device:'h5',
        hasAllFloor:"true",
        version
      }
    })
    floorPromise.then(res=>{
      var result = JSON.parse(res)
      var {modules} = this.state
      if(result.success){
        this.setState({modules:modules.concat(result.module)})
      }
    })
    var modePromise = request({
      url:'/requesthome/homepage',
      domain:'item',
      method:'post',
      data:{
        pageId:this.props.pageId+"",
        device:'h5',
        hasAllFloor:"false",
        version
      }
    })
    modePromise.then(res=>{
      var result = JSON.parse(res)
      var {modules} = this.state
      if(result.success){
        this.setState({modules:result.module.concat(modules)})
      }
    })
  },
  getPreModules(){
    var getPromise = ()=>{
      var {list} = this.state
      return request({
        url:'/requesthome/homepageoptimization',
        domain:'item',
        method:'post',
        data:{
          pageId:this.props.pageId,
          stepIds:list.map(item=>parseInt(item.stepId))
            .sort(($1,$2)=>($2-$1))
            .filter((data,index)=>index<40)
            .join(',')
        }
      }).then(res=>{
        var result = JSON.parse(res)
        if(result.success){
          this.setState({preModule:result.module})
        }
      })
    }
    if(!this.state.list){
      var listPromise = request({
        url:'/activity/list'
      })
      listPromise.then(result=>{
        if(result.success){
          this.setState({
            list:(result.module||[]).filter(m=>m.pageId===parseInt(this.props.pageId))
          },()=>getPromise())
        }
      })
      return
    }
    getPromise()
  },
  componentDidMount(){
    this.getModules()
    this.getPreModules()
  },
  drop(e){
    var floorStr = e.nativeEvent.dataTransfer.getData('floor')
    if(!floorStr){
      return message.info('请拖动右侧模块放入')
    }
    var floor = JSON.parse(floorStr)
    var {version,modules} = this.state
    var banList = banVersionMap[version]||[]
    if(banList.indexOf(floor.stepType)>-1){
      return message.info('该版本不支持该模块')
    }
    modules.push(floor)
    this.setState({
      modules
    })
  },
  saveOrder(){
    var {modules,version} = this.state
    var promise = ajax({
      url:'/activity/updatepagesort',
      method:'post',
      data:{
        list:modules.filter(m=>m.stepType!=27).map(m=>m.stepId),
        version
      }
    })
    promise.then(result=>{
      if(result.success){
        message.info('保存顺序成功')
      }
    })
  },
  render(){
    var {modules,config,version,preModule} = this.state
    return (
      <Row>
        <Col span={12}>
          <div className={styles.tab}>
            <Tabs defaultActiveKey={version} onChange={version=>{
              this.setState({version},()=>{
                this.getModules()
              })
            }}>
              {versions.map(version=>(
                <Tabs.TabPane tab={"版本 : "+version} key={version}><span style={{display:'none'}}>1</span></Tabs.TabPane>
              ))}
            </Tabs>
          </div>
          <div onDragOver={e=>e.nativeEvent.preventDefault()} onDrop={e=>this.drop(e)}>
            <TButton type="primary" className={styles.save} onClick={e=>this.saveOrder()}>保存排序</TButton>
            <Preview
              pageId={this.props.pageId}
              modules={modules}
              onMove={(dix,current)=>{
                var {modules} = this.state
                var flag = current + dix
                if(flag<0||flag>modules.length){
                  return
                }
                var flagModule = modules[current]
                modules[current] = modules[flag]
                modules[flag] = flagModule
                this.setState({modules})
              }}
              onDel={(floor,index)=>{
                this.setState({
                  modules:modules.filter((m,mIndex)=>mIndex!==index)
                })
              }}
              onUpdate={e=>{
                this.setState({list:null},()=>{
                  this.getModules()
                  this.getPreModules()
                })
              }}
            />
          </div>
        </Col>
        <Col span={12}>
          <Preview
            pageId={this.props.pageId}
            modules={preModule}
            onUpdate={e=>{
              this.setState({list:null},()=>{
                this.getPreModules()
                this.getModules()
              })
            }}
            canAdd={true}
            canDrag={true}
          />
        </Col>
      </Row>

    )
  }
})
