import React from 'react'
import {Table,Button,Popconfirm,message,Radio} from 'antd'
import req from 'widget/request'
import statuMap from 'widget/status/deliver.js'
import pickupMap from 'widget/status/pickup.js'
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button

import statusList from 'widget/status/canDeliver.js'

export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      statuMax:'1',
      pagination:{},
      current:1
    }
  },
  getOrderByPage(){
    var statuMax=this.state.statuMax
    var page=this.state.current
    var promise=req({
      url:'/distribution/queryByPage',
      method:'post',
      domain:'wms',
      data:{
        statuMax,
        page,
        size:10,
        bizStatuNE:1
      }
    })
    promise.then(result=>{
      if(result.success){
        var target=result.target
        this.setState({
          dataSource:result.target.items,
          pagination:{
            total:target.totalCount,
            current:target.page
          }
        })
      }
    })
  },
  deilverStart(data){
    var promise=req({
      url:'/distribution/deilverStart',
      method:'post',
      domain:'wms',
      data:data+''
    })
    promise.done(result=>{
      if(result.success){
        this.getOrderByPage()
        message.info(`${data}开始配送`)
      }else{
        message.info(result.message)
      }
    })
  },
  interval:null,
  componentDidMount(){
    this.getOrderByPage(1,{})
    this.interval=window.setInterval(()=>{
      this.getOrderByPage()
    },3*60*1000)
  },
  componentWillUnmount(){
    if(this.interval){
      window.clearInterval(this.interval)
      this.interval=null;
    }
  },
  render(){
    var self=this
    const columns = [{
      title: '配送ID',
      dataIndex: 'id',
      key: 'id',
    }, {
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
    }, {
      title: '下单时间',
      dataIndex: 'orderTime',
      key: 'orderTime',
      render: orderTime => {
        return orderTime&&orderTime.replace('T',' ')
      }
    },{
      title: '用户期望到达时间',
      dataIndex: 'appointTime',
      key: 'appointTime',
      render: createTime => {
        return createTime&&createTime.replace('T',' ')
      }
    },{
      title: '配送状态',
      dataIndex: 'statuMax',
      key: 'statuMax',
      render: stat =>{
        return statuMap[stat+'']
      }
    },{
      title:"订单备注",
      dataIndex: 'pickup',
      key: 'pickup',
      render: stat =>{
        return pickupMap[stat+'']
      }
    },{
      title: '配送地址',
      dataIndex: 'userAddress',
      key: 'userAddress'
    }, {
      title: '操作',
      key:'action',
      render:(text,record)=>{
        return (
          <div>
            <Button type="primary" size="small" onClick={e=>{
              window.open('#/dispatch/detail/'+record.id)
            }} href="javascript:void(0);">详情</Button>
            {' '}
            <Popconfirm title="确定开始配送吗" onConfirm={e=>{self.deilverStart(record.id)}}>
              <Button type="primary" size="small" onClick={e=>{}}>配送</Button>
            </Popconfirm>
          </div>
        )
      }
    }];

    var {dataSource,pagination} = this.state
    pagination = Object.assign({},pagination,{
      onChange: (current) => {
        this.setState({current},()=>{
          this.getOrderByPage();
        })
      }
    })

    return (
      <div>
        <RadioGroup onChange={e=>{
          this.setState({statuMax:e.target.value},()=>{
            this.getOrderByPage()
          })
        }} defaultValue={this.state.statuMax}>
          {statusList.map(status=>{
            return (
              <RadioButton key={status} value={status}>{statuMap[status+'']}</RadioButton>
            )
          })}
        </RadioGroup>
        <div style={{"height":"10px"}}>{' '}</div>
        <Table rowKey="id" dataSource={dataSource} columns={columns} pagination={pagination}/>
      </div>
    )
  }
})
