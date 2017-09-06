export default (stepType) => {
  var typeMap = {
    // 首页轮播图楼层
    10:'slide',
    // 首页单图楼层
    12:'banner',
    // 类目楼层
    17:'category',
    // 新闻楼层
    22:'content',
    // 首页(1+3*n)商品楼层
    13:'goods',
    // 3版2列商品列表
    25:'twoGood',
    // 活动页面商品楼层
    16:'goods',
    // 首页(单图+5*n)商品楼层无图版本
    21:'fiveGood',
    // 3版标题+横向滑动商品列表
    23:'scrollGood',
    // 3版左图+4商品列表
    24:'fourGood',
    // 3版抢购商品楼层
    26:'countGood',

    // 5版首页商品List楼层
    15:'oneGood',
    // 5版首页最顶部类目楼层
    27:'bar',
    // 5版首页连续方图楼层
    28:'square',
    // 5版首页快报楼层
    29:'contentList',
    // 5版本餐饮楼层
    30:'drink',
    // 5版标题图片楼层
    31:'titlePic',
    // 5版横向滚动商品楼层
    32:'rowRoll'

  }
  return typeMap[stepType]
}
export var getTarget = (type) => {
  var targetMap = {
    1:'category',
    2:'detail',
    4:'href'
  }
  return targetMap[type]
}
