import React from 'react'
import styles from "./marquee.less"

const step = 0.8
const during = 3000
const transition = 300

export default React.createClass({
  getInitialState(){
    return {
      list:[],
      current:0,
      transition:true
    }
  },
  interval:null,
  run(){
    var {current,list} = this.state

    this.setState({current:current+1,transition:true},()=>{
      if(current>=list.length-2){
        window.setTimeout(()=>{
          this.setState({transition:false},()=>this.setState({current:0}))
        },transition+100)
      }
    })

  },
  componentDidMount(){
    var list = Object.assign([],this.props.list).map(item=>{
      item.link = item.link||{}
      item.link.content = item.name||item.content
      item.link.targetId = item.link.targetId||item.targetId
      item.link.targetType = item.link.targetType||item.targetType
      return item.link
    })
    var first = Object.assign({},list[0])
    list.push(first)
    this.setState({list})

    if(list.length>2){
      this.interval = window.setInterval(()=>this.run(),during)
    }
  },
  componentWillUnmount(){
    if(this.interval){
      window.clearInterval(this.interval)
    }
  },
  render(){
    var {list,current,transition} = this.state
    return (
      <div className={styles.marquee}>
        <div className={styles.marqueeMove+" "+(transition?'':styles.marqueeMoveEmpty)} style={{transform:`translate(0,-${current*step}rem)`}}>
          {list.map((obj,p)=>{
            // 类目
            if(obj.targetType===1){
              return (
                <a key={p} href={`category.html?id=${obj.targetId}`}>{obj.content}</a>
              )
            }
            // 详情页
            if(obj.targetType===2){
              return (
                <a key={p} href={`detail.html?id=${obj.targetId}`}>{obj.content}</a>
              )
            }
            // 链接
            if(obj.targetType===4){
              return (
                <a key={p} href={obj.targetId}>{obj.content}</a>
              )
            }
            return (
              <p key={p}>{obj.content}</p>
            )
          })}
        </div>
      </div>
    )
  }
})
