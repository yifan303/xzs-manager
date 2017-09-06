import React from 'react'
import {
	Button,Table,Modal,DatePicker,
	Input,Radio,message,Col,Row,
	Checkbox,Popconfirm,Select
} from 'antd'
import ajax from 'widget/ajax'
import moment from 'moment'
import Search from 'widget/search'
import date from 'widget/util/date.js'
import Style from './style.less'
import common from 'widget/common'
import binary from './binary.js'

const RadioGroup = Radio.Group;
const Option = Select.Option

var couponTagPlaceholder = "两个框都不选则为全部用户"

var renderCouponTagOption = (optionMap) => {
	return optionMap.map(tagOption=>(
		<Option key={tagOption.value} value={tagOption.value}>{tagOption.text}</Option>
	))
}
var tagOptionMap = [
	{value:"2",text:"天使会员"},
	{value:"4",text:"针对线下用户"},
	{value:"8",text:"针对老用户"},
	{value:"16",text:"针对邀请用户"},
	{value:"32",text:"针对绑定微信用户"},
	{value:"128",text:'针对30天内注册用户'}
]
var negativeTagMap = [
	{value:'-4',text:"针对app用户"},
	{value:'-8',text:'针对新人用户'},
	{value:'-16',text:'针对非邀请用户'},
	{value:'-32',text:'针对未绑定微信用户'},
	{value:"-128",text:'针对非30天内注册用户'}
]

export default React.createClass({
	getInitialState(){
		return{
			dataSource:null,
			pagination:0,
			rowSelection:null,
			goodsData:null,
			goodsPage:0,
			selectGoodBool:false,
			addCouponsBool:false,
			isSuc:false,
			updateCouponsSuc:false,
			couponsDetailData:null,
			couponsDetailBool:false,
			isCorreGood:true,
			couponTag:0,
			couponNegativeTag:0,
			//编辑时触发
			GoodsdataList:[],
			itemInfoList:[],
			modalKey:1
		}
	},
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
					dataSource:module.coupons,
					pagination:{
            total:module.totalPage*10,
            current:module.currentPage+1
          }
				})
			}
		})
	},
	//查看详情
	getCouponDetail(id){
		var promise=ajax({
			url:'/marketActivity/getCouponDetail',
			method:"post",
			data:{"id":id}
		})
		promise.then(e=>{
			if(e.success){
				var module=e.module
				this.setState({
					couponsDetailData:module,
					itemInfoList:module.itemInfoList||[]
				})
			}
		})
	},
	//优惠券更新(修改、终止)
	updateCoupons(data){
		var promise=ajax({
			url:'/marketActivity/updateCoupons',
			method:"post",
			data:data
		})
		promise.then(e=>{
			if(e.success){
				message.success("修改成功")
				this.setState({
					updateCouponsSuc:true
				})
			}else{
				this.setState({
					updateCouponsSuc:false
				})
			}
		})
	},
	addcoupon(data){
		var promise=ajax({
			url:'/item/addcoupon',
			method:"post",
			data:data
		})
		promise.then(e=>{
			if(e.success){
				message.success("优惠券增加成功")
				this.setState({isSuc:true})
			}else{
				this.setState({isSuc:false})
			}
		})
	},
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
	render(){
		var {dataSource,updateCouponsSuc,pagination,rowSelection,goodsData,goodsPage,goodsQueryData,couponsDetailBool,timeSelectedData,couponsDetailData,itemInfoList,isSuc,modalKey,GoodsdataList}=this.state
		if(isSuc||updateCouponsSuc){
			setTimeout(e=>{
    		if(isSuc){this.setState({addCouponsBool:false,isSuc:false});}
    		if(updateCouponsSuc){
    			this.setState({couponsDetailBool:false,updateCouponsSuc:false,couponsDetailData:null});
    			this.getCoupons(this.state.current||1,timeSelectedData)}
    	},1000)
		}
		if(!this.state.isCorreGood){
			setTimeout(e=>{
				if(GoodsdataList.length>0){this.setState({GoodsdataList:[]})}
				else if(itemInfoList.length>0){this.setState({itemInfoList:[]})}
			},100)
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
				this.setState({showSkuSelected,selectedList});
			}
		}
		pagination=Object.assign({},pagination,{
      onChange:(current)=>{
        this.getCoupons(current,timeSelectedData||{})
        this.setState({current})
      }
    })
    goodsPage=Object.assign({},goodsPage,{
      onChange:(current)=>{
        this.getItemsInfo(current,goodsQueryData||{})
      }
    })
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
			title:"编码",
			key:"id",
			dataIndex:"id"
		},{
			title:"优惠券名称",
			key:"title",
			dataIndex:"title"
		},{
			title:"key值",
			key:"key",
			dataIndex:"key"
		},{
			title:"优惠券类型",
			key:"typeString",
			dataIndex:"typeString"
		},{
			title:"优惠券状态",
			key:"status",
			dataIndex:"statuString"
		},{
			title:"生效时间",
			key:"gmtStart",
			render:e=>{
				if(e.gmtStart==null)return ''
				return date.parseTime(e.gmtStart)
			}
		},{
			title:"失效时间",
			key:"gmtEnd",
			render:e=>{
				if(e.gmtEnd==null)return ''
				return date.parseTime(e.gmtEnd)
			}
		},{
			title:"金额",
			key:"amount",
			dataIndex:"amount"
		},{
			title:"渠道类型",
			key:"channelType",
			dataIndex:'channelTypeString'
		},{
			title:"操作",
			key:"gmtModified",
			width:170,
			render:record=>{
				return(
					<div className={Style.actionBtn}>
						<Button type="primary" size="small" onClick={e=>{
							this.getCouponDetail(record.id)
							this.setState({
								couponsDetailBool:true,
							})
						}}>编辑</Button>
						{' '}
						<Button type="primary" size="small" onClick={e=>{
							window.open(`https://m.xianzaishi.${common.isProd?'com':'net'}/mobile/coupon.html?id=${record.key}`)
						}}>优惠卷页面</Button>
					</div>
				)
			}
		}]
		return(
			<div>
				<Modal
					maskClosable={false}
					title="优惠券编辑"
					visible={couponsDetailBool}
					onCancel={e=>this.setState({couponsDetailBool:false,couponsDetailData:null})}
					afterClose={e=>this.setState({couponsDetailBool:false,couponsDetailData:null,associa:undefined})}
					onOk={e=>{
						var runOver=date.overTime(couponsDetailData.gmtStart,couponsDetailData.gmtEnd,true)
						if(isNaN(runOver)){return ''}
						var data={}
						var skuIds=[]
						for(let i in itemInfoList){
							 skuIds[i]=itemInfoList[i].skuId
						}
						data.id=couponsDetailData.id
						data.title=couponsDetailData.title
						if(skuIds.length<1&&this.state.isCorreGood&&!isNaN(this.state.associa)){
							return message.warning("请添加关联商品")
						}
						if(skuIds.length>0){
							data.related=true
						}else{
							data.related=false
						}

						data.sendRulesType=couponsDetailData.sendRulesType
						data.skuIds=skuIds
						data.limitNumber=couponsDetailData.limitNumber
						data.amount=parseInt(couponsDetailData.amount*100)
						data.gmtDayDuration=couponsDetailData.gmtDayDuration
						data.useCondition=couponsDetailData.useCondition
						data.amountLimit=parseInt(couponsDetailData.amountLimit*100)

						data.couponNegativeTag = couponsDetailData.couponNegativeTag
						data.couponTag = couponsDetailData.couponTag
						data.receiveLimitOneDay=couponsDetailData.receiveLimitOneDay||0
						data.channelType=couponsDetailData.channelType
						data.status=couponsDetailData.status
						data.gmtStart=couponsDetailData.gmtStart
						data.gmtEnd=couponsDetailData.gmtEnd
						data.link=couponsDetailData.link
						data.description=couponsDetailData.description
						this.updateCoupons(data)
					}}
					className={Style.actDetail}
					width="70%"
				>
					{couponsDetailData&&<div>
						<table>
							<tbody>
								<tr>
									<td><span>优惠券编码:{couponsDetailData.id}</span></td>
								</tr>
								<tr>
									<td>key值:{couponsDetailData.key}</td>
								</tr>
								<tr>
									<td>
										<span>开始时间:</span>
										<DatePicker
		        					showTime={{defaultValue:moment('00:00:00','HH:mm:ss')}}
								      value={moment(couponsDetailData.gmtStart)}
								      format="YYYY-MM-DD HH:mm:ss"
								      onChange={(e,s)=>{
								      	s=s? s:moment(couponsDetailData.gmtStart);
								      	couponsDetailData.gmtStart=date.parseStamp(s)
								      	this.setState({
								      		couponsDetailData
								      	})
								    	}}
							    	/>
							    </td>
							  </tr>
								<tr>
									<td>
										<span>结束时间:</span>
										<DatePicker
		        					showTime={{defaultValue:moment('23:59:59','HH:mm:ss')}}
								      value={moment(couponsDetailData.gmtEnd)}
								      format="YYYY-MM-DD HH:mm:ss"
								      onChange={(e,s)=>{
								      	s=s? s:moment(couponsDetailData.gmtStart);
								      	couponsDetailData.gmtEnd=date.parseStamp(s)
								      	this.setState({
								      	couponsDetailData
								      	})
								    	}}
							    	/>
							    </td>
								</tr>
								<tr>
									<td>
										<span>优惠券名称:</span>
										<Input style={{width:180}} maxLength={32} value={couponsDetailData.title} onChange={e=>{
											couponsDetailData.title=e.target.value
											this.setState({
												couponsDetailData
											})
										}}/>
									</td>
								</tr>
								<tr>
									<td>
										<span>面额:</span>
										<Input style={{width:180}} value={couponsDetailData.amount} maxLength={12} onChange={e=>{
												var value=e.target.value
												if(!isNaN(value)){
													couponsDetailData.amount=value||null
													this.setState({couponsDetailData})
												}
										}}/>元
									</td>
								</tr>
								<tr>
									<td>
										<span>领取后有效天数:</span>
										<Input style={{width:180}} value={couponsDetailData.gmtDayDuration} onChange={e=>{
												var value=e.target.value
						         		date.overTime(couponsDetailData.gmtStart,couponsDetailData.gmtEnd,true)
							        	if(!isNaN(value)){
							        		var timeLimit=date.overTime(couponsDetailData.gmtStart,couponsDetailData.gmtEnd)
							        		if(timeLimit<value&&timeLimit>0){
														message.info("最多可设置为"+timeLimit+"天")
							        		}else{
							        			couponsDetailData.gmtDayDuration=parseInt(value)||null
							        			this.setState({couponsDetailData})
							        		}
							          }
							        }}/>
									</td>
								</tr>
								<tr>
									<td>
										<span>限定用户:</span>
										<Select
											mode="multiple"
											placeholder={couponTagPlaceholder}
											onChange={e=>{
												couponsDetailData.couponTag = binary.join(e)
												this.setState({couponsDetailData})
											}}
											style={{width:200}}
											value={binary.split(couponsDetailData.couponTag).map(tag=>String(tag))}
										>
											{renderCouponTagOption(tagOptionMap)}
										</Select>
										{' '}
										<Select
											mode="multiple"
											placeholder={couponTagPlaceholder}
											onChange={e=>{
												couponsDetailData.couponNegativeTag = binary.join(e)
												this.setState({couponsDetailData})
											}}
											style={{width:200}}
											value={binary.negativeSplit(couponsDetailData.couponNegativeTag).map(tag=>String(tag))}
										>
											{renderCouponTagOption(negativeTagMap)}
										</Select>
									</td>
								</tr>
								<tr>
									<td>
										<span className={Style.margL}>描述：</span>
										<Input value={couponsDetailData.description} style={{width:280}} onChange={e=>{
											couponsDetailData.description=e.target.value
											this.setState({couponsDetailData})
										}}/>

									</td>
								</tr>
								<tr>
									<td>
										<span className={Style.margL}>链接地址：</span>
										<Input value={couponsDetailData.link} style={{width:320}} className={Style.lineBe} type="text-area" onChange={e=>{
											couponsDetailData.link=e.target.value
											this.setState({
												couponsDetailData
											})
										}} onBlur={e=>{
											var patt=/^http(s|)\:\/\/\S*xianzaishi\.(com|net)\W*/g
											var str=this.state.link
											if(!patt.test(str)){
												this.setState({tip:true})
											}else{this.setState({tip:false})}
										}}/>
										{this.state.tip&&<span style={{color:"red"}}>*请输入正确urls</span>}
									</td>
								</tr>
								<tr>
									<td>
						        <span>使用金额条件:</span>
										<RadioGroup value={couponsDetailData.useCondition} onChange={e=>{
												couponsDetailData.useCondition=e.target.value
												couponsDetailData.amountLimit=null
											this.setState({couponsDetailData})
										}}>
							        <Radio value={0}>无条件</Radio>
							        <Radio value={1}>满<Input value={couponsDetailData.useCondition!==0&&couponsDetailData.amountLimit||null} onChange={e=>{
												var value=e.target.value
							        	if(!isNaN(value)){
							        		couponsDetailData.amountLimit=value||null
							        		this.setState({couponsDetailData})
							          }
							        }} style={{width:80}} className={Style.lineBe}/>元使用</Radio>
							      </RadioGroup>
									</td>
								</tr>
								<tr>
									<td>
							   		<span className={Style.margL}>渠道类型:</span>
										<RadioGroup value={couponsDetailData.channelType} onChange={e=>{
											couponsDetailData.channelType=e.target.value
											this.setState({couponsDetailData})
										}}>
							        <Radio value={0}>通用</Radio>
							        <Radio value={1}>线上</Radio>
							        <Radio value={2}>线下</Radio>
							      </RadioGroup>
							    </td>
							  </tr>
								<tr>
									<td>
										<span>领取规则:</span>
										<RadioGroup value={couponsDetailData.sendRulesType} onChange={e=>{
											couponsDetailData.sendRulesType=e.target.value
												couponsDetailData.limitNumber=null
											this.setState({couponsDetailData})
									}}>
						        <Radio value={1}>用户拥有该优惠券数量不满<Input value={couponsDetailData.sendRulesType==1&&couponsDetailData.limitNumber||null} onChange={e=>{
						        	couponsDetailData.limitNumber=parseInt(e.target.value)||null
							        	if(!isNaN(e.target.value)){
							        	this.setState({couponsDetailData})
						          }
						        }} style={{width:80}} className={Style.lineBe}/>张就发</Radio>
						        <Radio value={2}>用户该优惠券有效可用数量不满<Input value={couponsDetailData.sendRulesType==2&&couponsDetailData.limitNumber||null} onChange={e=>{
						        	couponsDetailData.limitNumber=parseInt(e.target.value)||null
							        	if(!isNaN(e.target.value)){
							        	this.setState({couponsDetailData})
						          }
						        }} style={{width:80}} className={Style.lineBe}/>张就发</Radio>
						      </RadioGroup>
									</td>
								</tr>
								<tr>
									<td>
										<span>每日限领:</span>
										<Input style={{width:180}} value={couponsDetailData.receiveLimitOneDay} onChange={e=>{
												var value=e.target.value
							        	if(!isNaN(value)){
							        		couponsDetailData.receiveLimitOneDay=value
							        		this.setState({
							        			couponsDetailData
							        		})
							          }
							        }}/>
										<span>张(注：输入0或者不输表示不限制)</span>
									</td>
								</tr>
								<tr>
									<td>
							   		<span className={Style.margL}>优惠券状态:</span>
										<RadioGroup value={couponsDetailData.status} onChange={e=>{
											couponsDetailData.status=e.target.value
										  	this.setState({couponsDetailData})
										}}>
							        <Radio value={-1}>无效</Radio>
							        <Radio value={1}>有效</Radio>
							      </RadioGroup>
									</td>
								</tr>
							</tbody>
						</table>
						<table>
							<tbody>
								<tr>
									<td>
											<span className={Style.margL}>是否关联商品:</span><RadioGroup value={isNaN(this.state.associa)?(itemInfoList.length>0?0:1):this.state.associa} onChange={e=>{
												var	associa=e.target.value
												var isCorreGood=associa==1?false:true;
												if(isCorreGood){this.getCouponDetail(couponsDetailData.id)}
												this.setState({isCorreGood,associa})
											}}>
								        <Radio value={1}>不关联</Radio>
								        <Radio value={0}>关联</Radio>
								      </RadioGroup>
											{(isNaN(this.state.associa)?(itemInfoList.length>0?true:false):this.state.isCorreGood)&&<div><Button size="small" onClick={e=>{
												this.setState({
													selectGoodBool:true
												})
											}}>点击添加</Button>
											<Button size="small" style={{marginLeft:10}} onClick={e=>{
												itemInfoList=[];
												this.setState({
													itemInfoList
												})
											}}>清空</Button>
										</div>}
										<Row>
											{itemInfoList&&itemInfoList.map((item,index)=>{
													return<Col style={{padding:6}} span="8" key={index}><span>{item.skuId+":"+item.title}</span><span
													className={Style.deleteSpan}
													onClick={e=>{
														itemInfoList.splice(index,1)
														this.setState({itemInfoList})
													}}
												>X</span></Col>
											})}
										</Row>
									</td>
								</tr>
							</tbody>
						</table>
					</div>}
				</Modal>

				<Modal
					maskClosable={false}
					title="新增优惠券"
					visible={this.state.addCouponsBool}
					onCancel={e=>this.setState({addCouponsBool:false})}
					afterClose={e=>this.setState({isSuc:false,GoodsdataList:[],actTitle:null,sendRulesType:1,limitTimeBuy:null,distributeAmount:null,hasCouponsG:null,useCondition:0,channelTypeSelected:0,hasCouponsU:null,hasCouponsN:null,isCorreGood:true,associa:0,hasCouponsT:null})}
					width="70%"
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
						if(skuIds.length<1&&this.state.isCorreGood){
							return message.warning("请添加关联商品")
						}
						data.title=this.state.actTitle
						data.sendRulesType=this.state.sendRulesType||1
						data.limitNumber=0
						if(this.state.sendRulesType=="1"){data.limitNumber=this.state.hasCouponsN}
						else if(this.state.sendRulesType=="2"){data.limitNumber=this.state.hasCouponsU}
						data.gmtDayDuration=this.state.hasCouponsT
						data.startTime=startTime
						data.description=this.state.description
						data.link=this.state.link
						data.endTime=endTime
						data.amount=parseInt(this.state.limitTimeBuy*100)
						data.distributeAmount=this.state.distributeAmount||1
						data.channelType=this.state.channelTypeSelected||0
						data.useCondition=this.state.useCondition||0
						data.couponTag = this.state.couponTag
						data.receiveLimitOneDay=this.state.receiveLimitOneDay||0
						data.couponNegativeTag = this.state.couponNegativeTag
						data.amountLimit=0
						if(this.state.useCondition=="1"){data.amountLimit=parseInt(this.state.hasCouponsG*100)}
						data.skuIds=skuIds
						if(skuIds.length>0){
							data.related=true
						}else{
							data.related=false
						}
						this.addcoupon(data)
					}}
					className={Style.limitActModal}
				>
					<div
					className={Style.div}>
						<span className={Style.margL}>开始时间:</span>
				    <DatePicker
		          format="YYYY-MM-DD HH:mm:ss"
							defaultValue={moment(date.initTime(1),"YYYY-MM-DD HH:mm:ss")}
		        	showTime={{defaultValue:moment('00:00:00','HH:mm:ss')}}
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
		        	showTime={{defaultValue:moment('23:59:59','HH:mm:ss')}}
		          format="YYYY-MM-DD HH:mm:ss"
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
						<span className={Style.margL}>优惠券名称:</span><Input style={{width:180}} value={this.state.actTitle} onChange={e=>{
							var value=e.target.value
							this.setState({
								actTitle:value
							})
						}}/>
						{false&&<span className={Style.margL}>发行张数:<Input style={{width:180}} value={this.state.distributeAmount} onChange={e=>{
								var value=e.target.value||0
								if(!isNaN(value)){
									this.setState({
										distributeAmount:parseInt(value)
									})
								}
						}}/></span>}
						<span className={Style.margL}>面额:<Input style={{width:180}} value={this.state.limitTimeBuy} onChange={e=>{
							var value=e.target.value
							if(!isNaN(value)){
								this.setState({
									limitTimeBuy:value
								})
							}
						}}/>元</span>
					</div>
					<div className={Style.div}>
						<span className={Style.margL}>领取后有效天数:
						<Input style={{width:180}} value={this.state.hasCouponsT} onChange={e=>{
							var startTime=this.state.startTime||date.parseStamp(moment(date.initTime(1),"YYYY-MM-DD HH:mm:ss"))
							var endTime=this.state.endTime||date.parseStamp(moment(date.initTime(0),"YYYY-MM-DD HH:mm:ss"))
		         		date.overTime(startTime,endTime,true)
		        		var value=e.target.value
			        	if(!isNaN(value)){
			        		var timeLimit=date.overTime(startTime,endTime)
			        		timeLimit<value&&timeLimit>0? message.info("最多可设置为"+timeLimit+"天"):this.setState({hasCouponsT:parseInt(value)||null})
			          }
			        }}/></span>
					</div>
					<div className={Style.div}>
						<span className={Style.margL}>限定用户:</span>
						<Select
							mode="multiple"
							placeholder={couponTagPlaceholder}
							onChange={e=>{
								this.setState({couponTag:binary.join(e)})
							}}
							style={{width:200}}
							allowClear={true}
							value={binary.split(this.state.couponTag).map(tag=>String(tag))}
						>
							{renderCouponTagOption(tagOptionMap)}
						</Select>
						{' '}
						<Select
							mode="multiple"
							placeholder={couponTagPlaceholder}
							onChange={e=>{
								this.setState({couponNegativeTag:binary.join(e)})
							}}
							style={{width:200}}
							value={binary.negativeSplit(this.state.couponNegativeTag).map(tag=>String(tag))}
						>
							{renderCouponTagOption(negativeTagMap)}
						</Select>
					</div>
					<div className={Style.div}>
						<span className={Style.margL}>描述：</span>
						<Input value={this.state.description} style={{width:280}} onChange={e=>{
							var description=e.target.value
							this.setState({description})
						}}/>
					</div>
					<div className={Style.div}>
						<span className={Style.margL}>链接地址：</span>
						<Input value={this.state.link} style={{width:320}} className={Style.lineBe} type="text-area" onChange={e=>{
							var link=e.target.value
							this.setState({
								link
							})
						}} onBlur={e=>{
							var patt=/^http(s|)\:\/\/\S*xianzaishi\.(com|net)\W*/g
							var str=this.state.link
							if(!patt.test(str)){
								this.setState({tip:true})
							}else{this.setState({tip:false})}
						}}/>
						{this.state.tip&&<span style={{color:"red"}}>*请输入正确urls</span>}
					</div>
			    <div
						className={Style.div}>
		        <span className={Style.margL}>使用金额条件:</span>
						<RadioGroup value={this.state.useCondition||0} onChange={e=>{
								var useCondition=e.target.value
							this.setState({useCondition})
						}}>
			        <Radio value={0}>无条件</Radio>
			        <Radio value={1}>满<Input value={this.state.hasCouponsG} onChange={e=>{
			        	var value=e.target.value
				        	if(!isNaN(value)){
				        	this.setState({
				        		hasCouponsG:value
				        	})
			          }
			        }} style={{width:80}} className={Style.lineBe}/>元使用</Radio>
			      </RadioGroup>
			    </div>
			    <div
					className={Style.div}>
			   		<span className={Style.margL}>渠道类型:</span>
						<RadioGroup value={this.state.channelTypeSelected||0} onChange={e=>{
							this.setState({
								channelTypeSelected:e.target.value
							})
						}}>
			        <Radio value={0}>通用</Radio>
			        <Radio value={1}>手机</Radio>
			        <Radio value={2}>店里</Radio>
			      </RadioGroup>
			    </div>
					<div
					className={Style.div}>
						<span className={Style.margL}>领取规则:</span>
						<RadioGroup value={this.state.sendRulesType||1} onChange={e=>{
							this.setState({
								sendRulesType:e.target.value
							})
						}}>
			        <Radio value={1}>用户拥有该优惠券数量不满<Input style={{width:180}} value={this.state.hasCouponsN} onChange={e=>{
			        	var value=e.target.value
				        	if(!isNaN(value)){
				        	this.setState({
				        		hasCouponsN:parseInt(value)||null
				        	})
			          }
			        }} style={{width:80}} className={Style.lineBe}/>张就发</Radio>
			        <Radio value={2}>用户该优惠券有效可用数量不满<Input style={{width:180}} value={this.state.hasCouponsU} onChange={e=>{
			        	var value=e.target.value
				        	if(!isNaN(value)){
				        	this.setState({
				        		hasCouponsU:parseInt(value)||null
				        	})
			          }
			        }} style={{width:80}} className={Style.lineBe}/>张就发</Radio>
			      </RadioGroup>
			    </div>
					<div className={Style.div}>
						<span className={Style.margL}>每日限领:
						<Input style={{width:180}} value={this.state.receiveLimitOneDay} onChange={e=>{
							var receiveLimitOneDay=e.target.value
							if(!isNaN(receiveLimitOneDay)){
								this.setState({receiveLimitOneDay})
							}
							
			      }}/>张(注：输入0或者不输表示不限制)</span>
					</div>
			    <div className={Style.div}>
						<span className={Style.margL}>是否关联商品:</span><RadioGroup value={this.state.associa||0} onChange={e=>{
							var	associa=e.target.value
							var isCorreGood=associa==1?false:true;
							this.setState({isCorreGood,associa})
						}}>
			        <Radio value={1}>不关联</Radio>
			        <Radio value={0}>关联</Radio>
			      </RadioGroup>
			    </div>
					{this.state.isCorreGood&&<div className={Style.div,Style.margL}><Button size="small" onClick={e=>{
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
					</div>}
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
					title="选择商品"
					key={modalKey}
					visible={this.state.selectGoodBool}
					onCancel={e=>this.setState({selectGoodBool:false})}
					afterClose={e=>this.setState({showSkuSelected:[],selectedList:[],modalKey:modalKey+1,goodsData:null,goodsPage:null})}
					onOk={e=>{
						var selectedData=this.state.showSkuSelected
						if(!selectedData){return message.warning("请勾选商品")}
						if(couponsDetailData){
							itemInfoList=itemInfoList.concat(selectedData)
							itemInfoList=this.ov(itemInfoList)
							this.setState({
								itemInfoList,
								selectGoodBool:false
							})
						}else{
							GoodsdataList=GoodsdataList.concat(selectedData)
							GoodsdataList=this.ov(GoodsdataList)
							this.setState({
								GoodsdataList,
								selectGoodBool:false
							})
						}
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

				<Search
					widgets={[
            {name:"gmtStart",type:'date',text:'开始日期'},
            {name:'gmtEnd',type:'date',text:'结束日期'}
          ]}
          onSearch={e=>{
          	var timeparse={}
          	timeparse.gmtStart=date.parseStamp(e.gmtStart)
          	timeparse.gmtEnd=date.parseStamp(e.gmtEnd)
            this.getCoupons(1,timeparse)
            this.setState({timeSelectedData:timeparse})
          }}
				/>
				<Table rowKey="id" columns={columnsAct} dataSource={dataSource} pagination={pagination}/>
				<div className={Style.addBtn}>
					<Button type="primary" size="large" onClick={e=>{
						this.setState({
							addCouponsBool:true
						})
					}}>新增优惠券</Button>
				</div>
			</div>
		)
	}
})
