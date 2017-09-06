## 鲜在时后台

### 使用的库

- [react](https://facebook.github.io/react/)
- UI框架 - [ant-design](https://ant.design/)
- ajax工具 - [reqwest](https://github.com/ded/reqwest)
- 字体 - [iconfont](http://www.iconfont.cn/)
- router - [react-router](https://github.com/ReactTraining/react-router)

### 安装

```
npm install && npm install webpack-dev-server@1.16.2 -g && npm install webpack@1.13.3  -g
```

### 开发

```
npm run dev
```

### 打包

```
npm run prod
```

### 业务开发 

业务目前层级为两层,在`src/page`下,第一层为业务模块，第二层为具体的业务逻辑。

创建了业务component之后，通过配置`src/widget/route`关联hash

有了路由之后，在`src/widget/frame`中配置左侧的nav导航

### 组件

业务的模块放在`src/widget`目录下,引用时使用`widget`加模块名,例如引用`search`,使用`import Search from 'widget/search'`

#### route - 路由配置

#### frame - 左侧导航

#### search - 搜索条件组件,与`table`配合使用

例子:

````

import Search from 'widget/search'

<Search
  // 组件列表
  widgets={[
    // input框
    {name:"name",type:"input",placeholder:"请输入名字",maxLength:20},
    // select选择
    {name:"sex",width:'120',type:'select',options:[
      {value:-1,name:'请选择'},
      {value:0,name:'男'},
      {value:1,name:'女'}
    ]}
  ]}
  // 点击查询执行的回调
  onSearch={e=>{
    console.log(e)
  }}
/>

````
