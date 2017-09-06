import React from 'react'
import styles from './login.less'
import request from 'widget/request'
import md5 from 'blueimp-md5'
import {message} from 'antd'
import $ from 'jquery'
import login from 'widget/login'
import common from 'widget/common'

export default React.createClass({
  getInitialState(){
    return {
      userName:'',
      password:''
    }
  },
  onSubmit(e){
    e.preventDefault();
    var {userName,password}=this.state;
    if(userName===''){
      return message.info('请填写用户名')
    }
    if(password===''){
      return message.info('请填写密码')
    }
    const equipmentId=md5(window.navigator.userAgent)
    const sysTime=+new Date
    const sign=md5(`${md5(password)}_${sysTime}_${equipmentId}`)

    var req=request('/user/login',{
      method:'post',
      data:{
        userName,
        equipmentId,
        sysTime,
        sign
      }
    });
    req.done(result=>{
      if(result.module){
        login.login(result.module.name,result.module.token,result.module.operatorId)
      }else{
        message.info(result.errorMsg)
      }
    })
    req.fail(e=>{
      message.info('登录失败')
    })
  },
  render(){
    return (
      <div className={styles.content}>
        <form className={styles.login} onSubmit={e=>{this.onSubmit(e)}}>
          <div className={styles.logo}>鲜在时管理后台</div>
          <div className={styles.layer}>
            <div className={styles.username}>
              <i className={styles.icon+" iconfont"}>&#xe7d6;</i>
              <input type="text" onChange={e=>{
                this.setState({userName:e.target.value})
              }} placeholder="请输入用户名"/>
            </div>
            <div className={styles.username+' '+styles.password}>
              <i className={styles.icon+" iconfont"}>&#xe738;</i>
              <input type="password" onChange={e=>{
                this.setState({password:e.target.value})
              }} placeholder="请输入密码"/>
            </div>
          </div>
          <button className={styles.button}>登录</button>
          {common.isDev&&<a className={styles.button1} onClick={e=>{
            window.location.href='http://supplier-dev.xianzaishi.net/index.html?#/reset/1';
          }}>修改密码</a>}
          {common.isProd&&<a className={styles.button1} onClick={e=>{
            window.location.href='http://supplier.xianzaishi.com/index.html?#/reset/1';
          }}>修改密码</a>}
          {common.isQa&&<a className={styles.button1} onClick={e=>{
            window.location.href='http://supplier.xianzaishi.net/index.html?#/reset/1';
          }}>修改密码</a>}
        </form>
      </div>
    )
  }
})
