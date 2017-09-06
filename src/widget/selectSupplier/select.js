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
      supplierInfo:null,
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
      title: '编号',
      dataIndex: 'userId',
      key: 'userId'
    }, {
      title: '类型',
      dataIndex:'userTypeString',
      key: 'userTypeString'
    }, {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    }, {
      title: '联系人',
      dataIndex: 'contract',
      key: 'contract'
    }, {
      title: '手机',
      dataIndex: 'phone',
      key: 'phone'
    }];
  },
  getRowSelect(){
    var self = this
    var onSelect = this.props.onSelect||function(){}
    return {
      type:'radio',
      selectedRowKeys:this.props.value?[this.props.value.userId]:[],
      onChange(key,data){
        onSelect(data[0])
      }
    }
  },
  getSuppliers(){
    var params = {pageNum:this.state.pageNum,pageSize};
    var url = '/supplier/querydefaultsupplierinfo'
    var {userType,query,skuCode,skuKeyWords} = this.state.search

    if(userType&&userType!=-1){
      params.userType = parseInt(userType)
      url = '/supplier/querysupplierinfo'
    }
    if(query){
      params.query = query
      url = '/supplier/querysupplierinfo'
    }
    if(skuCode){
      params.skuCode = skuCode
      url = '/supplier/querysupplierinfo'
    }
    if(skuKeyWords){
      params.skuKeyWords = skuKeyWords
      url = '/supplier/querysupplierinfo'  
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
          supplierInfo:result.module||[]
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
    var promise = this.getSuppliers()
    var {userType} = this.state
    promise.done(result=>{
      if(result.success){
        var userTypeMap = {}
        var {supplierTypes} = result.module
        for(var i in supplierTypes){
          userTypeMap[supplierTypes[i].userType] = supplierTypes[i].userTypeString
        }
        this.setState({userType:Object.assign({},userType,userTypeMap)})
      }
    })
    var {defaultValue} = this.props
    defaultValue&&this.setState({selectSupplier:defaultValue})
  },
  render(){
    var {userType,supplierInfo,selectSupplier} = this.state
    var columns = this.getColumns()
    var {value,onCancel} = this.props
    var inputProps = {
      size:'large',
      style:{width:'200px'},
      value:value&&value.name,
      onChange:e=>{},
      onClick:e=>this.setState({visible:true})
    }
    if(onCancel){
      inputProps.suffix=<i style={{
        fontSize: "12px",
        color: "rgba(0, 0, 0, 0.43)",
        cursor:"pointer"
      }} onClick={e=>onCancel(e)} className="iconfont">&#xe6a6;</i>
    }
    return (
      <FormItem label="供应商">
        <Input {...inputProps}/>
        <Modal
          width={1200}
          title="选择供应商"
          style={{top:5}}
          onCancel={e=>this.setState({visible:false})}
          onOk={e=>{this.setState({visible:false})}}
          visible={this.state.visible}
        >
          <Search
            widgets={[
              {type:"select",text:'供应商类别',options:userType,name:'userType'},
              {type:'input',text:'关键字',placeholder:"输入名称/电话／联系人查询",name:'query'},
              {type:'input',text:'sku编码/69码',name:'skuCode'},
              {type:'input',text:'sku关键字',name:'skuKeyWords'}
            ]}
            onSearch={e=>this.search(e)}
          />
          {supplierInfo&&<Table rowClassName={()=>"min-row"} rowSelection={this.getRowSelect()} pagination={this.getPagination()} rowKey="userId" dataSource={supplierInfo} columns={columns} />}
        </Modal>
      </FormItem>
    )
  }
})
