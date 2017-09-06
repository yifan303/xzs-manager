import $ from 'jquery'
import common from 'widget/common'
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
  var deferred = $.Deferred()

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
  options.contentType="text/plain"
  options.processData=false
  options.dataType='html'
  options.method = options.method||'post'
  var postData = {
    "version":1,
    "src":"erp",
    "data":options.data||"",
    "appversion":"1"
  }
  options.data = JSON.stringify(postData)
  var promise = $.ajax(url,options)
  promise.done(result=>{
    result = JSON.parse(result)
    if(result.success===true){
      deferred.resolve(result)
    }else{
      message.info(result.errorMsg)
      deferred.reject(result.errorMsg)
    }
    if(result.resultCode===-7){
      window.location.href='#/login'
    }
  })
  promise.fail(()=>{
    deferred.reject('请求发起失败')
  })
  return deferred.promise()
}
