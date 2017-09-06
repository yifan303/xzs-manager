import couponslist from '../../page/customers/couponslist'
import detail from '../../page/customers/detail'
import Return from '../../page/customers/return'
import oderlist from '../../page/customers/oderlist'
import query from '../../page/customers/query'

export default [
  {path:"customers/couponslist/:uid",component:couponslist},
  {path:"customers/return/:id",component:Return},
  {path:"customers/detail/:id",component:detail},
  {path:"customers/oderlist/:uid/:phoneNum/:orderId",component:oderlist},
  {path:"customers/query",component:query},
];
