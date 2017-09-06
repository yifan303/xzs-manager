import React from 'react'
import {Table,Button,message} from 'antd'
import Search from 'widget/search'
import req from 'widget/ajax'

export default React.createClass({
  getInitialState(){
    return {

    }
  },
  componentDidMount(){

  },
  render(){
    var {search,sortMap,channelMap,totalSaleAmount,totalSaleCount} = this.state
//     月份 渠道 消费金额
// 2017-06 线上 17244.05
// 2017-06 线下 47319.87
// 2017-07 线上 23781.54
// 2017-07 线下 73420.29

    const columns = [{
      title: '月份',
      dataIndex: 'month',
      key: 'month',
    }, {
      title: '渠道',
      dataIndex: 'channel',
      key: 'channel',
    }, {
      title: '消费金额',
      dataIndex: 'money',
      key: 'money'
    }];
    var dataSource = [
      {month:"2017-06",channel:'线上',money:'17244.05'},
      {month:'2017-06',channel:'线下',money:'47319.87'},
      {month:'2017-07',channel:'线上',money:'23781.54'},
      {month:'2017-07',channel:"线下",money:'73420.29'}
    ]

    return (
      <div>
        <Search
          widgets={[
            {name:'range',type:'range',text:'充值时间'}
          ]}
          onSearch={e=>{

          }}
        />
        <Table
          rowKey={(record,index)=>{return index;}}
          dataSource={dataSource}
          columns={columns}
        />
      </div>
    )
  }
})
