import React from 'react'
import {Table,Button,Input,message} from 'antd'
import Search from 'widget/search'
import req from 'widget/request'
import style from './table.less'
import ajax from 'widget/ajax'
import date from 'widget/util/date.js'
import statu from 'widget/status/handleStatus.js'

export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      dataGoods:null,
      pagination:{}
    }
  },
  getOrderByPage(page,search){
    var promise=ajax({
      url:'/promotion/detail',
      "data":parseInt(search.data)
    })
    promise.then(e=>{
      if(e.success){
        var module=e.module
        this.setState({
          dataGoods:module
        })
      }
    })

  },
  checkItemCoupon(data){
    var promise=ajax({
      url:'/promotion/checkItemCoupon',
      "data":{"code":data.id+'',"status":-1}
    })
    promise.then(e=>{
      if(e.success){
      	message.success("审核成功")
        this.nearshelflifesku(this.state.current||1)
      }
    })

  },
  nearshelflifesku(page){
  	var {dataGoods}=this.state
    var promise=ajax({
      url:'/promotion/nearshelflifesku',
      "data":{
      	"skuId":dataGoods.skuId,
      	"pageNum":page-1,
      	"pageSize":10
      }	
    })
    promise.then(e=>{
      if(e.success){
        var module=e.module
        this.setState({
          dataSource:module.list,
          pagination:{
          	total:module.totalNum,
          	current:module.currentPageNum+1
          }
        })
      }
    })

  },
  fixGoodsMsg(id,price,count,way,statu){
    var promise=ajax({
      url:'/promotion/set',
     	"data":{"skuId":id,"setPrice":price,"count":count,"status":statu}
    })
    promise.then(result=>{
      if(result.success){
        message.success("修改成功",0.5);
        this.nearshelflifesku(1);
      }else if(!result.success){message.warning(result.errorMsg,1.5);}
    })
  },
  render(){
		var {dataSource,dataGoods,pagination}=this.state
		const switchBtn=location.hash.split('=')[1]
		pagination = Object.assign({},pagination,{
      onChange: (current) => {
        this.nearshelflifesku(current)
        this.setState({current})
      }
    });
		const columns=[{
			title:'ID',
			key:'id',
			render:(e,record)=>{
				return record.id
			}
		},{
			title:'日期',
			key:'gmtCreate',
			render:(e,record)=>{
				return date.parseTime(record.gmtCreate)
			}
		},{
			title:'规格',
			key:'displaySpecifications',
			render:(e)=>{
				return dataGoods.displaySpecifications
			}

		},{
			title:'处理价格',
			key:'price',
			dataIndex:'price'
		},{
			title:'开始时间',
			key:'startTime',
			render:(e,record)=>{
				return date.parseTime(record.startTime)
			}
		},{
			title:'结束时间',
			key:'endTime',
			render:(e,record)=>{
				return date.parseTime(record.endTime)
			}
		},{
			title:'状态',
			key:'status',
			render:(e,record)=>{
				return statu[record.status]
			}
		},{
			title:'订单ID',
			key:'orderId',
			dataIndex:'orderId'
		},{
			title:'店铺',
			key:'shopName',
			dataIndex:'shopName'
		},{
			title:'审核',
			key:`gmtCreate+orderId`,
			render:(e,record)=>{
				if(record.status=='-2'){
					return(
						<Button type="primary" size="small" onClick={e=>
							this.checkItemCoupon(record)
						}>审核使用</Button>
					)
				}
			}
		}

		];
    return (
      <div>
      	<Search
          widgets={[
            {name:'data',type:'input',text:'商品编号'}
          ]}
          onSearch={e=>{
            this.getOrderByPage(1,e)
            this.setState({dataSource:null,pagination:null})
          }}
        />
        {!dataGoods&&<div style={{fontWeight:700,fontSize:18}}>请输入要查询的商品编号</div>}
        {dataGoods&&<div>
	        <div className={style.title}><p>商品信息</p></div>
	        <table cellSpacing="0" className={style.table}>
		        <tbody>
		        	<tr><td>商品名称</td><td>{dataGoods.title}</td><td>类目</td><td>{dataGoods.catName}</td></tr>
		        	<tr><td>原价</td><td>{dataGoods.priceStr}</td><td>促销价</td><td>{dataGoods.promotionPriceStr}</td></tr>
		        	<tr><td>规格</td><td>{dataGoods.displaySpecifications}</td><td>ItemID</td><td>{dataGoods.id}</td></tr>
		        	<tr><td>供应商</td><td>{dataGoods.supplierName}</td><td>skuId</td><td>{dataGoods.skuId}</td></tr>
		        	<tr><td>库存(已扣除安全库存)</td><td>{dataGoods.stocNum}</td><td>安全库存</td><td>{dataGoods.safeStocNum}</td></tr>
		        	<tr><td>有效库位</td><td>{dataGoods.availableStocPosition&&dataGoods.availableStocPosition.map((item,index)=>(<p key={index}>{item}</p>))}</td><td>推荐库位</td><td>{dataGoods.recommondStocPosition&&dataGoods.recommondStocPosition.map((list,index)=>(<p key={index}>{list}</p>))}</td></tr>
		        </tbody>
	        </table>
	        <div className={style.space}></div>
	        <table className={style.forsend}>
	        	<tbody>
	        		<tr>
	        			<td><span>当前商品处理</span></td>
		        		<td><span>数量:</span><Input placeholder="请输入小于100的数字" className={style.lWidth} value={this.state.count} onChange={e=>{
		                    this.setState({
		                      count:e.target.value
		                    })
		            }}/></td>
		        		<td><span>处理方式:</span><select value={this.state.setWay} onChange={e=>{
		                this.setState({
		                  setWay:e.target.value
		                })
		            }} className={style.lWidth}>
		        		<option selected name="一口价">一口价</option></select></td>
		        		<td><span>处理价格:</span><Input placeholder="请输入价格" className={style.lWidth} value={this.state.price} onChange={e=>{
		                this.setState({
		                  price:e.target.value
		                })
		            }}/></td>
		        		{!switchBtn&&<td><Button type="primary" size="large" onClick={e=>{
				    			var count=parseInt(this.state.count);
		              var skuId=dataGoods.skuId;
		        			if(count<100){
		         			 	this.fixGoodsMsg(skuId,this.state.price,count,this.state.setWay,1)
		        			}else{
		                message.warning("输入有误",0.8);
		              }
		     				}} href="javascript:void(0);">确定</Button></td>}
		        		{switchBtn&&<td><Button type="primary" size="large" onClick={e=>{
				    			var count=parseInt(this.state.count);
		              var skuId=dataGoods.skuId;
		        			if(count<100){
		         			 	this.fixGoodsMsg(skuId,this.state.price,count,this.state.setWay,-2)
		        			}else{
		                message.warning("输入有误",0.8);
		              }
		     				}} href="javascript:void(0);">确定</Button></td>}
		     				<td><Button type="primary" size="large" onClick={e=>{
					    		this.nearshelflifesku(1);
		     				}} href="javascript:void(0);">查询</Button></td>
	     				</tr>
     				</tbody>
     			</table>
	        <div className={style.space}></div>
	        <div className={style.title}><p>临期历史记录</p></div>
	        <Table rowKey="id" dataSource={dataSource} pagination={pagination} columns={columns}/>
        </div>}
      </div>
    )
  }
})