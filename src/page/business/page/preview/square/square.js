import React from 'react'
import styles from './square.less'

export default (props)=>{
  var {list} = props
  return (
    <div className={styles.wrap}>
      {list.map((item,index)=>(
        <a href={item.link?item.link.url:'javascript:void(0);'} key={index} className={styles.item}>
          <img src={item.picUrl} />
          <i>{item.name}</i>
        </a>
      ))}
    </div>
  )
}
