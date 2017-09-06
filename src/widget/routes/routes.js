import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router'
import Frame from '../frame';
import React from 'react';

import goodsManagement from './goodsManagement.js'
import customers from './customers.js'
import dispatch from './dispatch.js';
import purchase from './purchase.js'
import service from './service.js'
import business from './business.js'
import marketing from './marketing.js'
import count from './count.js'

import Login from '../../page/login'
import Welcome from '../../page/welcome'
import Print from '../../page/dispatch/print'

export default (
  <Router history={hashHistory}>
    <Route path="/login" component={Login} />
    <Route path="/dispatch/print/:id" component={Print} />
    <Route path="/dispatch/print/:id/:pid" component={Print} />
    <Route path="/" component={Frame}>
      <IndexRoute component={Welcome} />
      {
        // route配置
        [
          ...dispatch,
          ...goodsManagement,
          ...customers,
          ...purchase,
          ...service,
          ...business,
          ...marketing,
          ...count
        ].map((item,index)=>(
          <Route key={index} path={item.path} component={item.component} />
        ))
      }
    </Route>
  </Router>
)
