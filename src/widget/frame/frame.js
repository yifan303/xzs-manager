import React from 'react'
import {
  wrap,
  header,
  logo,
  brand,
  use,
  logout,
  left,
  logoutIcon,
  right,
  brumb,
  brumbArrow,
  leftIcon,
  menu,
  menuHeader,
  menuBody,
  menuItem,
  menuItemSelect
} from './frame.less'
import {match} from 'react-router'
import login from 'widget/login'

const configs = [
  require('./dispatch.json'),
  require('./goodsManagement.json'),
  require('./customers.json'),
  require('./purchase.json'),
  require('./service.json'),
  require('./business.json'),
  require('./marketing.json'),
  require('./count.json')
];

export default React.createClass({
  getInitialState(){

    //检查登录
    if(!login.checkLogin()){
      login.logout()
    }
    const info=login.getInfo()

    // 子组件可以修改面包屑
    var children=this.props.children||{};
    var props=children.props||{}
    var params=props.params||{}

    params.changeBrumb = brumb => {
      this.setState({brumb})
    };

    return {
      open:null,
      item:null,
      brumb:[],
      userName:info.userName,
      expand:false
    };
  },
  // 根据当前hash  获取选中的tab
  findTab(){
    var hash = window.location.hash;
    for(var i=0;i<configs.length;i++){
      for(var j=0;j<configs[i].children.length;j++){
        if(hash==configs[i].children[j].href){
          return this.setState({
            open:i,
            brumb:[configs[i].name,configs[i].children[j].name]
          });
        }
      }
    }
  },
  componentDidMount(){
    this.findTab()
  },
  componentWillReceiveProps(next){
    var params = next.params||{}
    params.changeBrumb = brumb => {
      this.setState({brumb})
    };
    this.findTab()
  },
  render(){
    // 面包屑
    const brumbList=this.state.brumb||[];
    const result=[];
    for(var i=0;i<brumbList.length;i++){
      result.push(<span key={2*i}>{brumbList[i]}</span>)
      if(i!==brumbList.length-1){
        result.push(<i key={2*i+1} className={brumbArrow+" iconfont"}>&#xe6a3;</i>)
      }
    }

    const {open,userName,expand} = this.state;

    return (
      <div className={wrap}>
        <div className={header+" smoth print"}>
          <i className={logo+" iconfont"}>&#xe809;</i>
          <div className={brand}>鲜在时后台</div>
          <div className={brumb}>
            <span>后台</span>
            <i className={brumbArrow+" iconfont"}>&#xe6a3;</i>
            {result}
          </div>
          <div className={use}>
            <div className={logout}>
              <i className={logoutIcon+" iconfont"}>&#xe736;</i>{userName}
            </div>
            <div className={logout} onClick={e=>{
              login.logout()
            }}>
              <i className={logoutIcon+" iconfont"}>&#xe659;</i>登出
            </div>
          </div>
        </div>
        <div className={left+" smoth print "+(expand?"expand":'')}>
          <a href="javascript:void(0)" onClick={e=>{
            this.setState({expand:!expand})
          }} className={leftIcon}>
            <i className="iconfont">&#xe7ad;</i>
          </a>
          <div>
          {configs.map((config,index)=>{
            // 是否选中
            var height = 0;
            var rotate = 0;
            if(index===open){
              height = 40*config.children.length;
              rotate = 90;
            }

            return (
              <div className={menu} key={index}>
                <div className={menuHeader} onClick={e=>{
                  var {open} = this.state;
                  if(open===index){
                    return this.setState({open:null});
                  }
                  this.setState({open:index});

                }}>
                  <i style={{transform:`rotate(${rotate}deg)`}} className="iconfont" >&#xe74f;</i>
                  <span>{config.name}</span>
                </div>
                <div className={menuBody} style={{height}}>
                  {config.children.map((child,ix)=>{
                    var selectClass = window.location.hash==child.href?menuItemSelect:"";
                    return (
                      <a href={child.href} key={ix} className={menuItem+" "+selectClass}>
                        <i className="iconfont" dangerouslySetInnerHTML={{__html:child.icon}}/>
                        <span>{child.name}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            );
          })}
          </div>
        </div>
        <div className={right+" content "+(expand?'right-expand':'')} key={window.location.hash}>{this.props.children}</div>
      </div>
    )
  }
})
