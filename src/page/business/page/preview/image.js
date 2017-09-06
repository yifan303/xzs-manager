import React from 'react'

export default React.createClass({
  render(){
    var src = (this.props.src||'').replace(/^https?\:/,'')
    var style = Object.assign({},this.props.style)
    var {width,height,className} = this.props
    if(width){
      style.width = width
      style.height = height
    }
    return <img className={className} src={src} style={style}/>
  }
})
