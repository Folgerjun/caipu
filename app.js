// app.js
App({
  globalData: {
    userInfo: null,
    fridgeItems: [],
    favoriteRecipes: [],
    recentPreferences: [],
    dislikedCombinations: []
  },
  onLaunch: function() {
    // 获取本地存储的冰箱食材数据
    const fridgeItems = wx.getStorageSync('fridgeItems') || [];
    this.globalData.fridgeItems = fridgeItems;
    
    // 获取本地存储的收藏菜谱
    const favoriteRecipes = wx.getStorageSync('favoriteRecipes') || [];
    this.globalData.favoriteRecipes = favoriteRecipes;
    
    // 获取用户近期偏好
    const recentPreferences = wx.getStorageSync('recentPreferences') || [];
    this.globalData.recentPreferences = recentPreferences;
    
    // 获取用户不喜欢的组合
    const dislikedCombinations = wx.getStorageSync('dislikedCombinations') || [];
    this.globalData.dislikedCombinations = dislikedCombinations;
    
    // 检查登录状态
    wx.checkSession({
      success: () => {
        // 登录态有效，获取用户信息
        this.getUserInfo();
      },
      fail: () => {
        // 登录态过期，重新登录
        this.login();
      }
    });
  },
  
  login: function() {
    wx.login({
      success: res => {
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          // 实际项目中需要调用后端接口
          console.log('登录成功，获取到code:', res.code);
          this.getUserInfo();
        } else {
          console.log('登录失败：' + res.errMsg);
        }
      }
    });
  },
  
  getUserInfo: function() {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo;
              
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res);
              }
            }
          });
        }
      }
    });
  },
  
  // 添加食材到冰箱
  addFridgeItem: function(item) {
    this.globalData.fridgeItems.push(item);
    wx.setStorageSync('fridgeItems', this.globalData.fridgeItems);
  },
  
  // 从冰箱中删除食材
  removeFridgeItem: function(itemId) {
    this.globalData.fridgeItems = this.globalData.fridgeItems.filter(item => item.id !== itemId);
    wx.setStorageSync('fridgeItems', this.globalData.fridgeItems);
  },
  
  // 更新冰箱中的食材信息
  updateFridgeItem: function(updatedItem) {
    this.globalData.fridgeItems = this.globalData.fridgeItems.map(item => {
      if (item.id === updatedItem.id) {
        return updatedItem;
      }
      return item;
    });
    wx.setStorageSync('fridgeItems', this.globalData.fridgeItems);
  },
  
  // 添加收藏菜谱
  addFavoriteRecipe: function(recipe) {
    this.globalData.favoriteRecipes.push(recipe);
    wx.setStorageSync('favoriteRecipes', this.globalData.favoriteRecipes);
  },
  
  // 移除收藏菜谱
  removeFavoriteRecipe: function(recipeId) {
    this.globalData.favoriteRecipes = this.globalData.favoriteRecipes.filter(recipe => recipe.id !== recipeId);
    wx.setStorageSync('favoriteRecipes', this.globalData.favoriteRecipes);
  },
  
  // 添加用户偏好
  addUserPreference: function(preference) {
    // 限制保存的偏好数量，保留最近的10个
    if (this.globalData.recentPreferences.length >= 10) {
      this.globalData.recentPreferences.shift();
    }
    this.globalData.recentPreferences.push(preference);
    wx.setStorageSync('recentPreferences', this.globalData.recentPreferences);
  },
  
  // 添加不喜欢的组合
  addDislikedCombination: function(combination) {
    this.globalData.dislikedCombinations.push(combination);
    wx.setStorageSync('dislikedCombinations', this.globalData.dislikedCombinations);
  }
});