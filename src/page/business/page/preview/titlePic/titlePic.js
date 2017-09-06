import React from 'react'
import styles from './titlePic.less'

export default (props)=>(
  <div className={styles.title}>
    <p>{props.title}</p>
    {props.picUrl&&<img src={props.picUrl} />}
  </div>
)
