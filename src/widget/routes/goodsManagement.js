import handle from '../../page/goodsManagement/handle'
import querygoodstags from '../../page/goodsManagement/querygoodstags'
import pricemaintain from '../../page/goodsManagement/pricemaintain'
import List from '../../page/goodsManagement/list'
import Detail from '../../page/goodsManagement/detail'
import Category from '../../page/goodsManagement/category'

export default [
  {path:"goodsManagement/handle",component:handle},
  {path:"goodsManagement/pricemaintain",component:pricemaintain},
  {path:"goodsManagement/list",component:List},
  {path:"goodsManagement/querygoodstags",component:querygoodstags},
  {path:"goodsManagement/detail/:id",component:Detail},
  {path:"goodsManagement/category",component:Category}
];
