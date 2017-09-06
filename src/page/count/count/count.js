import React from 'react'
import {Table,Button,message} from 'antd'
import Search from 'widget/search'
import req from 'widget/ajax'
import statuMap from 'widget/status/deliver.js'
import statusMapCreate from 'widget/status/bizStatu.js'

const categoryMap = {
  '0':'全部',
  '140':'冲调饮品',
  '393':'厨具餐具',
  '55':'海鲜水产',
  '542':'烘培甜品',
  '375':'酒',
  '12':'冷饮冻食',
  '166':'粮油副食',
  '481':'料理主食',
  '83':'肉禽蛋类',
  '2':'乳制品',
  '406':'生活家用',
  '563':'时令鲜果',
  '344':'水/饮料',
  '436':'水吧',
  '107':'鲜花',
  '255':'休闲零食',
  '562':'严选蔬菜'
}

var splitStyle={
  margin:'0 10px'
}

var compareDate = (d1,d2)=>{
  var parseNum = num => (num<10?'0'+num:''+num)
  var parseDate = d => parseInt(''+d.getFullYear()+parseNum(d.getMonth())+parseNum(d.getDate()))
  return parseDate(d1)>=parseDate(d2)
}

export default React.createClass({
  getInitialState(){
    return {
      dataSource:null,
      pagination:{},
      search:{},
      sortMap:{},
      channelMap:{},
      totalSaleAmount:0,
      totalSaleCount:0
    }
  },
  getOrderByPage(page,search){

    var {saleDate,channel,category,sort} = search
    if(!saleDate){
      return message.info('请选择日期')
    }
    var saleDay = saleDate.getTime()
    if(compareDate(saleDate,new Date)){
      return message.info('请选择一个过去的日期')
    }
    var param = {
      saleDay,
      pageNum:page-1
    }
    if(channel&&channel!=='0'){
      param.channelType = channel
    }
    if(category&&category!=='0'){
      param.catId = parseInt(category)
    }
    if(sort&&sort!='0'){
      param.orderBy = sort
    }

    var promise=req({
      url:'/itemsalecount/getitemsalecount',
      method:'post',
      data:param
    })
    promise.then(result=>{
      if(result.success){
        var {totalSaleCount,totalSaleAmount,saleCount} = result.module
        this.setState({
          dataSource:saleCount,
          totalSaleCount,totalSaleAmount,
          pagination:{
            total:result.totalNum,
            current:result.currentPageNum+1,
            pageSize:20
          }
        })
      }
    })

  },
  componentDidMount(){
    var promise = req({
      url:'/itemsalecount/getquerylist',
      method:'post'
    })
    promise.done(result=>{
      var {channel,sort} = result.module

      this.setState({
        channelMap:channel.reduce(($1,$2)=>{
          $1[$2.channelShort] = $2.channelName
          return $1
        },{}),
        sortMap:sort.reduce(($1,$2)=>{
          $1[$2.sortShort] = $2.sortName
          return $1
        },{})
      })
    })
    //this.getOrderByPage(1,{})
  },
  render(){
    var {search,sortMap,channelMap,totalSaleAmount,totalSaleCount} = this.state
    const columns = [{
      title: '类目',
      dataIndex: 'catName',
      key: 'catName',
    }, {
      title: '商品名称',
      dataIndex: 'itemName',
      key: 'itemName',
    }, {
      title: '渠道',
      dataIndex: 'channelString',
      key: 'channelString'
    }, {
      title: '店内码',
      dataIndex: 'skuId',
      key: 'skuId'
    }, {
      title:"日销量",
      dataIndex:'saleCount',
      key:'saleCount'
    }, {
      title:'销售额',
      dataIndex:'effeAmount',
      key:'effeAmount'
    }, {
      title:'昨日剩余库存',
      dataIndex:'invNumbers',
      key:'invNumbers'
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
            {name:'saleDate',type:'date',text:'销售时间'},
            {name:'channel',type:'select',text:'销售渠道',options:channelMap},
            {name:'category',type:'select',text:'类目',options:categoryMap},
            {name:'sort',type:'select',text:'排序',options:sortMap}
          ]}
          onSearch={e=>{
            this.setState({search:e})
            this.getOrderByPage(1,e)
          }}
        />
        <Table
          title={()=>{
            return (
              <div>
                <span>渠道:{(search.channel in channelMap)?channelMap[search.channel]:'全部'}</span>
                <span style={splitStyle}/>
                <span>总销量:{totalSaleCount}</span>
                <span style={splitStyle}/>
                <span>总金额:{totalSaleAmount}</span>
              </div>
            )
          }}
          rowKey={(record,index)=>{return index;console.log(index)}}
          dataSource={dataSource}
          columns={columns}
          pagination={pagination}
        />
      </div>
    )
  },
  handleSubmit(e){
    e.preventDefault();
  }
})
