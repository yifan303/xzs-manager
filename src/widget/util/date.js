import moment from 'moment'
import {message} from 'antd'

export default {
  // date -> 2017-10-20 10:10:10
  parseDateToStr(date){
    var format = num => (num < 10?('0'+num):num)
    return date.getFullYear()+'-'+format(date.getMonth()+1)+'-'+format(date.getDate())+
    ' '+format(date.getHours())+':'+format(date.getMinutes())+':'+format(date.getSeconds())
  },
  // (begin,end) -> {beginTime:"2017-2-14 0:0:0",endTime:"2017-2-16 23:59:59"}
  parseRange(begin,end){
    return {
      beginTime:begin.getFullYear()+'-'+(begin.getMonth()+1)+'-'+begin.getDate()+' 00:00:00',
      endTime:end.getFullYear()+'-'+(end.getMonth()+1)+'-'+end.getDate()+' 23:59:59'
    }
  },
  //时间戳->时间
  parseTime(timestamp){
  	return this.parseDateToStr(new Date(timestamp))
  },
  parseStamp(time){
    return  Date.parse(time);
  },
  //data-> from now to a month later
  now2Month(){
    var d=new Date()
    var startTime=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+
      ' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds()
    var endTime=d.getFullYear()+'-'+(d.getMonth()+2)+'-'+d.getDate()+
      ' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
    var warn=false
    if(parseInt(d.getHours())>8&&parseInt(d.getHours())<22){
      warn=true
    }
    return{
      startTime:Date.parse(startTime),
      endTime:Date.parse(endTime),
      warn:warn
    }
  },
  //时间初始化
  initTime(isEnd){
    var format = num => (num < 10?('0'+num):num)
    var d=new Date()
    var localDate= d.getFullYear()+'-'+format(d.getMonth()+1)+'-'+format(d.getDate())
    var time=isEnd==0? localDate+'23:59:59':localDate+'00:00:00'
    return time
  },
  //判断开始和结束时间，
  overTime(start,end,isRightTime){
    var dayCount=(end-start)/1000/24/3600
    if(isRightTime&&dayCount<0){
      return message.info("开始时间大于结束时间，请重新选择时间")
    }
    return parseInt(dayCount)+1
  },
  // 获取倒计时
  // @param end timestamp
  getCount(end){

    if(!end){
      return {
        hour:0,
        minute:0,
        second:0,
        mini:0
      }
    }

    var hour = 0
    var minute = 0
    var second = 0
    var mini = 0
    var secondUnit = 1000
    var miniteUnit = 60*secondUnit
    var hourUnit = 60*miniteUnit
    var d = end-(+new Date)
    return {
      hour : parseInt(d/hourUnit),
      minute : parseInt(d%hourUnit/miniteUnit),
      second : parseInt(d%miniteUnit/secondUnit),
      mini : parseInt(d%secondUnit/100)
    }
  }
}
