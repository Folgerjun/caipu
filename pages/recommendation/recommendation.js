// recommendation.js
const util = require('../../utils/util.js');

Page({
  data: {
    recommendationId: '', // 推荐ID
    recommendation: null, // 推荐数据
    availableIngredients: [], // 冰箱中可用的食材ID列表
    totalNutrition: { // 总营养成分
      calories: 0,
      protein: '0g',
      fat: '0g',
      carbs: '0g'
    },
    isFavorite: false // 是否已收藏
  },

  onLoad: function(options) {
    if (options.id) {
      this.setData({
        recommendationId: options.id
      });
      this.loadRecommendationData(options.id);
    }
  },

  onShow: function() {
    // 获取冰箱中可用的食材
    this.loadAvailableIngredients();
  },

  // 加载推荐数据
  loadRecommendationData: function(recommendationId) {
    // 从本地存储获取推荐历史
    const recentRecommendations = wx.getStorageSync('recentRecommendations') || [];
    const recommendation = recentRecommendations.find(item => item.id === recommendationId);
    
    if (recommendation) {
      this.setData({
        recommendation
      });
      
      // 计算总营养成分
      this.calculateTotalNutrition(recommendation.recipes);
      
      // 检查是否已收藏
      this.checkIfFavorite(recommendationId);
    } else {
      wx.showToast({
        title: '未找到推荐数据',
        icon: 'none'
      });
      
      // 返回上一页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 加载冰箱中可用的食材
  loadAvailableIngredients: function() {
    const app = getApp();
    const fridgeItems = app.globalData.fridgeItems;
    const availableIngredients = fridgeItems.map(item => item.id);
    
    this.setData({
      availableIngredients
    });
  },

  // 计算总营养成分
  calculateTotalNutrition: function(recipes) {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    
    recipes.forEach(recipe => {
      if (recipe.nutrition) {
        // 累加热量
        totalCalories += recipe.nutrition.calories || 0;
        
        // 累加蛋白质（需要处理单位）
        if (recipe.nutrition.protein) {
          const protein = parseFloat(recipe.nutrition.protein);
          if (!isNaN(protein)) {
            totalProtein += protein;
          }
        }
        
        // 累加脂肪（需要处理单位）
        if (recipe.nutrition.fat) {
          const fat = parseFloat(recipe.nutrition.fat);
          if (!isNaN(fat)) {
            totalFat += fat;
          }
        }
        
        // 累加碳水化合物（需要处理单位）
        if (recipe.nutrition.carbs) {
          const carbs = parseFloat(recipe.nutrition.carbs);
          if (!isNaN(carbs)) {
            totalCarbs += carbs;
          }
        }
      }
    });
    
    this.setData({
      totalNutrition: {
        calories: totalCalories,
        protein: totalProtein.toFixed(1) + 'g',
        fat: totalFat.toFixed(1) + 'g',
        carbs: totalCarbs.toFixed(1) + 'g'
      }
    });
  },

  // 检查是否已收藏
  checkIfFavorite: function(recommendationId) {
    const favoriteRecommendations = wx.getStorageSync('favoriteRecommendations') || [];
    const isFavorite = favoriteRecommendations.some(item => item.id === recommendationId);
    
    this.setData({
      isFavorite
    });
  },

  // 查看菜谱详情
  viewRecipeDetail: function(e) {
    const recipeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe/recipe?id=${recipeId}&recommendationId=${this.data.recommendationId}`
    });
  },

  // 重新生成推荐
  regenerate: function() {
    wx.showModal({
      title: '重新推荐',
      content: '确定要重新生成推荐吗？',
      success: res => {
        if (res.confirm) {
          // 记录不喜欢的组合
          const app = getApp();
          app.addDislikedCombination(this.data.recommendationId);
          
          // 返回首页并触发重新推荐
          wx.switchTab({
            url: '/pages/index/index',
            success: () => {
              // 通过事件通知首页重新生成推荐
              // 注意：这里需要在首页实现相应的事件监听
              const eventChannel = this.getOpenerEventChannel();
              eventChannel.emit('regenerateRecommendation', {});
            }
          });
        }
      }
    });
  },

  // 收藏推荐组合
  saveRecommendation: function() {
    if (this.data.isFavorite) {
      // 已收藏，取消收藏
      const favoriteRecommendations = wx.getStorageSync('favoriteRecommendations') || [];
      const updatedFavorites = favoriteRecommendations.filter(
        item => item.id !== this.data.recommendationId
      );
      
      wx.setStorageSync('favoriteRecommendations', updatedFavorites);
      
      this.setData({
        isFavorite: false
      });
      
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      });
    } else {
      // 未收藏，添加收藏
      const favoriteRecommendations = wx.getStorageSync('favoriteRecommendations') || [];
      favoriteRecommendations.unshift(this.data.recommendation);
      
      // 最多保存20条收藏
      if (favoriteRecommendations.length > 20) {
        favoriteRecommendations.pop();
      }
      
      wx.setStorageSync('favoriteRecommendations', favoriteRecommendations);
      
      this.setData({
        isFavorite: true
      });
      
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    }
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: `今天做什么菜 - ${this.data.recommendation.date}推荐`,
      path: `/pages/recommendation/recommendation?id=${this.data.recommendationId}`,
      imageUrl: this.data.recommendation.recipes[0]?.image || '/images/share-default.png'
    };
  },

  // 获取难度文本
  getDifficultyText: function(difficulty) {
    const difficultyMap = {
      'easy': '简单',
      'medium': '中等',
      'hard': '困难'
    };
    return difficultyMap[difficulty] || '未知';
  },

  // 检查食材是否可用
  isIngredientAvailable: function(ingredientId) {
    return this.data.availableIngredients.includes(ingredientId);
  }
});