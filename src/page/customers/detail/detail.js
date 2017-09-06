import React from 'react'
import {Table,Button} from 'antd'
import req from 'widget/request'
import date from 'widget/util/date.js'
import tableStyle from '../query/query.less'


export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      dataorder:null
    }
  },
 	getOrderMsg(){
		var orderId=this.props.params.id;
    orderId=parseInt(orderId);
  	var promise=req({
      url:'/user/getOrderInfo',
      method:'post',
      data:{orderId}
    })
    
    promise.then(result=>{
      if(result.success){
        var module=result.module
        this.setState({
          dataorder:result.module,
          dataSource:module.itemsList
        })
      }
    })
    
  },
  componentDidMount(){
    this.getOrderMsg(),
    this.props.params.changeBrumb(['客户管理','客户查询','订单列表','订单详情'])
  },
  render(){
  	const {dataorder,dataSource}=this.state;
    console.log(dataorder)
  	const columns = [{
      title: '商品编号',
      dataIndex: 'id',
      key: 'id',
    },{
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
    },{
      title: 'skuId',
      dataIndex: 'skuId',
      key: 'skuId',
    },{
      title: '购买数量',
      dataIndex: 'count',
      key: 'count',
    },{
      title: '商品单价',
      dataIndex: 'price',
      key: 'price',
    },{
      title: '应付金额',
      dataIndex: 'amount',
      key: 'amount',
    },{
      title: '实付金额',
      dataIndex: 'effeAmount',
      key: 'effeAmount',
    },{
      title: '其他',
      dataIndex: 'other',
      key: 'other',
    }
    ];
    return (
      <div>{dataorder&&<div>
      	<div>
	    	<table cellSpacing="0" className={tableStyle.table}>
	    		<tbody>
						<tr><td colSpan="6" style={{textAlign:'center',fontWeight:700,padding:'15px',background:'#f7f7f7'}}>订单信息</td></tr>
						<tr><td style={{fontWeight:700,textAlign:'center',padding:'15px'}}>订单编号</td><td>{dataorder.id}</td>
						<td style={{fontWeight:700,textAlign:'center'}}>应付金额</td><td>{dataorder.payAmount}</td>
						<td style={{fontWeight:700,textAlign:'center'}}>实付金额</td><td>{dataorder.effeAmount}</td></tr>
						<tr><td style={{fontWeight:700,textAlign:'center',padding:'15px'}}>积分抵扣</td><td>{dataorder.creditDiscount}</td>
						<td style={{fontWeight:700,textAlign:'center'}}>优惠券抵扣</td><td>	{dataorder.couponDiscount}</td>	
						<td style={{fontWeight:700,textAlign:'center'}}> </td><td></td></tr>
					</tbody>
				</table>
				<div className={tableStyle.marginTop}></div>	
				<table cellSpacing="0" className={tableStyle.table}>
	    		<tbody>
						<tr ><td colSpan="6" style={{textAlign:'center',fontWeight:700,padding:'15px',background:'#f7f7f7'}}>配送信息</td></tr>
						<tr><td style={{fontWeight:700,textAlign:'center',padding:'15px'}}>配送地址</td><td>{dataorder.distributinaAddress}</td>
						<td style={{fontWeight:700,textAlign:'center'}}>联系电话</td><td>{dataorder.phoneNumber}</td>
						<td style={{fontWeight:700,textAlign:'center'}}>业务状态</td><td>{dataorder.businessStatus==1?'取消':'正常'}</td></tr>
						<tr><td style={{fontWeight:700,textAlign:'center',padding:'15px'}}>配送状态</td><td>{dataorder.distributinStatus}</td>
						<td style={{fontWeight:700,textAlign:'center'}}>开始配送时间</td><td>{dataorder.distributinStartTime&&date.parseTime(dataorder.distributinStartTime)}</td>
            <td style={{fontWeight:700,textAlign:'center'}}>期望送达时间</td><td>{dataorder.distributinEndTime?date.parseTime(dataorder.distributinEndTime):'立即送达'}</td></tr>
					</tbody>
				</table>
				</div>
				<div className={tableStyle.marginTop}></div>	
				<Table rowKey="id" dataSource={dataSource} columns={columns}/>
      </div>     	
      }</div>
    )
  },
})

