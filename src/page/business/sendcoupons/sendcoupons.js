import React from 'react'
import {Input,Row,Col} from 'antd'
import ajax from 'widget/ajax'
import req from 'widget/request'
import Search from 'widget/search'


export default React.createClass({
	getInitialState(){
		return({
			hadGetUid:false,
			resData:[]
		})
	},
	getUserInfo(phoneNum){
    phoneNum=parseInt(phoneNum);
  	var promise=req({
      url:'/user/getUserInfo',
      method:'post',
      data:{phoneNum}
    })
    promise.then(result=>{
      if(result.success){
        var module=result.module
        this.setState({
          userData:result.module,
          hadGetUid:true
        })
      }else{
      	console.log(phoneNum)
      	var resUserMsg={}
      	var {resData}=this.state
				resUserMsg.phone=phoneNum
				resUserMsg.msg=result.errorMsg
      	resData.push(resUserMsg)
      	this.setState({resData})
      }
    })
  },
  addCoupon(userData){
  	var couponId=this.state.couponId
  	var userId=userData.userId
    var req = ajax({
      url:'/promotion/addDiscountCoupon',
      data:{
        userId,couponId
      }
    })
    req.then(result=>{
      if(result.success){
      	var resUserMsg={}
      	var {resData}=this.state
				resUserMsg.phone=userData.phoneNum
				resUserMsg.msg='发送优惠卷成功'
      	resData.push(resUserMsg)
      	this.setState({resData})
      }
    })
    req.fail(result=>{
    	var resUserMsg={}
    	var {resData}=this.state
			resUserMsg.phone=userData.phoneNum
			resUserMsg.msg=result
    	resData.push(resUserMsg)
    	this.setState({resData})
    })
  },
  getUid(phoneList){
  	if(!phoneList||phoneList.length<12){
  		this.getUserInfo(phoneList)
  		return ''
  	}
  	var arr=phoneList.split(",")
  	for(var i=0;i<arr.length;i++){
  		if(/^1[3456789]\d{9}/.test(arr[i])){
	  		this.getUserInfo(arr[i])
  		}else{
      	var resUserMsg={}
      	var {resData}=this.state
				resUserMsg.phone=arr[i]
				resUserMsg.msg='号码错误'
      	resData.push(resUserMsg)
      	this.setState({resData})
  		}
  	}
  },
  getcoupons(userData,hadGetUid){
		this.addCoupon(userData)
		this.setState({
			hadGetUid:false
		})
  },
  ov(ar) {
		var ret = [];
		var retRun = [];
		var skuIds=[];
		for(var x in ar){
			skuIds[x]=ar[x].phone
		}
		for (var i = 0, j = skuIds.length; i < j; i++) {
		 if (ret.indexOf(skuIds[i]) === -1) {
	     ret.push(skuIds[i]);
	     retRun.push(ar[i]);
		 }
		}
    return retRun;
  },
	render(){
		var {hadGetUid,userData,resData}=this.state
		resData=this.ov(resData)
		if(hadGetUid){this.getcoupons(userData,hadGetUid)}
		return(<div>
			<Search
				widgets={[
					{name:"phoneList",type:'input',text:'手机号码'},
					{name:"couponId",type:'input',text:'优惠券ID'}
				]}
				onSearch={e=>{
					resData=[]
					this.setState({
						couponId:e.couponId,
						resData
					})
					this.getUid(e.phoneList)
				}}>发放优惠券</Search>
				<Row>{resData&&resData.map((item,index)=>{
					return <Col key={index} span="6">{item.phone+":"+item.msg}</Col>
				})
				}</Row>
		</div>)
	}
})