import React from 'react'
import {Input,Button,Form,Select} from 'antd'
import styles from './search.less'

const FormItem = Form.Item
const Option = Select.Option

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
    })
  },
  render(){
    return (
      <Form inline className={styles.form}>
        {this.getComponentByConfig()}
        <FormItem>
          <Button htmlType="submit" type="primary" onClick={e=>{
            this.setState({
              addremoveflag:0
            })
            this.props.onSearch&&this.props.onSearch(this.state)
          }}>查询</Button>
          <Button htmlType="submit" type="primary" onClick={e=>{
            this.setState({
              addremoveflag:1
            })
            this.props.onSearch&&this.props.onSearch(this.state)
          }}>打标</Button>
        </FormItem>
      </Form>
    );
  }
})
