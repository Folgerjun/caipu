// recipe.js
const util = require('../../utils/util.js');

Page({
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
    
    // 提取所有推荐历史中的菜谱
    let allRecommendedRecipes = [];
    recentRecommendations.forEach(recommendation => {
      if (recommendation.recipes && recommendation.recipes.length > 0) {
        allRecommendedRecipes = allRecommendedRecipes.concat(recommendation.recipes);
      }
    });
    
    // 去重（可能有重复的菜谱）
    const uniqueRecipes = [];
    const recipeIds = new Set();
    allRecommendedRecipes.forEach(recipe => {
      if (!recipeIds.has(recipe.id)) {
        recipeIds.add(recipe.id);
        uniqueRecipes.push(recipe);
      }
    });
    
    const showEmptyState = this.data.activeTab === 'recommend' ? 
      uniqueRecipes.length === 0 : favoriteRecipes.length === 0;
    
    this.setData({
      recentRecommendations: recentRecommendations,
      favoriteRecipes: favoriteRecipes,
      allRecipes: this.data.activeTab === 'recommend' ? uniqueRecipes : favoriteRecipes,
      showEmptyState: showEmptyState
    });
  },
  
  // 切换标签页
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab !== this.data.activeTab) {
      const allRecipes = tab === 'recommend' ? 
        this.extractUniqueRecipes(this.data.recentRecommendations) : 
        this.data.favoriteRecipes;
      
      this.setData({
        activeTab: tab,
        allRecipes: allRecipes,
        showEmptyState: allRecipes.length === 0
      });
    }
  },
  
  // 从推荐历史中提取唯一的菜谱
  extractUniqueRecipes: function(recommendations) {
    let allRecipes = [];
    recommendations.forEach(recommendation => {
      if (recommendation.recipes && recommendation.recipes.length > 0) {
        allRecipes = allRecipes.concat(recommendation.recipes);
      }
    });
    
    const uniqueRecipes = [];
    const recipeIds = new Set();
    allRecipes.forEach(recipe => {
      if (!recipeIds.has(recipe.id)) {
        recipeIds.add(recipe.id);
        uniqueRecipes.push(recipe);
      }
    });
    
    return uniqueRecipes;
  },
  
  // 查看菜谱详情
  viewRecipeDetail: function(e) {
    const recipeId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe/recipe?id=${recipeId}`
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
    
    // 如果还是没找到，可以从模拟数据中查找（实际项目中可能需要从服务器获取）
    if (!recipe) {
      // 这里使用util.js中的模拟数据，实际项目中应该从服务器获取
      const mockRecipes = [
        {
          id: 'recipe1',
          name: '番茄炒蛋',
          cuisine: 'other',
          difficulty: 'easy',
          time: 15,
          ingredients: [
            { id: 'tomato', name: '番茄', amount: '2个' },
            { id: 'egg', name: '鸡蛋', amount: '3个' },
            { id: 'salt', name: '盐', amount: '适量' },
            { id: 'sugar', name: '糖', amount: '少许' },
            { id: 'oil', name: '食用油', amount: '适量' },
            { id: 'scallion', name: '葱', amount: '少许' }
          ],
          nutrition: { calories: 220, protein: '13g', fat: '16g', carbs: '8g' },
          steps: [
            { step: 1, description: '番茄洗净切块，葱切碎' },
            { step: 2, description: '鸡蛋打散，加入少许盐调味' },
            { step: 3, description: '热锅倒油，倒入蛋液炒至金黄' },
            { step: 4, description: '盛出鸡蛋，锅中留底油，放入番茄翻炒' },
            { step: 5, description: '番茄炒软后加入少许糖调味' },
            { step: 6, description: '倒入炒好的鸡蛋，翻炒均匀即可' }
          ],
          tips: [
            '番茄不要炒太久，保持一定的形状口感更佳',
            '加入少许糖可以中和番茄的酸味',
            '先炒蛋再炒番茄，可以保持蛋的嫩滑'
          ]
        },
        {
          id: 'recipe2',
          name: '青椒土豆丝',
          cuisine: 'dongbei',
          difficulty: 'easy',
          time: 20,
          ingredients: [
            { id: 'potato', name: '土豆', amount: '2个' },
            { id: 'greenpepper', name: '青椒', amount: '2个' },
            { id: 'salt', name: '盐', amount: '适量' },
            { id: 'vinegar', name: '醋', amount: '适量' },
            { id: 'oil', name: '食用油', amount: '适量' },
            { id: 'chili', name: '干辣椒', amount: '少许' }
          ],
          nutrition: { calories: 180, protein: '4g', fat: '7g', carbs: '28g' },
          steps: [
            { step: 1, description: '土豆去皮切丝，用清水浸泡去除淀粉' },
            { step: 2, description: '青椒去籽切丝' },
            { step: 3, description: '热锅倒油，放入干辣椒爆香' },
            { step: 4, description: '倒入土豆丝翻炒至变软' },
            { step: 5, description: '加入青椒丝继续翻炒' },
            { step: 6, description: '加入盐和醋调味，翻炒均匀即可' }
          ],
          tips: [
            '土豆切丝后要用清水浸泡，去除多余淀粉，炒出来才不会粘连',
            '青椒最后放，保持脆嫩口感',
            '醋可以增加酸爽口感，也能防止土豆变色'
          ]
        },
        {
          id: 'recipe3',
          name: '红烧肉',
          cuisine: 'jiangsu',
          difficulty: 'medium',
          time: 90,
          ingredients: [
            { id: 'pork', name: '五花肉', amount: '500g' },
            { id: 'soysauce', name: '生抽', amount: '适量' },
            { id: 'sugar', name: '冰糖', amount: '适量' },
            { id: 'ginger', name: '姜', amount: '适量' },
            { id: 'scallion', name: '葱', amount: '适量' },
            { id: 'star_anise', name: '八角', amount: '2个' },
            { id: 'cinnamon', name: '桂皮', amount: '1小块' }
          ],
          nutrition: { calories: 650, protein: '28g', fat: '58g', carbs: '6g' },
          steps: [
            { step: 1, description: '五花肉切成大块，冷水下锅焯水去血水' },
            { step: 2, description: '锅中倒油，放入冰糖小火融化至焦糖色' },
            { step: 3, description: '放入肉块翻炒上色' },
            { step: 4, description: '加入姜、葱、八角、桂皮' },
            { step: 5, description: '加入生抽和适量开水，没过肉块' },
            { step: 6, description: '大火烧开后转小火，盖上锅盖炖1小时' },
            { step: 7, description: '开盖后转大火收汁即可' }
          ],
          tips: [
            '焯水时加入姜片和料酒可以去除腥味',
            '冰糖炒至焦糖色再放肉，可以让肉色更红亮',
            '炖煮时间越长，肉质越酥烂'
          ]
        }
      ];
      
      recipe = mockRecipes.find(item => item.id === recipeId);
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
  onShareAppMessage: function() {
    return {
      title: `今天做什么菜 - ${this.data.recipe.name}`,
      path: `/pages/recipe/recipe?id=${this.data.recipeId}`,
      imageUrl: this.data.recipe.image || '/images/share-default.png'
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