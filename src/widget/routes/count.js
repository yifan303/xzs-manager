import Count from '../../page/count/count'
import Store from '../../page/count/store'
import User from '../../page/count/user'
import Recharge from '../../page/count/recharge'

export default [
  // 日统计报表
  {path:'count/count',component:Count},
  // 库存报表
  {path:'count/store',component:Store},
  // 用户交易报表
  {path:'count/user',component:User},
  // 重置月度查询
  {path:'count/recharge',component:Recharge},
  {path:'count/user',component:User}
];
