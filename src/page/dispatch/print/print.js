import React from 'react'
import ajax from 'widget/ajax'
import styles from './print.less'
import {Button} from 'antd'
import req from 'widget/request'

export default React.createClass({
  getInitialState(){
    return {
      distributionVO:[]
    }
  },
  componentDidMount(){
    var {id} = this.props.params
    var barcodes = id?id.split('-'):[]
    var barcode = barcodes[0]
    if(barcode){
        var promise = ajax({
          url:'/wave/checkwavebypickingbasketbarcode',
          data:{barcode}
        })
        promise.done(result=>{
          var {distributionVO} = this.state
          if(result.success){
            var distributions = result.module.distributionVO||[]
            this.setState({distributionVO:distributionVO.concat(distributions)})
            var details = distributions.reduce(($1,$2)=>{
              $1=$1.concat($2.details)
              return $1
            },[])

            // 获取库位
            details.forEach(detail=>{
              var d = req({
                url:'/inventory/recommendPositionBySku',
                method:'post',
                domain:'wms',
                data:detail.skuId+""
              })
              d.done(result=>{
                if(result.success){
                  var target = result.target[0]
                  detail.position = target?target.pisitionVO.code:''
                  this.forceUpdate()
                }
              })
            })
          }
        })
    }

  },
  render(){
    var {distributionVO} = this.state
    var isList = 'pid' in this.props.params
    var renderDistribution = (distribution,index) => {
      var renderDetail = (details) => {
        return (
          <tbody>
            {details.map(detail=>(
              <tr key={detail.id}>
                <td>{detail.skuId}</td>
                <td>{detail.skuName}</td>
                <td>{`${detail.delivNo}${detail.saleUnit}${detail.saleUnitType===4?('('+detail.delivNo*detail.spec+detail.specUnit+')'):''}`}</td>
                <td>{detail.position}</td>
              </tr>
            ))}
          </tbody>
        )
      }
      var renderAppointTime = (appointTime) => {
        if(!appointTime){
          return '/'
        }
        var start = new Date(appointTime)
        var end = new Date(appointTime+30*60*1000)
        return [
          start.getFullYear(),
          start.getMonth()+1,
          start.getDate()
        ].join('/')+' '+[
          start.getHours(),
          start.getMinutes()
        ].join(':')+'-'+[
          end.getHours(),
          end.getMinutes()
        ].join(':')
      }
      return (
        <div className={styles.wrap} key={index}>
          <table className={styles.table}>
            <tbody>
              <tr>
                <td></td><td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr key="2">
                <td colSpan={3}>
                  配送ID : {distribution.id}
                </td>
                <td colSpan={3}>
                  期望送达 : {renderAppointTime(distribution.appointTime)}
                </td>
              </tr>
              <tr key="3">
                <td colSpan={3}>
                  联系方式 : {distribution.userName}{' '}{distribution.userPhone}
                </td>
                <td colSpan={3}>
                  备注 : {distribution.desOrder}
                </td>
              </tr>
              <tr key="1">
                <td colSpan={4}>
                  地址 : {distribution.userAddress}
                </td>
                <td colSpan={2}>
                  订单编号 : {distribution.orderId}
                </td>
              </tr>
            </tbody>
          </table>
          <table className={styles.detail+' '+styles.goods}>
            <thead>
              <tr>
                <th>编码</th>
                <th>商品名称</th>
                <th>配送数量</th>
                <th>库位</th>
              </tr>
            </thead>
            {renderDetail(distribution.details)}
          </table>
          <table className={styles.detail}>
            <tbody>
              <tr>
                <td className={styles.sign}>签收人:</td>
                <td></td>
                <td>(请在确认质量、数量无误后签字)</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    }
    return (
      <div>
        {distributionVO.map(renderDistribution)}
        {!isList&&(<div className={"print "+styles.btn}>
          <Button type="primary" onClick={e=>window.print()}>打印</Button>
        </div>)}
      </div>
    )
  }
})
