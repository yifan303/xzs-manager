// 将接口的数据转化为图表数据
import DateUtil from 'widget/util/date.js'

var parseDate = DateUtil.parseTime.bind(DateUtil)
const dayTime = 1000

var prepareData = (sortData,startSign,endSign,priceSign,tempData) => {
  sortData = Object.assign([],sortData)
  for(var i=0;i<sortData.length;i++){
    for(var j=i+1;j<sortData.length;j++){
      if(
        sortData[i][startSign] >= sortData[j][startSign] &&
        sortData[i][endSign] <= sortData[j][endSign]
      ){
        sortData.splice(i,1)
        i--;
        break
      }
      if(
        sortData[i][startSign] < sortData[j][startSign] &&
        sortData[i][endSign] > sortData[j][startSign] &&
        sortData[i][endSign] <= sortData[j][endSign]
      ){
        sortData[i][endSign] = sortData[j][startSign]-dayTime
        continue
      }
      if(
        sortData[i][startSign] < sortData[j][startSign] &&
        sortData[i][endSign] > sortData[j][endSign]
      ){
        sortData[i][endSign] = sortData[j][startSign]-dayTime
        tempData.push({
          saleStart:sortData[j][endSign]+dayTime,
          saleEnd:sortData[j][endSign],
          price:sortData[i][priceSign]
        })
        continue
      }
      if(
        sortData[i][startSign] > sortData[j][startSign] &&
        sortData[i][startSign] < sortData[j][endSign] &&
        sortData[i][endSign] > sortData[j][endSign]
      ){
        sortData[i][startSign] = sortData[j][endSign]+dayTime
        continue
      }
    }
  }
  var copySortData = Object.assign([],sortData).sort(($1,$2)=>{
    return $1[startSign]>$2[startSign]
  })
  for(var j=0;j<copySortData.length;j++){
    if(j+1>=copySortData.length){
      break
    }
    if(copySortData[j+1][startSign]-copySortData[j][endSign]>dayTime){
      var headerObj = {}
      headerObj[startSign] = copySortData[j][endSign]+dayTime
      headerObj[endSign] = copySortData[j+1][startSign]-dayTime
      headerObj.price = copySortData[j][priceSign]
      copySortData.push(headerObj)
    }
  }
  return copySortData
}

export default (inputData,startSign='saleStart',endSign='saleEnd',priceSign='price') => {
  var tempData = []
  var sortData = inputData.sort(($1,$2)=>$1.id>$2.id)
  sortData = prepareData(sortData,startSign,endSign,priceSign,tempData)

  var timeObj = sortData.reduce(($1,$2)=>{
    $1[$2[startSign]] = $2[priceSign]
    $1[$2[endSign]] = $2[priceSign]
    return $1
  },{})
  var dateSort = Object.keys(timeObj).sort(($1,$2)=>$1>$2)
  var chartDate = [
    ['x'].concat(
      dateSort.map($1=>new Date(parseInt($1)))
    )
  ].concat(sortData.concat(tempData).map(d=>{
    var inArea = false
    var list = []
    for(var i=0;i<dateSort.length;i++){
      if(dateSort[i]==d[startSign]){
        inArea = true
      }
      var price = d[priceSign]
      if(inArea){
        list.push(price/100)
      }else{
        list.push(null)
      }
      if(dateSort[i]==d[endSign]){
        inArea = false
      }
    }

    return [parseDate(d[startSign])+'至'+parseDate(d[endSign])].concat(list)
  }))

  return chartDate
}
