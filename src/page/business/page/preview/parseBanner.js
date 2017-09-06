import React from 'react'
import {getTarget} from './getType.js'
import Img from './image.js'
import styles from './preview.less'

export default (pic,index,style)=>{
  if(getTarget(pic.targetType)==='detail'){
    return (
      <a
        href={`http://m.xianzaishi.com/mobile/detail.html?id=${pic.targetId}`}
        key={index}
      >
        <Img
          className={styles.mBanner}
          style={style}
          src={pic.picUrl}
        />
      </a>
    )
  }
  if(getTarget(pic.targetType)==='href'){
    return (
      <a href={pic.targetId} key={index}>
        <Img
          className={styles.mBanner}
          style={style}
          src={pic.picUrl}
        />
      </a>
    )
  }
  return (
    <Img
      style={style}
      className={styles.mBanner}
      key={index}
      src={pic.picUrl}
    />
  )
}
