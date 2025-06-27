// index.js
const util = require('../../utils/util.js');

const shareBehavior = require('../../behaviors/shareBehavior');

Page({
  behaviors: [shareBehavior],
  data: {
    fridgeItems: [], // 冰箱中的食材
    fridgeItemsPreview: [], // 冰箱食材预览（最多显示5个）
    expiringItems: [], // 即将过期的食材
    cuisineOptions: util.cuisineTypes, // 菜系选项
    selectedCuisine: 'all', // 默认选择全部菜系
    dishCountOptions: [1, 2, 3, 4], // 菜品数量选项
    selectedDishCount: 2, // 默认选择3道菜
    recentRecommendations: [], // 最近的推荐
    isLoading: false, // 是否正在加载
    canRecommend: false // 是否可以推荐（冰箱是否有食材）
  },

  // 可选：覆盖默认分享数据
  // _getShareData() {
  //   return {
  //     title: '自定义页面标题',
  //     path: `/pages/index/index?id=${this.data.id}`,
  //     imageUrl: this.data.shareImage,
  //     query: `id=${this.data.id}`
  //   }
  // },

  onLoad: function() {
    // 页面加载时执行
    // 添加全部选项到菜系列表开头
    const allOption = { id: 'all', name: '全部' };
    this.setData({
      cuisineOptions: [allOption, ...this.data.cuisineOptions]
    });
  },

  onShow: function() {
    // 每次页面显示时获取最新的冰箱数据
    this.loadFridgeData();
    // 获取最近推荐历史
    this.loadRecentRecommendations();
  },
  
  // // 可选：覆盖默认分享数据
  // _getShareData() {
  //   return {
  //     title: '自定义页面标题',
  //     path: `/pages/index/index?id=${this.data.id}`,
  //     imageUrl: this.data.shareImage,
  //     query: `id=${this.data.id}`
  //   }
  // },

  // 加载冰箱数据
  loadFridgeData: function() {
    const app = getApp();
    const fridgeItems = app.globalData.fridgeItems || [];
    
    // 计算即将过期的食材
    const expiringItems = fridgeItems.filter(item => {
      if (!item.expiryDate) return false;
      const remainingDays = util.calculateRemainingDays(item.expiryDate);
      return remainingDays >= 0 && remainingDays <= 2; // 剩余2天及以内视为即将过期
    });
    
    // 准备预览数据（最多显示5个）
    const fridgeItemsPreview = fridgeItems.slice(0, 5).map(item => {
      let status = 'normal';
      if (item.expiryDate) {
        const remainingDays = util.calculateRemainingDays(item.expiryDate);
        status = util.getFreshnessStatus(remainingDays);
      }
      return {
        id: item.id,
        name: item.name,
        status: status
      };
    });
    
    this.setData({
      fridgeItems,
      fridgeItemsPreview,
      expiringItems,
      canRecommend: fridgeItems.length > 0
    });
  },

  // 加载最近推荐历史
  loadRecentRecommendations: function() {
    // 从本地存储获取最近推荐历史
    const recentRecommendations = wx.getStorageSync('recentRecommendations') || [];
    // 处理推荐数据，添加菜品名称列表
    const formattedRecommendations = recentRecommendations.slice(0, 5).map(item => {
      return {
        id: item.id,
        date: item.date,
        dishes: item.recipes.map(recipe => ({ id: recipe.id, name: recipe.name }))
      };
    });
    
    this.setData({
      recentRecommendations: formattedRecommendations
    });
  },

  // 跳转到冰箱页面
  navigateToFridge: function() {
    wx.switchTab({
      url: '/pages/fridge/fridge'
    });
  },

  // 选择菜系
  selectCuisine: function(e) {
    const cuisineId = e.currentTarget.dataset.cuisine;
    this.setData({
      selectedCuisine: cuisineId
    });
  },

  // 选择菜品数量
  selectDishCount: function(e) {
    const count = e.currentTarget.dataset.count;
    this.setData({
      selectedDishCount: count
    });
  },

  // 生成推荐
  generateRecommendation: async function() {
    const app = getApp();
    const fridgeItems = app.globalData.fridgeItems || [];
    
    // 检查冰箱是否有食材
    if (fridgeItems.length === 0) {
      wx.showToast({
        title: '冰箱里还没有食材哦',
        icon: 'none'
      });
      return;
    }
    
    // 记录当前推荐状态
    console.log('开始生成推荐', {
      '冰箱食材数量': fridgeItems.length,
      '冰箱食材': fridgeItems,
      '选择的菜系': this.data.selectedCuisine,
      '选择的菜品数量': this.data.selectedDishCount
    });
    
    this.setData({
      isLoading: true
    });
    
    // 准备用户偏好数据
    const preferences = {
      cuisines: this.data.selectedCuisine === 'all' ? [] : [this.data.selectedCuisine],
      dishCount: this.data.selectedDishCount
    };
    
    // 获取用户不喜欢的组合
    const dislikedCombinations = app.globalData.dislikedCombinations || [];
    console.log('不喜欢的组合数量:', dislikedCombinations.length);
    
    // 调用推荐算法生成推荐
    // 注意：这里使用模拟数据，实际项目中可能需要调用后端API
    let recommendedRecipes = [];
    try {
      recommendedRecipes = await util.generateRecommendations(
        fridgeItems,
        preferences,
        dislikedCombinations
      );
      
      console.log(`推荐结果: 获得${recommendedRecipes.length}个菜谱`);
      
      // 如果没有推荐结果
      if (recommendedRecipes.length === 0) {
        this.setData({
          isLoading: false
        });
        
        // 提供更具体的提示信息
        let message = '没有找到合适的推荐';
        if (this.data.selectedCuisine !== 'all') {
          // 如果选择了特定菜系但没有推荐，提示尝试其他菜系
          const cuisineName = this.data.cuisineOptions.find(c => c.id === this.data.selectedCuisine)?.name || this.data.selectedCuisine;
          message = `没有找到匹配${cuisineName}菜系的推荐，请尝试其他菜系或添加更多食材`;
        } else {
          message = '没有找到合适的推荐，请添加更多食材或减少菜品数量';
        }
        
        wx.showToast({
          title: message,
          icon: 'none',
          duration: 2500
        });
        return;
      }
    } catch (error) {
      console.error('生成推荐时出错:', error);
      this.setData({
        isLoading: false
      });
      wx.showToast({
        title: '推荐生成出错，请稍后再试',
        icon: 'none'
      });
      return;
    }
    
    // 限制推荐数量
    // const limitedRecipes = recommendedRecipes.slice(0, this.data.selectedDishCount);
    
    // 生成推荐ID
    const recommendationId = util.generateUniqueId();
    
    // 保存推荐结果
    const recommendation = {
      id: recommendationId,
      date: util.formatTime(new Date(), 'MM月DD日'),
      dishCount: recommendedRecipes.length,
      recipes: recommendedRecipes,
      timestamp: Date.now()
    };
    
    // 保存到本地存储
    const recentRecommendations = wx.getStorageSync('recentRecommendations') || [];
    recentRecommendations.unshift(recommendation);
    // 最多保存10条记录
    if (recentRecommendations.length > 10) {
      recentRecommendations.pop();
    }
    wx.setStorageSync('recentRecommendations', recentRecommendations);
    
    this.setData({
      isLoading: false
    });
    
    // 跳转到推荐结果页面
    wx.navigateTo({
      url: `/pages/recommendation/recommendation?id=${recommendationId}`
    });
  },

  // 查看历史推荐
  viewRecommendation: function(e) {
    const recommendationId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recommendation/recommendation?id=${recommendationId}`
    });
  }
});