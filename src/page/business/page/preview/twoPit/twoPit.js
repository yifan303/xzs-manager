import React from 'react'
import styles from './twoPit.less'

export default props => {
  var {list} = props
  return (
    <div className={styles.wrap}>
    {list.map((item,index)=>{
      var detail = item.itemSkuVOs&&item.itemSkuVOs[0]&&item.itemSkuVOs[0].saleDetailInfo;
      var mayTag = item.itemSkuVOs&&item.itemSkuVOs[0]&&item.itemSkuVOs[0].tagDetail&&item.itemSkuVOs[0].tagDetail['maySale']
      var href=`//m.xianzaishi.com/mobile/detail.html?id=${item.itemId}`
      var empty = item.itemSkuVOs&&item.itemSkuVOs[0]&&item.itemSkuVOs[0].inventory<=0
      var tags = item.itemSkuVOs&&item.itemSkuVOs[0]&&item.itemSkuVOs[0].tagDetail&&item.itemSkuVOs[0].tagDetail['tagContent']
      return (
        <div key={index} className={styles.goods}>
          <a href={href}>
            <img className={styles.goodsImg} src={item.picUrl} />
          </a>
          <p className={styles.goodsTitle}>{mayTag?(<span>促</span>):""}{item.title}</p>
          <p className={styles.goodsPrice}>
            ¥{item.discountPriceYuanString}<span>/{detail}</span>
          </p>
          {!empty&&(
            <a className={styles.goodsAddToCart} href={href}>
              <span>加入购物车</span>
            </a>
          )}
          {empty&&(
            <a className={styles.goodsAddToCart+' '+styles.goodsEmpty} href={href}>
              <span>该商品已售馨</span>
            </a>
          )}
          {tags&&(
            <span className="w-good-tags">{tags}</span>
          )}
        </div>
      )
    })}
    </div>
  )
}
