// behaviors/shareBehavior.js
module.exports = Behavior({
  methods: {
    // 转发给好友
    onShareAppMessage() {
      return this._getShareData() || {
        title: '不知道炒啥子菜就来点我！',
        path: this._getDefaultPath(),
        imageUrl: '/images/default/chaocai.png'
      }
    },
    
    // 分享到朋友圈
    onShareTimeline() {
      return this._getShareData() || {
        title: '炒炒炒炒啥子菜',
        query: this._getDefaultQuery(),
        imageUrl: '/images/default/chaocai.png'
      }
    },
    
    // 获取页面自定义分享数据（可由各个页面覆盖）
    _getShareData() {
      return null
    },
    
    // 获取默认路径
    _getDefaultPath() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      return `/${currentPage.route}?${this._getDefaultQuery()}`
    },
    
    // 获取默认查询参数
    _getDefaultQuery() {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const options = currentPage.options
      return Object.keys(options)
        .map(key => `${key}=${options[key]}`)
        .join('&')
    }
  }
})