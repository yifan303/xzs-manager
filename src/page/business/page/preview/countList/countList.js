import React from 'react'
import styles from './countList.less'
import dateUtl from 'widget/util/date.js'

export default (props) => {
  var countObj = dateUtl.getCount(props.end)
  var {list} = props
  return (
    <div className={styles.count}>
      <header>
        <span>{countObj.hour}</span>
        <span>{countObj.minute}</span>
        <span>{countObj.second}</span>
        <span>{countObj.mini}</span>
      </header>
      <container>
        {list.map((item,key)=>{
          var good = item.item||{}
          var sku = good.itemSkuVOs||[{}]
          var names = item.name.split(';')
          return (
            <div className={styles.item} key={key}>
              <img src={good.picUrl} />
              <p className={styles.title}>{good.title}</p>
              <p className={styles.subtitle}>{good.subtitle}</p>
              <p className={styles.originPrice}>原价 : ¥{good.priceYuanString}</p>
              <p className={styles.price}>
                <span>¥{sku[0].discountPriceYuanString}</span>
                /{sku[0].saleDetailInfo}
              </p>
              <span className={styles.add}>+</span>
            </div>
          )
        })}
      </container>
    </div>
  )
}
