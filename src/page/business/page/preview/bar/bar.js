import React from 'react'
import styles from './bar.less'

export default React.createClass({
  render(){
    return (
      <div className={styles.bar}>
        {this.props.list.map((item,index)=>(
          <span className={index===0?styles.selected:''} key={index}>{item.name}</span>
        ))}
      </div>
    )
  }
})
