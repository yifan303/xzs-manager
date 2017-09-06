import $ from 'jquery'
import common from 'widget/common'
import login from 'widget/login'
import {message} from 'antd'

const domainMap={
  'wms':{
    'dev':'http://wmsop.xianzaishi.net',
    'prod':'http://wmsop.xianzaishi.com'
  },
  'purchase':{
    'dev':'http://purchaseop.xianzaishi.net/purchaseadmin',
    'prod':'http://purchaseop.xianzaishi.com'
  },
  'item':{
    'dev':'http://item.xianzaishi.net/wapcenter',
    'prod':'http://item.xianzaishi.com'
  }
}

export default function request(){
  var url='/'
  var options={}

  if(arguments.length>1){
    url=arguments[0]
    options=arguments[1]
  }else if(typeof(arguments[0])==='string'){
    url = arguments[0]
  }else{
    url=arguments[0].url
    delete arguments[0].url
    options=arguments[0]
  }

  options.contentType='application/x-www-form-urlencoded'

  var domainName=options.domain||'purchase'
  var domain=domainMap[domainName]
  if(common.isDev||common.isQa){
    url=domain.dev+url
  }
  if(common.isProd){
    url=domain.prod+url
  }

  options.xhrFields={
    withCredentials: true
  }
  if('data' in options&&options.isOld!==true){
    if(domainName==='wms'){
      options.data={request:JSON.stringify({data:options.data})}
    }else if(domainName==='item'){
      options.contentType = 'text/plain'
      options.processData = false
      options.data = JSON.stringify(options.data)
    }else{
    	options.data={data:JSON.stringify(options.data)}
    }
  }
  var promise = $.ajax(url,options)
  promise.done(result=>{
    if(result.success===false){
      message.info(result.message||result.errorMsg)
    }
    if(result.resultCode===-7){
      window.location.href='#/login'
    }
  })
  return promise
}
