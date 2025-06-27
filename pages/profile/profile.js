// profile.js
const util = require('../../utils/util.js');

const shareBehavior = require('../../behaviors/shareBehavior');

Page({
  behaviors: [shareBehavior],
  data: {
    userInfo: null
  },

  onLoad: function() {
    // 获取用户信息
    this.getUserInfoFromStorage();
  },

  onShow: function() {
    // 页面显示时刷新数据
    this.getUserInfoFromStorage();
  },

  // 从本地存储获取用户信息
  getUserInfoFromStorage: function() {
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      });
    }
  },

  // 获取用户信息
  getUserInfo: function(e) {
    if (e.detail.userInfo) {
      const app = getApp();
      app.globalData.userInfo = e.detail.userInfo;
      
      this.setData({
        userInfo: e.detail.userInfo
      });
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '您取消了授权',
        icon: 'none'
      });
    }
  },

  // 导航到我的收藏页面
  navigateToFavorites: function() {
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    });
  },

  // 导航到浏览历史页面
  navigateToHistory: function() {
    util.showNoneToast('规划中，敬请期待～', 1500);
    // wx.navigateTo({
    //   url: '/pages/history/history'
    // });
  },

  // 导航到设置页面
  navigateToSettings: function() {
    util.showNoneToast('规划中，敬请期待～', 1500);
    // wx.navigateTo({
    //   url: '/pages/settings/settings'
    // });
  },

  // 导航到意见反馈页面
  navigateToFeedback: function() {
    util.showNoneToast('欢迎评价打分支持～', 1500);
    // wx.navigateTo({
    //   url: '/pages/feedback/feedback'
    // });
  },

  // 导航到关于我们页面
  navigateToAbout: function() {
    util.showNoneToast('炒菜纠结患者～', 1500);
    // wx.navigateTo({
    //   url: '/pages/about/about'
    // });
  }
});