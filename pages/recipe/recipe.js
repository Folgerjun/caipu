// recipe.js
const util = require('../../utils/util.js');

const shareBehavior = require('../../behaviors/shareBehavior');

Page({
  behaviors: [shareBehavior],
  data: {
    recipeId: '', // 菜谱ID
    recommendationId: '', // 推荐ID（如果是从推荐页面跳转过来的）
    recipe: null, // 菜谱数据
    availableIngredients: [], // 冰箱中可用的食材ID列表
    isFavorite: false, // 是否已收藏
    allRecipes: [], // 所有菜谱列表
    recentRecommendations: [], // 最近推荐历史
    favoriteRecipes: [], // 收藏的菜谱
    activeTab: 'recommend', // 当前激活的标签页：recommend(推荐)、favorite(收藏)
    showEmptyState: false, // 是否显示空状态
    isDetailMode: false // 是否是详情模式
  },

  onLoad: function(options) {
    if (options.id) {
      // 查看单个菜谱详情
      this.setData({
        recipeId: options.id,
        isDetailMode: true
      });
      
      // 如果有推荐ID，保存起来
      if (options.recommendationId) {
        this.setData({
          recommendationId: options.recommendationId
        });
      }
      
      // 加载菜谱数据
      this.loadRecipeData(options.id);
    } else {
      // 显示菜谱列表页面
      this.loadAllRecipeData();
    }
  },

  onShow: function() {
    // 获取冰箱中可用的食材
    this.loadAvailableIngredients();
    
    // 检查当前菜谱是否已收藏
    if (this.data.recipeId) {
      this.checkIfFavorite(this.data.recipeId);
    }
    
    // 重新加载推荐历史和收藏菜谱
    if (!this.data.isDetailMode) {
      this.loadAllRecipeData();
    }
  },
  
  // 加载所有菜谱数据（推荐历史和收藏）
  loadAllRecipeData: function() {
    const recentRecommendations = wx.getStorageSync('recentRecommendations') || [];
    const favoriteRecipes = getApp().globalData.favoriteRecipes || [];
    
    const showEmptyState = this.data.activeTab === 'recommend' ? 
    recentRecommendations.length === 0 : favoriteRecipes.length === 0;
    
    this.setData({
      recentRecommendations: recentRecommendations,
      favoriteRecipes: favoriteRecipes,
      allRecipes: this.data.activeTab === 'recommend' ? recentRecommendations : favoriteRecipes,
      showEmptyState: showEmptyState
    });
  },
  
  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.activeTab) {
      const allRecipes = tab === 'recommend' ? 
        this.data.recentRecommendations : 
        this.data.favoriteRecipes;

      console.log('allRecipes', allRecipes);
      this.setData({
        activeTab: tab,
        allRecipes: allRecipes,
        showEmptyState: allRecipes.length === 0
      });
    }
  },
  
  // 查看菜谱详情
  viewRecipeDetail: function(e) {
    const recipeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recommendation/recommendation?id=${recipeId}`
    });
  },

  // 加载菜谱数据
  loadRecipeData: function(recipeId) {
    // 从本地存储或推荐历史中获取菜谱数据
    // 实际项目中可能需要从服务器获取
    const app = getApp();
    let recipe = null;
    
    // 先从推荐历史中查找
    if (this.data.recommendationId) {
      const recentRecommendations = wx.getStorageSync('recentRecommendations') || [];
      const recommendation = recentRecommendations.find(item => item.id === this.data.recommendationId);
      
      if (recommendation) {
        recipe = recommendation.recipes.find(item => item.id === recipeId);
      }
    }
    
    // 如果推荐历史中没有找到，从收藏中查找
    if (!recipe) {
      const favoriteRecipes = app.globalData.favoriteRecipes;
      recipe = favoriteRecipes.find(item => item.id === recipeId);
    }
    
    if (recipe) {
      this.setData({
        recipe
      });
    } else {
      wx.showToast({
        title: '未找到菜谱数据',
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

  // 检查是否已收藏
  checkIfFavorite: function(recipeId) {
    const app = getApp();
    const favoriteRecipes = app.globalData.favoriteRecipes;
    const isFavorite = favoriteRecipes.some(item => item.id === recipeId);
    
    this.setData({
      isFavorite
    });
  },

  // 切换收藏状态
  toggleFavorite: function() {
    const app = getApp();
    
    if (this.data.isFavorite) {
      // 取消收藏
      app.removeFavoriteRecipe(this.data.recipeId);
      
      this.setData({
        isFavorite: false
      });
      
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      });
    } else {
      // 添加收藏
      app.addFavoriteRecipe(this.data.recipe);
      
      this.setData({
        isFavorite: true
      });
      
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    }
  },

  // 返回推荐页面
  backToRecommendation: function() {
    if (this.data.recommendationId) {
      wx.navigateBack();
    }
  },

  // 分享功能
  _getShareData() {
    return {
      title: `今天炒啥子菜 - ${this.data.recipe.name}`,
      path: `/pages/recipe/recipe?id=${this.data.recipeId}`,
      imageUrl: this.data.recipe.image || '/images/default/chaocai.png'
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

  // 获取菜系文本
  getCuisineText: function(cuisine) {
    const cuisineMap = {};
    util.cuisineTypes.forEach(item => {
      cuisineMap[item.id] = item.name;
    });
    return cuisineMap[cuisine] || '其他';
  },

  // 检查食材是否可用
  isIngredientAvailable: function(ingredientId) {
    return this.data.availableIngredients.includes(ingredientId);
  }
});