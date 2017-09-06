var timeout = null
var defaultDuring = 1000

export default (arr1,arr2,compareFunc) => {
  var length = arr1.length
  var newArr = Object.assign([],arr1)
  var newArr2 = Object.assign([],arr2)

  for(var i=0;i<newArr2.length;i++){

    for(var j=0;j<length;j++){
      if(
        (compareFunc&&compareFunc(newArr[j],newArr2[i]))||
        (!compareFunc&&newArr[j]===newArr2[i])
      ){
        break
      }
    }

    if(j===length){
      newArr.push(newArr2[i])
    }

  }
  return newArr
}
