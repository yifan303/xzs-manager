var pow = 8

export default {
	split : pa => {
		var result = []
		var num = parseInt(pa)

		for(var i=pow;i>0;i--){
			var powResult = Math.pow(2,i)
			var flag = parseInt(num/powResult)
			num = num%powResult
			if(flag===1){
				result.push(powResult)
			}
		}
		return result
	},
	negativeSplit : pa => {
		var result = []
		var num = parseInt(pa)

		for(var i=pow;i>0;i--){
			var powResult = -Math.pow(2,i)
			var flag = parseInt(num/powResult)
			num = num%powResult
			if(flag===1){
				result.push(powResult)
			}
		}
		return result
	},
	join: (num=[]) => {
		return num.reduce(($1,$2)=>{ return $1+parseInt($2) },0)
	}
}
