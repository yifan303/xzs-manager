import React from 'react'
import ajax from 'widget/ajax'
import {Card,Button,Select,InputNumber,Popconfirm,message,Input} from 'antd'
import styles from './screen.less'
import Upload from 'widget/upload'
import TButton from 'widget/button/throttle.js'

const profix = '//img.xianzaishi.com/'
const protocol = /https?\:/g

var getDeviceName = (device) => {
  const deviceMap = {
    1010:"立柱1",
    1011:"立柱2",
    1012:"立柱3",
    1013:"立柱4",
    1000:"蔬菜1",
    1001:"蔬菜2",
    1002:"蔬菜3",
    1003:"蔬菜4",
    1020:"海鲜",
    1030:"名当1",
    1031:"名当2",
    1040:"水吧1",
    1041:"水吧2",
    1050:"现金收银台"
  }
  return deviceMap[device]||('未命名'+device)
}

const modelMap = [
  "Accordion","Background2Foreground","CubeIn","DepthPage",
  "Fade","FlipHorizontal","FlipPage","Foreground2Background",
  "RotateDown","RotateUp","Stack","Tablet","ZoomIn",
  "ZoomOutSlide","ZoomOut"
]

var parseConfig = item => {
  var {picUrl} = item
  var pics = picUrl?picUrl.split(';'):[]
  item.dist = pics.map(pic=>(profix+pic))
  return item
}

export default React.createClass({
  getInitialState(){
    return {
      config:[]
    }
  },
  componentDidMount(){
    var promise = ajax({
      url:'/screen/list'
    })
    promise.done(result=>{
      if(result.success){
        var {configInfo} = result.module
        var config = JSON.parse(configInfo)
        this.setState({
          config:config.map(parseConfig)
        })
      }
    })
  },
  deletePic(item,index){
    var {dist} = item
    dist.splice(index,1)
    this.forceUpdate()
  },
  changeModel(item,value){
    item.model = value
    this.forceUpdate()
  },
  changeFrequency(item,value){
    item.frequency = value
    this.forceUpdate()
  },
  changeTitle(item,e){
    item.title = e.target.value
    this.forceUpdate()
  },
  upload(item,value){
    item.dist.push(value)
    this.forceUpdate()
  },
  update(result){
    var item = Object.assign({},result)
    if(!item.frequency){
      item.frequency = 1000
    }
    if(!item.model){
      item.model = 'Fade'
    }
    if(item.dist){
      item.picUrl = item.dist.map(pic=>pic.replace(profix,'').replace(protocol,'')).join(';')
      delete item.dist
    }
    if(item.temp){
      delete item.temp
    }
    item.version = parseInt(item.version||0) + 1
    var promise = ajax({
      url:'/screen/update',
      data:item
    })
    promise.done(result=>{
      if(result.success){
        this.setState({
          config:result.module.map(parseConfig)
        })
        message.info('投屏提交成功')
      }
    })
  },
  indexStore:{index:0,configIndex:0},
  drag(e,index,configIndex){
    this.indexStore = {index,configIndex}
  },
  drop(e,index,configIndex){
    var {config} = this.state
    var priIndex = this.indexStore.index
    var priConfigIndex = this.indexStore.configIndex
    if(configIndex!=priConfigIndex){
      return message.info('不在同一个类型的图片')
    }
    var conf = config[configIndex].dist
    var flag = conf[index]
    conf[index] = conf[priIndex]
    conf[priIndex] = flag
    this.forceUpdate()
  },
  delete(item){
    if(item.temp){
      this.setState({
        config:this.state.config.filter(c=>c.deviceNumber!=item.deviceNumber)
      })
      return
    }
    var promise = ajax({
      url:'/screen/delete',
      data:item
    })
    promise.then(result=>{
      if(result.success){
        this.setState({
          config:result.module.map(parseConfig)
        })
        message.info('投屏删除成功')
      }
    })
  },
  addConfig(){
    var {config} = this.state
    var deviceInitNumber = 1000
    var numbers = config.map(item=>parseInt(item.deviceNumber))

    while (numbers.indexOf(deviceInitNumber)>-1) {
      deviceInitNumber++
    }

    config.push({
      "deviceNumber":deviceInitNumber+'',
      "picUrl":"",
      "direction":"b",
      "model":"Fade",
      "frequency":30000,
      "picList":null,
      "dist":[],
      "title":"未定义",
      "version":0,
      "temp":true
    })
    this.forceUpdate()
  },
  render(){
    var {config} = this.state
    return (
      <div>
        {config.map((item,configIndex)=>(
          <div key={item.deviceNumber} className={styles.card}>
            <Card
              title={item.title+'-'+item.deviceNumber}
              extra={(
                <span>
                  <Popconfirm title="确认删除该投屏吗?" onConfirm={e=>this.delete(item)}>
                    <Button type="primary" size="small">删除</Button>
                  </Popconfirm>
                  {' '}
                  <TButton type="primary" size="small" onClick={e=>this.update(item)}>提交</TButton>
                </span>
              )}
            >
              <div className={styles.imgDiv}>
                {item.dist.map((pic,index)=>(
                  <div
                    draggable
                    className={styles.imgWrap}
                    key={pic}
                    onDrag={e=>this.drag(e,index,configIndex)}
                    onDrop={e=>this.drop(e,index,configIndex)}
                    onDragOver={e=>{e.preventDefault()}}
                  >
                    <img draggable={false}  src={pic} key={index} className={styles.img}/>
                    <a onClick={e=>this.deletePic(item,index)} title="删除" className={styles.delete}><i className="iconfont">&#xe6a6;</i></a>
                  </div>
                ))}
                <div className={styles.imgWrap}>
                  <Upload onChange={e=>this.upload(item,e.module)}/>
                </div>
              </div>
              <div className={styles.formDiv}>
                <label>标题 : </label>
                <div className={styles.split} />
                <Input value={item.title} className={styles.select} onChange={e=>this.changeTitle(item,e)}/>
                <div className={styles.split} />
                <label>切换方式 : </label>
                <Select
                  className={styles.select}
                  value={item.model}
                  onChange={e=>this.changeModel(item,e)}
                >
                  {modelMap.map(model=>(
                    <Select.Option key={model} value={model}>{model}</Select.Option>
                  ))}
                </Select>
                <div className={styles.split} />
                <label>频率 : </label>
                <InputNumber value={item.frequency} onChange={e=>this.changeFrequency(item,e)}/>
              </div>
            </Card>
          </div>
        ))}
        <div className={styles.submit}>
          <TButton type="primary" onClick={e=>this.addConfig()}>添加</TButton>
        </div>
      </div>
    )
  }
})
