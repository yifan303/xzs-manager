import React from 'react'
import {Table,Button,message,DatePicker,InputNumber,Modal,Tooltip} from 'antd'
import moment from 'moment'
import Search from 'widget/search'
import req from 'widget/request'
import ajax from 'widget/ajax'
import date from 'widget/util/date.js'
import myStyle from './myStyle.less'
import Chart from 'widget/chart'
import parseData from './parseData.js'

const {RangePicker}=DatePicker
export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      pagination:{},
      visible: false,
      recorddata:{},

      //查询变价计划
      show:false,
      queryflag:1,
      pagPricePlan:{},
      dataPricePlan:null,

      //按钮判断
      Isbtn3:true,
      Isbtn4:true,
      Isbtn5:true,
      Isbtn6:true,
      //搜索框值对
      searchValue:{},
      currentpage:0,
      //提交变价计划
      commitPriceSuccess:false,
      urgentCommitPriceSuccess:false
    }
  },
  getPlan(page,search){
    var page=page-1
    var data={
      "skuName":search.skuName,
      "beginItemCode":search.beginItemCode,
      "endItemCode":search.endItemCode,
      "type":search.type,
      "pageSize":10,
      "pageNum":page
    }
    var promise=ajax({
      url:'/skurelation/skurelation',
      "data":data
    })
    promise.then(e=>{
      if(e.success){
        var module=e.module
        this.setState({
          dataSource:module,
          pagination:{
            total:e.totalNum,
            current:e.currentPageNum+1
          }
        })
      }
    })

  },
  queryPricePlan(value){
    var promise=ajax({
      url:'/skurelation/skurelationSchedule',
      "data":{
        "id":value.id+"",
        "type":value.type,
      }
    })
    promise.then(e=>{
      if(e.success){
        var module=e.module
        this.setState({
          dataPricePlan:module
        })
      }
    })
  },
  //变价计划
  //采购
  updateskurelationBuySchedule (value){
    var promise=ajax({
      url:'/skurelation/updateskurelationBuySchedule',
      "data":value
    })
    promise.then(e=>{
      if(e.success){
        message.success("采购计划提交成功")
        this.setState({commitPriceSuccess:true})
      }else{this.setState({commitPriceSuccess:false})}
    })
  },
  //销售
  updateskurelationSchedule (value){
    var promise=ajax({
      url:'/skurelation/updateskurelationSchedule',
      "data":value
    })
    promise.then(e=>{
      if(e.success){
        message.success("销售计划提交成功")
        this.setState({commitPriceSuccess:true})
      }else{this.setState({commitPriceSuccess:false})}
    })
  },
  //紧急采购
  emergencyupdatebuyskurelation(value){
    var promise=ajax({
      url:'/skurelation/emergencyupdatebuyskurelation',
      "data":value
    })
    promise.then(e=>{
      if(e.success){
        message.success("采购计划紧急提交成功")
        this.setState({urgentCommitPriceSuccess:true})
        this.getPlan(this.state.currentpage,this.state.searchValue)
      }else{this.setState({urgentCommitPriceSuccess:false})}
    })
  },
  //紧急销售
  emergencyupdateskurelation(value){
    var promise=ajax({
      url:'/skurelation/emergencyupdateskurelation',
      "data":value
    })
    promise.then(e=>{
      if(e.success){
        message.success("销售计划紧急提交成功")
        this.setState({urgentCommitPriceSuccess:true})
        this.getPlan(this.state.currentpage,this.state.searchValue)
      }else{this.setState({urgentCommitPriceSuccess:false})}
    })
  },
  modal(record){
    var self=this;
    return self.setState({
      recorddata:Object.assign({},record),
      salePrice:record.salePrice,
      buyPrice:record.packageTotalCost,
      unitStr:record.saleUnit.unitStr,
      salePriceOfbtn:record.salePrice,
      salePriceCompare:record.salePrice,
      packageUnitOfbtn:record.packageUnitCost,
      packageCompare:record.packageUnitCost,
      visible:true,
      Isbtn3:true,
      Isbtn4:true,
      Isbtn5:true,
      Isbtn6:true
    })
  },
  limitlength(sum){
    sum = parseFloat(sum)
    return sum.toFixed(2)
  },
  componentDidMount(){
    this.getPlan(1,{})
  },
  render(){
    var self=this;
    var commitdata=this.state.recorddata
    var {dataSource,pagination,recorddata,unitStr,type,dataPricePlan,queryflag,salePrice,buyPrice,
      commitPriceSuccess,urgentCommitPriceSuccess,salePriceOfbtn,packageUnitOfbtn,packageCompare,salePriceCompare}=this.state

    if(type=="1"){commitdata.discount=true}
    pagination = Object.assign({},pagination,{
      onChange: (current) => {
        this.setState({currentpage:current})
        this.getPlan(current,this.state.searchValue)
      }
    });
    var salewarn=false
    var dstart=new Date(recorddata.saleStartTime);
    var dend=new Date(recorddata.saleEndTime);
    if(parseInt(dstart.getHours())>8&&parseInt(dstart.getHours())<22 || parseInt(dend.getHours())>8&&parseInt(dend.getHours())<22)
    {
      salewarn=true
    }else{
      salewarn=false
    }
    const columns=[{
      title:'商品货号',
      key:'pskuId',
      dataIndex:'pskuId'
    },{
      title:'销售货号',
      key:'cskuId',
      dataIndex:'cskuId'
    },{
      title:'商品名称',
      key:'title',
      dataIndex:'title'
    },{
      title:'采购成本',
      key:'packageTotalCost',
      render:record=>{
        return (record.packageTotalCost+"元/箱")
      }
    },{
      title:'箱规',
      key:'buyPackageUnit.unitStr',
      render:record=>{
        return record.packageUnitSize +record.saleUnit.unitStr
      }
    },{
      title:'采购生效/截止时间',
      key:'buyStartTime',
      render:(e,record,index)=>{
        var buyStartTime=date.parseTime(record.buyStartTime)
        var buyEndTime=date.parseTime(record.buyEndTime)
        return (<div><p>{buyStartTime}</p><p>{buyEndTime}</p></div>)
      }
    },{
      title:'销售成本 ',
      key:'packageUnitCost',
      render:record=>{
        return record.packageUnitCost+"元/"+record.saleUnit.unitStr
      }
    },{
      title:'销售价格',
      key:'salePrice',render:record=>{
        return(record.salePrice+"元/"+record.saleUnit.unitStr)
      }
    },{
      title:'平均移动成本',
      key:'avgCost',
      dataIndex:'null'
    },{
      title:'销售生效/截止时间',
      key:'saleStartTime',
      render:(e,record,index)=>{
        var saleStartTime=date.parseTime(record.saleStartTime)
        var saleEndTime=date.parseTime(record.saleEndTime)
        return (<div><p>{saleStartTime}</p><p>{saleEndTime}</p></div>)
      }
    },{
      title:'毛利',
      key:'grossMargin',
      dataIndex:'grossMargin'
    },{
      title:'操作',
      key:'skuCode',
      fixed: 'right',
      width:80,
      render:record=>{
        return (
          <Button type="primary" size="small" onClick={e=>{
            this.setState({
              randomKey:record.id
            })
            this.modal(record)
          }} href="javascript:void(0);">修改</Button>
        )
      }
    }

    ];
    const columnsPrice1=[{
        title:'整箱成本',
        key:'boxCostYuan',
        render:record=>{
          return (record.boxCostYuan+"元/箱")
        }
      },{
        title:'单品价格',
        key:'bPriceYuan',
        render:record=>{return (record.bPriceYuan+"元/"+unitStr)}
      },{
        title:'采购生效/截止时间',
        key:'buyStart',
        render:(e,record,index)=>{
          var buyStartTime=date.parseTime(record.buyStart)
          var buyEndTime=date.parseTime(record.buyEnd)
          return (<div><p>{buyStartTime}</p><p>{buyEndTime}</p></div>)
        }
      }
    ];
    const columnsPrice2=[{
        title:'销售价格',
        key:'priceYuan',
        render:record=>{return (record.priceYuan+"元/"+unitStr)}
      },{
        title:'销售生效/截止时间',
        key:'saleEnd',
        render:(e,record,index)=>{
          var saleStartTime=date.parseTime(record.saleStart)
          var saleEndTime=date.parseTime(record.saleEnd)
          return (<div><p>{saleStartTime}</p><p>{saleEndTime}</p></div>)
        }
      }
    ];

    return (
      <div>
        <Modal
          key={this.state.randomKey}
          title={<div>
            <span>商品货号:{recorddata.pskuId}</span>
            {recorddata.discount&&
            <span style={{color:"red"}}>(优惠变价)</span>}
            {!recorddata.discount&&
            <span style={{color:"red"}}>(普通变价)</span>}
          </div>}
          visible={this.state.visible}
          onCancel={e=>this.setState({visible:false})}
          width={"86%"}
          afterClose={e=>this.setState({recorddata:{}})}
          footer={[
            <Button key="btn1" type="primary" onClick={e=>{
              this.queryPricePlan({"id":recorddata.id,"type":"0"})
              this.setState({show:true,queryflag:true})
            }}>查询采购计划</Button>,
            <Button key="btn2" type="primary" onClick={e=>{
              this.queryPricePlan({"id":recorddata.id,"type":"1"})
              this.setState({show:true,queryflag:false})
            }}>查询销售计划</Button>,

            <Button key="btn3" type="primary" disabled={this.state.Isbtn3} onClick={e=>{
              Modal.confirm({
                title: '请注意(无法预先检测优惠价格是否低于采购价格)',
                content: <div>
                  <p>采购成本:{packageUnitOfbtn+"元/"+unitStr}</p>
                  <p>采购生效时间:{date.parseTime(commitdata.buyStartTime)}</p>
                  <p>采购截止时间:{date.parseTime(commitdata.buyEndTime)}</p>
                </div>,
                cancelText: '取消',
                okText:'确认',
                maskClosable:true,
                onOk:e=>{
                  commitdata.packageUnitCost=packageUnitOfbtn;
                  commitdata.salePrice=this.state.salePrice;
                  commitdata.buyUpdate=true
                  this.updateskurelationBuySchedule(commitdata)
                  var resolve=this.setState({visible:false})
                  return new Promise((resolve, reject) => {
                    setTimeout(commitPriceSuccess ? resolve: reject, 500);
                  }).catch(() => null);
                }
              });
            }}>提交采购计划</Button>,
            <Button key="btn5" type="primary" disabled={this.state.Isbtn5|true} onClick={e=>{
              Modal.confirm({
                title: '变价操作将同步优惠价格信息',
                content: <div>
                  <p>采购成本:{packageUnitOfbtn+"元/"+unitStr}</p>
                  <p>采购生效时间:{date.parseTime(commitdata.buyStartTime)}</p>
                  <p>采购截止时间:{date.parseTime(commitdata.buyEndTime)}</p>
                </div>,
                cancelText: '取消',
                okText:'确认',
                maskClosable:true,
                onOk:e=>{
                  commitdata.buyStartTime=date.now2Month().startTime
                  commitdata.buyEndTime=date.now2Month().endTime
                  commitdata.packageUnitCost=packageUnitOfbtn;
                  commitdata.salePrice=this.state.salePrice;
                  commitdata.buyUpdate=true;
                  this.emergencyupdatebuyskurelation(commitdata);
                  var resolve=this.setState({visible:false})
                  return new Promise((resolve, reject) => {
                    setTimeout(urgentCommitPriceSuccess ? resolve: reject, 500);
                  }).catch(() => null);
                }
              });
            }}>紧急提交采购</Button>,
            <Button key="btn4" type="primary" disabled={this.state.Isbtn4} onClick={e=>{
              Modal.confirm({
                title: '请注意(无法预先检测优惠价格是否低于采购价格)',
                content: <div>
                  {salewarn&&<p style={{color:"red"}}>所选时间是营业时间,是否继续变价?</p>}
                  <p>销售价格:{salePriceOfbtn+"元/"+unitStr}</p>
                  <p>销售生效时间:{date.parseTime(commitdata.saleStartTime)}</p>
                  <p>销售截止时间:{date.parseTime(commitdata.saleEndTime)}</p>
                </div>,
                cancelText: '取消',
                okText:'确认',
                maskClosable:true,
                onOk:e=>{
                  commitdata.salePrice=salePriceOfbtn;
                  commitdata.packageUnitCost=this.state.buyPrice
                  commitdata.saleUpdate=true
                  this.updateskurelationSchedule(commitdata)
                  var resolve=this.setState({visible:false})
                  return new Promise((resolve, reject) => {
                    setTimeout(commitPriceSuccess ? resolve: reject, 500);
                  }).catch(() => null);
                }
              });
            }}>提交销售计划</Button>,
            <Button key="btn6" type="primary" disabled={this.state.Isbtn6} onClick={e=>{
              Modal.confirm({
                title: '变价操作将同步优惠价格信息',
                content: <div>
                  {date.now2Month().warn&&<p style={{color:"red"}}>现在是营业时间,是否继续变价?</p>}
                  <p>销售价格:{salePriceOfbtn+"元/"+unitStr}</p>
                  <p>销售生效时间:{date.parseTime(commitdata.saleStartTime)}</p>
                  <p>销售截止时间:{date.parseTime(commitdata.saleEndTime)}</p>
                </div>,
                cancelText: '取消',
                okText:'确认',
                maskClosable:true,
                onOk:e=>{
                  commitdata.saleStartTime=date.now2Month().startTime
                  commitdata.saleEndTime=date.now2Month().endTime
                  commitdata.salePrice=salePriceOfbtn
                  commitdata.packageUnitCost=this.state.buyPrice
                  commitdata.saleUpdate=true
                  this.emergencyupdateskurelation(commitdata)
                  var resolve=this.setState({visible:false})
                  return new Promise((resolve, reject) => {
                    setTimeout(urgentCommitPriceSuccess ? resolve: reject, 500);
                  }).catch(() => null);
                }
              });
            }}>紧急提交销售</Button>
          ]} >
          <ul className={myStyle.sty}>
            <li>
              <span>采购成本:</span>
              <InputNumber min={0}onChange={e=>{
                function pricefollow(e){
                  var e=parseFloat(e);
                  var packageTotalCost=e*parseInt(recorddata.packageUnitSize);
                  commitdata.packageTotalCost=packageTotalCost;
                  self.setState({packageUnitOfbtn:e})
                }
                if(e!=packageCompare){
                  pricefollow(e)
                  this.setState({Isbtn3:false,Isbtn5:false})
                }else{
                  pricefollow(e)
                  this.setState({Isbtn3:true,Isbtn5:true})
                }
                recorddata.packageUnitCost = e
                this.setState({recorddata:Object.assign({},recorddata)})
              }}
              value={recorddata.packageUnitCost}
              />
              <span>{" 元/"+unitStr}</span>
              <span style={{marginLeft:"20px"}}>{"整箱采购成本："+ this.limitlength(commitdata.packageTotalCost)+"元/箱"}</span>
              <span style={{marginLeft:"20px"}}>{"箱规："+recorddata.packageUnitSize+unitStr+"/箱"}</span>
              <span style={{marginLeft:"20px"}}>采购生效时间:</span>              
              <DatePicker
			          showTime
			          format="YYYY-MM-DD HH:mm:ss"
			          value={recorddata.buyStartTime?moment(recorddata.buyStartTime):null}
			          placeholder="startTime"
			          onChange={e=>{
			          	e=e? e:{}
                  if(recorddata.buyStartTime==Date.parse(e._d)){
                    this.setState({Isbtn3:true,Isbtn5:true})
                  }else{
                    this.setState({Isbtn3:false,Isbtn5:false})
                  }
                  commitdata.buyStartTime= Date.parse(e._d);
                  this.setState({recorddata:Object.assign({},recorddata)})
                }}
			        />
              <span style={{marginLeft:"20px"}}>采购截止时间:</span>
			        <DatePicker
			          showTime
			          format="YYYY-MM-DD HH:mm:ss"
			          value={recorddata.buyEndTime?moment(recorddata.buyEndTime):null}
			          placeholder="endTime"
			          onChange={e=>{
			          	e=e? e:{}
                  if(recorddata.buyEndTime==Date.parse(e._d)){
                    this.setState({Isbtn3:true,Isbtn5:true})
                  }else{
                    this.setState({Isbtn3:false,Isbtn5:false})
                  }
                  commitdata.buyEndTime= Date.parse(e._d);
                  this.setState({recorddata:Object.assign({},recorddata)})
                }}
			        />
            </li>

            <li>
              <span>销售价格:</span>
              <InputNumber min={0}
                value={recorddata.salePrice}
                onChange={e=>{
                  if(e!=salePriceCompare){
                    this.setState({Isbtn4:false,Isbtn6:false,salePriceOfbtn:e})
                  }else{this.setState({Isbtn4:true,Isbtn6:true,salePriceOfbtn:e})}
                  recorddata.salePrice = e
                  this.setState({recorddata:Object.assign({},recorddata)})
                }}
              />
              <span>{" 元/"+unitStr}</span>
              <span style={{marginLeft:"20px"}}>销售生效时间:</span>
              <DatePicker
			          showTime
			          format="YYYY-MM-DD HH:mm:ss"
			          value={recorddata.saleStartTime?moment(recorddata.saleStartTime):null}
			          placeholder="startTime"
			          onChange={e=>{
			          	e=e? e:{}
                  if(recorddata.saleStartTime==Date.parse(e._d)){
                    this.setState({Isbtn4:true,Isbtn6:true})
                  }else{
                    this.setState({Isbtn4:false,Isbtn6:false})
                  }
                  commitdata.saleStartTime= Date.parse(e._d);
                  this.setState({recorddata:Object.assign({},recorddata)})
                }}
			        />
              <span style={{marginLeft:"20px"}}>销售截止时间:</span>
			        <DatePicker
			          showTime
			          format="YYYY-MM-DD HH:mm:ss"
			          value={recorddata.saleEndTime?moment(recorddata.saleEndTime):null}
			          placeholder="endTime"
			          onChange={e=>{
			          	e=e? e:{}
                  if(recorddata.saleEndTime==Date.parse(e._d)){
                    this.setState({Isbtn4:true,Isbtn6:true})
                  }else{
                    this.setState({Isbtn4:false,Isbtn6:false})
                  }
                  commitdata.saleEndTime= Date.parse(e._d);
                  this.setState({recorddata:Object.assign({},recorddata)})
                }}
			        />
            </li>
          </ul>
        </Modal>
        <Modal
          key={recorddata.pskuId}
          title={null}
          visible={this.state.show}
          onOk={e=>this.setState({show:false})}
          onCancel={e=>this.setState({show:false})}
          afterClose={e=>{
            this.setState({
              dataPricePlan:null
            })
          }}
          width={"86%"} >
            <p style={{marginBottom:"20px",fontSize:"14px",fontWeight:"700"}}>{"商品货号："+recorddata.pskuId}</p>

            {dataPricePlan&&dataPricePlan.length>0&&(
              <Chart
                data={
                  {
                    x: 'x',
                    columns:parseData(dataPricePlan,queryflag?'buyStart':undefined,queryflag?'buyEnd':undefined,queryflag?'bPrice':undefined)
                    ,types:{'销售价格':'step'}
                  }
                }
                axis={{
                  x: {
                    type: 'timeseries',
                    tick: {count: 4,format: '%Y-%m-%d'}
                  }
                }}
              />
            )}
            {queryflag&&<Table rowKey="id" columns={columnsPrice1} dataSource={dataPricePlan}/>}
            {!queryflag&&<Table rowKey="id" columns={columnsPrice2} dataSource={dataPricePlan}/>}
          </Modal>
        <Search
          widgets={[
            {name:'beginItemCode',type:'input',placeholder:'开始商品货号',text:'商品货号区间'},
            {name:'endItemCode',type:'input',placeholder:'结束商品货号'},
            {name:'type',type:'select',options:['普通价格','优惠价格'],defaultValue:'普通价格'},
            {name:'skuName',type:'input',placeholder:'商品名称'}
          ]}
          onSearch={e=>{
            this.setState({
              type:e.type,
              searchValue:e
            })
            if(e.skuName==""){
              delete e.skuName
            }else if(e.beginItemCode==""){
              delete e.beginItemCode
            }else if(e.endItemCode==""){
              delete e.endItemCode
            }
            this.getPlan(1,e)
          }}
        />
        <Table rowKey="id" columns={columns} dataSource={dataSource} pagination={pagination} scroll={{ x: 1800}}/>
      </div>
    )
  }
})