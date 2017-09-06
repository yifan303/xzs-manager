import List from '../../page/business/list'
import Page from '../../page/business/page'
import Screen from '../../page/business/screen'
import Sendcoupons from '../../page/business/sendcoupons'

export default [
  // 运营列表
  {path:"business/list",component:List},
  // 具体页面
  {path:'business/page/:pageId',component:Page},
  // 投屏管理
  {path:'business/screen/list',component:Screen},
  //批量赠送优惠券
  {path:'business/sendcoupons',component:Sendcoupons}
];
