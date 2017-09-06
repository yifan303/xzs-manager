import React from 'react'
import {Row,Col,Tree,Card,Modal,Form,Input,Checkbox,Select} from 'antd'
import styles from './category.less'
import Upload from 'widget/upload'
import req from 'widget/request'

const TreeNode = Tree.TreeNode
const Option = Select.Option

export default React.createClass({
  getInitialState(){
    return {
      category:{
        catName:"类目",
        catId:'-1',
        root:true,
        leaf:0,
        children:[]
      },
      modal:false,
      isLeaf:true,
      attrGroup:[
        {name:'属性集1',id:'0',desc:'属性说明1'},
        {name:'属性集2',id:'1',desc:'属性说明2'}
      ],
      attr:'0'
    }
  },
  getTreeNode(category){
    var node = data => {
      var titleNode = (
        <span>
          {data.catName}
          {!data.root&&(
            <i className={"iconfont "+styles.font} onClick={e=>this.setState({modal:true})}>&#xe761;</i>
          )}
          {!data.root&&data.leaf==0&&(
            <i className={"iconfont "+styles.font} onClick={e=>this.setState({modal:true})}>&#xe7a7;</i>
          )}
          {!data.root&&data.leaf==1&&(
            <i className={"iconfont "+styles.font}>&#xe6eb;</i>
          )}
        </span>
      )
      if(data.children&&data.children.length>0){
        return (
          <TreeNode title={titleNode} key={data.catId} isLeaf={data.leaf==0}>
            {data.children.map(child=>node(child))}
          </TreeNode>
        )
      }
      return <TreeNode title={titleNode} key={data.catId} isLeaf={data.leaf==1}/>
    }
    return node(category)
  },
  loadData(key){
    var parentId = key == -1?'':key
    var {category} = this.state
    var queryTree = (tree,key,modules) =>{
      if(tree.catId==key){
        tree.children = modules
        return
      }
      if(tree.leaf!=0){
        return
      }
      var children = tree.children||[]
      for(var i=0;i<children.length;i++){
        queryTree(children[i],key,modules)
      }
    }
    var promise = req({
      url:`/commodityrelease/querycategories?parentId=${parentId}`
    })
    promise.then(result=>{
      if(result.success){
        var {category} = this.state
        queryTree(category,key,result.module)
        this.forceUpdate()
      }
    })
    return promise
  },
  selectAttr(attr){
    this.setState({attr})
  },
  render(){
    var {category,modal,isLeaf,attrGroup,attr} = this.state
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    }
    return (
      <div>
        <Row>
          <Col span={12}>
            <Card title="类目树" >
              <div className={styles.category}>
                <Tree
                 showLine={true}
                 loadData={node=>this.loadData(node.props.eventKey)}
                >
                  {this.getTreeNode(category)}
                </Tree>
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card className={styles.rule} title="类目规则说明">
              <p>1、类目分为叶子类目和非叶子类目，只有叶子类目下可以有属性集</p>
            </Card>
          </Col>
        </Row>
        <Modal
          title="编辑类目"
          visible={modal}
          onCancel={e=>this.setState({modal:false})}
        >
          <Form.Item label="类目名称" {...formItemLayout}>
            <Input placeholder="填写类目名称"/>
          </Form.Item>
          <Form.Item label="类目图片" {...formItemLayout}>
            <Upload />
          </Form.Item>
          <Form.Item label="叶子节点" {...formItemLayout}>
            <Checkbox checked={isLeaf} onChange={e=>this.setState({isLeaf:e.target.checked})}/>
            {' '}
            是否为叶子节点
          </Form.Item>
          {isLeaf&&(
            <div>
              <Form.Item label="属性集" {...formItemLayout}>
                <Select style={{ width: 120 }} onChange={e=>this.selectAttr(e)} value={attr}>
                  {attrGroup.map(attr=>(
                    <Option key={attr.id} value={attr.id}>{attr.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="属性集描述" {...formItemLayout}>
                {(attrGroup.filter(attrItem=>attrItem.id===attr))[0].desc}
              </Form.Item>
            </div>
          )}
        </Modal>
      </div>
    )
  }
})
