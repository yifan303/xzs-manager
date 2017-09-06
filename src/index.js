// 全局样式
import "./widget/common/global.less";
import 'antd/dist/antd.css'; 

import React from 'react'
import {render} from 'react-dom'

import Frame from './widget/frame'
import Routes from './widget/routes'
const content = document.getElementById('content')

render(Routes,content)
