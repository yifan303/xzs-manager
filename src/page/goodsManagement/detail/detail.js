import React from 'react'
import {Table,Button,Input,message} from 'antd'
import Search from 'widget/search'
import req from 'widget/request'
import style from './table.less'
import ajax from 'widget/ajax'
import date from 'widget/util/date.js'

export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      dataGoods:null
    }
  },
  componentDidMount(){
    this.getOrderByPage(this.props.params.id)
  },
  getOrderByPage(search){
    var promise=ajax({
      url:'/promotion/detail',
      "data":parseInt(search)
    })
    promise.then(a=>{
      if(a.success){
        var module=a.module
        this.setState({
          dataSource:module.discountItemHistory,
          dataGoods:module
        })
      }
    })

  },
  fixGoodsMsg(id,price,count,way){
    var promise=ajax({
      url:'/promotion/set',
     	"data":{"skuId":id,"setPrice":price,"count":count}
    })
    promise.then(result=>{
    	var skudata={"data":id};
      if(result.success){
        message.success("修改成功",0.5);
        this.getOrderByPage(1,skudata);
      }else if(!result.success){message.warning(result.errorMsg,1.5);}
    })
  },
  render(){
		const {dataSource,dataGoods}=this.state
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
			title:'处理数量',
			key:'count',
			render:(e)=>{return 1}
		},{
			title:'销售数量',
			key:'sell',
			render:(e)=>{return 1}
		},{
			title:'处理方式',
			key:'type',
			render:(e)=>{var a="一口价"; return a}
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
			render:(e,record)=>{if(record.status==0){var a="已使用"}else if(record.status==1){a="未使用"}else{a="未知"} return a}
		},{
			title:'订单ID',
			key:'orderId',
			dataIndex:'orderId'
		},{
			title:'店铺',
			key:'shopName',
			dataIndex:'shopName'
		}];
    return (
      <div>
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
	        <div className={style.title}><p>临期历史记录</p></div>
	        <Table rowKey="id" dataSource={dataSource} columns={columns}/>
        </div>}
      </div>
    )
  }
})
