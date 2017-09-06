import React from 'react'
import styles from './countPit.less'
import parseBanner from '../parseBanner.js'
import moment from 'moment'

export default props=>{
  var {list,pic,end} = props
  var renderPic = (p,index) => (
    parseBanner(p,index,{
      width:'4.75rem',
      height:'2.2rem',
      display:'block',
      margin:'.1rem auto 0'
    })
  )

  var hour = 0
  var minute = 0
  var second = 0
  var mini = 0
  var secondUnit = 1000
  var miniteUnit = 60*secondUnit
  var hourUnit = 60*miniteUnit
  if(end){
    var d = end-(+new Date)
    hour = parseInt(d/hourUnit)
    minute = parseInt(d%hourUnit/miniteUnit)
    second = parseInt(d%miniteUnit/secondUnit)
    mini = parseInt(d%secondUnit/100)
  }
  return (
    <div className={styles.wrap}>
      <section>
        <p>本场活动结束还剩</p>
        <p><span>{hour}</span>时<span>{minute}</span>分<span>{second}</span>秒<span>{mini}</span></p>
        <img src={list[0].picUrl} />
        <p>{list[0].title}</p>
        <p>¥{list[0].discountPriceYuanString}<span>/{list[0].itemSkuVOs&&list[0].itemSkuVOs[0]&&list[0].itemSkuVOs[0].saleDetailInfo}</span></p>
        <p>原价 : ¥{list[0].priceYuanString}</p>
        <a>+</a>
      </section>
      <section>
        {pic.filter((p,index)=>index<3).map(renderPic)}
      </section>
    </div>
  )
}
