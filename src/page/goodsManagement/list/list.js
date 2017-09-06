import React from 'react'
import Search from 'widget/search'
import ajax from 'widget/ajax'
import {Table,Button,message,Modal,Select,Popconfirm} from 'antd'
import styles from './list.less'
import SelectSupplier from 'widget/selectSupplier'

const Option = Select.Option
const channelMap = {
  1:'线上线下同步销售',
  2:'线上销售',
  3:'线下销售'
}

export default React.createClass({
  getInitialState(){
    return {
      pageNum:0,
      list:[],
      totalPage:0,
      pageSize:"8",
      skuId:'',
      skuName:'',
      sku69Code:'',

      editModal:false,
      editData:null,

      modifyModal:false,
      modifySupplier:null,
      modifyRecord:null

    }
  },
  componentDidMount(){
    this.getData()
  },
  getData(){
    var {pageNum,pageSize,skuId,skuName,sku69Code} = this.state
    var data = {
      pageNum,
      pageSize
    }
    if(skuId){
      data.skuId = skuId
    }
    if(skuName){
      data.skuName = skuName
    }
    if(sku69Code){
      data.sku69Code = sku69Code
    }
    var promise = ajax({
      url:'/salelist/saleList',
      method:'post',
      data
    })
    promise.then(result=>{
      if(result.success){
        var {list,totalPage} = result.module
        this.setState({
          list,totalPage
        })
      }
    })
  },
  editChannel(){
    var {editData} = this.state
    var promise = ajax({
      url:'/salelist/updateChannel',
      method:'post',
      data:{
        channel:editData.saleStatusCode,
        skuId:editData.skuId
      }
    })
    promise.then(result=>{
      if(result.success){
        this.setState({editModal:false})
        this.getData()
        message.info(`${editData.title}修改渠道成功`)
      }
    })
  },
  onshelf({skuId}){
    var promise = ajax({
      url:'/salelist/upShelf',
      method:'post',
      data:{skuId:skuId}
    })
    promise.then(result=>{
      if(result.success){
        message.info('上架成功')
        this.getData()
      }
    })
  },
  offshelf({skuId}){
    var promise = ajax({
      url:'/salelist/downShelf',
      method:'post',
      data:{skuId}
    })
    promise.then(result=>{
      if(result.success){
        message.info('下架成功')
        this.getData()
      }
    })
  },
  qrcode(record){
    var promise = ajax({
      url:'/salelist/getQrcode',
      data:{
        qrId:record.itemId,
        qrType:0
      }
    })
    promise.then(result=>{
      if(result.success){
        window.open(`//erp.xianzaishi.com/generatecode.html?qrcodeString=${result.module}`)
      }
    })
  },
  clearUp(record){
    var {skuId,statusCode} = record
    var promise = ajax({
      url:'/salelist/clearitem',
      data:{
        skuId:skuId+'',status:statusCode+''
      }
    })
    promise.then(result=>{
      if(result.success){
        message.info('清退商品成功')
        this.getData()
      }
    })
  },
  modifyModal(record){
    this.setState({
      modifyModal:true,
      modifySupplier:{
        name:record.supplierName,
        userId:record.supplierId
      },
      modifyRecord:Object.assign({},record)
    })
  },
  modifySupplier(){
    var {modifySupplier,modifyRecord} = this.state
    if(modifySupplier.userId==modifyRecord.supplierId){
      return message.info('请选择供应商进行修改')
    }
    var promise = ajax({
      url:'/salelist/changeitemsupplier',
      data:{
        skuId:modifyRecord.skuId+'',
        oldSupplierId:modifyRecord.supplierId+"",
        newSupplierId:modifySupplier.userId+""
      }
    })
    promise.then(result=>{
      if(result.success){
        message.info('修改供应商成功')
        this.setState({modifyModal:false})
        this.getData()
      }
    })
  },
  render(){
    var {
      pageNum,list,totalPage,
      pageSize,editModal,editData,
      modifyModal,
      modifyRecord,
      modifySupplier
    } = this.state

    return (
      <div>
        <Modal
          title="修改供应商"
          visible={modifyModal}
          onOk={e=>this.modifySupplier()}
          onCancel={e=>this.setState({modifyModal:false})}
        >
          <SelectSupplier
            value={modifySupplier}
            onSelect={e=>this.setState({
              modifySupplier:{name:e.name,userId:e.userId}
            })}
          />
        </Modal>
        <Search
          widgets={[
            {name:'skuId',text:'skuid',type:'input'},
            {name:'skuName',text:'sku名称',type:'input'},
            {name:'sku69Code',text:'商品69码',type:'input'}
          ]}
          onSearch={e=>{
            this.setState({...e,pageNum:0},()=>{
              this.getData()
            })
          }}
        />
        <Table
          rowKey="skuId"
          dataSource={list}
          pagination={{
            current:pageNum+1,
            total:parseInt(pageSize)*totalPage,
            onChange:(pageNum)=>{
              this.setState({pageNum:pageNum-1},()=>{
                this.getData()
              })
            }
          }}
          scroll={{x:1200}}
          columns={[
            {
              title:"skuid",
              dataIndex:"skuId",
              key:'skuId'
            },{
              title:'itemid',
              dataIndex:'itemId',
              key:'itemId'
            },{
              title:'69码',
              dataIndex:'sku69code',
              key:'sku69code'
            },{
              title:'sku名称',
              dataIndex:'title',
              key:'title'
            },{
              title:'sku状态',
              dataIndex:'status',
              key:'status'
            },{
              title:'销售渠道',
              dataIndex:'saleStatus',
              key:'saleStatus'
            },{
              title:'商品货号',
              dataIndex:"skuCode",
              key:'skuCode'
            },{
              title:'操作',
              fixed:'right',
              width:170,
              render:(data,record,index)=>{
                return (
                  <div>
                    <div className={styles.btns}>
                      <Button type="primary" size="small" onClick={e=>this.qrcode(record)}>二维码</Button>
                      {' '}
                      <Button type='primary' size="small" onClick={e=>this.modifyModal(record)}>修改供应商</Button>
                    </div>
                    <div className={styles.btns}>
                      <Button type="primary" size="small" onClick={e=>{window.open(`#/goodsManagement/detail/${record.skuId}`)}}>商品详情</Button>
                      {' '}
                      <Button type="primary" size="small" onClick={e=>this.setState({editModal:true,editData:Object.assign({},record)})}>渠道</Button>
                    </div>
                    <div className={styles.btns}>
                      {record.statusCode!=-1&&<Popconfirm title="商品清退之后不能恢复,确认清退该商品吗?" onConfirm={e=>this.clearUp(record)}>
                        <Button type="primary" size="small" onClick={e=>{}}>清退</Button>
                      </Popconfirm>}
                      {' '}
                      {record.statusCode===2&&<Button type="primary" size="small" onClick={e=>this.onshelf(record)}>上架</Button>}
                      {record.statusCode===1&&<Button type="primary" size="small" onClick={e=>this.offshelf(record)}>下架</Button>}
                    </div>
                  </div>
                )
              }
            }
          ]}
        />

        <Modal
          visible={editModal}
          title={editData&&editData.title}
          onCancel={e=>this.setState({editModal:false})}
          onOk={e=>this.editChannel()}
        >
          <Select
            style={{width:150}}
            value={editData?channelMap[editData.saleStatusCode]:channelMap[1]}
            onChange={e=>{
              editData.saleStatusCode = e
              this.setState({editData})
            }}
          >
            {Object.keys(channelMap).map(channel=>(
              <Option key={channel} value={channel}>{channelMap[channel]}</Option>
            ))}
          </Select>
        </Modal>

      </div>
    )
  }
})
