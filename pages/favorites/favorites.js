// favorites.js
const util = require('../../utils/util.js');

const shareBehavior = require('../../behaviors/shareBehavior');

Page({
  behaviors: [shareBehavior],
  data: {
    favoriteRecipes: [], // 收藏的菜谱
    availableIngredients: [] // 冰箱中可用的食材ID列表
  },

  onLoad: function() {
    this.loadFavoriteRecipes();
    this.loadAvailableIngredients();
  },

  onShow: function() {
    // 页面显示时刷新数据
    this.loadFavoriteRecipes();
    this.loadAvailableIngredients();
  },

  // 加载收藏的菜谱
  loadFavoriteRecipes: function() {
    const app = getApp();
    const favoriteRecipes = app.globalData.favoriteRecipes;
    console.log('favoriteRecipes', favoriteRecipes);
    this.setData({
      favoriteRecipes
    });
  },

  // 加载冰箱中可用的食材
  loadAvailableIngredients: function() {
    const app = getApp();
    const fridgeItems = app.globalData.fridgeItems;
    console.log('fridgeItems', fridgeItems);
    const availableIngredients = fridgeItems.map(item => item.id);
    
    this.setData({
      availableIngredients
    });
  },

  // 取消收藏菜谱
  unfavoriteRecipe: function(e) {
    const recipeId = e.currentTarget.dataset.id;
    const app = getApp();
    
    app.removeFavoriteRecipe(recipeId);
    
    // 刷新列表
    this.loadFavoriteRecipes();
    
    wx.showToast({
      title: '已取消收藏',
      icon: 'success'
    });
  },

  // 查看菜谱详情
  viewRecipeDetail: function(e) {
    const recommendationId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recommendation/recommendation?id=${recommendationId}`
    });
  },

  // 检查食材是否在冰箱中
  isIngredientAvailable: function(ingredientId) {
    return this.data.availableIngredients.includes(ingredientId);
  }
});