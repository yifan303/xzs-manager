import React from 'react'
import styles from './link.less'
import {Select,Input,Button,Form} from 'antd'
import Upload from 'widget/upload'

export default React.createClass({

  getInitialState(){
    return {
      url:'',
      title:'',
      type:0,
      picUrl:''
    }
  },
  componentWillReceiveProps(props){
    if(JSON.stringify(props.value)!==JSON.stringify(this.props.value)){
      this.setState(props.value||{})
    }
  },
  componentDidMount(){
    this.setState(this.props.value||{})
  },
  runChange(){
    typeof(this.props.onChange)==='function'&&this.props.onChange(this.state)
  },
  render(){
    var {picType} = this.props
    var item = this.state
    return (
      <div className={styles.wrap}>
        <Form.Item label="链接">
          <Select
            value={picType[item.type]}
            style={{width:150}}
            onChange={e=>{
              this.setState({type:e},()=>this.runChange())
            }}
          >
            {Object.keys(picType).map(type=>(
              <Select.Option key={type} value={type}>{picType[type]}</Select.Option>
            ))}
          </Select>
          {' '}
          <Input
            type="text"
            value={item.url}
            style={{width:100}}
            placeholder="链接地址"
            onChange={e=>{
              this.setState({url:e.target.value},()=>this.runChange())
            }}
          />
          {' '}
          <Input
            type="text"
            value={item.title}
            style={{width:100}}
            placeholder="标题"
            onChange={e=>{
              this.setState({title:e.target.value},()=>this.runChange())
            }}
          />
        </Form.Item>
        <Form.Item label="模块图片">
          {item.picUrl&&<img className={styles.picImg} src={item.picUrl} />}
          <Upload
            style={{width:100}}
            onChange={e=>{
              this.setState({picUrl:e.module},()=>this.runChange())
            }}
          />
        </Form.Item>
        <Button
          style={{position:'absolute',right:10,bottom:10}}
          type="primary"
          size="small"
          onClick={e=>{this.setState({picUrl:null},()=>this.runChange())}}
        >清除图片</Button>
      </div>
    )
  }
})
