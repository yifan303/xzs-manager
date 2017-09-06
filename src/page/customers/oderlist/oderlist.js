import React from 'react'
import {Table,Button,Modal,message,Input,Tooltip} from 'antd'
import req from 'widget/request'
import date from 'widget/util/date.js'
import tableStyle from '../query/query.less'
import login from 'widget/login'

export default React.createClass({
  getInitialState(){
    return {
      datacustomersMsg:null,  
      pagination:{}, 
      currentPageNum:1,
      selectedRowList:[],
      billdataSend:{},
      //Modal
      visible:false
    }
  },
  getcustomersMsg(){  
  var phoneNum=this.props.params.phoneNum;
  var oid=this.props.params.orderId;
  if(phoneNum.length==11){oid=null}else{
    phoneNum=null
  }
    phoneNum=parseInt(phoneNum);
    var promise=req({
      url:'/user/getUserInfo',
      method:'post',
      data:{phoneNum,oid}
    })
    
    promise.then(result=>{
      if(result.success){
        var module=result.module
        this.setState({
          datacustomersMsg:result.module,
        })
      }
    })
    
  },
  getOrderByPage(page){
  var uid=this.props.params.uid;
    uid=parseInt(uid);
    var promise=req({
      url:'/user/getOrderList',
      method:'post',
      data:{
        uid,
        currentPage:page,
        pageSize:10 
      }
    })
    promise.then(result=>{
      if(result.success){
        var module=result.module
        this.setState({
          orderData:module,
          pagination:{
            total:module.count,
            current:module.currentPage
          }
        })
      }
    })
    
  },
  billing(billData){
    var promise=req({
      url:'/user/insertBill',
      method:'post',
      data:billData
    })
    promise.then(result=>{
      if(result.success){
        message.success("开票成功");
        this.setState({visible:false,selectedRowList:[],billdataSend:[]})
        this.getOrderByPage(this.state.currentPageNum||1)
        this.getcustomersMsg()
      }
    })
  },
  componentDidMount(){
    this.getOrderByPage(1),
    this.getcustomersMsg(),
    this.props.params.changeBrumb(['客户管理','客户查询','订单列表'])

  },
  render(){
    var {orderData,selectedRowList,pagination,datacustomersMsg,currentPageNum,billdataSend} = this.state;
    const rowSelection = {
      onChange: (selectedRowKeys,selectedRowList)=>{
        this.setState({ selectedRowList });
      },
      getCheckboxProps: record => ({
        disabled:record.status!=8 && record.status!=7 || record.billed ==true
      }),
    };
    pagination = Object.assign({},pagination,{
      onChange: (current) => {
        this.getOrderByPage(current);
        this.setState({
          currentPageNum:current,
        })      
      },
    });
    const columns=[{
      title:'序号',
      render:(e,record,index)=>index+1+(currentPageNum-1)*10
    },{
      title:'订单ID',
      dataIndex:'id',
      key:'id'
    },{
      title:'交易时间',
      dataIndex:'gmtCreate',
      key:'gmtCreate',
      render:(e,record)=>date.parseTime(record.gmtCreate)
    },{
      title:'订单状态',
      dataIndex:'statusString',
      key:'statusString'
    },{
      title:'应付金额',
      dataIndex:'payAmount',
      key:'payAmount'
    },{
      title:'实付金额',
      dataIndex:'effeAmount',
      key:'effeAmount'
    },{
      title:'退款金额',
      dataIndex:'refunded',
      key:'refunded'
    },{
      title:'使用积分',
      dataIndex:'credit',
      key:'credit'
    },{
      title:'优惠券抵扣',
      dataIndex:'couponDiscount',
      key:'couponDiscount'
    },{
      title:'操作',
      dataIndex:'action',
      key:'action',
      render:(text,record)=>{
        var disable=record.status==1 || record.status==2 ? true:false;
        return (
          <div>
            <Button type="primary" size="small" onClick={e=>{
              window.location.href=`#/customers/detail/${record.id}`
            }} href="javascript:void(0);">详情</Button>
            <span>  </span>
            <Button type="primary" size="small" disabled={record.allRefound || disable} onClick={e=>{
              window.location.href=`#/customers/return/${record.id}`
            }} href="javascript:void(0);">退换货</Button>
          </div>  
      )}
    }]  
    return (
      <div>
        <Modal
          title='开发票'
          visible={this.state.visible}
          onOk={e=>{
            var billData={};
            billdataSend.operator=login.getInfo().userName
            if(!billdataSend.billNumber){
              message.warning("请输入发票号");
            }else{
              this.billing(billdataSend)
            }
          }}
          onCancel={e=>{this.setState({visible:false})}}  
        >
          <div className={tableStyle.modalContentDiv}><span>金额:</span><span>{this.state.money}</span></div>
          <div className={tableStyle.modalContentDiv}><span>开票员:</span><span>{login.getInfo().userName}</span></div>
          <div className={tableStyle.modalContentDiv}><span>发票号:</span><Input size="small" value={billdataSend&&billdataSend.billNumber} onChange={e=>{
            billdataSend.billNumber=e.target.value
            this.setState({billdataSend})
          }} style={{width:"40%"}} placeholder="请输入发票号"/></div>
          <div className={tableStyle.modalContentDiv}><span>备注信息:</span><Input style={{width:"40%"}} size="small" value={billdataSend&&billdataSend.contribution} onChange={e=>{
            billdataSend.contribution=e.target.value
            this.setState({billdataSend})
          }}placeholder="请输入"/></div>
        </Modal>
        {orderData&&<div>
          {datacustomersMsg&&<table cellSpacing="0" className={tableStyle.table}>
            <tbody>
              <tr ><td colSpan="4" style={{textAlign:'center',fontWeight:700,padding:'15px',background:'#f7f7f7'}}>客户信息</td></tr>
              <tr><td style={{fontWeight:700,textAlign:'center',padding:'15px'}}>客户名称</td><td>{datacustomersMsg.userName}</td>
              <td style={{fontWeight:700,textAlign:'center'}}>手机号码</td><td>{datacustomersMsg.phoneNum}</td></tr>  
              <tr><td style={{fontWeight:700,textAlign:'center',padding:'15px'}}>总消费金额</td><td>{orderData.allMoney}</td>
              <td style={{fontWeight:700,textAlign:'center'}}>已开发票金额</td><td>{orderData.moneyHasBilled}</td></tr>
            </tbody>
          </table>}
          <div style={{width:'100%',textAlign:'center',fontSize:'14px',fontWeight:700,padding:'15px',background:'#f7f7f7',marginTop:'20px'}}><p>订单列表</p></div>
          <Table rowKey="id" columns={columns} dataSource={orderData.orders} rowSelection={rowSelection} pagination={pagination}/>
          <div style={{textAlign:'center'}}>
            {!(selectedRowList.length>0)&&<Tooltip title="请选择可以开发票的订单"><Button disabled={true} type="primary" size="large">开发票</Button></Tooltip>}
            {(selectedRowList.length>0)&&<Button type="primary" size="large" onClick={e=>{
              var userdata=selectedRowList.map(user=>({
                orderId:parseInt(user.id),
                userId:parseInt(user.userId),
                money:user.payAmount
              }))
              var money=0;
              for(var i=0;i<userdata.length;i++){
                money +=parseFloat(userdata[i].money);
              }
              billdataSend.orders=userdata
              money=money.toFixed(2)
              this.setState({
                visible:true,
                money,
                billdataSend
              })
            }} href="javascript:void(0);">开发票</Button>}
          </div>
        </div>}  
      </div>
    )
  }
})