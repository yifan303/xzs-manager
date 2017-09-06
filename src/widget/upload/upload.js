import React from 'react'
import login from 'widget/login'
import {Upload,Button,Icon} from 'antd'
import common from 'widget/common'
import $ from 'jquery'

export default (props)=>(
  <Upload
    name='img'
    data={{token:'BC7836FD25EDDBE3',bizid:1}}
    withCredentials={true}
    customRequest={e=>{
      var fd = new FormData()
      fd.append("img", e.file,"image.jpeg");
      fd.append("token","BC7836FD25EDDBE3");
      fd.append("bizid",1);
      var promise = $.ajax({
        url: `//static.xianzaishi.com:7009/pic/upload`,
        type: 'post',
        contentType: false,
        crossOrigin: true,
        processData: false,
        data: fd
      })
      promise.then(result=>{
        props.onChange&&props.onChange(JSON.parse(result))
      })
    }}
  >
    <Button>
      <Icon type="upload" /> 点击上传图片
    </Button>
  </Upload>
)
