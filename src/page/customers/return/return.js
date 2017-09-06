import React from 'react'
import {Table,Button,Input,Select,Tooltip,message,Popconfirm} from 'antd'
import req from 'widget/request'
import ajax from 'widget/ajax'
import date from 'widget/util/date.js'
import Style from './return.less'

const Option=Select.Option
//判断输入逻辑--!(!isNaN(record.refundCount)&&!isNaN(record.inventoryCount)&&!isNaN(record.inventoryLostCount))
export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      selectedRows:0,
      dataorder:null,
      Visible:false,
      dataBuy:null,
      module:null,
      writeWrong:false,
      isOver:false
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
  getPrice(data){
    var promise=ajax({
      url:"/inventory/getPrice",
      method:"post",
      data:data
    })
    promise.then(result=>{
      if(result.success){
        var module=result.module
        this.setState({module})
      }
    })
    promise.fail(errorMsg=>{
      this.setState({
        errorMsg
      })
    })
  },
  orderUpdateInventory(data){
    var promise=ajax({
      url:'/inventory/orderUpdateInventory',
      method:'post',
      data:data
    })
    promise.then(result=>{
      if(result.success){
        message.success("处理成功，重新加载页面")
        var fn=()=>{return window.location.reload()}
        setTimeout(fn, 1500 )
      }
    })
    promise.fail(errorMsg=>{
      this.setState({
        errorMsg
      })
    })
  },
  getSelectedData(data,dataSource){
    var writeWrong=false
    data.skuList.map(item=>{
      for(let i=0;i<dataSource.length;i++){
        if(item.skuId==dataSource[i].skuId){
          item.refundCount=dataSource[i].refundCount
          item.inventoryLostCount=dataSource[i].inventoryLostCount
          item.inventoryCount=dataSource[i].inventoryCount
       }

      }      
      return data
    })
  },
  getdata(selectedRows,dataorder){
    var skuList=[]
    var data={}
    skuList=selectedRows.map((item,index)=>{
      var oData={}
      oData.skuId=item.skuId
      if(item.refundCount){
        oData.refundCount=item.refundCount
      }
      if(item.inventoryCount){
        oData.inventoryCount=item.inventoryCount
      }
      if(item.inventoryLostCount){
        oData.inventoryLostCount=item.inventoryLostCount
      }
      oData.refundOrderSkuType=item.refundOrderSkuType
      return skuList[index]=oData  
    })
    data.orderId=dataorder.id
    data.skuList=skuList
  return data
  },
  onSelectChange(selectedRowKeys,selectedRows) {
    this.setState({ selectedRows});
  },
  componentDidMount(){
    this.getOrderMsg(),
    this.props.params.changeBrumb(['客户管理','客户查询','订单列表','退换货处理'])
  },
  render(){
  	const {dataorder,dataSource,selectedRows,module,writeWrong}=this.state;
    const rowSelection = {
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled:record.count==record.alreadyRefound
      }),
    };
    var hasSelected =selectedRows.length>0;
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
      title: '实际单价',
      dataIndex: 'effePrice',
      key: 'effePrice',
    },{
      title: '实付金额',
      dataIndex: 'effeAmount',
      key: 'effeAmount',
    },{
      title: '处理原因',
      key: 'Price',
      render:(e,record)=>{
        record.refundOrderSkuType=1
        return <Select 
          style={{width:100}} 
          defaultValue="退货"
          onChange={e=>{
            return record.refundOrderSkuType=e
          }}
        >
          <Option value="1">退货</Option>
        </Select>
      }
    },{
      title: '已退数量',
      dataIndex: 'alreadyRefound',
      key: 'alreadyRefound',
    },{
      title: '实退数量',
      key: 'refundCount',
      render:(e,record,index)=>{
        return <Input style={{width:70}} 
          onChange={e=>{
            var refundCount=e.target.value
            if(!isNaN(refundCount)){
              dataSource[index].refundCount=refundCount
              dataSource[index].inventoryCount=refundCount
              this.setState({dataSource})
            }
          }}  
          value={record.refundCount}
        />
      }
    },{
      title: '报损',
      key: 'inventoryLostCount',
      render:(e,record,index)=>{
       return <Input style={{width:70}} value={record.inventoryLostCount} onChange={e=>{
        var inventoryLostCount=e.target.value
        if(!isNaN(inventoryLostCount)){
          dataSource[index].inventoryLostCount=inventoryLostCount
          this.setState({dataSource})
        }
       }}/>
      }
    },{
      title: '处理结果',
      key: 'dealResult',
      dataIndex: 'dealResult',
    }
    ];
    return (
      <div>
        {dataorder&&<div>
          <p>商品列表(<span style={{color:"red"}}>重新填写后请先获取金额，再提交处理</span>)</p>  
          <Table rowKey="id" rowSelection={rowSelection} dataSource={dataSource}  columns={columns}/>
          <div className={Style.refundMethod}>
            <span style={{marginRight:14}}>金额总计:{module&&module}</span>
            {!hasSelected&&<Tooltip placement="topLeft" title="请勾选商品">
              <Button disabled={true} size="small">获取金额</Button>
            </Tooltip>}
            {hasSelected&&<Button  size="small" onClick={e=>{
              var data=this.getdata(selectedRows,dataorder)
              var isOver=false;
              var writeWrong=false
              data.skuList.map(item=>{
                for(let i=0;i<dataSource.length;i++){
                  if(item.skuId==dataSource[i].skuId){
                    item.refundCount=dataSource[i].refundCount
                    item.inventoryLostCount=dataSource[i].inventoryLostCount
                    item.inventoryCount=dataSource[i].inventoryCount
                    if(item.refundCount==""){delete item.refundCount}
                    if(item.inventoryLostCount==""){delete item.inventoryLostCount}
                    if(item.inventoryCount==""){delete item.inventoryCount}
                    var writeWrongA=item.refundCount>(dataSource[i].count-dataSource[i].alreadyRefound)?true:false
                    writeWrong=writeWrongA|writeWrong
                 }

                }
                if(writeWrong==1){writeWrong=true}
                else{writeWrong=false} 
                this.setState({writeWrong})       
                return data
              }) 
              data.skuList.map(item=>{
                var isOverA=item.refundCount<item.inventoryLostCount? true:false
                return isOver=isOverA|isOver
              })
              if(isOver==1){isOver=true}else{
                isOver=false
                if(!writeWrong){
                  this.getPrice(data)
                }
              }
              this.setState({isOver}) 
            }} href="javascript:void(0);">获取金额</Button>}
            <span style={{color:"red"}}>{this.state.isOver&&"报损数量不能大于实退数量"}</span>
            <span style={{color:"red"}}>{this.state.writeWrong&&"实退数量不能大于购买数量与已退数量之差"}</span>
          </div>
          <div style={{textAlign:'center',marginTop:10}}>
            <div>
            {this.state.errorMsg&&<p style={{color:"red",textAlign:"center"}}>{this.state.errorMsg}</p>}
            {!hasSelected&&<Tooltip placement="topLeft" title="请勾选商品">
              <Button disabled={true} type="primary" size="large">提交处理</Button>
            </Tooltip>}
            {hasSelected&&!module&&<Tooltip placement="topLeft" title="请先获取差价">
              <Button disabled={true} type="primary" size="large">提交处理</Button>
            </Tooltip>}
            {hasSelected&&module&&<Popconfirm 
              title="是否确认提交处理" 
              onConfirm={e=>{
                var data=this.getdata(selectedRows,dataorder)
                var orderItemTransformDetail={}
                this.getSelectedData(data,dataSource) 
                data.orderProcessType=0
                orderItemTransformDetail.price=module
                data.orderItemTransformDetail=orderItemTransformDetail
                this.orderUpdateInventory(data)
              }}
              okText="Yes" cancelText="No"
            >
              <Button type="primary" size="large" disabled={this.state.isOver|this.state.writeWrong} href="javascript:void(0);">提交处理</Button>
            
            </Popconfirm>}
              </div>
          </div>
        </div>}		
    	</div>
    	
    	
    )
  },
})

