import React from 'react'
import {Table,Button} from 'antd'
import Search from 'widget/search'
import req from 'widget/request'
import statuMap from 'widget/status/deliver.js'
import statusMapCreate from 'widget/status/bizStatu.js'

var statusMap = statusMapCreate()
const whole = '-100'
statuMap[whole]='全部'

export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      pagination:{},
      search:{}
    }
  },
  getOrderByPage(page,search){
    var statu=search.statu&&search.statu!==whole?search.statu:''
    var orderId=search.orderId||""
    var size=10
    var param={}
    var parseTime=date=>{
      return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+
      ' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
    }
    if(orderId){
      param={
        page,
        orderId,
        size
      }
    }else{
      param={
        statu,
        page,
        size,
        bizStatuNE:1
      }
      if(search.deliver){
        if(search.deliver.start){
          param.beginTime=parseTime(search.deliver.start)
        }
        if(search.deliver.end){
          param.endTime=parseTime(search.deliver.end)
        }
      }
    }

    var promise=req({
      url:'/distribution/queryByPage',
      method:'post',
      domain:'wms',
      data:param
    })
    promise.then(result=>{
      if(result.success){
        var target=result.target
        this.setState({
          dataSource:result.target.items,
          pagination:{
            total:target.totalCount,
            current:target.page
          }
        })
      }
    })
  },
  componentDidMount(){
    //this.getOrderByPage(1,{})
  },
  render(){

    const columns = [{
      title: '配送ID',
      dataIndex: 'id',
      key: 'id',
    }, {
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
    }, {
      title: '配送开始时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: createTime => {
        return createTime&&createTime.replace('T',' ')
      }
    }, {
      title: '业务状态',
      dataIndex: 'bizStatu',
      key: 'bizStatu',
      render: bizStatu => {
        return statusMap[bizStatu||"0"]
      }
    }, {
      title: '配送状态',
      dataIndex: 'statu',
      key: 'statu',
      render: stat =>{
        return statuMap[stat+'']
      }
    }, {
      title: '用户期望到达时间',
      dataIndex: 'appointTime',
      key: 'appointTime',
      render: createTime => {
        return createTime&&createTime.replace('T',' ')
      }
    }, {
      title: '配送地址',
      dataIndex: 'userAddress',
      key: 'userAddress'
    }, {
      title: '操作',
      key:'action',
      render:(text,record)=>{
        return (
          <Button type="primary" size="small" onClick={e=>{
            window.open('#/dispatch/detail/'+record.id)
          }} href="javascript:void(0);">详情</Button>
        )
      }
    }];

    var {dataSource,pagination} = this.state
    pagination = Object.assign({},pagination,{
      onChange: (current) => {
        this.getOrderByPage(current,this.state.search);
      }
    })
    return (
      <div>
        <Search
          widgets={[
            {name:"statu",text:'配送状态',width:'120',type:'select',options:statuMap},
            {name:'deliver',type:'range',text:'配送时间'},
            {name:'orderId',type:'input',text:'订单编号'}
          ]}
          onSearch={e=>{
            this.setState({search:e})
            this.getOrderByPage(1,e)
          }}
        />
        <Table rowKey="id" dataSource={dataSource} columns={columns} pagination={pagination}/>
      </div>
    )
  },
  handleSubmit(e){
    e.preventDefault();
  }
})
