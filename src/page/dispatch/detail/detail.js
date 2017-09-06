import React from 'react'
import {Col,Row,Button,Table,Popconfirm,message} from 'antd'
import req from 'widget/request'
import styles from  "./detail.less"
import $ from 'jquery'
import pickupMap from 'widget/status/pickup.js'

import statusList from 'widget/status/canDeliver.js'

export default React.createClass({
  getInitialState(){
    return {
      target:{},
      position:{},
      sysPosition:{}
    }
  },
  getDetail(){
    var promise=req({
      url:'/distribution/get',
      domain:'wms',
      method:'post',
      data:this.props.params.id
    })
    promise.done(result=>{
      if(result.success){
        var {details}=result.target

        var promise=details.map(detail=>{
          return req({
            url:'/inventory/recommendPositionBySku',
            method:'post',
            domain:'wms',
            data:detail.skuId+""
          })
        })

        var pw=$.when.apply($,promise)
        var {position,sysPosition}=this.state
        var self=this;
        pw.done(function(){
          var arg=arguments;
          if(!arg[0][0]){
            arg=[arguments]
          }
          for(var i=0;i<arg.length;i++){
            if(arg[i][0].success){
              var data=arg[i][0].target
              if(data[0]){
                position[data[0].skuId]=data.map(item=>item.pisitionVO.code)
                sysPosition[data[0].skuId]=data.map(item=>item.pisitionVO.barcode)
              }
            }
          }
          self.setState({position})
        })

        this.setState({target:result.target})
      }
    })
  },
  deilverStart(data){
    var promise=req({
      url:'/distribution/deilverStart',
      method:'post',
      domain:'wms',
      data:data+''
    })
    promise.done(result=>{
      if(result.success){
        this.getDetail()
        message.info(`${data}开始配送`)
      }else{
        message.info(result.message)
      }
    })
  },
  deilverEnd(data){
    var promise=req({
      url:'/distribution/arrived',
      method:'post',
      domain:'wms',
      data:{"id":data+''}
    })
    promise.done(result=>{
      if(result.success){
        this.getDetail()
        message.info(`订单${data}成功送达`)
      }else{
        message.info(result.message)
      }
    })
  },
  componentDidMount(){
    this.props.params.changeBrumb(['配送模块','订单详情']),
    this.getDetail()
  },
  render(){
    var {target,position,sysPosition}=this.state

    const columns = [{
      title: 'plu码',
      dataIndex: 'skuId',
      key: 'skuId'
    }, {
      title: '商品名称',
      dataIndex: 'skuName',
      key: 'skuName'
    }, {
      title: '数量',
      dataIndex: 'dr',
      render(text,record){
        return record.allNo+record.saleUnit
      }
    }, {
      title: '规格',
      dataIndex: 'specUnit',
      render(text,record){
        return record.spec+record.specUnit
      }
    }, {
      title: '单价',
      dataIndex: 'price',
      key: 'price'
    }, {
      title: '库位',
      dataIndex: 'store',
      render(text,record){
        var list=position[record.skuId]
        if(list){
          return list.map(item=>(
            <div key={item}>{item}</div>
          ))
        }
        return <span></span>;
      }
    },{
      title:"系统库位",
      dataIndex: 'systemStore',
      render(text,record){
        var list=sysPosition[record.skuId]
        if(list){
          return list.map(item=>(
            <div key={item}>{item}</div>
          ))
        }
        return <span></span>;
      }
    }];

    var formatDate=(dateStr)=>{
      if(!dateStr){
        return ''
      }
      return dateStr.replace('T',' ')
    }

    return (
      <div>
        <div className={styles.print}>
          <table>
            <tbody>
              <tr>
                <td>姓名:</td><td>{target.userName}</td>
                <td>电话:</td><td>{target.userPhone}</td>
                <td>订单号:</td><td>{target.orderId}</td>
              </tr>
            </tbody>
          </table>
          <table>
            <tbody>
              <tr>
                <td>订单时间:</td><td style={{width:"40mm"}}>{formatDate(target.orderTime)}</td>
                <td>期望送达时间:</td><td style={{width:"40mm"}}>{formatDate(target.appointTime)||'/'}</td>
              </tr>
            </tbody>
          </table>
          <table>
            <tr>
              <td>地址:</td><td>{target.userAddress}</td>
            </tr>
          </table>
          <table className={styles.printTable}>
            <thead>
              <tr>
                <td>编码</td>
                <td>商品名称</td>
                <td>数量</td>
                <td>库位</td>
              </tr>
            </thead>
            <tbody>
              {target.details&&target.details.map(item=>{
                var list=position[item.skuId]
                var p=''
                if(list){
                  p=list.map(skup=>(
                    <div key={skup}>{skup}</div>
                  ))
                }
                return (
                  <tr key={item.id}>
                    <td>{item.skuId}</td>
                    <td className={styles.tableLimit}>
                      <div className={styles.tableLimit}>{item.skuName}</div>
                    </td>
                    <td>{item.allNo+item.saleUnit}</td>
                    <td>{p}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <table>
            <tbody>
              <tr>
                <td>签名:</td>
                <td style={{"minWidth":"90px"}}></td>
                <td>(请在确认质量,数量无误后签字)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className={styles.detail}>
          <Row>
            <Col span={8}>配送单号:{target.id}</Col>
            <Col span={8}>订单号:{target.orderId}</Col>
            <Col span={8}>下单时间:{formatDate(target.orderTime)}</Col>
          </Row>
          <Row>
            <Col span={8}>期望送达时间:{formatDate(target.appointTime)}</Col>
            <Col span={8}>订单金额:{target.payAmount}</Col>
            <Col span={8}>联系人:{target.userName}</Col>
          </Row>
          <Row>
            <Col span={8}>联系电话:{target.userPhone}</Col>
            <Col span={8}>订单备注:<span className={styles.red}>{target.desOrder}</span></Col>
          </Row>
          <Row>
            <Col span={24}>配送地址:{target.userAddress}</Col>
          </Row>
          <Row className="print">
            <Col className={styles.table} span={24}>
              <Table rowKey="id" dataSource={target.details} columns={columns} pagination={false}/>
            </Col>
          </Row>
        </div>
        <div style={{"textAlign":"center","marginTop":"10px"}}>
          <Button className="btn btn-primary print" onClick={e=>{
            window.print()
          }} type="primary">打印</Button>
          {' '}
          {statusList.indexOf(target.statu+'')>-1&&(
            <Popconfirm title="确定开始配送吗" onConfirm={e=>{
              this.deilverStart(target.id)
            }}>
              <Button className="print" type="primary" onClick={e=>{}}>配送</Button>
            </Popconfirm>
          )}
          {target.statu==6&&(
            <Popconfirm title="确定送达吗" onConfirm={e=>{this.deilverEnd(target.id)}}>
              <Button className="print" type="ghost" onClick={e=>{}}>送达</Button>
            </Popconfirm>
          )}
        </div>
      </div>
    )
  }
})
