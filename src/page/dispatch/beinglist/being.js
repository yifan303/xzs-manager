import React from 'react'
import {Table,Button,Popconfirm,message} from 'antd'
import req from 'widget/request'
import statuMap from 'widget/status/deliver.js'

export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      pagination:{},
      current:1
    }
  },
  getOrderByPage(){
    var statu='6'
    var page=this.state.current
    var promise=req({
      url:'/distribution/queryByPage',
      method:'post',
      domain:'wms',
      data:{
        statu,
        page,
        size:10
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
  deilverEnd(data){
    var promise=req({
      url:'/distribution/arrived',
      method:'post',
      domain:'wms',
      data:{"id":data+''}
    })
    promise.done(result=>{
      if(result.success){
        this.getOrderByPage()
        message.info(`订单${data}成功送达`)
      }else{
        message.info(result.message)
      }
    })
  },
  componentDidMount(){
    this.getOrderByPage(1,{})
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
      title: '配送开始时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: createTime => {
        return createTime&&createTime.replace('T',' ')
      }
    }, {
      title: '配送状态',
      dataIndex: 'statu',
      key: 'statu',
      render: stat =>{
        return statuMap[stat+'']
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
            <Popconfirm title="确定送达吗" onConfirm={e=>{self.deilverEnd(record.id)}}>
              <Button type="primary" size="small" onClick={e=>{}}>送达</Button>
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
        <Table rowKey="id" dataSource={dataSource} columns={columns} pagination={pagination}/>
      </div>
    )
  }
})
