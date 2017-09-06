import React from 'react'
import {Table,Input,Button,Form,Select,DatePicker,Row,Col} from 'antd'
import styles from './search.less'
import Supplier from 'widget/selectSupplier'

const {RangePicker} =DatePicker
const FormItem = Form.Item
const Option = Select.Option

var formatMoment=(e,hour,minute,second)=>{
  if(!e){
    return null
  }
  var d=new Date(e._d)
  d.setHours(hour)
  d.setMinutes(minute)
  d.setSeconds(second)
  return d
}

export default React.createClass({
  getInitialState(){
    return {}
  },
  getComponentByConfig(){
    var config = this.props.widgets||[]
    return config.map((widget,index)=>{
      if(widget.type==='input'){
        return (
          <FormItem label={widget.text} key={index}>
            <Input
              placeholder={widget.placeholder||''}
              maxLength={widget.maxLength||100}
              onChange={e=>{
                var state=this.state
                state[widget.name||('input'+index)]=e.target.value
                this.setState(state)
              }}
            />
          </FormItem>
        )
      }
      if(widget.type==='select'){
        const options = widget.options||[];
        return (
          <FormItem label={widget.text} key={index}>
            <Select
              style={{width:parseFloat(widget.width)||120}}
              placeholder={widget.placeholder||'请选择'}
              defaultValue={widget.defaultValue||''}
              onChange={e=>{
                var state=this.state
                state[widget.name||('select'+index)]=e
                this.setState(state)
              }}
            >
              {Object.keys(options).map((key)=>{
                return <Option key={key} value={key+''}>{options[key]}</Option>
              })}
            </Select>
          </FormItem>
        )
      }
      if(widget.type==='range'){
        var name=widget.name||(widget.type+index)
        return (
          <FormItem label={widget.text} key={index}>
            <RangePicker onChange={e=>{
              var state=this.state
              state[name]={
                start:formatMoment(e[0],0,0,0),
                end:formatMoment(e[1],23,59,59)
              }
              this.setState(state)
            }} />
          </FormItem>
        )
      }
      if(widget.type==='date'){
        var name=widget.name||(widget.type+index)
        return (
          <FormItem label={widget.text} key={index}>
            <DatePicker onChange={e=>{
              var state = this.state
              state[name]=e?new Date(e._d):null
              this.setState(state)
            }} />
          </FormItem>
        )
      }
      if(widget.type==='supplier'){
        var name=widget.name||(widget.type+index)
        return (
          <Supplier
            key={name}
            value={this.state[name]}
            onSelect={e=>{
              var state = this.state
              state[name]=e
              this.setState(state)
            }}
            onCancel={e=>{
              var {state} = this
              state[name]=null
              this.setState(state)
            }}
          />
        )
      }
      return <span></span>
    })
  },
  // 布局 3个input为一行
  layout(){
    var elements = this.getComponentByConfig()
    var count = 3
    var list = []
    var colStyle = {padding:"0 0 5px",whiteSpace:"nowrap"}
    elements.push(
      <Button onClick={e=>{
        this.props.onSearch&&this.props.onSearch(this.state)
      }} type="primary">查询</Button>
    )

    for(var i=0;i<elements.length;i++){
      var col = i%count
      var row = parseInt(i/count)
      if(col === 0){
        list.push(
          <Row key={row} type="flex">
            <Col style={colStyle} span={8}>{elements[row*count]}</Col>
            <Col style={colStyle} span={8}>{elements[row*count+1]}</Col>
            <Col style={colStyle} span={8}>{elements[row*count+2]}</Col>
          </Row>
        )
      }
    }
    return (
      <Form inline className={styles.form}>{list}</Form>
    )
  },
  render(){
    if(this.props.row){
      return this.layout()
    }
    var btntitle = this.props.children || '查询'
    return (
      <Form inline className={styles.form}>
        {this.getComponentByConfig()}
        <FormItem>
          <Button htmlType="submit" type="primary" onClick={e=>{
            this.props.onSearch&&this.props.onSearch(this.state)
          }}>{btntitle}</Button>
        </FormItem>
      </Form>
    );
  }
})
