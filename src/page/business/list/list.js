import React from 'react'
import request from 'widget/request'
import {Table,Button,Modal,Input,Form,message,Tag} from 'antd'
import dataUtil from 'widget/util/date.js'
import Search from 'widget/search'
import styles from './list.less'
import TButton from 'widget/button/throttle.js'

var pagesBak = []

export default React.createClass({
  getInitialState(){
    return {
      pages:[],

      visible:false,
      title:''

    }
  },
  defaultData(){
    var promise = request({
      url:'/activity/list'
    })
    promise.then(result=>{
      if(result.success){
        var pages = (result.module||[])
          .sort(($1,$2)=>{
            return parseInt($2.pageId)-parseInt($1.pageId)
          })
          .reduce(($1,$2)=>{
            if($1.length===0){
              $1.push($2)
              return $1
            }
            if($1[$1.length-1].pageId!==$2.pageId){
              $1.push($2)
            }else{
              $1[$1.length-1].stepList = $1[$1.length-1].stepList||[]
              $1[$1.length-1].stepList.push($2.stepTitle)
            }
            return $1
          },[])
        var indexPage = pages.filter(page=>page.pageId==30)
        var searchPage = pages.filter(page=>page.pageId==2)
        pages = indexPage.concat(searchPage).concat(pages)
        this.setState({pages})
        pagesBak = Object.assign([],pages)
      }
    })
  },
  componentDidMount(){
    this.defaultData()
  },
  getColumns(){
    var stepLimit = 6
    return [
      {
        "title":"页面ID",
        "dataIndex":"pageId",
        "key":"pageId"
      },{
        "title":"标题",
        "dataIndex":"title",
        render:(data,record)=>{
          if(record.pageId==30){
            return (
              <span>
                <Tag.CheckableTag checked={true}>首页</Tag.CheckableTag>
                {data}
              </span>
            )
          }
          if(record.pageId==2){
            return (
              <span>
                <Tag.CheckableTag checked={true}>热搜关键字</Tag.CheckableTag>
                {data}
              </span>
            )
          }
          return data
        }
      },{
        "title":"楼层",
        "dataIndex":"stepList",
        "width":300,
        render(list){
          if(!list||list.length===0){
            return "无"
          }
          return list.filter((data,index)=>{
            if(index>stepLimit){
              return false
            }
            return true
          }).map((data,index)=>{
            if(index===stepLimit){
              return <div key={index}>...</div>
            }
            return <div key={index}>{data}</div>
          })
        }
      },{
        "title":"修改",
        "dataIndex":"pageId",
        "key":"operation",
        render(data){
          return (
            <span>
              <Button type="primary" onClick={e=>window.location.href=`#/business/page/${data}`}>修改</Button>
            </span>
          )
        }
      }
    ]
  },
  openModal(){
    this.setState({visible:true,title:''})
  },
  addPage(){
    var {title} = this.state
    if(title===''){
      return message.info('请输入标题')
    }
    var promise = request({
      url:'/activity/init',
      data:{
        pageId:0,
        title,
        gmtCreate:null,
        gmtModified:null
      }
    })
    promise.then(result=>{
      if(result.success){
        message.info('添加页面成功')
        this.setState({visible:false})
        this.defaultData()
      }
    })
  },
  render(){
    var {pages,visible,title} = this.state
    return (
      <div>
        <Search
          widgets={[
            {"name":"pageId","type":"input"}
          ]}
          onSearch={e=>{
            this.setState({pages:pagesBak.filter(page=>{
              if(!e.pageId){
                return true
              }
              return page.pageId==e.pageId
            })})
          }}
        />
        <Button onClick={e=>this.openModal()} type="primary" className={styles.add}>新增页面</Button>
        <Table rowKey="pageId" columns={this.getColumns()} dataSource={pages}/>
        <Modal
          onCancel={e=>this.setState({visible:false})}
          onOk={e=>this.addPage()}
          visible={visible}
        >
          <Form inline>
            <Form.Item label="标题">
              <Input value={title} onChange={e=>this.setState({title:e.target.value})}/>
            </Form.Item>
            <Form.Item>
              <TButton timeout={3000} type="primary" onClick={e=>this.addPage()}>添加</TButton>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
})
