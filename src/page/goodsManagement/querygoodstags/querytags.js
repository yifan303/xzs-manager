import React from 'react'
import {Table,Button,Form,Select,message} from 'antd'
import Search from 'widget/search'
import req from 'widget/request'

export default React.createClass({
  getInitialState(){
    return {
      isDrop:false,
      dataSource:null
    }
  },
  //打标需求查询
  queryTagsType(){
    var promise=req({
      url:'/item/queryTagsType'
    })
    promise.then(e=>{
      if(e.success){
        var module=e.module
        this.setState({
          channelTypes:module.channelTypes,
          tagsType:module.tagsType
        })
      }
    })
  },
  addSkuTags(value){
    var promise=req({
      url:'/item/addSkuTags',
      method:'post',
      isOld:true,
      data:value
    })
    promise.then(e=>{
      if(e.success){
        if(typeof e.module=='string'){
         message.success(e.module)
        }else{
          this.setState({
            dataSource:e.module
          })
        }
      }
    })
  },
  dropSkuTags(value){
    var promise=req({
      url:'/item/dropSkuTags',
      method:'post',
      isOld:true,
      data:value
    })
    promise.then(e=>{
      if(e.success){
        var data=this.state.dataSource
        data.splice(this.state.currindex, 1);
        this.setState({ dataSource:data});
      }
    })
  },
  componentDidMount(){
    this.queryTagsType()
  },
  render(){
    var {tagsType,channelTypes,dataSource}=this.state
    self=this
    const columns=[{
      title:'商品skuID',
      key:'skuId',
      dataIndex:'skuId'
    },{
      title:'标种类',
      key:'tagString',
      dataIndex:'tagString'
    },{
      title:'标渠道',
      key:'channelString',
      dataIndex:'channelString'
    },{
      title:'标内容',
      key:'tagContent',
      dataIndex:'tagContent'
    },{
      title:'操作',
      key:'tagId',
      render:(text,record,index)=>{
        var num=0;
        record.num=num ++
        return (
          <Button type="primary" size="small" onClick={e=>{
            this.setState({
              currindex:index
            })
            this.dropSkuTags(record)
          }} href="javascript:void(0);">删除</Button>
        )
      }
    }];
    return (
      <div>
        <Search
          widgets={[
            {name:'idlist',type:'input',text:'商品skuID'},
          ]}
          onSearch={e=>{
            if(e.type==null){
              e.type="0"
            }
            this.addSkuTags(e)
          }}
        />
        <Search
          widgets={[
            {name:'type',type:'select',options:['商品skuID','类目ID'],defaultValue:'商品skuID'},
            {name:'idlist',type:'input'},
            {
              name:'tag',
              type:'select',
              text:'打标种类',
              defaultValue:'请选择',
              width:'200',
              options:(tagsType||[]).reduceRight(($1,$2,index)=>{
                $1[$2.tags+','+index+','+$2.tagRule] = $2.tagsString
                return $1
              },{})
            },
            {
              name:'channel',
              type:'select',
              text:'标渠道',
              defaultValue:'全场标',
              options:(channelTypes||[]).reduceRight(($1,$2)=>{
                $1[$2.channel] = $2.channelString
                return $1
              },{})
            },
            {name:'tagcontent',type:'input',text:'标内容'},
          ]}
          onSearch={e=>{
            if(!e.idlist){
              return message.info('请填写商品skuID或类目ID')
            }
            if(!e.tag){
              return message.info('请选择打标种类')
            }
            if(e.tag.split(',').length>1){
              var arrtag=e.tag.split(',')
              e.tag=arrtag[0]
              e.tagrule=arrtag[2]
            }
            if(e.type==null){
              e.type="0"
            }
            if(e.channel==null){
              e.channel="0"
            }
            e.addremoveflag=1

            this.addSkuTags(e)
          }}
        >打标</Search>
        <Table rowKey={record=>{
          return `${record.skuId}-${record.tagId}-${record.tagContent}-${record.tagString}`
        }} columns={columns} dataSource={dataSource}/>
      </div>
    )
  }
})
