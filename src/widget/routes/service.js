import servicelist from '../../page/service/servicelist'
import output from '../../page/service/output'
import input from '../../page/service/input'
import detail from '../../page/service/detail'
import outputdetail from '../../page/service/outputdetail'
import inputdetail from '../../page/service/inputdetail'

export default[
	{path:"service/input",component:input},
	{path:"service/output",component:output},
	{path:"service/servicelist",component:servicelist},
	{path:"service/inputdetail/:id/:bizId/:taskStatus",component:inputdetail},
	{path:"service/outputdetail/:id/:bizId/:taskStatus",component:outputdetail},
	{path:"service/detail/:id/:detail",component:detail},
]