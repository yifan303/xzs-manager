import React from 'react'
import {Modal,Form,Input,Button,message,Table} from 'antd'
import ajax from 'widget/ajax'

export default React.createClass({
  getInitialState(){
    return {
      code:'',
      good:null
    }
  },
  search(){
    var {code} = this.state
    if(code===''){
      return message.info('请输入要查询的商品码')
    }
    var promise = ajax({
      url:'/pick/queryskudetail',
      data:code
    })
    promise.then(result=>{
      if(result.success){
        this.setState({good:result.module})
      }
    })
  },
  getColumn(){
    return [
      {title:'商品名称',key:"title",dataIndex:'title'},
      {title:'规格',key:'specification',dataIndex:'specification'},
      {title:'商品编码',key:'skuId',dataIndex:'skuId'},
      {title:'数量',key:"barCount",dataIndex:'barCount'}
    ]
  },
  render(){
    var {onOk,...props} = this.props
    var {good} = this.state
    var newProps = Object.assign({
      title:"手动输入条码",
      width:1000,
      onOk:e=>{
        onOk(this.state.good)
      }
    },props)

    var {code} = this.state

    return (
      <Modal {...newProps}>
        <div>
          <div>
            商品条码:
            {' '}
            <Input
              value={code}
              onChange={e=>this.setState({code:e.target.value})}
              style={{width:200,display:'inline'}}
            />
            {' '}
            <Button type="primary" onClick={e=>this.search()}>查询</Button>
          </div>
          <div style={{height:20}}></div>
          <Table
            rowKey="id"
            dataSource={good?[good]:[]}
            columns={this.getColumn()}
            pagination={false}
          />
        </div>
      </Modal>
    )
  }
})
