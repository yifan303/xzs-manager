import React from 'react'
import {Input,DatePicker,Table,Button,Select} from 'antd'
import Search from 'widget/search'
import ajax from 'widget/ajax'
import tradestatus from 'widget/status/tradestatus.js'
import tradetype from 'widget/status/tradetype.js'

export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      pagination:{},
      searchValue:{}
    }
  },
  getservicelist(page,e){
    page=page-1
    var promise=ajax({
      url:'/customservice/gettasks',
      method:'post',
      data:{
        'type':0,
        'status':e.status,
        'pageSize':10,
        'pageNum':page
      }
    })
    promise.then(e=>{
      if(e.success&&e.module){
        var module=e.module
        this.setState({
          dataSource:module.customTask,
          pagination:{
            total:module.totalPage*10,
            current:module.currentPage+1,
          }
        })
      }
      else{
        this.setState({
          dataSource:null
        })
      }
    })
  },
  componentDidMount(){
    this.getservicelist(1,{})
  },
  render(){
    var {dataSource,pagination,searchValue} = this.state
    pagination=Object.assign({},pagination,{
      onChange:(current)=>{
        this.getservicelist(current,searchValue||{})
      }
    })
    const columns=[{
      title:'任务编号',
      key:'id',
      dataIndex:'id'
    },{
      title:'任务类型',
      key:'type',
      dataIndex:'type'
    },{
      title:'任务名称',
      key:'title',
      dataIndex:'title'
    },{
      title:'业务Id',
      key:'bizId',
      dataIndex:'bizId'
    },{
      title:'任务状态',
      key:'statusString',
      dataIndex:'statusString'
    },{
      title:'业务状态',
      key:'processTypeString',
      dataIndex:'processTypeString'
    },{
      title:'发生时间',
      key:'gmtCreate',
      dataIndex:'gmtCreate'
    },{
      title:'操作',
      key:'typeCode',
      render:(record,index)=>{
        var detail=true;
        if(record.status==2){
          detail=true;
        }else{detail=false}
        return(<div>{detail&&<Button type="primary" size="small" onClick={e=>{
          window.location.href=`#/service/detail/${record.id}/${detail}`
        }} href="javascript:viod(0);">详情</Button>}
        {!detail&&<Button type="primary" size="small" onClick={e=>{
          window.location.href=`#/service/detail/${record.id}/${detail}`
        }} href="javascript:viod(0);">处理</Button>}
        </div>)
      }
    }
    ]
    return (
      <div>
        <Search
          widgets={[
            {name:'type',type:'select',options:tradetype,defaultValue:'交易退款任务'},
            {name:'status',type:'select',options:tradestatus,defaultValue:'全部'}
          ]}
          onSearch={e=>{
            if(e.status=='-1'){
              delete e.status
            }
            this.getservicelist(1,e)
            this.setState({searchValue:e})
          }}
        />
        <Table rowKey="id" columns={columns} dataSource={dataSource} pagination={pagination}/>
      </div>
    )
  }
})
