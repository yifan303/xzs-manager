import React from 'react'
import {Input,Form,Modal,Table,Radio,message} from 'antd'
import Search from 'widget/search'
import request from 'widget/request'
import goodStatus from 'widget/status/goodStatus.js'

var FormItem = Form.Item
var pageSize = 10;

export default React.createClass({
  getInitialState(){
    return {
      userType:{"-1":"全部"},
      visible:false,
      goodInfo:null,
      selectList:[],
      search:{status:'1'},
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
      key: 'skuId',
      width:100
    }, {
      title: '类别',
      dataIndex:'catName',
      key: 'catName'
    }, {
      title: '名称',
      dataIndex: 'title',
      key: 'title',
      width:200
    }, {
      title: '商品规格详细',
      dataIndex: 'specification',
      key: 'specification'
    }, {
      title:'周日均线上销量',
      dataIndex:'saleCountOnLine',
      key:'saleCountOnLine'
    }, {
      title:'周日均线下销量',
      dataIndex:'saleCountOffLine',
      key:'saleCountOffLine'
    }, {
      title: '当前销售库存',
      dataIndex: 'inventory',
      width:100,
      render:(data,record)=>{
        return record.inventory + record.saleUnit
      }
    }, {
      title: '采购数量',
      dataIndex:'count',
      width:120,
      render:(data,record,index)=>{
        return (
          <span>
            <Input style={{width:50}} value={record.count} onChange={e=>{
              record.count=e.target.value.replace(/\D/g,'')
              var {selectList,goodInfo} = this.state
              var filter = selectList.filter(select=>record.skuId===select.skuId)
              if(filter.length>0){
                filter[0].count = record.count
              }
              this.setState({
                goodInfo,
                selectList
              })
            }}/>
            {record.purchaseUnit}
          </span>
        )
      }
    }, {
      title:'箱规',
      dataIndex:'pcProportion',
      key:'pcProportion',
      render(data,record){
        return record.count*record.pcProportion/1000+record.saleUnit
      }
    }, {
      title: '供应商',
      dataIndex:'supplierName',
      key: 'supplierName',
      width:200
    }];
  },
  getRowSelect(){
    var {selectList} = this.state
    return {
      selectedRowKeys:selectList.map(select=>select.skuId),
      type:'checkbox',
      onSelect:(record,selected,selectedRows)=>{
        var selectList = Object.assign([],this.state.selectList)
        if(selected){
          var length = selectList.filter(select=>select.skuId===record.skuId).length
          if(length===0){
            selectList.push(Object.assign({},record))
          }
        }else{
          selectList = selectList.filter(select=>select.skuId!==record.skuId)
        }
        this.setState({selectList})
      },
      onSelectAll:(selected, selectedRows, changeRows)=>{
        var selectList = Object.assign([],this.state.selectList)
        if(selected){
          selectedRows.forEach(select=>{
            var length = selectList.filter(sr=>sr.skuId===select.skuId).length
            if(length===0){
              selectList.push(Object.assign({},select))
            }
          })
        }else{
          var {goodInfo} = this.state
          goodInfo.forEach(select=>{
            selectList = selectList.filter(sl=>select.skuId!==sl.skuId)
          })
        }
        this.setState({selectList})
      }
    }
  },
  getSuppliers(){
    var params = {
      pageNum:this.state.pageNum,
      pageSize
    }
    var url = '/item/querypurchaseitem'
    var {skuId,title,status} = this.state.search
    if(skuId){
      params.skuId = skuId
    }else if(title){
      params.title = title
    }else{
      url = '/item/querydefaultpurchaseitem'
    }
    if(status&&status!=='-100'){
      params.status = status
      url = '/item/querypurchaseitem'
    }
    var {supplierId} = this.props
    if(!supplierId){
      return
    }
    params.supplierId = supplierId
    var promise = request(url,{
      method:'post',
      data:params,
      dataType:'json'
    })
    promise.done(result=>{
      if(result.success){
        var {selectList} = this.state
        this.setState({
          pageNum:result.currentPageNum||0,
          total:result.totalNum||0,
          goodInfo:(result.module||[]).map(good=>{
            var filter = selectList.filter(select=>select.skuId===good.skuId)
            if(filter.length>0){
              return Object.assign({},filter[0])
            }
            good.count = 1
            return good
          })
        })
      }else{
        this.setState({
          pageNum:0,
          total:0,
          goodInfo:[]
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
  },
  render(){
    var {goodInfo,selectList} = this.state
    var columns = this.getColumns()
    var {value,onOk,...props} = {...this.props,width:1100}
    return (
      <Modal
        {...props}
        style={{top:4}}
        onOk={e=>{
          onOk&&onOk(Object.assign([],selectList))
          this.setState({selectList:[]})
        }}
      >
        <Search
          widgets={[
            {type:"input",text:'SKU编码',name:'skuId'},
            {type:'input',text:'SKU名称',name:'title'},
            {type:'select',text:'状态',name:'status',width:200,options:goodStatus,defaultValue:goodStatus['1']}
          ]}
          onSearch={e=>this.search(e)}
        />
        {goodInfo&&<Table rowClassName={()=>"min-row"} rowSelection={this.getRowSelect()} pagination={this.getPagination()} rowKey="skuId" dataSource={goodInfo} columns={columns} />}
      </Modal>
    )
  }
})
