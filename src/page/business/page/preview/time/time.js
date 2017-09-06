import React from 'react'
import {DatePicker,Button,TimePicker} from 'antd'
import Moment from 'moment'
const ButtonGroup = Button.Group

export default React.createClass({
  getInitialState(){
    return {
      type:0,
      begin:'',
      end:''
    }
  },
  componentDidMount(){
    this.setState(this.props.value||{})
  },
  componentWillReceiveProps(props){
    if(JSON.stringify(props.value)!==JSON.stringify(this.props.value)){
      this.setState(props.value||{})
    }
  },
  runChange(){
    typeof(this.props.onChange)&&this.props.onChange(this.state)
  },
  render(){
    var time = this.props.value
    var absoluteTime = time===null||time.type==0||time.type==undefined
    return (
      <div>
        <div style={{marginBottom:'10px'}}>
          <ButtonGroup>
            <Button
              type={absoluteTime?"primary":"default"}
              onClick={e=>{
                this.setState({type:0,begin:'',end:''},()=>this.runChange())
              }}
            >绝对时间</Button>
            <Button
              type={!absoluteTime?"primary":"default"}
              onClick={e=>{
                this.setState({type:1,begin:'',end:''},()=>this.runChange())
              }}
            >相对时间</Button>
          </ButtonGroup>
        </div>
        {absoluteTime&&(
          <DatePicker.RangePicker
            format="YYYY-MM-DD HH:mm:ss"
            showTime={{defaultValue:[Moment('00:00:00','HH:mm:ss'), Moment('23:59:59','HH:mm:ss')]}}
            allowClear={true}
            value={[
              time&&time.begin?Moment(time.begin):undefined,
              time&&time.end?Moment(time.end):undefined
            ]}
            onChange={e=>{
              var time = this.state
              time.type = 0
              if(e[0]){
                time.begin = e[0].format('YYYY-MM-DD HH:mm:ss')
              }else{
                time.begin = null
              }
              if(e[1]){
                time.end = e[1].format('YYYY-MM-DD HH:mm:ss')
              }else{
                time.end = null
              }
              this.setState(time,()=>this.runChange())
            }}
          />
        )}
        {!absoluteTime&&(
          <div>
            <TimePicker
              value={time&&time.begin?Moment(time&&time.begin,'HH:mm:ss'):null}
              format="HH:mm:ss"
              onChange={e=>{
                var time = this.state
                time.type = 1
                time.begin = e.format('YYYY-MM-DD HH:mm:ss').split(' ')[1]
                this.setState(time,()=>this.runChange())
              }}
            />
            ~
            <TimePicker
              value={time&&time.end?Moment(time&&time.end,'HH:mm:ss'):null}
              format="HH:mm:ss"
              onChange={e=>{
                var time = this.state
                time.type = 1
                time.end = e.format('YYYY-MM-DD HH:mm:ss').split(' ')[1]
                this.setState(time,()=>this.runChange())
              }}
            />
          </div>
        )}
      </div>
    )
  }
})
