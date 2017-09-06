var timeout = null
var defaultDuring = 1000

export default (cb,during) => {
  if(timeout){
    window.clearTimeout(timeout)
    timeout = null
  }
  timeout = window.setTimeout(()=>{
    cb()
  },during||defaultDuring)
}
