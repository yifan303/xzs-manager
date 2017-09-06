import React from 'react'
import {InputNumber,Table,Button,Select,Modal,Input,message} from 'antd'
import ajax from 'widget/ajax'
import styleTab from './table.less'
import login from 'widget/login'
import TButton from 'widget/button/throttle.js'

const Option = Select.Option;
export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      show:false,
      taskId:this.props.params.id,
      orderInfo:null,
      customInfo:null,
      taskInfo:null,
      coupons:null,
      role:false,
      refundNum:0,
      refoudReason:null,
      couponId:null,
      cole:0
    }
  },
  //获取详情
  getDetailMsg(){ 
    var taskId=this.props.params.id;
    var promise=ajax({
      url:'/customservice/getcustomdetail',
      method:'post',
      data:{taskId}
    })
    promise.then(e=>{
      if(e.success){
        var module=e.module
        this.setState({
          customInfo:module.customInfo,
          taskInfo:module.taskInfo,
          orderInfo:module.orderInfo,
          coupons:module.coupons
        })
      }
    })
  },
  //获得登陆者角色
  roleList(){
    var promise=ajax({
      url:'/customservice/roleList',
      method:'post',
      data:{opertatorId:login.getInfo().oid}
    })
    promise.then(e=>{
      if(e.success){
        var arr=e.module.split(";")
        var rolearr=[]
        arr.forEach(e=>{
          if(e=='87' || e=='60'){
            rolearr.push(e)
          }
        })
        this.setState({
          role:rolearr
        })
      }
    })
  },
  //任务检查
  taskcheck(data){ 
    var taskId=this.props.params.id;
    var promise=ajax({
      url:'/customservice/checkTask',
      method:'post',
      data:data
    })
    promise.then(e=>{
      if(e.success){
        var module=e.module
        this.setState({
          module:module
        })
      }
    })
  },
  //确认退款
  commitRefund(data){
    var promise=ajax({
      url:'/customservice/commitRefund',
      method:'post',
      data:data
    })
    promise.then(e=>{
      if(e.success){
        message.success("退款成功")
      }
    })
  },
  //提交到审核
  commitAudit(data){
    var promise=ajax({
      url:'/customservice/commitAudit',
      method:'post',
      data:data
    })
    promise.then(e=>{
      if(e.success){
        message.success("提交成功")
        if(this.state.role.length==2){
          window.location.reload()
        }
      }
    })
  },
  //撤销并完成
  completeTask(data){
    var promise=ajax({
      url:'/customservice/completeTask',
      method:'post',
      data:{taskId:data}
    })
  },
  componentDidMount(){
    this.getDetailMsg()
    if(this.props.params.detail=="false"){
      this.roleList();
      this.props.params.changeBrumb(['客服管理','售后列表','任务处理'])
    }else{
      this.props.params.changeBrumb(['客服管理','售后列表','任务详情'])
    }
  },
  render(){
    var {customInfo,taskInfo,orderInfo,coupons,couponId,refundNum,refoudReason,show,taskId,module,role} = this.state
    var detail=this.props.params.detail
    var self=this
    if(detail=="true"){
      detail=false;
    }else{
      detail=true
    }
    const columns=[{
      title:'商品名称',
      key:'title',
      dataIndex:'title'
    },{
      title:'总价',
      key:'totalPrice',
      dataIndex:'totalPrice'
    },{
      title:'下单库存',
      key:'count',
      dataIndex:'count'
    },{
      title:'退货数量',
      key:`skuId+title+''`,
      render:(record,data,index)=>{
        if(detail){
          return(detail&&<InputNumber value={record.returnCount || 0} min={0} onChange={e=>{
          var orderInfo=Object.assign([],this.state.orderInfo)
          var data=Object.assign({},orderInfo[index])
          data.returnCount=e
          orderInfo[index] = data
          this.setState({orderInfo})
        }} ></InputNumber>)}
        else{
          return record.count 
        }
      }
    },{
      title:'操作',
      key:'skuId',
      render:(e,record,index)=>{
        if(index==0&&detail){
          return(<Button type="primary" size="small" onClick={e=>{
            var data={}
            orderInfo=Object.assign([],orderInfo.map(list=>({
              skuId:list.skuId,
              count:list.returnCount
            })))
            data.taskId=parseInt(taskId)
            data.orderId=taskInfo.orderId
            data.itemlist=orderInfo
            this.taskcheck(data)
            this.setState({show:true});
          }} href="javascript:viod(0);">任务检查</Button>)
        }
      }
    }
    ]
    return (
      <div>
        <Modal
        title={"退款申请"}
        visible={this.state.show}
        footer={[
          <span className={styleTab.sp} key="btn3">{(role.length==2 || role[0]=='60')&&<TButton type="primary" size="small" onClick={e=>{
            var data={}
            data.id=taskId
            data.couponId=couponId
            data.sum=refundNum
            data.refoudReason=refoudReason
            this.commitAudit(data)
            this.setState({show:false})
          }} href="javascript:viod(0);">提交审核</TButton>}</span>,
          <span className={styleTab.sp} key="btn4">{(role.length==2 || role[0]=='87')&&<TButton timeout={3000} type="primary" size="small" onClick={e=>{
            var data={}
            this.setState({btnloading:true})
            data.id=taskId
            data.orderId=taskInfo.orderId
            data.couponId=taskInfo.couponId
            data.sum=taskInfo.sum
            data.refoudReason=taskInfo.refoudReason
            this.commitRefund(data)
          }} href="javascript:viod(0);">确认退款</TButton>}</span>,
          <Button key="btn1" type="primary" size="small" onClick={e=>{
            this.setState({show:false})
          }} href="javascript:viod(0);">取消</Button>,     
          <TButton key="btn5" type="primary" size="small" onClick={e=>{
            this.completeTask(this.props.params.id)
            window.location.href=`#/service/servicelist`
          }}>撤销退款并完成</TButton>
        ]}
        onCancel={e=>this.setState({show:false})}
        afterClose={e=>{
          module=null
        }}
        width={"66%"} >
          <div style={{fontSize:"14px",fontWeight:700}}>{module}</div>
          <div className={styleTab.marginTop}></div>
          <table>
            <tbody>
              <tr>
                <td>退款金额</td>
                <td>
                  {(role.length==2 || role[0]=='60')&&<Input type="primary" value={refundNum} onChange={e=>{
                    this.setState({
                      refundNum:e.target.value,
                      a:e.target.checked
                    })
                  }}style={{width:"200px"}}></Input>}
                  {(role.length==2 || role[0]=='87')&&<span>{taskInfo&&taskInfo.sum}</span>}
                </td>
              </tr>
              <tr>
                <td>退款原因</td>
                <td>
                  {(role.length==2 || role[0]=='60')&&<Input type="textarea" value={refoudReason} onChange={e=>{
                    this.setState({
                      refoudReason:e.target.value
                    })
                  }}style={{width:"200px"}}></Input>}
                  {(role.length==2 || role[0]=='87')&&<span>{taskInfo&&taskInfo.refoudReason}</span>}
                </td>
              </tr>
              <tr>
                <td>赠送优惠券</td>
                <td colSpan='2'>
                  {(role.length==2 || role[0]=='60')&&<Select size="large" placeholder="请选择" style={{ width: 200 }} onChange={e=>{
                    var e=JSON.parse(e)
                    this.setState({
                      couponId:e.id
                    })
                  }}>
                    {coupons&&coupons.map((item,index)=>{
                      return <Option value={JSON.stringify(item)} key={index}>{item.title}</Option>
                    })}
                  </Select>}
                  {(role.length==2 || role[0]=='87')&&<span>{taskInfo&&taskInfo.couponTitle}</span>}
                </td>
              </tr>
            </tbody>
          </table>
        </Modal>
        {!customInfo&&<p>{console.log(customInfo)}</p>}
        {customInfo&&<div><div className={styleTab.title}>客户信息</div>
        <table cellSpacing="0" className={styleTab.table}>
          <tbody>
            <tr>
              <td>客户姓名</td><td>{customInfo.name}</td>
              <td>联系方式</td><td>{customInfo.phone}</td>
              <td>联系地址</td><td>{customInfo.adress}</td>
            </tr>
            <tr>
              <td>会员卡号</td><td>{customInfo.vipCardNO}</td>
              <td>会员级别</td><td>{customInfo.memberLevel}</td>
              <td></td><td></td>
            </tr>
          </tbody>
        </table>
        <div className={styleTab.marginTop}></div>
        <div className={styleTab.title}>{detail?'待处理任务':'已处理任务'}</div>
        <table cellSpacing="0" className={styleTab.table}>
          <tbody>
            <tr>
              <td>任务类型</td><td>{taskInfo.type}</td>
              <td>发生时间</td><td>{taskInfo.gmtCreate}</td>
              <td>订单编号</td><td>{taskInfo.orderId}</td>
            </tr>
            <tr>
              <td>任务描述</td><td colSpan="5">{taskInfo.taskDescription&&<div>
                <p className={styleTab.floatL}>{taskInfo.taskDescription[0].source}</p>
                {taskInfo.taskDescription[1]&&<div><img src={taskInfo.taskDescription[1].source} onClick={e=>{
                  window.open(`${taskInfo.taskDescription[1].source}`,true) 
                }}/></div>}
              </div>}</td>
            </tr>
          </tbody>
        </table>        
        <div className={styleTab.marginTop}></div>
        <div className={styleTab.title}>{detail?'处理任务':'交易详情'}</div>
        <Table rowKey="skuId" columns={columns} pagination={{ pageSize: 10 }} dataSource={orderInfo}/> 
        </div>}  
        <div className={styleTab.marginTop}></div>
          <Button type="primary" onClick={e=>{
            window.history.go(-1)
          }}>返回</Button>
      </div>
    )
  }
})
