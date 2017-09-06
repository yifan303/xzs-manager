import React from 'react'
import {Input,Form,DatePicker,Table,Button,Modal,Select,InputNumber,message} from 'antd'
import SelectSupplier from 'widget/selectSupplier'
import SelectGood from 'widget/selectGood'
import SelectMultiGood from 'widget/selectGood/selectMultiGood.js'
import moment from 'moment'
import styles from './append.less'
import warehouseMap from 'widget/status/warehouse.js'
import request from 'widget/request'
import login from 'widget/login'
import $ from 'jquery'
import ajax from 'widget/ajax'

var FormItem = Form.Item
var Option = Select.Option

function disabledDate(current) {
  // can not select days before today and today
  var timesamp = Date.now()
  return current && current.valueOf() < (timesamp-24*60*60*1000);
}

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

      remark:''

    }
  },
  getColumns(){
    var self = this
    return [
      { title: '序号', key: 'index',width:50 ,render(data,record,index){ return index + 1 }},
      { title: '商品', dataIndex: 'title',key:'title',width:150},
      { title: '商品编码', dataIndex: 'skuId',key:'skuId',width:100 },
      { title: '数量', dataIndex: 'count',key:'count',width:50 },
      { title: '采购单位', dataIndex: 'purchaseUnit',width:100 },
      {
        title:'销售库存变动',
        dataIndex:'pcProportion',
        key:'pcProportion',
        render(data,record){
          return record.count*record.pcProportion/1000+record.saleUnit
        }
      },
      { title: '商品规格', dataIndex: 'specification',width:100 },
      { title: '购货单价', dataIndex:'discountPrice',width:100 },
      { title: '购货总金额', dataIndex:'total',width:100,render(data,record){
        var count = parseInt(record.count)
        var price = parseFloat(record.discountPrice)
        if(!count||!price){
          return ''
        }
        return (count*price).toFixed(2)
      } },
      { title: '当前销售库存', dataIndex:'inventory',key:'inventory',width:100 },
      { title: '仓库(批量)', dataIndex: 'wareHouse',width:150,render:wareHouse => warehouseMap["0"] },
      { title: '备注', dataIndex:'checkInfo',key:'checkInfo',width:200},
      {
        title: '操作',
        fixed:'right',
        render(data,record,editIndex){
          return (
            <span>
              <Button onClick={e=>{
                var result = self.state.list.filter((item,index)=>index!==editIndex)
                self.setState({list:result})
              }}>删除</Button>
              {' '}
              <Button type="primary" onClick={e=>{
                self.setState({editIndex,visible:true})
              }}>修改</Button>
            </span>
          )
        }
      }
    ]
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
  appendGoods(selectList){
    var list = Object.assign([],this.state.list)
    selectList.forEach(select=>{
      var filter = list.filter(item=>item.skuId===select.skuId)
      if(filter.length>0){
        filter[0].count = parseInt(filter[0].count) + parseInt(select.count)
      }else{
        list.push(select)
      }
    })

    this.setState({
      appendVisible:false,
      list
    })

  },
  componentDidMount(){
    var {id} = this.props.params
    if(id){
      try{
        this.props.params.changeBrumb(['修改采购单'])
      }catch(e){

      }
      var promise = request('/orderlist/requestorderDetail',{
        method:'post',
        data:{
          purchaseId:parseInt(id),pageSize:1000,pageNum:0
        }
      })
      promise.done(result=>{
        if(result.success){
          var {arriveDate,purchaseDate,purchaseItems,supplier,userId,remarks} = result.module
          this.setState({
            list:purchaseItems,
            arrive:moment(arriveDate),
            purchase:moment(purchaseDate),
            supplier:{
              name:supplier,
              userId
            },
            remark:remarks
          })
        }
      })
    }

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
    var {list,supplier,purchase,arrive,remark} = this.state
    obj.items = list.map(item=>{
      var result = Object.assign({},item)
      delete result.status
      return result
    })
    obj.userId = supplier.userId
    obj.purchaseDate = purchase._d.getTime()
    obj.expectArriveDate = arrive._d.getTime()
    obj.remarks = remark
    return obj
  },
  save(){
    var valid = this.valid()
    if(!valid){
      return;
    }
    var promise = request('/order/save',{
      data:this.getData(),
      method:'post'
    })
    promise.done(result=>{
      if(result.success){
        message.info('采购单保存成功')
        window.location.href='#/purchase/list'
      }else{
        message.info(result.errorMsg)
      }
    })
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
        window.location.href='#/purchase/list'
      }else{
        message.info(result.errorMsg)
      }
    })
  },
  render(){
    var {purchase,arrive,list,visible,editIndex,supplier,appendVisible} = this.state
    var editObj = list[editIndex]||{}

    return (
      <div>
        <div className={styles.form}>
          <Form inline>
            <SelectSupplier value={supplier} onSelect={e=>this.setState({supplier:e})}/>
            <FormItem label="采购日期">
              <DatePicker
                value={purchase}
                disabledDate={disabledDate}
                onChange={e=>{this.setState({purchase:e})}}
              />
            </FormItem>
            <FormItem label="期望到货日期">
              <DatePicker
                disabledDate={disabledDate}
                value={arrive}
                onChange={e=>this.setState({arrive:e})}
              />
            </FormItem>

          </Form>
        </div>
        <Table
          rowKey={(data,index)=>index}
          rowClassName={()=>"min-row"}
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
              }}>添加明细</Button>
            </div>
          )}
          dataSource={list}
          columns={this.getColumns()}
          pagination={false}
          scroll={{ x: 1350}}
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
          <Button type="primary" onClick={e=>this.save()}>保存</Button>
          {' '}
          <Button type="primary" onClick={e=>this.submit()}>提交审核</Button>
        </div>

        {appendVisible&&<SelectMultiGood
          visible={true}
          supplierId={supplier.userId}
          onCancel={e=>this.setState({appendVisible:false})}
          onOk={selectList=>this.appendGoods(selectList)}
        />}

        <Modal
          title="采购单"
          onCancel={e=>this.setState({visible:false})}
          onOk={e=>this.setState({visible:false})}
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
              <span>{editObj.purchaseUnit||''}</span>
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
