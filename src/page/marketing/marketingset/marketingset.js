import React from 'react'
import {Button,Table,Modal,DatePicker,Radio,Input,Select,message,Col,Row,InputNumber} from 'antd'
import ajax from 'widget/ajax'
import moment from 'moment'
import Search from 'widget/search'
import date from 'widget/util/date.js'
import Style from './style.less'

const Option=Select.Option
const RadioGroup = Radio.Group;

export default React.createClass({
	getInitialState(){
		return{
			dataSource:null,
			pagination:0,
			rowSelection:null,
			rowSelectionRadio:null,
			rowSelectionCoup:null,
			goodsData:null,
			goodsPage:0,
			selectGoodBool:false,
			couponsBool:false,
			limitActBool:false,
			actDetailData:{},
			activityInfo:{},
			addActSuc:false,//添加活动成功？
			//编辑时触发
			edit:false,
			GoodsdataList:[],
			discountOffInfos:[],
			GoodsdataCouponsList:[],
			modalKey:0,
			actKey:0
		}
	},
	getActivityList(page,data){
		page=page-1
		data.pageSize=10
		data.currentPage=page
		var promise=ajax({
			url:'/marketActivity/getActivityList',
			method:"post",
			data:data
		})
		promise.then(e=>{
			if(e.success){
				var module=e.module
				this.setState({
					dataSource:module.activities,
					pagination:{
            total:module.totalPage*10,
            current:module.currentPage+1
          }
				})
			}
		})
	},
	addActivity(data){
		data.status=0
		var promise=ajax({
			url:'/marketActivity/addActivity',
			method:"post",
			data:data
		})
		promise.then(e=>{
			if(e.success){
				this.setState({
					addActSuc:true
				});
				message.success("增加成功")
				this.getActivityList(this.state.current||1,this.state.timeSelectedData)
			}else{
				this.setState({
					addActSuc:false
				})
			}
		})
	},
	//查看活动
	getActivityDetail(id){
		var promise=ajax({
			url:'/marketActivity/getActivityDetail',
			method:"post",
			data:{"id":id}
		})
		promise.then(e=>{
			if(e.success){
				var module=e.module
				this.setState({
					actDetailData:module,
					activityInfo:module.activityInfo
				})
			}
		})
	},
	//活动更新(修改、终止)
	updateActivity(data){
		var promise=ajax({
			url:'/marketActivity/updateActivity',
			method:"post",
			data:data
		})
		promise.then(e=>{
			if(e.success){
				message.success("修改成功")
				this.setState({
					updateActSuc:true
				})
			}else{
				this.setState({
					updateActSuc:false
				})
			}
		})
	},
	//获取商品列表
	getItemsInfo(page,data){
		page=page-1
		data.pageSize=10
		data.currentPage=page
		var promise=ajax({
			url:'/item/getItemsInfo',
			method:"post",
			data:data
		})
		promise.then(e=>{
			if(e.success){
				var module=e.module
				this.setState({
					goodsData:module.data,
					goodsPage:{
            total:module.totalPage*10,
            current:module.currentPage+1,
          }
				})
			}
		})
	},
	//优惠券列表
	getCoupons(page,data){
		page=page-1
		data.pageSize=10
		data.pageNum=page
		var promise=ajax({
			url:'/marketActivity/getCoupons',
			method:"post",
			data:data
		})
		promise.then(e=>{
			if(e.success){
				var module=e.module
				this.setState({
					couponsData:module.coupons,
					couponsPag:{
            total:module.totalPage*10,
            current:module.currentPage+1
          }
				})
			}
		})
	},
	//商品去重
	ov(ar) {
		var ret = [];
		var retRun = [];
		var skuIds=[];
		var retNUm=0;
		for(var x in ar){
			skuIds[x]=ar[x].skuId
		}
		for (var i = 0, j = skuIds.length; i < j; i++) {
		 if (ret.indexOf(skuIds[i]) === -1) {
	     ret.push(skuIds[i]);
	     retRun.push(ar[i]);
		 }else{retNUm++}
		}
		if(retNUm>0){message.info("去掉"+retNUm+"个重复选项")}
    return retRun;
  },
  channel(info){
  	var msg='';
				if(info==0){
					msg="通用"
				}
				else if(info==2){
					msg="线下"
				}
				else if(info==1){
					msg="线上"
				}
				return msg
  },
	render(){
		var {discountOffInfos,actKey,dataSource,couponsData,rowSelectionCoup,addActSuc,couponsPag,couponsQueryData,pagination,rowSelection,rowSelectionRadio,goodsData,goodsPage,goodsQueryData,timeSelectedData,actDetailData,activityInfo,edit,GoodsdataList,GoodsdataCouponsList,modalKey}=this.state
    if(addActSuc||this.state.updateActSuc){
    	setTimeout(e=>{
    		this.setState({limitActBool:false,couponsBool:false,actDetailBool:false,edit:false,actDetailData:null});
      	if(this.state.updateActSuc){this.getActivityList(this.state.current||1,timeSelectedData)}
    	},1000)
		}
		rowSelection={
			onChange:(e,selectedList)=>{
				var showSkuSelected=[]
				selectedList.map((item,index)=>{
					var oB={}
					oB.skuId=item.skuId
					oB.title=item.title
					showSkuSelected[index]=oB
				})
				this.setState({showSkuSelected});
			}
		}

		rowSelectionRadio={
			type:"radio",
			onChange:(e,selectedList)=>{
				var showSkuSelected=[]
				selectedList.map((item,index)=>{
					var oB={}
					oB.skuId=item.skuId
					oB.title=item.title
					showSkuSelected[index]=oB
				})
				this.setState({showSkuSelected});
			}
		}
		rowSelectionCoup={
			onChange:(e,selectedList)=>{
				var showIdSelected=[]
				selectedList.map((item,index)=>{
					var oB={}
					oB.couponId=item.id
					oB.title=item.title
					showIdSelected[index]=oB
				})
				this.setState({showIdSelected});
			}
		}
		pagination=Object.assign({},pagination,{
      onChange:(current)=>{
        this.getActivityList(current,timeSelectedData||{})
        this.setState({current})
      }
    })
    goodsPage=Object.assign({},goodsPage,{
      onChange:(current)=>{
        this.getItemsInfo(current,goodsQueryData||{})
      }
    })
    couponsPag=Object.assign({},couponsPag,{
      onChange:(current)=>{
        this.getCoupons(current,couponsQueryData||{})
      }
    })
    var couponsBtn=false;//注释隐藏编辑中关联优惠券选项
		const columns=[{
			title:"商品编码",
			key:"id",
			dataIndex:"id"
		},{
			title:"商品SKU",
			key:"skuId",
			dataIndex:"skuId"
		},{
			title:"商品名称",
			key:"title",
			dataIndex:"title"
		},{
			title:"规格",
			key:"specification",
			dataIndex:"specification"
		},{
			title:"销售单位",
			key:"skuUnit",
			dataIndex:"skuUnit"
		}]
		const columnsAct=[{
			title:"活动编码",
			key:"id",
			dataIndex:"id"
		},{
			title:"活动名称",
			key:"name",
			dataIndex:"name"
		},{
			title:"活动状态",
			key:"status",
			dataIndex:"statusString"
		},{
			title:"活动类型",
			key:"typeString",
			dataIndex:"typeString"
		},{
			title:"开始时间",
			key:"gmtStart",
			render:e=>{
				if(e.gmtStart==null)return ''
				return date.parseTime(e.gmtStart)
			}
		},{
			title:"结束时间",
			key:"gmtEnd",
			render:e=>{
				if(e.gmtEnd==null)return ''
				return date.parseTime(e.gmtEnd)
			}
		},{
			title:"渠道类型",
			key:"channelType",
			render:(e,info)=>{
				var msg='';
				if(info.activityInfo.channelType==0){
					msg="通用"
				}
				else if(info.activityInfo.channelType==2){
					msg="线下"
				}
				else if(info.activityInfo.channelType==1){
					msg="线上"
				}
				return msg
			}
		},{
			title:"操作",
			key:"gmtModified",
			render:record=>{
				return(
					<div className={Style.actionBtn}>
						<Button type="primary" size="small" onClick={e=>{
							this.getActivityDetail(record.id)
							this.setState({
								actDetailBool:true
							})
						}}>查看</Button>
						<Button type="primary" size="small" onClick={e=>{
							this.getActivityDetail(record.id)
							this.setState({
								actDetailBool:true,
								edit:true
							})
						}}>编辑</Button>
					</div>
				)
			}
		}]
		const columnsCoup=[{
			title:"优惠券编号",
			key:"id",
			dataIndex:'id'
		},{
			title:"优惠券名称",
			key:"title",
			dataIndex:'title'
		},{
			title:"开始时间",
			key:"gmtStart",
			render:e=>{
				if(e.gmtStart==null)return ''
				return date.parseTime(e.gmtStart)
			}
		},{
			title:"结束时间",
			key:"gmtEnd",
			render:e=>{
				if(e.gmtEnd==null)return ''
				return date.parseTime(e.gmtEnd)
			}
		},{
			title:"渠道",
			key:"channelTypeString",
			dataIndex:'channelTypeString'
		},{
			title:"类型",
			key:"typeString",
			dataIndex:'typeString'
		},{
			title:"状态",
			key:"statuString",
			dataIndex:'statuString'
		}
		]
		var isLimitActData=Object.assign({},actDetailData)
		var isLimitAct=isLimitActData.typeString=='限购活动'? true:false;
		if(!isLimitActData.activityInfo)isLimitActData.activityInfo=[]
		return(
			<div>
				<Modal
					maskClosable={false}
					title={actDetailData&&edit?"活动编辑("+actDetailData.typeString+")":"活动详情"}
					visible={this.state.actDetailBool}
					onCancel={e=>this.setState({actDetailBool:false})}
					afterClose={e=>this.setState({updateActSuc:false,edit:false,actDetailData:null,GoodsdataList:[]})}
					onOk={e=>{
						if(!edit){this.setState({actDetailBool:false}); return ''}
						var runOver=date.overTime(actDetailData.gmtStart,actDetailData.gmtEnd,true)
						if(isNaN(runOver)){return ''}
						var data={}
						var skuIds=[]
						for(let i in activityInfo.itemInfos){
							 skuIds[i]=activityInfo.itemInfos[i].skuId
						}
						if(skuIds.length<1&&actDetailData.status==0){
							return message.warning("请添加关联商品")
						}
						data.id=actDetailData.id
						data.name=actDetailData.name
						data.type=actDetailData.type
						data.status=actDetailData.status
						data.gmtStart=actDetailData.gmtStart
						data.gmtEnd=actDetailData.gmtEnd
						data.channelType=activityInfo.channelType
						data.skuIds=skuIds
						data.bindType=0
						data.add=true
						if(isLimitAct){
							data.limitedTimeDiscount=activityInfo.limitedTimeDiscount
							data.limitCount=activityInfo.limitCount
						}else{
							var discountOffInfosSend=[]
							for(let i=0;i<activityInfo.discountOffInfos.length;i++){
								if(activityInfo.discountOffInfos[i]){
									if(parseFloat(activityInfo.discountOffInfos[i].discount)>0&&parseFloat(activityInfo.discountOffInfos[i].discountCount)>0){
										discountOffInfosSend.push(activityInfo.discountOffInfos[i])
									}else{
										if(parseFloat(activityInfo.discountOffInfos[i].discount)>0||parseFloat(activityInfo.discountOffInfos[i].discountCount)>0){
											return message.warning("优惠方案输入"+(i+1)+"有误")
										}
									}
									var arr=Object.assign([],activityInfo.discountOffInfos)
									arr.sort((a,b)=>{return a.discountCount-b.discountCount})
									for(let i=0;i<arr.length;i++){
										if(parseFloat(arr[i].discount)!=0&&arr[i]){
											if(i+1<arr.length){
												if(parseFloat(arr[i].discount)<=parseFloat(arr[i+1].discount)){
													return message.warning("折扣输入有误，请检查")
												}
											}
										}	
									}
								}	
							}
							data.discountOffInfos=discountOffInfosSend
						}
						this.updateActivity(data)
					}}
					width="80%"
					className={Style.actDetail}
				>
					{actDetailData&&!edit&&<div>
						<table>
							<tbody>
								<tr>
									<td>活动编码:{actDetailData.id}</td>
									<td>活动名称:{actDetailData.name}</td>
									<td>活动创建人:{actDetailData.operatorName}</td>
								</tr>
								<tr>
									<td>活动类型:{actDetailData.typeString}</td>
									<td>活动状态:{actDetailData.statusString}</td>
									{isLimitAct&&false&&<td>限购折扣(折):{activityInfo.limitedTimeDiscount}</td>}
									<td>渠道类型:{this.channel(activityInfo.channelType)}</td>
								</tr>
								{!isLimitAct&&<tr>{activityInfo.discountOffInfos&&activityInfo.discountOffInfos.map((item,index)=>{
									return <td key={index}>满件折扣：{"满"+item.discountCount+"件"+item.discount/10+"折"}</td>
								})}</tr>}
								<tr>
									{isLimitAct&&<td>每笔订单限购:{activityInfo.limitCount}</td>}
									<td>开始时间:{date.parseTime(actDetailData.gmtStart)}</td>
									<td>结束时间:{date.parseTime(actDetailData.gmtEnd)}</td>
								</tr>
							</tbody>
						</table>
						<table>
						<tbody>
						<tr>
						<td>
							{activityInfo.itemInfos&&<Row>
								<p>关联商品:(SKU:名称)</p>
								{activityInfo.itemInfos.map((item,index)=>{
									return<Col style={{padding:6}} span="8" key={index}>{item.skuId+":"+item.title}</Col>
								})}
							</Row>}
							{activityInfo.couponInfos&&<Row>
								<p>关联优惠券:(ID:名称)</p>
								{activityInfo.couponInfos.map((item,index)=>{
									return<Col style={{padding:6}} span="8" key={index}>{item.couponId+":"+item.title}</Col>
								})}
							</Row>}
							</td>
							</tr>
							</tbody>
						</table>
					</div>}

					{actDetailData&&edit&&<div className={Style.editSty}>
						<table>
							<tbody>
								<tr>
									<td><span>活动编码:{actDetailData.id}</span></td>
									<td>活动创建人:{actDetailData.operatorName}</td>
									<td>活动类型:{actDetailData.typeString}</td>
								</tr>
								<tr>
									<td>
										<span>活动名称:</span>
										<Input className={Style.Input} maxLength={32} value={actDetailData.name} onChange={e=>{
											actDetailData.name=e.target.value
											this.setState({
												actDetailData
											})
										}}/>
									</td>
									
									{isLimitAct&&false&&<td><span>限购折扣:
										<Input className={Style.Input} value={activityInfo.limitedTimeDiscount} onChange={e=>{
											var value=e.target.value
											if(!isNaN(value)){
												if(value>=0&&value<=10){
													activityInfo.limitedTimeDiscount=value
													this.setState({
														activityInfo
													})
												}else{message.info("输入有误,请重新输入。（如：输入8.5折）")}
											}
										}}/>折</span>
									</td>}
									<td>
										<span>活动状态:</span>
										<RadioGroup value={actDetailData.status} onChange={e=>{
												actDetailData.status=e.target.value
										  	this.setState({actDetailData})
										}}>
							        <Radio value={0}>有效</Radio>
							        <Radio value={1}>无效</Radio>
							      </RadioGroup>
									</td>
									<td>
							   		<span className={Style.margL}>渠道类型:</span>
										<RadioGroup value={activityInfo.channelType} onChange={e=>{
											activityInfo.channelType=e.target.value
											this.setState({activityInfo})
										}}>
							        <Radio value={0}>通用</Radio>
							        <Radio value={1}>线上</Radio>
							        <Radio value={2}>线下</Radio>
							      </RadioGroup>
									</td>
								</tr>
									{!isLimitAct&&<tr>
										<td>
											<span className={Style.margL}>优惠方案一：满</span><InputNumber value={activityInfo.discountOffInfos&&activityInfo.discountOffInfos[0].discountCount} max={999} min={0} step={1} onChange={e=>{
												if(activityInfo.discountOffInfos[0]){
													activityInfo.discountOffInfos[0].discountCount=e
								    		}else{
									    		var data={}
									    		data.discountCount=e
													activityInfo.discountOffInfos[0]=data			    			
								    		}
												this.setState({activityInfo})
								    	}}/>
								    	<span style={{"marginRight":"10px"}}>件</span>
								    	<InputNumber value={activityInfo.discountOffInfos&&activityInfo.discountOffInfos[0].discount/10} min={0} max={10} step={0.1} onChange={e=>{
								    		if(activityInfo.discountOffInfos[0]){
													activityInfo.discountOffInfos[0].discount=e*10
								    		}else{
									    		var data={}
									    		data.discount=e*10
													activityInfo.discountOffInfos[0]=data			    			
								    		}
												this.setState({activityInfo})
								    	}}/>
								    	<span>折</span>
										</td>
										<td>
											<span className={Style.margL}>优惠方案二：满</span><InputNumber value={activityInfo.discountOffInfos&&activityInfo.discountOffInfos.length>1&&activityInfo.discountOffInfos[1].discountCount} max={999} min={0} step={1} onChange={e=>{
								    		if(activityInfo.discountOffInfos[1]){
													activityInfo.discountOffInfos[1].discountCount=e
								    		}else{
									    		var data={}
									    		data.discountCount=e
													activityInfo.discountOffInfos[1]=data			    			
								    		}
												this.setState({activityInfo})
								    	}}/>
								    	<span style={{"marginRight":"10px"}}>件</span>
								    	<InputNumber value={activityInfo.discountOffInfos&&activityInfo.discountOffInfos.length>1&&activityInfo.discountOffInfos[1].discount/10} min={0} max={10} step={0.1} onChange={e=>{
								    		if(activityInfo.discountOffInfos[1]){
													activityInfo.discountOffInfos[1].discount=e*10
								    		}else{
									    		var data={}
									    		data.discount=e
													activityInfo.discountOffInfos[1]=data			    			
								    		}
												this.setState({activityInfo})
								    	}}/>
								    	<span>折</span>
										</td>
										<td>
											<span className={Style.margL}>优惠方案三：满</span><InputNumber value={activityInfo.discountOffInfos&&activityInfo.discountOffInfos.length>2&&activityInfo.discountOffInfos[2].discountCount} max={999} min={0} step={1} onChange={e=>{
								    		if(activityInfo.discountOffInfos[2]){
													activityInfo.discountOffInfos[2].discountCount=e
								    		}else{
									    		var data={}
									    		data.discountCount=e
													activityInfo.discountOffInfos[2]=data			    			
								    		}
												this.setState({activityInfo})
								    	}}/>
								    	<span style={{"marginRight":"10px"}}>件</span>
								    	<InputNumber value={activityInfo.discountOffInfos&&activityInfo.discountOffInfos.length>2&&activityInfo.discountOffInfos[2].discount/10} min={0} max={10} step={0.1} onChange={e=>{
								    		if(activityInfo.discountOffInfos[2]){
													activityInfo.discountOffInfos[2].discount=e*10
								    		}else{
									    		var data={}
									    		data.discount=e
													activityInfo.discountOffInfos[2]=data			    			
								    		}
												this.setState({activityInfo})
								    	}}/>
								    	<span>折</span>
										</td>
									</tr>}
								<tr>
									{isLimitAct&&<td><span>每笔订单限购:</span>
										<Input className={Style.Input} value={activityInfo.limitCount} onChange={e=>{
												var value=e.target.value||0
												if(!isNaN(value)){
													activityInfo.limitCount=parseInt(value)
													this.setState({
														activityInfo
													})
												}
											}}/>
									</td>}
									<td>
										<span>开始时间:</span>
										<DatePicker
								      showTime={{defaultValue:moment('00:00:00','HH:mm:ss')}}
								      value={moment(actDetailData.gmtStart)}
								      format="YYYY-MM-DD HH:mm:ss"
								      onChange={(e,s)=>{
								      	s=s? s:moment(actDetailData.gmtStart);
								      	actDetailData.gmtStart=date.parseStamp(s)
								      	this.setState({
								      		actDetailData
								      	})
								    	}}
							    	/>
							    </td>
									<td>
										<span>结束时间:</span>
										<DatePicker
								      showTime={{defaultValue:moment('00:00:00','HH:mm:ss')}}
								      value={moment(actDetailData.gmtEnd)}
								      format="YYYY-MM-DD HH:mm:ss"
								      onChange={(e,s)=>{
								      	s=s? s:moment(actDetailData.gmtEnd);
								      	actDetailData.gmtEnd=date.parseStamp(s)
								      	this.setState({
								      	actDetailData
								      	})
								    	}}
							    	/>
							    </td>
								</tr>
							</tbody>
						</table>
						<table>
							<tbody>
								<tr>
									<td>
										<div>
											<span>关联商品:(SKU:名称)</span>
											<Button size="small" onClick={e=>{
												if(actDetailData.type==1){
													this.setState({
														selectGoodBool:true
													})
											}else{
													this.setState({
														selectGoodCouponsBool:true
													})
												}
											}}>点击添加</Button>
											<Button size="small" style={{marginLeft:10}} onClick={e=>{
												activityInfo.itemInfos=[];
												this.setState({
													activityInfo,
													GoodsdataList:[]
												})
											}}>清空</Button>
										</div>
										<Row>
											{activityInfo.itemInfos&&activityInfo.itemInfos.map((item,index)=>{
													return<Col style={{padding:6}} span="8" key={index}><span>{item.skuId+":"+item.title}</span><span
													className={Style.deleteSpan}
													onClick={e=>{
														activityInfo.itemInfos.splice(index,1)
														this.setState({
															activityInfo,
															GoodsdataList:[]
														})
													}}
												>X</span></Col>
											})}
										</Row>
										{couponsBtn&&<p><div>
											<span>关联优惠券:(ID:名称)</span>
											<Button size="small" onClick={e=>{
												this.setState({
													slectedCouponsBool:true
												})
											}}>点击添加</Button>
											<Button size="small" style={{marginLeft:10}} onClick={e=>{
												activityInfo.couponInfos=[];
												this.setState({
													activityInfo
												})
											}}>清空</Button>
										</div>
										<Row>
											{activityInfo.couponInfos&&activityInfo.couponInfos.map((item,index)=>{
												return<Col style={{padding:6}} span="8" key={index}><span>{item.couponId+":"+item.title}</span><span
													className={Style.deleteSpan}
													onClick={e=>{
														activityInfo.couponInfos.splice(index,1)
														this.setState({activityInfo})
													}}
												>X</span></Col>
											})}
										</Row></p>}
									</td>
								</tr>
							</tbody>
						</table>
					</div>}
				</Modal>
				<Modal
					maskClosable={false}
					title="新增限购活动(称重类型商品不支持)"
					width="55%"
					visible={this.state.limitActBool}
					onCancel={e=>this.setState({limitActBool:false})}
					afterClose={e=>this.setState({addActSuc:false,GoodsdataList:[],actTitle:null,everyoneBuy:null,channelTypeSelected:null,})}
					onOk={e=>{
						var startTime=this.state.startTime||date.parseStamp(moment(date.initTime(1),"YYYY-MM-DD HH:mm:ss"))
						var endTime=this.state.endTime||date.parseStamp(moment(date.initTime(0),"YYYY-MM-DD HH:mm:ss"))
						var runOver=date.overTime(startTime,endTime,true)
						if(isNaN(runOver)){return ''}
						var data={}
						var skuIds=[]
						for(let i in GoodsdataList){
							 skuIds[i]=GoodsdataList[i].skuId
						}
						if(skuIds.length<1){
							return message.warning("请添加关联商品")
						}
						data.name=this.state.actTitle
						data.type=1
						data.gmtStart=startTime
						data.gmtEnd=endTime
						data.limitedTimeDiscount=this.state.limitTimeBuy
						this.state.channelTypeSelected?data.channelType=this.state.channelTypeSelected:data.channelType=0
						data.limitCount=this.state.everyoneBuy
						data.skuIds=skuIds
						this.addActivity(data)
					}}
					className={Style.limitActModal}
				>
					<div
					className={Style.div}>
						<span className={Style.margL}>活动名称:</span><Input maxLength={32} value={this.state.actTitle} onChange={e=>{
							var value=e.target.value
							this.setState({
								actTitle:value
							})
						}}/>
					</div>
					{false&&<div
					className={Style.div}>
						<span className={Style.margL}>限时折扣:<Input value={this.state.limitTimeBuy} onChange={e=>{
							var value=e.target.value
							if(!isNaN(value)){
								if(value>=0&&value<=10){
									this.setState({
									limitTimeBuy:value
								})
								}else{message.info("输入有误,请重新输入。（如：输入8.5折）")}
							}
						}}/>折</span>
					</div>}
					<div
					className={Style.div}>
						<span className={Style.margL}>每笔订单限购:<Input value={this.state.everyoneBuy} onChange={e=>{
							var value=e.target.value||0
							if(!isNaN(value)){
								this.setState({
									everyoneBuy:parseInt(value)
								})
							}
						}}/>件</span>
			    </div>
			    <div
					className={Style.div}>
			   		<span className={Style.margL}>渠道类型:</span>
						<RadioGroup value={this.state.channelTypeSelected||0} onChange={e=>{
							var channelTypeSelected=e.target.value
							this.setState({channelTypeSelected})
						}}>
			        <Radio value={0}>通用</Radio>
			        <Radio value={1}>线上</Radio>
			        <Radio value={2}>线下</Radio>
			      </RadioGroup>
					</div>
					<div
					className={Style.div}>
						<span className={Style.margL}>开始时间:</span>
				     <DatePicker
							defaultValue={moment(date.initTime(1),"YYYY-MM-DD HH:mm:ss")}
     	 				showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
		          format="YYYY-MM-DD HH:mm:ss"
		          placeholder="Start Time"
		          onChange={(e,s)=>{
								var startTime=date.parseStamp(s)
								this.setState({
									startTime
								})
							}}
		        />
		        <span className={Style.margL}>结束时间:</span>
		        <DatePicker
							defaultValue={moment(date.initTime(0),"YYYY-MM-DD HH:mm:ss")}
     	 				showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
		          format="YYYY-MM-DD HH:mm:ss"
		          placeholder="End Time"
		          onChange={(e,s)=>{
								var endTime=date.parseStamp(s)
								this.setState({
									endTime
								})
							}}
		        />
					</div>
					<div
					className={Style.div}>
						<span className={Style.margL}>活动商品:</span>
						<Button size="small" onClick={e=>{
							this.setState({
								selectGoodBool:true
							})
						}}>点击添加</Button>
						<Button size="small" style={{marginLeft:10}} onClick={e=>{
							GoodsdataList=[];
							this.setState({
								GoodsdataList
							})
						}}>清空</Button>
			    </div>
			    <Row>
						{GoodsdataList&&GoodsdataList.map((item,index)=>{
							return<Col style={{padding:6}} span="8" key={index}><span>{item.skuId+":"+item.title}</span><span
								className={Style.deleteSpan}
								onClick={e=>{
									GoodsdataList.splice(index,1)
									this.setState({GoodsdataList})
								}}
							>X</span></Col>
						})}
					</Row>
				</Modal>

				<Modal
					maskClosable={false}
					title="新增满件优惠活动"
					key={actKey}
					visible={this.state.couponsBool}
					onCancel={e=>this.setState({couponsBool:false,actKey:actKey+1})}
					afterClose={e=>this.setState({addActSuc:false,actCouponsTitle:null,discountOffInfos:[],GoodsdataCouponsList:[],startCouponsTime:null,endCouponsTime:null,coupChannelType:0})}
					width="55%"
					onOk={e=>{
						var startTime=this.state.startCouponsTime||date.parseStamp(moment(date.initTime(1),"YYYY-MM-DD HH:mm:ss"))
						var endTime=this.state.endCouponsTime||date.parseStamp(moment(date.initTime(0),"YYYY-MM-DD HH:mm:ss"))
						var runOver=date.overTime(startTime,endTime,true)
						if(isNaN(runOver)){return ''}
						var data={}
						var skuIds=[]
						for(let i in GoodsdataCouponsList){
							 skuIds[i]=GoodsdataCouponsList[i].skuId
						}
						if(skuIds.length<1){
							return message.warning("请添加关联商品")
						}
						var discountOffInfosSend=[]
						for(let i=0;i<discountOffInfos.length;i++){
							if(discountOffInfos[i]){
								if(parseFloat(discountOffInfos[i].discount)>0&&parseFloat(discountOffInfos[i].discountCount)>0){
									discountOffInfosSend.push(discountOffInfos[i])
								}else{
									if(parseFloat(discountOffInfos[i].discount)>0||parseFloat(discountOffInfos[i].discountCount)>0){
										return message.warning("优惠方案输入"+(i+1)+"有误")
									}
								}
							}
						}
						var arr=Object.assign([],discountOffInfosSend)
						arr.sort((a,b)=>{return a.discountCount-b.discountCount})
						for(let i=0;i<arr.length;i++){
							if(parseFloat(arr[i].discount)!=0&&arr[i]){
								if(i+1<arr.length){
									if(parseFloat(arr[i].discount)<=parseFloat(arr[i+1].discount)){
										return message.warning("折扣输入有误，请检查")
									}
								}
							}	
						}
						data.name=this.state.actCouponsTitle
						data.type=0
						data.gmtStart=startTime
						data.gmtEnd=endTime
						data.discountOffInfos=discountOffInfosSend
						data.channelType=this.state.coupChannelType||0
						data.skuIds=skuIds
						this.addActivity(data)
					}}
					className={Style.limitActModal}
				>
					<div
					className={Style.div}>
						<span className={Style.margL}>活动名称:</span><Input maxLength={32} value={this.state.actCouponsTitle} onChange={e=>{
							var value=e.target.value
							this.setState({
								actCouponsTitle:value
							})
						}}/>
					</div>
					<div>
			    	<span className={Style.margL}>优惠方案一：满</span><InputNumber style={{"marginBottom":"10px"}} max={999} min={0} step={1} onChange={e=>{
			    		if(discountOffInfos[0]){
								discountOffInfos[0].discountCount=e
			    		}else{
				    		var data={}
				    		data.discountCount=e
								discountOffInfos[0]=data			    			
			    		}
							this.setState({discountOffInfos})
			    	}}/>
			    	<span style={{"marginRight":"10px"}}>件</span>
			    	<InputNumber style={{"marginBottom":"10px"}} min={0} max={10} step={0.1} onChange={e=>{
			    		if(discountOffInfos[0]){
								discountOffInfos[0].discount=e*10
			    		}else{
			    			var data={}
				    		data.discount=e*10
								discountOffInfos[0]=data
							}	
							this.setState({discountOffInfos})
			    	}}/>
			    	<span>折</span><span style={{"color":"red","marginLeft":"10px"}}>(注：输入2 ，8.5表示满2件打8.5折)</span>
					</div>
					<div>
			    	<span className={Style.margL}>优惠方案二：满</span><InputNumber style={{"marginBottom":"10px"}} max={999} min={0} step={1} onChange={e=>{
			    		if(discountOffInfos[1]){
								discountOffInfos[1].discountCount=e
			    		}else{
				    		var data={}
				    		data.discountCount=e
								discountOffInfos[1]=data			    			
			    		}
							this.setState({discountOffInfos})
			    	}}/>
			    	<span style={{"marginRight":"10px"}}>件</span>
			    	<InputNumber style={{"marginBottom":"10px"}} min={0} max={10} step={0.1} onChange={e=>{
			    		if(discountOffInfos[1]){
								discountOffInfos[1].discount=e*10
			    		}else{
			    			var data={}
				    		data.discount=e*10
								discountOffInfos[1]=data
							}
							this.setState({discountOffInfos})	
			    	}}/>
			    	<span>折</span><span style={{"color":"red","marginLeft":"10px"}}>(没有可不填)</span>
					</div>
					<div>
			    	<span className={Style.margL}>优惠方案三：满</span><InputNumber style={{"marginBottom":"10px"}} max={999} min={0} step={1} onChange={e=>{
			    		if(discountOffInfos[2]){
								discountOffInfos[2].discountCount=e
			    		}else{
				    		var data={}
				    		data.discountCount=e
								discountOffInfos[2]=data			    			
			    		}
							this.setState({discountOffInfos})

			    	}}/>
			    	<span style={{"marginRight":"10px"}}>件</span>
			    	<InputNumber style={{"marginBottom":"10px"}} min={0} max={10} step={0.1} onChange={e=>{
			    		if(discountOffInfos[2]){
								discountOffInfos[2].discount=e*10
			    		}else{
			    			var data={}
				    		data.discount=e*10
								discountOffInfos[2]=data
							}
							this.setState({discountOffInfos})	
			    	}}/>
			    	<span>折</span>
					</div>
			    <div
					className={Style.div}>
			   		<span className={Style.margL}>渠道类型:</span>
						<RadioGroup value={this.state.coupChannelType||0} onChange={e=>{
							var coupChannelType=e.target.value
							this.setState({coupChannelType})
						}}>
			        <Radio value={0}>通用</Radio>
			        <Radio value={1}>线上</Radio>
			        <Radio value={2}>线下</Radio>
			      </RadioGroup>
					</div>
			    <div className={Style.div}>
						<span className={Style.margL}>开始时间:</span>
				     <DatePicker
							defaultValue={moment(date.initTime(1),"YYYY-MM-DD HH:mm:ss")}
     	 				showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
		          format="YYYY-MM-DD HH:mm:ss"
		          placeholder="Start Time"
		          onChange={(e,s)=>{
								var startCouponsTime=date.parseStamp(s)
								this.setState({
									startCouponsTime
								})
							}}
		        />
		        <span className={Style.margL}>结束时间:</span>
		        <DatePicker
							defaultValue={moment(date.initTime(0),"YYYY-MM-DD HH:mm:ss")}
		        	showTime={{defaultValue:moment('00:00:00','HH:mm:ss')}}
		          format="YYYY-MM-DD HH:mm:ss"
		          placeholder="End Time"
		          onChange={(e,s)=>{
								var endCouponsTime=date.parseStamp(s)
								this.setState({
									endCouponsTime
								})
							}}
		        />
			    </div>
			    <div
					className={Style.div}>
						<span className={Style.margL}>活动商品:</span>
						<Button size="small" onClick={e=>{
							this.setState({
								selectGoodCouponsBool:true
							})
						}}>点击添加</Button>
						<Button size="small" style={{marginLeft:10}} onClick={e=>{
							GoodsdataCouponsList=[];
							this.setState({
								GoodsdataCouponsList
							})
						}}>清空</Button>
			    </div>
			    <Row>
						{GoodsdataCouponsList&&GoodsdataCouponsList.map((item,index)=>{
							return<Col style={{padding:6}} span="8" key={index}><span>{item.skuId+":"+item.title}</span><span
								className={Style.deleteSpan}
								onClick={e=>{
									GoodsdataCouponsList.splice(index,1)
									this.setState({GoodsdataCouponsList})
								}}
							>X</span></Col>
						})}
					</Row>
				</Modal>

				<Modal
					maskClosable={false}
					title="选择商品"
					key={modalKey+"a"}
					visible={this.state.selectGoodCouponsBool}
					afterClose={e=>this.setState({modalKey:modalKey+1,goodsData:null,goodsPage:null})}
					onCancel={e=>this.setState({selectGoodCouponsBool:false})}
					onOk={e=>{
						var selectedData=this.state.showSkuSelected
						if(!selectedData){return message.warning("请勾选商品")}
						activityInfo.itemInfos=selectedData
						this.setState({
							GoodsdataCouponsList:selectedData,
							activityInfo,
							selectGoodCouponsBool:false
						})
					}}
					width="90%"
					className={Style.selectGood}
				>
					<Search
						widgets={[
	            {name:"title",type:'input',text:'商品名称'},
	            {name:'skuIds',type:'input',text:'商品skuId集合'}
	          ]}
	          onSearch={e=>{
	          	if(e.skuIds&&e.skuIds!=""){
	          		e.skuIds=e.skuIds.split(",")
	          	}else{delete e.skuIds}
	            this.getItemsInfo(1,e)
	            this.setState({goodsQueryData:e})
	          }}
					/>
					<Table rowKey="id" columns={columns} dataSource={goodsData} rowSelection={rowSelectionRadio}
						pagination={goodsPage}
					/>
				</Modal>

				<Modal
					maskClosable={false}
					title="选择商品"
					key={modalKey+"b"}
					visible={this.state.selectGoodBool}
					onCancel={e=>this.setState({selectGoodBool:false})}
					afterClose={e=>this.setState({modalKey:modalKey+1,goodsData:null,goodsPage:null})}
					onOk={e=>{
						var selectedData=this.state.showSkuSelected
						if(!selectedData){return message.warning("请勾选商品")}
						GoodsdataList=GoodsdataList.concat(selectedData)
						if(edit){
							var item=activityInfo.itemInfos
							if(!item){item=[]}
							var newList=item.concat(GoodsdataList)
							newList=this.ov(newList)
							activityInfo.itemInfos=newList
						}else{
							GoodsdataList=this.ov(GoodsdataList)
						}
						this.setState({
							activityInfo,
							GoodsdataList,
							selectGoodBool:false
						})
					}}
					width="90%"
					className={Style.selectGood}
				>
					<Search
						widgets={[
	            {name:"title",type:'input',text:'商品名称'},
	            {name:'skuIds',type:'input',text:'商品skuId集合'}
	          ]}
	          onSearch={e=>{
	          	if(e.skuIds&&e.skuIds!=""){
	          		e.skuIds=e.skuIds.split(",")
	          	}else{delete e.skuIds}
	            this.getItemsInfo(1,e)
	            this.setState({goodsQueryData:e})
	          }}
					/>
					<Table rowKey="id" columns={columns} dataSource={goodsData} rowSelection={rowSelection}
						pagination={goodsPage}
					/>
				</Modal>
				<Modal
					maskClosable={false}
					title="选择优惠券"
					visible={this.state.slectedCouponsBool}
					onCancel={e=>this.setState({slectedCouponsBool:false})}
					onOk={e=>{
						var selectedData=this.state.showIdSelected
						if(!selectedData){return message.warning("请勾选商品")}
						GoodsdataCouponsList=GoodsdataCouponsList.concat(selectedData)
						if(edit){
							var item=activityInfo.couponInfos
							if(!item){item=[]}
							var newList=item.concat(GoodsdataCouponsList)
							activityInfo.couponInfos=newList
						}
						this.setState({
							activityInfo,
							slectedCouponsBool:false
						})
					}}
					width="90%"
					className={Style.selectGood}
				>
					<Search
						widgets={[
	            {name:"gmtStart",type:'date',text:'开始日期'},
	            {name:'gmtEnd',type:'date',text:'结束日期'}
	          ]}
	          onSearch={e=>{
	          	e.gmtStart=date.parseStamp(e.gmtStart)
	          	e.gmtEnd=date.parseStamp(e.gmtEnd)
	            this.getCoupons(1,e)
	            this.setState({
	            	couponsQueryData:e
	            })
	          }}
					/>
					<Table rowKey="id" columns={columnsCoup} dataSource={couponsData} rowSelection={rowSelectionCoup}
						pagination={couponsPag}
					/>
				</Modal>

				<Search
					widgets={[
            {name:"gmtStart",type:'date',text:'开始日期'},
            {name:'gmtEnd',type:'date',text:'结束日期'}
          ]}
          onSearch={e=>{
          	var timeparse={}
          	timeparse.gmtStart=date.parseStamp(e.gmtStart)
          	timeparse.gmtEnd=date.parseStamp(e.gmtEnd)
           this.getActivityList(1,timeparse)
           this.setState({timeSelectedData:timeparse})
          }}
				/>
				<Table rowKey="id" columns={columnsAct} dataSource={dataSource} pagination={pagination}/>
				<div className={Style.addBtn}>
					<Button type="primary" size="large" onClick={e=>{
						this.setState({
							limitActBool:true
						})
					}}>新增限购活动</Button>
					<Button type="primary" size="large" onClick={e=>{
						this.setState({
							couponsBool:true
						})
					}}>新增满件优惠活动</Button>
				</div>
			</div>
		)
	}
})