import React from 'react'
import styles from './drink.less'

export default (props) => {
  var {list,picUrl} = props

  return (
    <div className={styles.contain}>
      <a className={styles.more}>更多</a>
      <div className={styles.wrap} style={{backgroundImage:picUrl?`url(${picUrl})`:'none'}}>
        {list.map((item,key)=>{
          var good = item.item||{}
          var sku = good.itemSkuVOs||[{}]
          var names = item.name.split(/[;=]/)
          return (
            <div className={styles.item} key={key}>
              <img src={good.picUrl} />
              <p className={styles.title}>{good.title}</p>
              <p className={styles.subtitle}>{good.subtitle}</p>
              <p className={styles.memo}>
                <span>
                  <i>{names[0]}</i>
                  <i>{names[2]}</i>
                </span>
                <span>
                  <i>{names[1]}</i>
                  <i>{names[3]}</i>
                </span>
              </p>
              <p className={styles.price}>
                <span>¥{sku[0].discountPriceYuanString}</span>
                /{sku[0].saleDetailInfo}
              </p>
              <span className={styles.add}>+</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
