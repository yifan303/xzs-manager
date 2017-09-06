import List from '../../page/dispatch/list'
import Tobelist from '../../page/dispatch/tobelist'
import Beinglist from '../../page/dispatch/beinglist'
import Detail from '../../page/dispatch/detail'
import Check from '../../page/dispatch/check'
import Handup from '../../page/dispatch/handup'

export default [
  {path:"dispatch/list",component:List},
  {path:"dispatch/tobelist",component:Tobelist},
  {path:'dispatch/beinglist',component:Beinglist},
  {path:'dispatch/detail/:id',component:Detail},
  {path:'dispatch/check',component:Check},
  {path:'dispatch/check/:id',component:Check},
  {path:'dispatch/handup',component:Handup}
];
