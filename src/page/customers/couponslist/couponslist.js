import React from 'react'
import {Table,Form,message,Input} from 'antd'
import req from 'widget/request'
import date from 'widget/util/date.js'
import ajax from 'widget/ajax'
import TButton from 'widget/button/throttle.js'

const { Column} = Table;
export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      couponId:''
    }
  },
  getOrderByPage(page){
		var uid=this.props.params.uid;
    uid=parseInt(uid);
  	var promise=req({
      url:'/user/getCouponList',
      method:'post',
      data:{uid}
    })

    promise.then(result=>{
      if(result.success){
        var module=result.module
        this.setState({
          dataSource:module,
        })
      }
    })

  },
  componentDidMount(){
    this.getOrderByPage(1),
    this.props.params.changeBrumb(['客户管理','客户查询','优惠券列表'])
  },
  addCoupon(){
    var couponId = this.state.couponId
    if(!couponId){
      return message.info('优惠卷id不能为空')
    }
    var userId=parseInt(this.props.params.uid)
    var req = ajax({
      url:'/promotion/addDiscountCoupon',
      data:{
        userId,couponId
      }
    })
    req.then(result=>{
      if(result.success){
        message.info('发送优惠卷成功')
      }
    })

  },
  render(){
  	var {dataSource}=this.state
    return (
     <div>

      <Form onSubmit={e=>{}}>
        <span>优惠卷ID</span>
        {' '}
        <Input
          value={this.state.couponId}
          onChange={e=>this.setState({couponId:e.target.value})}
          style={{width:200}}
        />
        {' '}
        <TButton timeout={3000} type="primary" onClick={e=>this.addCoupon()}>发送优惠卷</TButton>
      </Form>
      <div style={{width:10,height:10}}></div>

     {dataSource&&<div>
    	<div style={{width:'100%',textAlign:'center',fontSize:'14px',fontWeight:700,padding:'15px',background:'#f7f7f7'}}><p>优惠券列表</p></div>
    	<Table rowKey="id" dataSource={dataSource} pagination={{ pageSize: 300 }}>
      <Column
        title="主键ID"
        dataIndex="id"
        key="id"
      />
      <Column
        title="优惠券ID"
        dataIndex="couponId"
        key="couponId"
      />
    <Column
      title="优惠券名称"
      dataIndex="couponTitle"
      key="couponTitle"
    />
    <Column
      title="发放时间"
      dataIndex="couponStartTime"
      key="couponStartTime"
      render={
      	couponStartTime => {
    			return(date.parseTime(couponStartTime))
      	}
      }
    />
    <Column
      title="结束时间"
      dataIndex="couponEndTime"
      key="couponEndTime"
      render={
      	couponEndTime => {
    			return(date.parseTime(couponEndTime))
      	}
      }
    />
    <Column
      title="优惠金额"
      dataIndex="discountAmount"
      key="discountAmount"
    />
    <Column
      title="渠道类型"
      dataIndex="channel"
      key="channel"
    />
    <Column
      title="当前状态"
      dataIndex="currentStatus"
      key="currentStatus"
    />
    <Column
      title="已使用优惠"
      dataIndex="usedYouHui"
      key="usedYouHui"
    />
    <Column
      title="关联订单"
      dataIndex="orderId"
      key="orderId"
    />
		  </Table>
		  </div>}
 		</div>
    )
  },
  handleSubmit(e){
    e.preventDefault();
  }
})
