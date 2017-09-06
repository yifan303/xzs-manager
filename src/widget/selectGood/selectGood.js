import React from 'react'
import {Input,Form,Modal,Table,Radio} from 'antd'
import Search from 'widget/search'
import request from 'widget/request'

var FormItem = Form.Item
var pageSize = 10;

export default React.createClass({
  getInitialState(){
    return {
      userType:{"-1":"全部"},
      visible:false,
      goodInfo:null,
      selectGood:{},
      search:{},
      pageNum:0,
      total:0
    }
  },
  search(search){
    this.setState({search,pageNum:0},()=>this.getSuppliers())
  },
  getColumns(){
    return [{
      title: '商品编码',
      dataIndex: 'skuId',
      key: 'skuId'
    }, {
      title: '类别',
      dataIndex:'catName',
      key: 'catName'
    }, {
      title: '名称',
      dataIndex: 'title',
      key: 'title'
    }, {
      title: '商品规格详细',
      dataIndex: 'specification',
      key: 'specification'
    }, {
      title: '当前库存数量/单位',
      dataIndex: 'inventory',
      key: 'inventory',
      width:100
    }, {
      title: '供应商',
      dataIndex:'supplierName',
      key: 'supplierName',
      width:200
    }, {
      title: '销售单位',
      dataIndex: 'saleUnit',
      key: 'saleUnit'
    }, {
      title: '采购单位',
      dataIndex: 'purchaseUnit',
      key: 'purchaseUnit'
    }];
  },
  getRowSelect(){
    var self = this
    var onSelect = this.props.onSelect||function(){}
    return {
      selectedRowKeys:this.props.value?[this.props.value.skuId]:[],
      type:'radio',
      onChange(key,data){
        self.setState({selectGood:data[0]})
        onSelect(data[0])
      }
    }
  },
  getSuppliers(skuId,title){
    var params = {pageNum:this.state.pageNum,pageSize};
    var url = '/item/querypurchaseitem'
    var {skuId,title} = this.state.search
    if(skuId){
      params.skuId = skuId
    }else if(title){
      params.title = title
    }else{
      url = '/item/querydefaultpurchaseitem'
    }
    var promise = request(url,{
      method:'post',
      data:params,
      dataType:'json'
    })
    promise.done(result=>{
      if(result.success){
        this.setState({
          pageNum:result.currentPageNum,
          total:result.totalNum,
          goodInfo:result.module
        })
      }
    })
    return promise
  },
  getPagination(){
    var self = this
    return {
      current:self.state.pageNum+1,
      pageSize,
      total:self.state.total,
      onChange(page){
        self.setState({pageNum:page-1},()=>{
          self.getSuppliers()
        })
      }
    }
  },
  componentDidMount(){
    this.getSuppliers()
    var {defaultValue} = this.props
    defaultValue&&this.setState({selectSupplier:defaultValue})
  },
  empty(){
    this.setState({selectGood:{}})
  },
  render(){
    var {goodInfo,selectGood} = this.state
    var columns = this.getColumns()
    var {value} = this.props
    return (
      <FormItem label="商品">
        <Input size='large' style={{width:'200px'}} value={value&&value.title} onChange={e=>{}} onClick={e=>this.setState({visible:true})}/>
        <Modal
          width={900}
          title="选择商品"
          onCancel={e=>this.setState({visible:false})}
          onOk={e=>{this.setState({visible:false})}}
          visible={this.state.visible}
        >
          <Search
            widgets={[
              {type:"input",text:'SKU编码',name:'skuId'},
              {type:'input',text:'SKU名称',name:'title'}
            ]}
            onSearch={e=>this.search(e)}
          />
          {goodInfo&&<Table rowSelection={this.getRowSelect()} pagination={this.getPagination()} rowKey="skuId" dataSource={goodInfo} columns={columns} />}
        </Modal>
      </FormItem>
    )
  }
})
