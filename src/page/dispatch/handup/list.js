import React from 'react'
import {Table,Button} from 'antd'
import ajax from 'widget/ajax'
import dateUtil from 'widget/util/date.js'

export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      pagination:{},
    }
  },
  componentDidMount(){
    var promise = ajax({
      url:'/wave/queryhangwavelist'
    })
    promise.done(result=>{
      if(result.success){
        this.setState({dataSource:result.module})
      }
    })
  },
  render(){

    const columns = [{
      title: '波次单号',
      dataIndex: 'id',
      key: 'id',
    }, {
      title: '复核员',
      dataIndex: 'operator',
      key: 'operator',
    }, {
      title: '订单数',
      dataIndex: 'distributionCount',
      key: 'distributionCount'
    }, {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render(data){
        return dateUtil.parseTime(data)
      }
    }, {
      title: '操作',
      key:'action',
      render:(text,record)=>{
        return (
          <Button
            type="primary"
            size="small"
            onClick={e=>window.location.href=`#/dispatch/check/${record.id}`}
          >取单</Button>
        )
      }
    }];

    var {dataSource} = this.state
    return (
      <div>
        <Table rowKey="id" dataSource={dataSource} columns={columns} pagination={false}/>
      </div>
    )
  }
})
