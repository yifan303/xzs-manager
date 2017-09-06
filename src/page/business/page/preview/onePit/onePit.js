import React from 'react'
import styles from './onePit.less'

export default props=>{
  var {list,title} = props
  var renderItem = item=>{
    var tags = item.itemSkuVOs&&item.itemSkuVOs[0]&&item.itemSkuVOs[0].tagDetail&&item.itemSkuVOs[0].tagDetail['tagContent']
    return (
      <div key={item.itemId} className="clearfix">
        <img src={item.picUrl} />
        <p>{item.title}</p>
        <p>{item.subtitle}</p>
        <p>规格: {item.itemSkuVOs&&item.itemSkuVOs[0]&&item.itemSkuVOs[0].saleDetailInfo}</p>
        <p>¥<span>{item.discountPriceYuanString}</span></p>
        <div className={styles.cart}></div>
        {tags&&(
          <span className="w-good-tags">{tags}</span>
        )}
      </div>
    )
  }
  return (
    <div className={styles.wrap}>
      <header>{title}</header>
      {list.map(renderItem)}
    </div>
  )
}
