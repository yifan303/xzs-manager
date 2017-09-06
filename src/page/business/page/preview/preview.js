import React from 'react'
import Slide from 'dwd-slide'
import styles from './preview.less'
import Pit from './pit'
import FivePit from './fivePit'
import parseBanner from './parseBanner.js'
import parseType from './getType.js'
import {getTarget} from './getType.js'
import Marquee from './marquee'
import Img from './image.js'
import Moment from 'moment'
import {
  DatePicker,Button,Modal,
  Form,Input,Select,
  Card,Icon,message,
  Popconfirm,Checkbox,TimePicker
} from 'antd'
import request from 'widget/request'
import login from 'widget/login'
import Upload from 'widget/upload'
import OnePit from './onePit'
import TwoPit from './twoPit'
import ScrollPit from './scrollPit'
import FourPit from './fourPit'
import CountPit from './countPit'
import Bar from './bar'
import Square from './square'
import TitlePic from './titlePic'
import Drink from './drink'
import CountList from './countList'
import Link from './link'
import Time from './time'
import CategoryValue from './category'

const ButtonGroup = Button.Group

var getType = mode => {
  return parseType(mode.stepType)
}

var space = () => (
  <div style={{height:10}}/>
)

var line = () => (
  <div style={{height:15,borderTop:'1px solid #eee'}}/>
)

var headSpaceType = {
  true:'是',
  false:'否'
}

// 用到kernelList的模块
const kernelVersion = [27,28,29,15,30,31]

var isArray = (list) => list&&typeof(list)==='object'&&list.length>0

export default React.createClass({
  getInitialState(){
    return {
      visible:false,
      step:null,
      stepType:[],
      picType:[]
    }
  },
  parseFloor(floor,index){
    if(getType(floor)==='bar'&&isArray(floor.kernelList)){
      return <Bar list={floor.kernelList}/>
    }
    if(getType(floor)==='banner'&&isArray(floor.picList)){
      return parseBanner(floor.picList[0])
    }
    if(getType(floor)==='goods'&&isArray(floor.items)){
      return (
        <Pit list={floor.items}/>
      )
    }
    if(getType(floor)==='fiveGood'&&isArray(floor.items)&&floor.items.length>4){
      return (
        <FivePit list={floor.items}/>
      )
    }
    // if(getType(floor)==='oneGood'&&isArray(floor.kernelList)){
    //   return (
    //     <OnePit list={floor.kernelList.map(kernel=>kernel.item)}  title={floor.title}/>
    //   )
    // }
    if(getType(floor)==='scrollGood'&&isArray(floor.items)){
      return (
        <ScrollPit list={floor.items} title={floor.title}/>
      )
    }
    if(getType(floor)==='fourGood'&&isArray(floor.items)&&isArray(floor.picList)){
      return (
        <FourPit list={floor.items} pic={floor.picList}/>
      )
    }
    if(getType(floor)==='countGood'&&isArray(floor.items)&&isArray(floor.picList)&&floor.picList.length>0){
      return (
        <CountPit list={floor.items} pic={floor.picList} end={floor.end}/>
      )
    }
    if(getType(floor)==='twoGood'&&isArray(floor.items)){
      return (
        <TwoPit list={floor.items}/>
      )
    }
    var {picList,catList,contentList} = floor
    var type = getType(floor)
    if(type === 'slide'&&isArray(picList)){
      var auto = picList.length>1
      return (
        <Slide
          auto={auto}
          width="10rem"
          height="4rem"
          during={5000}
          images={picList.map(config=>{
            var href = 'javascript:void(0)'
            var type = getTarget(config.targetType)
            if(type === 'detail'){
              href=`//m.xianzaishi.com/mobile/detail.html?id=${config.targetId}`
            }
            if(type === 'href'){
              href=config.targetId
            }
            return {
              src:config.picUrl,
              href
            }
          })}
        />
      )
    }

    if(type === 'category'&&isArray(catList)){
      return (
        <div className={styles.category+" clearfix"}>
          {catList.map((cat,cindex)=>{
            return (
              <a
                href={cat.jumpLink||`//m.xianzaishi.com/mobile/sub-cate.html?parentId=${cat.catId}`}
                key={cindex}
                className={styles.categoryItem}
              >
                <Img src={cat.picUrl}/>
                <span>{cat.catName}</span>
              </a>
            )
          })}
        </div>
      )
    }
    if(type === 'content'&&isArray(floor.contentList)){
      return (
        <div className={styles.marqueeWrap}>
          <img className={styles.marqueeImg} src={require('./xianshi.png')}/>
          <Marquee list={floor.contentList} />
        </div>
      )
    }
    if(type === 'contentList'&&isArray(floor.kernelList)){
      return (
        <div className={styles.marqueeWrap}>
          <img className={styles.marqueeImg} src={floor.picUrl||require('./xianshi.png')}/>
          <Marquee list={floor.kernelList} />
        </div>
      )
    }
    if(type === 'square'&&isArray(floor.kernelList)){
      return (
        <Square list={floor.kernelList}/>
      )
    }
    if(type === 'titlePic'){
      return (
        <TitlePic picUrl={floor.picUrl} title={floor.title}/>
      )
    }
    if(type === 'rowRoll'&&isArray(floor.items)){
      return (
        <Pit
          list={floor.items}
          style={{width:'10rem','overflowX':'scroll','whiteSpace':'nowrap'}}
          itemStyle={{float:'none',display:'inline-block'}}
        />
      )
    }
    if(type === 'drink'&&isArray(floor.kernelList)){
      return (
        <Drink
          list={floor.kernelList}
          picUrl={floor.picUrl}
        />
      )
    }
    if(type === 'oneGood'&&isArray(floor.kernelList)){
      return (
        <CountList list={floor.kernelList} end={(floor.time&&floor.time.end)||+new Date}/>
      )
    }
    return <div className={styles.holderFloor} key={index}></div>
  },
  componentDidMount(){

    // 废弃的楼层
    const failStep = ['18','19','11']

    // 选择楼层类型
    var stepPromise = request({
      url:'/activity/liststeptype',
      method:'post'
    })
    stepPromise.then(result=>{
      if(result.success){
        this.setState({
          stepType:(result.module||[]).reduceRight(($1,$2)=>{
            if(failStep.indexOf($2[0])===-1){
              $1[$2[0]]=$2[1]
            }
            return $1
          },{})
        })
      }
    })

    // 获取图片类型
    var picPromise = request({
      url:'/activity/listpictype',
      method:'post'
    })
    picPromise.then(result=>{
      if(result.success){
        this.setState({
          picType:(result.module||[]).reduceRight(($1,$2)=>{
            $1[$2[0]]=$2[1]
            return $1
          },{})
        })
      }
    })

  },
  openModal(module){
    var promise = request({
      url:'/activity/querystep',
      data:{
        pageId:parseInt(this.props.pageId),
        stepId:module.stepId
      }
    })
    promise.then(result=>{
      if(result.success){
        this.setState({
          visible:true,
          step:result.module
        })
      }
    })
  },
  // 提交修改楼层
  submit(){
    var step = Object.assign({},this.state.step)
    step.pageId=this.props.pageId

    // time字段 空值变为null
    var {time,kernelList} = step
    if(time&&!time.begin&&!time.end){
      step.time = null
    }
    if(kernelList){
      for(var i=0;i<kernelList.length;i++){
        var item = kernelList[i]
        if(item.time&&!item.time.begin&&!item.time.end){
          item.time = null
        }
      }
    }

    var promise = request({
      url:'/activity/addstep',
      method:'post',
      data:step
    })
    promise.then(result=>{
      if(result.success){
        message.info('更新楼层成功')
        this.props.onUpdate&&this.props.onUpdate()
        this.setState({visible:false})
      }
    })
  },

  // 回滚楼层
  reset(floor){
    var promise = request({
      url:'/activity/reset',
      method:'post',
      data:{
        pageId:parseInt(this.props.pageId),
        stepId:floor.stepId
      }
    })
    promise.then(result=>{
      if(result.success){
        this.props.onUpdate&&this.props.onUpdate()
        message.info('楼层回滚成功')
      }
    })
  },
  addMode(){
    this.setState({
      visible:true,
      step:{
        "picList":null,
        "title":'',
        "itemList":null,
        "stepId":'0',
        "stepType":10,
        "time":null,
        "sortId":0,
        "pageId":this.props.pageId+''
      }
    })
  },
  dragStart(e,floor){
    var {nativeEvent} = e
    nativeEvent.dataTransfer.setData("floor",JSON.stringify(floor))
  },
  delFloor(floor,index){
    this.props.onDel(floor,index)
  },
  render(){
    var {modules,config,canAdd,canDrag,onDel,onMove} = this.props
    var {visible,step,stepType,picType} = this.state
    var isNewStepType = step&&kernelVersion.indexOf(step.stepType)>-1
    return (
      <div style={{position:'relative'}}>
        {canAdd&&(
          <div className={styles.addWrap}>
            <Button type="primary" className={styles.add} onClick={e=>this.addMode()}>添加模块</Button>
          </div>
        )}
        <div className={styles.wrap}>
          <Modal
            width={600}
            visible={visible}
            title={`页面名称 : ${step&&step.title} ｜ 楼层ID : ${step&&step.stepId}`}
            onOk={e=>{
              this.submit()
            }}
            onCancel={e=>{
              this.setState({visible:false})
            }}
          >
            {step&&(
              <Form>
                <Form.Item label="标题">
                  <Input value={step.title} onChange={e=>{
                    var step = Object.assign({},this.state.step)
                    step.title=e.target.value
                    this.setState({step})
                  }}/>
                </Form.Item>
                <Form.Item label="选择楼层类型">
                  <Select
                    style={{width:150}}
                    value={stepType[step.stepType]}
                    onChange={e=>{
                      var step = Object.assign({},this.state.step)
                      if(step.stepId!=='0'){
                        message.info('不可更改楼层类型')
                        return
                      }
                      step.stepType = parseInt(e)
                      this.setState({step})
                    }}
                  >
                    {Object.keys(stepType).map(type=>(
                      <Select.Option key={type} value={type}>{stepType[type]}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="楼层排序">
                  <Input value={step.sortId} onChange={e=>{
                    var step = Object.assign({},this.state.step)
                    step.sortId=e.target.value
                    this.setState({step})
                  }}/>
                </Form.Item>
                <Link
                  value={Object.assign({},step.link,{picUrl:step.picUrl})}
                  picType={picType}
                  onChange={e=>{
                    var {url,title,type,picUrl} = e
                    step.link = {url,title,type}
                    step.picUrl = picUrl
                    this.forceUpdate()
                  }
                }/>
                <Form.Item label="是否有上边距">
                  <Select
                    style={{width:150}}
                    value={headSpaceType[step.headSpace]||'false'}
                    onChange={e=>{
                      var step = Object.assign({},this.state.step)
                      step.headSpace = e === 'true'||e === true
                      this.setState({step})
                    }}
                  >
                    {Object.keys(headSpaceType).map(type=>(
                      <Select.Option key={type} value={type}>{headSpaceType[type]}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                {['oneGood','drink'].indexOf(getType(step))>-1&&(
                  <Form.Item label="起止时间">
                    <Time value={step.time} onChange={e=>{
                      step.time = e
                      this.setState({step})
                    }}/>
                  </Form.Item>
                )}
                {getType(step)==='countGood'&&(
                  <Form.Item label="起止时间">
                    <DatePicker.RangePicker
                      format="YYYY-MM-DD HH:mm:ss"
                      showTime={true}
                      allowClear={true}
                      value={[
                        step.begin?Moment(step.begin):undefined,
                        step.end?Moment(step.end):undefined
                      ]}
                      onChange={e=>{
                        var step = Object.assign({},this.state.step)
                        if(e[0]){
                          step.begin = e[0].toDate().getTime()
                        }else{
                          step.begin = null
                        }
                        if(e[1]){
                          step.end = e[1].toDate().getTime()
                        }else{
                          step.end = null
                        }
                        this.setState({step})
                      }}
                    />
                  </Form.Item>
                )}
                <Card
                  title="商品id"
                  style={{width:'100%','display':isNewStepType?'none':'block'}}
                >
                  {(step.itemList||[]).map((pic,index)=>(
                    <div key={index} className={"ant-form ant-form-inline "+styles.pic}>
                      <Form.Item label="商品id">
                        <Input
                          style={{width:100}}
                          value={pic.itemId}
                          onChange={e=>{
                            pic.itemId = e.target.value
                            this.setState({step})
                          }}/>
                        {' '}
                        <Button type="primary" size="default" onClick={e=>{
                          step.itemList.splice(index,1)
                          this.setState({step})
                        }}>删除</Button>
                      </Form.Item>
                      <div style={{marginTop:5}}>
                        {pic.picUrl&&<img className={styles.picImg} src={pic.picUrl} />}
                        <Upload onChange={response=>{
                          if(response.success){
                            pic.picUrl = response.module
                            this.setState({step})
                          }else{
                            message.info(response.errorMsg)
                          }
                        }}/>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={e=>{
                      if(!step.itemList){
                        step.itemList = []
                      }
                      step.itemList.push({
                        picUrl:'',
                        itemId:''
                      })
                      this.setState({step})
                    }}
                    type="primary"
                  >添加商品id</Button>
                </Card>
                <div style={{height:20}}>{' '}</div>
                <Card
                  title="图片"
                  style={{width:'100%','display':isNewStepType?'none':'block'}}
                >
                  {(step.picList||[]).map((pic,index)=>(
                    <div key={index} className={"ant-form ant-form-inline "+styles.pic}>
                      <Form.Item label="图片">
                        <Select
                          value={picType[pic.targetType]}
                          style={{width:150}}
                          onChange={e=>{
                            pic.targetType = e
                            this.setState({step})
                          }}
                        >
                          {Object.keys(picType).map(type=>(
                            <Select.Option key={type} value={type}>{picType[type]}</Select.Option>
                          ))}
                        </Select>
                        {' '}
                        <Input
                          value={pic.targetId}
                          style={{width:100}}
                          placeholder="targetId"
                          onChange={e=>{
                            pic.targetId = e.target.value
                            this.setState({step})
                          }}
                        />
                        {' '}
                        <Input
                          style={{width:100}}
                          placeholder="titleInfo"
                          value={pic.titleInfo}
                          onChange={e=>{
                            pic.titleInfo = e.target.value
                            this.setState({step})
                          }}
                        />
                        {' '}
                        <Button type="primary" size="default" onClick={e=>{
                          step.picList.splice(index,1)
                          this.setState({step})
                        }}>删除</Button>
                      </Form.Item>
                      <div style={{marginTop:5}}>
                        {pic.picUrl&&<img className={styles.picImg} src={pic.picUrl} />}
                        <Upload onChange={response=>{
                          if(response.success){
                            pic.picUrl = response.module
                            this.setState({step})
                          }else{
                            message.info(response.errorMsg)
                          }
                        }}/>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={e=>{
                      if(!step.picList){
                        step.picList = []
                      }
                      step.picList.push({
                        picUrl:'',
                        targetId:'',
                        targetType:0,
                        titleInfo:''
                      })
                      this.setState({step})
                    }}
                    type="primary"
                  >添加图片</Button>
                </Card>
                <div style={{height:20}}>{' '}</div>
                <Card
                  title="其他"
                  style={{width:'100%','display':isNewStepType?'block':'none'}}
                >
                  {(step.kernelList||[]).map((item,index)=>(
                    <div key={index} className={"ant-form ant-form-inline "+styles.pic}>
                      <Button
                        size="small"
                        type="primary"
                        className={styles.delNewModule}
                        onClick={e=>{
                          (step.kernelList||[]).splice(index,1)
                          this.setState({step})
                        }}
                      >删除</Button>
                      <div>
                        <Form.Item label="是否设置模块独立id">
                          <Checkbox
                            onChange={e=>{
                              if(!e.target.checked){
                                item.id = null
                              }else{
                                item.id = 255
                              }
                              this.setState({step})
                            }}
                            checked={item.id!==null}
                          />
                          {' '}
                          {item.id!==null&&(
                            <Input
                              type="text"
                              value={item.id}
                              style={{width:60}}
                              onChange={e=>{
                                item.id = parseInt(e.target.value)||0
                                this.setState({step})
                              }}
                            />
                          )}
                        </Form.Item>
                      </div>
                      {space()}
                      <div>
                        <Form.Item label="是否绑定商品ID">
                          <Checkbox
                            onChange={e=>{
                              if(!e.target.checked){
                                item.item = null
                              }else{
                                item.item = ''
                              }
                              this.setState({step})
                            }}
                            checked={item.item!==null}
                          />
                          {item.item!==null&&(<Input
                            type="text"
                            value={item.item&&item.item.itemId}
                            style={{width:60}}
                            onChange={e=>{
                              item.item = item.item||{}
                              item.item.itemId = parseInt(e.target.value)||''
                              this.setState({step})
                            }}
                          />)}
                          {' '}
                          {item.item!==null&&(
                            <div className={styles.goodDiv}>
                              {' '}
                              {item.item&&item.item.picUrl&&<img className={styles.picImg} src={item.item.picUrl} />}
                              {' '}
                              <Upload onChange={e=>{
                                item.item = item.item||{}
                                item.item.picUrl = e.module
                                this.setState({step})
                              }} />
                            </div>
                          )}
                        </Form.Item>
                      </div>
                      {space()}
                      <div>
                        <Form.Item label="模块名称">
                          <Input
                            type="text"
                            value={item.name}
                            onChange={e=>{
                              item.name = e.target.value
                              this.setState({step})
                            }}
                          />
                        </Form.Item>
                      </div>
                      {space()}
                      {['oneGood','drink'].indexOf(getType(step))>-1&&(
                        <div>
                          {line()}
                          <Form.Item label="时间区间">
                            <Time
                              value={item.time}
                              onChange={e=>{
                                item.time = e
                                this.setState({step})
                              }}
                              />
                          </Form.Item>
                        </div>
                      )}
                      {space()}
                      {line()}
                      <Link
                        picType={picType}
                        value={Object.assign({},item.link,{picUrl:item.picUrl})}
                        onChange={e=>{
                          var {url,title,type,picUrl} = e
                          item.link = {url,title,type}
                          item.picUrl = picUrl
                          this.setState({step})
                        }}
                      />
                    </div>
                  ))}
                  <Button
                    onClick={e=>{
                      if(!step.kernelList){
                        step.kernelList = []
                      }
                      step.kernelList.push({
                        id:null,
                        item:null,
                        link:{
                          type:5,
                          url:'',
                          title:""
                        },
                        name:"",
                        picUrl:null,
                        time:null
                      })
                      this.setState({step})
                    }}
                    type="primary"
                  >添加</Button>
                </Card>
              </Form>
            )}
          </Modal>

          <div className={styles.div}>
            {modules.map((floor,index)=>(
              <div className={styles.preview} key={index} draggable={true} onDragStart={e=>this.dragStart(e,floor)}>
                <div className={styles.buttonGroup}>
                  {onMove&&index!==modules.length&&(
                    <Button type="primary" size="small" className="iconfont" onClick={e=>onMove(1,index)}>&#xe703;</Button>
                  )}
                  {' '}
                  {onMove&&index!==0&&(
                    <Button type="primary" size="small" className="iconfont" onClick={e=>onMove(-1,index)}>&#xe69e;</Button>
                  )}
                  {' '}
                  {onDel&&(
                    <Button type="primary" size="small" className="iconfont" onClick={e=>this.delFloor(floor,index)}>&#xe6b4;</Button>
                  )}
                  {' '}
                  {canDrag&&(<Button type="primary" size="small" style={{cursor:'move'}}>拖动</Button>)}
                  {' '}
                  <Button type="primary" size="small" className="iconfont" onClick={e=>this.openModal(floor)}>&#xe649;</Button>
                  {' '}
                  <Popconfirm title="确认回滚吗" onConfirm={e=>this.reset(floor)}>
                    <Button type="primary" size="small" className="iconfont" title="回滚">&#xe71f;</Button>
                  </Popconfirm>
                </div>
                {floor.headSpace==true&&(
                  <div style={{width:"100%",height:".2rem"}}></div>
                )}
                <div>
                  {this.parseFloor(floor)}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    )
  }
})
