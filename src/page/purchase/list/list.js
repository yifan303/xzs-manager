import React from 'react'
import {Input,Form,DatePicker,Table,Button,Modal,Select,InputNumber,message} from 'antd'
import SelectSupplier from 'widget/selectSupplier'
import Search from 'widget/search'
import request from 'widget/request'
import {purchaseStatus} from 'widget/status/purchase.js'
import parseDatetime from 'widget/util/date.js'

export default React.createClass({
  getInitialState(){
    return {

      // 初审
      visible:false,
      memo:'',

      purchaseId:null,

      list:null,

      // 分页参数
      pageNum:0,
      pageSize:10,
      totalNum:0,

      search:{}
    }
  },
  getColumns(){
    var self=this
    return [
      {title:"采购编号",dataIndex:'purchaseId',key:'purchaseId',width:90},
      {title:'采购日期',dataIndex:"purchaseData",key:'purchaseData',width:100},
      {title:'供应商',dataIndex:"supplier",key:"supplier",width:70},
      {title:"购货金额",dataIndex:"purchaseAmount",key:"purchaseAmount",width:90},
      {title:"到货时间",dataIndex:"arriveDate",key:"arriveDate",width:90},
      {title:'实际金额',dataIndex:'actualAmount',width:90},
      {title:'采购单状态',dataIndex:'auditingStatusString',key:'auditingStatusString',width:100},
      {title:"入库状态",dataIndex:'storageStatus',key:'storageStatus',width:90},
      {title:"备注",width:150,render(data,record){
        var remarks = (record.remarks||'').split('<br>')
        return (
          <div>{remarks.map((remark,index)=>(
            <div key={index}>{remark}</div>
          ))}</div>
        )
      }},
      {title:"操作",width:350,render(data,record){
        return (
          <span>
            <Button size="small" type="primary" onClick={e=>self.setState({visible:true,purchaseId:record.purchaseId})}>采购单初审</Button>
            {' '}
            <Button size="small" type="primary" onClick={e=>self.submitPurchase(record.purchaseId,3)}>提交供应商</Button>
            {' '}
            <Button size="small" type="primary" onClick={e=>window.open(`#/purchase/edit/${record.purchaseId}`)}>详情</Button>
            {' '}
            <Button size="small" type="primary" onClick={e=>window.location=`#/purchase/continue/${record.purchaseId}`}>继续采购</Button>
          </span>
        )
      }}
    ]
  },
  getPurchase(){
    var {pageNum,pageSize,search} = this.state
    var {supplier,purchaseSubId,purchase,status} = search
    var params = {}

    if(status&&status!='-1'){
      params.auditingStatus = status
    }
    if(supplier){
      params.supplier = supplier.name
    }
    if(purchaseSubId){
      params.purchaseId = purchaseSubId
    }
    if(purchase){
      if(purchase.end&&purchase.start){
        var range = parseDatetime.parseRange(purchase.start,purchase.end)
        params.begin = range.beginTime
        params.end = range.endTime
      }
    }

    var url = '/orderlist/requestorderlistwithemployee'

    var promise = request(url,{
      method:'get',
      data:{
        ...params,
        pageNum,
        pageSize
      }
    })
    promise.done(result=>{
      if(result.success){
        this.setState({
          list:result.module.orderListVOs,
          totalNum:result.totalNum||0,
          pageNum:result.currentPageNum||0
        })
      }else{
        this.setState({
          list:[],
          totalNum:0,
          pageNum:0
        })
      }
    })
  },
  getPagination(){
    var self = this
    return {
      pageSize:this.state.pageSize,
      current:this.state.pageNum+1,
      total:this.state.totalNum,
      onChange(e){
        self.setState({pageNum:e-1},()=>self.getPurchase())
      }
    }
  },
  componentDidMount(){
    this.getPurchase()
  },

  // 初审意见
  agree(auditingStatus){
    var {purchaseId,memo} = this.state
    purchaseId = purchaseId + ''
    auditingStatus = auditingStatus + ''

    var promise = request('/orderlist/trialwithemployee',{
      method:'post',
      data:{
        purchaseId,auditingStatus,remarks:memo
      }
    })
    promise.done(result=>{
      if(result.success){
        this.setState({visible:false,purchaseId:null})
        message.info('初审提交成功')
        this.getPurchase()
      }
    })
  },

  // 提交供应商
  submitPurchase(purchaseId,auditingStatus){

    purchaseId = purchaseId + ''
    auditingStatus = auditingStatus + ''

    var promise = request('/orderlist/trialwithemployee',{
      method:'post',
      data:{
        purchaseId,auditingStatus
      }
    })
    promise.done(result=>{
      if(result.success){
        message.info('提交成功')
        this.getPurchase()
      }
    })
  },

  render(){
    var {list,visible,memo} = this.state
    return (
      <div>
        <Search
          row
          widgets={[
            {name:'supplier',type:'supplier'},
            {name:'purchaseSubId',type:'input',text:'采购单号'},
            {name:'purchase',type:'range',text:'采购时间'},
            {name:'status',type:'select',options:purchaseStatus,text:'状态'}
          ]}
          onSearch={e=>this.setState({search:e,pageNum:0},()=>this.getPurchase())}
        />
        <Table
          rowClassName={e=>"min-row"}
          rowKey="purchaseId"
          bordered
          columns={this.getColumns()}
          dataSource={list}
          pagination={this.getPagination()}
        />
        <Modal
          onOk={e=>this.setState({visible:false})}
          onCancel={e=>this.setState({visible:false})}
          footer={[
            <Button key="submit" type="primary" size="large" onClick={e=>this.agree(2)}>同意</Button>,
            <Button key="back" size="large" onClick={e=>this.agree(0)}>不同意</Button>
          ]}
          title="审核意见"
          visible={visible}
        >
          <Input type="textarea" rows={5} value={memo} onChange={e=>this.setState({memo:e.target.value})}/>
        </Modal>
      </div>
    )
  }
})
