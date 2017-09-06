import Append from '../../page/purchase/append'
import List from '../../page/purchase/list'
import Edit from '../../page/purchase/edit'

export default [
  // 添加
  {path:"purchase/append",component:Append},
  // 详情
  {path:'purchase/edit/:purchaseId',component:Edit},
  // 继续添加
  {path:'purchase/continue/:id',component:Append},
  {path:'purchase/list',component:List}
];
