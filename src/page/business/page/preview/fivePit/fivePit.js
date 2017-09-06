import React from 'react'
import styles from './fivePit.less'

export default props=>{
  var {list} = props
  var renderSingle = item => {
    var tags = item.itemSkuVOs&&item.itemSkuVOs[0]&&item.itemSkuVOs[0].tagDetail&&item.itemSkuVOs[0].tagDetail['tagContent']
    var empty = item.itemSkuVOs&&item.itemSkuVOs[0]&&item.itemSkuVOs[0].inventory<=0
    return (
      <div>
        {empty&&(
          <span className="w-good-empty">卖光啦</span>
        )}
        {!empty&&tags&&(
          <span className="w-good-tags">{tags}</span>
        )}
        <p className={styles.stitle}>{item.title}</p>
        <p className={styles.scount}>{item.itemSkuVOs&&item.itemSkuVOs[0]&&item.itemSkuVOs[0].saleDetailInfo}</p>
        <p className={styles.sprice}>¥{item.discountPriceYuanString}</p>
        <img className={styles.simg} src={item.picUrl} />
      </div>
    )
  }
  var renderDouble = item => {
    var tags = item.itemSkuVOs&&item.itemSkuVOs[0]&&item.itemSkuVOs[0].tags
    var empty = item.itemSkuVOs&&item.itemSkuVOs[0]&&item.itemSkuVOs[0].inventory<=0
    return (
      <div className={styles.dwrap}>
        {empty&&(
          <span className="w-good-empty">卖光啦</span>
        )}
        {!empty&&tags&&(
          <span className="w-good-tags">{tags}</span>
        )}
        <div className={styles.dinfo}>
          <span>{item.title}</span>
          <span>¥{item.discountPriceYuanString}</span>
        </div>
        <img src={item.picUrl} />
      </div>
    )
  }
  return (
    <div className={styles.wrap}>
      <div className={styles.single}>
        {renderSingle(list[0])}
      </div>
      <div className={styles.double}>
        {renderDouble(list[1])}
        {renderDouble(list[2])}
      </div>
      <div className={styles.double}>
        {renderDouble(list[3])}
        {renderDouble(list[4])}
      </div>
    </div>
  )
}
