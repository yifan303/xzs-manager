import React from 'react'
import styles from "./pit.less"
import Img from '../image.js'

export default (props) => {
  var {list,style,itemStyle} = props
  return (
    <div className={styles.module} style={style||{}}>
      {list.map((json,index)=>{
        var empty = json.itemSkuVOs&&json.itemSkuVOs[0]&&json.itemSkuVOs[0].inventory<=0;
        var saleDetailInfo = json.itemSkuVOs&&json.itemSkuVOs[0]&&json.itemSkuVOs[0].saleDetailInfo
        var itemUrl = `//m.xianzaishi.com/mobile/detail.html?id=${json.itemId}`
        var tags = json.itemSkuVOs&&json.itemSkuVOs[0]&&json.itemSkuVOs[0].tagDetail&&json.itemSkuVOs[0].tagDetail['tagContent']
        return (
          <div key={index} className={styles.goods} style={itemStyle||{}}>
        		<div className={styles.boxImg}>
        			<Img className={styles.boxImgPic} src={json.picUrl} />
        		</div>
        		<div className={styles.boxText}>
        			<a className={styles.text1} href={itemUrl} target="_blank">{json.title}</a>
              <p className={styles.subtitle}><span>¥{json.discountPriceYuanString}</span>/{saleDetailInfo}</p>
            </div>
            {empty&&<span className={styles.empty}>卖光啦</span>}
            {tags&&(
              <span className="w-good-tags">{tags}</span>
            )}
        	</div>
        )
      })}
    </div>
  )
}
