// favorites.js
const util = require('../../utils/util.js');

Page({
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
    const favoriteRecipes = app.globalData.favoriteRecipes || [];
    
    this.setData({
      favoriteRecipes
    });
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
    const recipeId = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: `/pages/recipe/recipe?id=${recipeId}`
    });
  },

  // 检查食材是否在冰箱中
  isIngredientAvailable: function(ingredientId) {
    return this.data.availableIngredients.includes(ingredientId);
  },

  // 获取难度文本
  getDifficultyText: function(difficulty) {
    return util.getDifficultyText(difficulty);
  },

  // 获取菜系文本
  getCuisineText: function(cuisine) {
    return util.getCuisineText(cuisine);
  }
});