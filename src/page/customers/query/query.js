import React from 'react'
import {Table,Button,message} from 'antd'
import Search from 'widget/search'
import req from 'widget/request'
import queryStyle from './query.less'

export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      search:{},
      uid:null,
      orderId:null
    }
  },
  getOrderByPage(page,search){
    var orderId=search.orderId||""
    var phoneNum=search.phoneNum||""
    orderId=parseInt(orderId);
    phoneNum=parseInt(phoneNum);
  	var promise=req({
      url:'/user/getUserInfo',
      method:'post',
      data:{
      	oid:orderId,
      	phoneNum
      }
    })
    
    promise.then(result=>{
      if(result.success){
        var module=result.module
        this.setState({
          dataSource:result.module,
          uid:result.module.userId
        })
      }
    })
    
  },
  render(){
  	var {dataSource,orderId} = this.state
    return (
      <div>
        <Search
          widgets={[
            {name:"phoneNum",text:'手机号码',type:'input'},
            {name:'orderId',type:'input',text:'订单编号'}
          ]}
          onSearch={e=>{
           var num=parseInt(e.phoneNum)
           var pattern=/^1\d{10}$/g;
           if(num&&pattern.test(num)){
            this.setState({orderId:null})
            this.getOrderByPage(1,e)
           }else if(e.orderId){
            this.setState({orderId:e.orderId})
            this.getOrderByPage(1,e)
           }else{message.warning("请输入11位手机号码")}
          }}
         
        />
        {!dataSource&&<div style={{fontWeight:700,fontSize:18}}>请输入手机号码或订单编号查询</div>}
        {dataSource&&<div>
        	<table  className={queryStyle.table} cellSpacing="0">
        		<tbody>
							<tr><td colSpan="4" style={{textAlign:'center',fontWeight:700,padding:'15px',background:'#f7f7f7'}}>客户信息</td></tr>
							<tr><td style={{fontWeight:700,textAlign:'center',padding:'15px'}}>客户名称</td><td>{dataSource.userName}</td><td style={{fontWeight:700,textAlign:'center'}}>手机号码</td><td>{dataSource.phoneNum}</td></tr>
							<tr><td style={{fontWeight:700,textAlign:'center',padding:'15px'}}>会员等级</td><td>{dataSource.level}</td><td style={{fontWeight:700,textAlign:'center'}}>消费积分</td><td>{dataSource.credit}</td></tr>
							<tr><td style={{fontWeight:700,textAlign:'center',padding:'15px'}}>用户ID</td><td>{dataSource.userId}</td><td style={{fontWeight:700,textAlign:'center',padding:'15px'}}>常用收货地址</td><td style={{textAlign:'left'}}>{dataSource.addressList&&dataSource.addressList.map((item,index)=>(<p key={index}>{item}</p>))}</td></tr>
						</tbody>
					</table>
      		<div className={queryStyle.btn}  style={{width:'100%',textAlign:'center',}}>
		        {<Button type="primary" size="large"  onClick={e=>{
              window.open('#/customers/oderlist/'+this.state.uid+'/'+dataSource.phoneNum+'/'+this.state.orderId)
	          }} href="javascript:void(0);">订单列表</Button>}
	          <Button type="primary" size="large" onClick={e=>{
              window.open('#/customers/couponslist/'+ this.state.uid)
	          }} href="javascript:void(0);">优惠券列表</Button>
        	</div>  
	        
      	</div>}
      </div>
    )
  }
})
