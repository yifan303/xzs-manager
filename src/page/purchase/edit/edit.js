import React from 'react'
import {Input,Form,DatePicker,Table,Button,Modal,Select,InputNumber,message,Popconfirm} from 'antd'
import SelectSupplier from 'widget/selectSupplier'
import SelectMultiGood from 'widget/selectGood/selectMultiGood.js'
import moment from 'moment'
import styles from './edit.less'
import warehouseMap from 'widget/status/warehouse.js'
import request from 'widget/request'
import ajax from 'widget/ajax'
import login from 'widget/login'
import $ from 'jquery'


var FormItem = Form.Item
var Option = Select.Option

export default React.createClass({
  getInitialState(){
    return {

      supplier:{},

      purchase:moment(),
      arrive:moment(),
      list:[],

      // 添加采购单 弹框
      appendVisible:false,

      // 修改采购单 弹框
      visible:false,
      editIndex:0,

      remark:'',

      //采购单状态
      orderStatus:0
    }
  },
  getColumns(){
    var self = this
    var {orderStatus} = this.state
    var columns = [
      { title: '序号', key: 'index',width:50 ,render(data,record,index){ return index + 1 }},
      { title: '商品', dataIndex: 'title' ,width:300},
      { title: '商品编码', dataIndex: 'skuId',width:100 },
      { title: '数量', dataIndex: 'count',width:60 },
      { title: '采购单位', dataIndex: 'purchaseUnit',width:100 },
      { title: '购货单价', dataIndex:'discountPrice',width:100 },
      { title: '当前销售库存', dataIndex:'inventory',key:'inventory',width:120 },
      { title: '购货总金额', dataIndex:'total',width:100,render(data,record){
        var count = parseInt(record.count)
        var price = parseFloat(record.discountPrice)
        if(!count||!price){
          return ''
        }
        return (count*price).toFixed(2)
      } },
      {
        title:'预计销售库存变动',
        dataIndex:'pcProportion',
        key:'pcProportion',
        width:150,
        render(data,record){
          return record.count*record.pcProportion/1000+record.saleUnit
        }
      },
      { title: '实际金额', dataIndex: 'subPurchaseActualAmount',width:100 },
      { title:'实际入库数量', dataIndex: 'actualCount',width:100 },
      {
        title:'实际销售库存变动',
        dataIndex:'actualInventory',
        key:'actualInventory',
        width:150
      },
      { title: '商品规格', dataIndex: 'specification',width:150 },
      { title: '仓库(批量)', dataIndex: 'wareHouse',width:100,render:wareHouse => warehouseMap["0"] },
      { title: '备注', dataIndex:'checkInfo',key:'checkInfo',width:200},
      {
        title: '操作',
        fixed:'right',
        render(data,record,editIndex){
          return (
            <span>
              <Popconfirm title="确定删除该采购单?" onConfirm={e=>self.del(record)}>
                <Button onClick={e=>{}}>删除</Button>
              </Popconfirm>
              {' '}
              <Button type="primary" onClick={e=>{
                self.setState({editIndex,visible:true})
                // 保存要修改采购单的数量  为了在修改失败时回填
                var editObj = self.state.list[editIndex]
                editObj.countBak = editObj.count
              }}>修改</Button>
            </span>
          )
        }
      }
    ]
    if(orderStatus==8){
      columns = columns.filter(column=>(column.dataIndex!=='pcProportion'&&column.dataIndex!=='actualInventory'))
    }
    return columns
  },
  getFooter(){
    var {list} = this.state
    var sum = list.reduceRight(($1,$2)=>{
      return $1+(parseFloat($2.count)||0)
    },0)
    var sumPrice = list.reduceRight(($1,$2)=>{
      return $1 + (parseFloat($2.count*$2.discountPrice)||0)
    },0)
    return (
      <span>
        <span>总数量:</span>
        <span>{sum}</span>
        {'  '}
        <span>购货总价格:</span>
        <span>{sumPrice.toFixed(2)}</span>
      </span>
    )
  },
  editGood(e){
    var {list,editIndex,supplier} = this.state
    var result = Object.assign([],list)
    if(supplier&&e.supplierId!==supplier.userId){
      return message.info('商品的供应商和本采购单的供应商不匹配')
    }
    result[editIndex] = Object.assign({},result[editIndex],e)
    result[editIndex].count = result[editIndex].count||1
    this.setState({list:result})
  },
  componentDidMount(){
    this.props.params.changeBrumb(['修改采购单'])
    this.defaultData()
    this.setState({purchaseId:this.props.params.purchaseId})
  },
  defaultData(){
    var {purchaseId} = this.props.params
    if(purchaseId){
      var promise = request('/orderlist/requestorderDetail',{
        method:'post',
        data:{
          purchaseId:parseInt(purchaseId),pageSize:1000,pageNum:0
        }
      })
      promise.done(result=>{
        if(result.success){
          var {arriveDate,purchaseDate,purchaseItems,supplier,userId,remarks,orderStatus} = result.module
          this.setState({
            list:purchaseItems,
            arrive:arriveDate?moment(arriveDate):null,
            purchase:moment(purchaseDate),
            supplier:{
              name:supplier,
              userId
            },
            remark:remarks?remarks.replace(/\<br\>/g,'    '):'',
            orderStatus
          })
        }
      })
    }
  },
  update(){
    var {list,editIndex} = this.state
    var editObj = list[editIndex]||{}
    var {subPurchaseId} = editObj
    if(subPurchaseId){
      // 修改采购单
      var promise = request('/order/updatesuborder',{
        method:'post',
        data:editObj
      })
      promise.done(result=>{
        if(result.success){
          message.info('更新子采购单成功')
        }else{
          message.info(result.errorMsg)
          editObj.count = editObj.countBak
        }
      })
      promise.always(e=>{
        this.setState({visible:false})
      })
    }else{
      // 添加采购单
      var addObject = Object.assign({},editObj)
      addObject.purchaseId = this.props.params.purchaseId
      var addPromise = request('/order/addsuborder',{
        method:'post',
        data:addObject
      })
      addPromise.done(result=>{
        if(result.success){
          message.info('添加子采购单成功')
          this.setState({visible:false},()=>{
            this.defaultData()
          })
        }else{
          message.info(result.errorMsg)
        }
      })
    }

  },
  del(data){
    var editObj = Object.assign({},data,{status:-1})
    var promise = request('/order/updatesuborder',{
      method:'post',
      data:editObj
    })
    promise.done(result=>{
      if(result.success){
        message.info('删除子采购单成功')
        this.defaultData()
      }else{
        message.info(result.errorMsg)
      }
    })

  },
  valid(){
    var {list,purchase,arrive,supplier} = this.state
    if(!purchase){
      message.info('请输入采购日期')
      return false
    }
    if(!arrive){
      message.info('请输入到达时间')
      return false
    }
    if(!supplier.name){
      message.info('请选择供应商')
      return false
    }
    if(list.length===0){
      message.info('请添加采购单明细')
      return false
    }
    for(var i=0;i<list.length;i++){
      var json = list[i]
      if(!json.count){
        message.info('请填写商品数量')
        return false
      }
      if(!json.skuId){
        message.info('请选择商品')
      }
    }
    return true
  },
  getData(){
    var obj = {}
    var {list,supplier,purchase,arrive,remark,purchaseId} = this.state
    obj.items = list
    obj.userId = supplier.userId
    obj.purchaseId = purchaseId
    obj.purchaseDate = purchase._d.getTime()
    obj.expectArriveDate = arrive._d.getTime()
    obj.remarks = remark
    return obj
  },
  submit(){
    var valid = this.valid()
    if(!valid){
      return;
    }
    var promise = request('/order/submitaudit',{
      data:this.getData(),
      method:'post'
    })
    promise.done(result=>{
      if(result.success){
        message.info('采购单提交审核成功')
      }else{
        message.info(result.errorMsg)
      }
    })
  },
  appendList(selectList){
    var {purchaseId} = this.props.params
    if(selectList.length===0){
      return message.info('请选择商品')
    }
    var url = '/order/addsuborder'
    if(this.isRep()){
      url = '/order/replenishment'
    }
    var promise = ajax({
      url,
      data:selectList.map(item=>{
        item.purchaseId = parseInt(purchaseId)
        item.status = 0
        return item
      })
    })
    promise.then(result=>{
      if(result.success){
        this.setState({appendVisible:false})
        this.defaultData()
      }
    })
  },
  isRep(){
    return this.state.orderStatus>2
  },
  render(){
    var {purchase,arrive,list,visible,editIndex,supplier,appendVisible,orderStatus} = this.state
    var editObj = list[editIndex]||{}
    return (
      <div>
        <div className={styles.form}>
          <Form inline>
            <FormItem label="供应商">
              <Input disabled value={supplier.name}/>
            </FormItem>
            <FormItem label="采购日期">
              <DatePicker
                disabled
                value={purchase}
                onChange={e=>{this.setState({purchase:e})}}
              />
            </FormItem>
            <FormItem label="期望到货日期">
              <DatePicker
                disabled
                value={arrive}
                onChange={e=>this.setState({arrive:e})}
              />
            </FormItem>
          </Form>
        </div>
        <Table
          rowClassName={e=>"min-row"}
          rowKey={(data,index)=>index}
          bordered
          title={()=>(
            <div>
              <span>采购单明细</span>
              {' '}
              <Button type="primary" size='small' onClick={e=>{
                var {supplier} = this.state
                if(!supplier.userId){
                  return message.info('请先选择供应商')
                }
                this.setState({appendVisible:true})
              }}>{this.isRep()?'补货采购单':'添加明细'}</Button>
            </div>
          )}
          dataSource={list}
          columns={this.getColumns()}
          pagination={false}
          scroll={{ x: orderStatus==8?1650:1950}}
          footer={e=>this.getFooter()}
        />
        <FormItem label="备注">
          <Input
            type="textarea"
            value={this.state.remark}
            onChange={e=>this.setState({remark:e.target.value})}
            rows={6}
          />
        </FormItem>
        <div style={{textAlign:"center"}}>
          <Button type="primary" onClick={e=>this.submit()}>提交审核</Button>
        </div>
        {appendVisible&&<SelectMultiGood
          visible={true}
          supplierId={supplier.userId}
          onCancel={e=>this.setState({appendVisible:false})}
          onOk={selectList=>this.appendList(selectList)}
        />}
        <Modal
          title="采购单"
          onCancel={e=>this.setState({visible:false})}
          onOk={e=>this.update()}
          visible={visible}
        >
          <Form onSubmit={e=>{}}>
            <FormItem label="采购商品">
              <span>{editObj&&editObj.title}</span>
            </FormItem>
            <FormItem label="采购商品编码">
              <span>{editObj&&editObj.skuId}</span>
            </FormItem>
            <FormItem label="采购数量">
              <InputNumber value={editObj.count||1} onChange={e=>{
                var {list,editIndex} = this.state
                var result = Object.assign([],list)
                result[editIndex].count = e>0?e:1
                this.setState({list:result})
              }}/>
            </FormItem>
            <FormItem label="仓库">
              <Select value={warehouseMap[editObj.wareHouse||"0"]} style={{width:120}}>
                {Object.keys(warehouseMap).map(key=>(<Option key={key} value={key}>{warehouseMap[key]}</Option>))}
              </Select>
            </FormItem>
            <FormItem label="备注">
              <Input type="textarea" value={editObj.checkInfo||''} rows={5} onChange={e=>{
                var {list,editIndex} = this.state
                var result = Object.assign([],list)
                result[editIndex].checkInfo = e.target.value
                this.setState({list:result})
              }}/>
            </FormItem>
          </Form>
        </Modal>
      </div>
    )
  }
})
