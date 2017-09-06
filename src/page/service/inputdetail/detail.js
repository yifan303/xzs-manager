import React from 'react'
import {Table,Button,message} from 'antd'
import ajax from 'widget/ajax'
import styleTab from '../table.less'
import timeStamp from 'widget/util/date.js'

export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      orderInfo:null,
      customInfo:null,
      taskInfo:null,
      coupons:null,
    }
  },
  //审核
  processStorageTask(status){ 
    var taskId=this.props.params.id;
    var promise=ajax({
      url:'/inventory/processStorageTask',
      method:'post',
      data:{"taskId":taskId,"status":status}
    })
   var msg=status==1? "审核通过,正在刷新页面":"审核不通过,返回入库列表"
    promise.then(e=>{
      if(e.success){
        message.success(msg)
      }
    })
  },//获取详情
  getDetailMsg(){ 
    var bizId=this.props.params.bizId;
    var promise=ajax({
      url:'/inventory/queryStorageDetail',
      method:'post',
      data:bizId
    })
    promise.then(e=>{
      if(e.success){
        var module=e.module
        this.setState({
          data:module,
          dataSource:module.details
        })
      }
    })
  },
  componentDidMount(){
    this.getDetailMsg(),
    this.props.params.changeBrumb(['客服管理','入库列表','详情'])
  },
  render(){
    var {data,dataSource} = this.state
    var taskStatus=this.props.params.taskStatus==='true'? true:false;
    const columns=[{
      title:'子任务id',
      key:'id',
      dataIndex:'id'
    },{
      title:'sku名称',
      key:'skuName',
      dataIndex:'skuName'
    },{
      title:'skuId',
      key:'skuId',
      dataIndex:'skuId'
    },{
      title:'入库数量',
      key:'number',
      dataIndex:'number'
    },{
      title:'入库单位',
      key:'saleUnit',
      dataIndex:'saleUnit'
    },{
      title:'库位',
      key:'positionId',
      dataIndex:'positionId'
    },{
      title:'库位条码',
      key:'positionCode',
      dataIndex:'positionCode'
    }
    ]
    return (
      <div>
        {!data&&<div><p>获取信息失败</p>
        <Button type="primary" onClick={e=>{
          window.location.href=`#/service/input`
        }}>返回</Button></div>}
        {data&&<div><div className={styleTab.title}>入库信息</div>
          <table cellSpacing="0" className={styleTab.table}>
            <tbody>
              <tr>
                <td>操作人名称</td><td>{data.operateName}</td>
                <td>操作人</td><td>{data.operate}</td>
                <td>入库id</td><td>{data.id}</td>
              </tr>
              <tr>
                <td>审核人名称</td><td>{data.auditorName}</td>
                <td>审核人</td><td>{data.auditor}</td>
                <td>审核时间</td><td>{data.auditTime&&timeStamp.parseTime(data.auditTime)}</td>
              </tr>
              <tr>
                <td>入库原因</td><td>{data.opReasonString}</td>
                <td>入库状态</td><td>{data.statusString}</td>
                <td>任务时间</td><td>{timeStamp.parseTime(data.opTime)}</td>
              </tr>
            </tbody>
          </table>     
          <div className={styleTab.marginTop}></div>
          <div className={styleTab.title}>交易详情</div>
          <Table rowKey="id" pagination={{ pageSize: 10 }} columns={columns} dataSource={dataSource}/> 
          <div className={styleTab.btn}>
            <Button type="primary" onClick={e=>{
              window.location.href=`#/service/input`
            }}>返回</Button>
            {data.statu!=3&&<span>
              <Button type="primary" onClick={e=>{
                var fn=()=>{return window.location.reload()}
                this.processStorageTask(1)
                setTimeout(fn, 1500 )
              }}>审核通过</Button>
              {!taskStatus&&<Button type="primary" onClick={e=>{
                var fn=()=>{return window.location.href=`#/service/input`}
                this.processStorageTask(0)
                setTimeout(fn, 1500 )
              }}>审核不通过</Button>}
            </span>}
          </div>  
        </div>}
      </div>
    )
  }
})
