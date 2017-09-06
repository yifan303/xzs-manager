import React from 'react'
import {Form,Input,Button,Col,message,Row,Table,Modal,Popconfirm,Icon} from 'antd'
import ajax from 'widget/ajax'
import styles from './check.less'
import throttle from 'widget/util/throttle.js'
import mergeArray from 'widget/util/mergeArray.js'
import InputModal from './inputModal.js'

var splitDiv = () => <div style={{width:'100%',height:20}}></div>
var handlePick = pick=>{
  delete pick.ts
  //if(pick.saleUnitType!==4){
  //  pick.checkedSpec = pick.checkedNo||0
  //}else{
  //  pick.checkedSpec = pick.checkedNo*pick.barCount
  //}
  return pick
}
var statuMap = {
  0:"未处理",
  1:"处理完成",
  4:"挂起波次单",
  3:"波次单取消"
}

var storeageTypeMap = {
  78:'活物',
  79:'常温',
  80:'热藏>63°C',
  81:'冷藏',
  82:'冷冻'
}

export default React.createClass({
  getInitialState(){
    return {
      code:'',
      goodCode:'',
      pickDetails:[],
      pickingBaskets:[],
      modal:false,
      waveId:'',
      picks:[],
      goodLoading:false,
      confirmModal:false,
      confirmModalText:'',
      completedPicks:null,
      currentBasket:null,
      currentDetail:null,
      distributionCount:0
    }
  },
  componentDidMount(){
    // 取单进入 会带有id
    var {id} = this.props.params
    if(id){
      this.props.params.changeBrumb(['配送模块','波次单详情'])
      var promise = ajax({
        url:'/wave/checkwavebywaveid',
        data:{waveId:id}
      })
      promise.then(result=>{
        if(result.success){
          var {pickDetails,pickingBaskets,pickVOs,statu} = result.module
          this.setState({
            pickDetails,
            pickingBaskets:pickingBaskets||[],
            picks:pickingBaskets||[],
            waveId:id,
            statu
          })
        }
      })
    }
  },
  submit(){
    var {code} = this.state
    if(code === ''){
      return message.info('请输入检货框编号')
    }
    this.setState({currentBasket:code})
    var promise = ajax({
      url:'/wave/checkwavebypickingbasketbarcode',
      data:{barcode:code}
    })
    promise.then(result=>{
      if(result.success){

        if(!result.module){
          message.error('捡货筐为空')
          return
        }

        var {pickDetails,picks} = this.state
        var {pickingBaskets,currentPickingBasketVO,id,statu,pickingWallPositions,distributionCount} = result.module
        var pickingBasketsState = this.state.pickingBaskets
        if(pickingWallPositions&&pickingWallPositions.length===0){
          message.error('该捡货筐未绑定捡货墙')
          return
        }
        if(!currentPickingBasketVO){
          message.error('捡货筐编号有误')
          return
        }
        var pick = picks.filter(pick=>pick.barcode===currentPickingBasketVO.barcode)
        if(pick.length>0){
          message.error('该捡货筐已扫描')
          return
        }
        if(
          pickingBasketsState.length>0&&
          pickingBasketsState.filter(basket=>basket.barcode===currentPickingBasketVO.barcode).length===0
        ){
          message.error('该捡货筐不在本波次单中')
          return
        }
        if(statu===1){
          this.setState({completedPicks:{id}})
        }
        picks.push(currentPickingBasketVO)

        var details = pickDetails.length===0?result.module.pickDetails.map(item=>{
          item.checkedNo = item.checkedNo||0
          item.checkedSpec = item.checkedSpec||0
          return item
        }):pickDetails

        this.setState({
          pickDetails:details,
          pickingBaskets,
          waveId:id,
          picks,
          distributionCount,
          statu
        })

        // 光标移到商品条码
        this.refs.goodCode.focus()

      }
    },()=>{
      message.info(`${code}捡货筐编号有误`)
      window.setTimeout(()=>{
        this.setState({code:''})
      },1000)
    })
  },
  changeBarcode(value){
    this.setState({code:value})
    var {code} = this.state
    throttle(()=>{
      this.submit()
    })
  },
  handleGood(module){
    var {pickDetails} = this.state
    for(var i=0;i<pickDetails.length;i++){
      if(pickDetails[i].skuId===module.skuId){
        pickDetails[i].checkedNo = pickDetails[i].checkedNo + 1
        if(pickDetails[i].saleUnitType===4){
          pickDetails[i].checkedSpec = pickDetails[i].checkedSpec + module.barCount
        }else{
          pickDetails[i].checkedSpec = pickDetails[i].checkedSpec + 1
        }
        this.setState({pickDetails})
        break
      }
    }
    if(i===pickDetails.length){
      return message.error('该商品不在当前捡货筐内')
    }
  },
  changeGoodcode(value){
    this.setState({goodCode:value})
    throttle(()=>{
      var {goodCode,pickDetails} = this.state
      if(pickDetails.length===0){
        this.setState({goodCode:''})
        return message.error('请先扫描捡货筐')
      }
      this.setState({
        goodLoading:true,
        currentDetail:goodCode
      })
      var promise = ajax({
        url:'/pick/queryskudetail',
        data:goodCode
      })
      promise.done(result=>{
        if(result.success){
          this.handleGood(result.module)
        }
      })
      promise.always(()=>{
        this.setState({
          goodCode:'',
          goodLoading:false
        })
      })
    },500)
  },
  getColumn(){
    return [
      {title:'商品名称',key:"skuName",dataIndex:'skuName'},
      {title:'规格',key:'specUnit',dataIndex:'specUnit'},
      {title:'商品编码',key:'skuId',dataIndex:'skuId'},
      {title:'下单数量',key:"orderSpec",dataIndex:'orderSpec',render(data,record){
        if(record.saleUnitType===4){
          return `${record.orderSpec} (1${record.saleUnit}/${record.spec}${record.specUnit})`
        }
        return data
      }},
      {title:"退款数量",key:'refundSpec',dataIndex:'refundSpec'},
      {title:'复核数量',key:'checkedSpec',dataIndex:'checkedSpec'},
      //{title:'配送数量',key:'delSpec',dataIndex:'delSpec'},
      {title:"属性",key:'storeageType',dataIndex:'storeageType',render:data=>storeageTypeMap[data]},
      {title:'操作',key:'review',render:(data,record)=>{
        return (
            <Button
              onClick={e=>{
                record.checkedNo = 0
                record.checkedSpec = 0
                this.forceUpdate()
              }}
            >
              重新扫描
            </Button>
        )
      }}
    ]
  },
  checkFinish(){
    var {pickDetails,waveId,picks,pickingBaskets,completedPicks} = this.state
    if(!waveId){
      message.error('请扫描捡货筐')
      return false
    }
    if(pickingBaskets.length!==picks.length){
      message.error('还有未扫描的捡货筐')
      return false
    }
    var flag = false
    var list = []
    for(var i=0;i<pickDetails.length;i++){
      let refundSpec = parseInt(pickDetails[i].refundSpec)||0
      let rl = pickDetails[i].checkedSpec - pickDetails[i].orderSpec + refundSpec
      if(rl<0){
        break
      }
      if(rl>0){
        list.push(Object.assign({},pickDetails[i]))
        flag = true
      }
    }
    // if(i!==pickDetails.length){
    //   message.error('复核数量不一致，请挂起该波次单')
    //   return false
    // }
    var confirmText = ''
    if(completedPicks!==null){
      confirmText = `id为${completedPicks.id}的波次单已经扫描完成过。`
    }
    if(flag){
      confirmText += `以下商品:${list.map(item=>item.skuName).join(',')},复核数量大于配送数量,确认提交复核结果吗?`
    }else{
      confirmText += '复核数量正确，确认提交复核结果吗?'
    }
    this.setState({confirmModalText:confirmText})
    return true
  },
  waveFinished(){
    var {pickDetails,waveId,picks,pickingBaskets} = this.state
    var promise = ajax({
      url:'/wave/wavefinished',
      data:{id:waveId+'',pickDetails:pickDetails.map(handlePick)}
    })
    promise.then(result=>{
      if(result.success){
        message.info('波次单复核完成')
        window.open(`#/dispatch/print/${picks.map(pick=>pick.barcode).join('-')}`)
        this.setState({confirmModal:false})
        window.setTimeout(()=>{
          if(this.props.params&&this.props.params.id){
            window.location.href='#/dispatch/check'
          }else{
            window.location.reload()
          }
        },1000)
      }
    })
  },
  handup(){
    var {waveId,pickDetails} = this.state
    if(waveId===''){
      return message.error('请扫描捡货筐')
    }
    var promise = ajax({
      url:'/wave/hangwave',
      data:{id:waveId+'',pickDetails:pickDetails.map(handlePick)}
    })
    promise.then(result=>{
      if(result.success){
        message.info('波次单挂起成功')
        window.location.href='#/dispatch/handup'
      }
    })
  },
  finishByHand(){
    var {pickDetails} = this.state
    for(var i=0;i<pickDetails.length;i++){
      pickDetails[i].checkedSpec = pickDetails[i].orderSpec - pickDetails[i].refundSpec
    }
    this.setState({pickDetails})
  },
  render(){

    var {
      code,goodCode,pickDetails,modal,waveId,pickingBaskets,
      picks,goodLoading,confirmModal,confirmModalText,currentDetail,
      currentBasket,distributionCount,statu
    } = this.state

    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    }

    return (
      <div>
        <Form>
          拣货框编号:
          {' '}
          <Input
            value={code}
            onChange={e=>this.changeBarcode(e.target.value)}
            autoFocus
            onFocus={e=>this.setState({code:''})}
            style={{display:'inline',width:400}}
          />
          {' '}
          {currentBasket&&(
            <span>当前拣货筐：{currentBasket}</span>
          )}
        </Form>
        {splitDiv()}
        <Row>
          <Col span={5}>当前波次单号:{waveId}</Col>
          <Col span={5}>订单数:{distributionCount}</Col>
          <Col span={5}>拣货筐数:{picks.length}/{pickingBaskets.length}</Col>
          <Col span={5}>波次单状态:{statuMap[statu]}</Col>
          <Col span={4}>
            <Popconfirm title="复核数量不一致时，挂起波次单" onConfirm={e=>this.handup()}>
              <Button type="primary">挂起波次单</Button>
            </Popconfirm>
          </Col>
        </Row>
        {splitDiv()}
        <Form>
          商品条码:
          {' '}
          <div style={{display:'inline-block',width:300,verticalAlign:'middle'}}>
            <Input
              value={goodCode}
              ref="goodCode"
              onChange={e=>this.changeGoodcode(e.target.value)}
              addonAfter={<Icon type={goodLoading?'loading':"check"} />}
            />
          </div>
          {'  '}
          <Button type="primary" onClick={e=>this.setState({modal:true})} size="small">手动输入条码</Button>
          {' '}
          {currentDetail&&(
            <span>当前商品码：{currentDetail}</span>
          )}
        </Form>
        {splitDiv()}
        <Table
          rowKey="id"
          dataSource={pickDetails}
          columns={this.getColumn()}
          pagination={false}
          rowClassName={(record,index)=>{
            var ls = record.checkedSpec - record.orderSpec + record.refundSpec
            if(ls >= 0){
              return styles.check
            }
            return ''
          }}
        />
        {splitDiv()}
        <div style={{'textAlign':"center"}}>
          <Button
            type="primary"
            onClick={e=>this.finishByHand()}
          >
            手动复核
          </Button>
          {' '}
          <Button
            type="primary"
            onClick={e=>{
              if(!this.checkFinish()){
                return
              }
              this.setState({confirmModal:true})
            }}
          >
            扫描包装完成
          </Button>
          {' '}
          <Button onClick={e=>{
            if(this.props.params&&this.props.params.id){
              window.location.href='#/dispatch/check'
            }else{
              window.location.reload()
            }
          }}>处理新波次单</Button>
          {' '}
          {picks.length>0&&(
            <Button
              onClick={e=>window.open(`#/dispatch/print/${pickingBaskets.map(pick=>pick.barcode).join('-')}/1`)}
            >配送单列表</Button>
          )}
        </div>
        <InputModal
          visible={modal}
          onOk={e=>{
            this.setState({modal:false})
            if(e!==null){
              this.handleGood(e)
            }
          }}
          onCancel={e=>this.setState({modal:false})}
        />
        <Modal
          title="复核确认"
          visible={confirmModal}
          onCancel={e=>this.setState({confirmModal:false})}
          onOk={e=>this.waveFinished()}
        >
          {confirmModalText}
        </Modal>
      </div>
    )
  }
})
