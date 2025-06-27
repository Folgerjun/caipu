// fridge.js
const util = require('../../utils/util.js');

const shareBehavior = require('../../behaviors/shareBehavior');

Page({
  behaviors: [shareBehavior],
  data: {
    fridgeItems: [], // 冰箱中的所有食材
    filteredFoodItems: [], // 经过分类和搜索筛选后的食材
    expiringItems: [], // 即将过期的食材
    categories: util.ingredientCategories, // 食材分类
    categoryNames: [], // 分类名称数组（用于选择器）
    currentCategory: 'all', // 当前选中的分类
    searchKeyword: '', // 搜索关键词
    showAddModal: false, // 是否显示添加食材弹窗
    showDetailModal: false, // 是否显示食材详情弹窗
    newFood: { // 新添加/编辑的食材
      name: '',
      category: 'vegetable',
      quantity: '',
      unit: '',
      expiryDate: '',
      note: ''
    },
    categoryIndex: 1, // 默认选中蔬菜类
    today: util.formatTime(new Date()), // 今天日期，用于日期选择器
    editingFood: null, // 当前正在编辑的食材ID
    currentFood: {}, // 当前查看详情的食材
    currentFoodCategory: '', // 当前查看详情的食材分类名称
    emptyStateText: '冰箱里还没有食材，点击添加', // 空状态提示文本
    touchStartX: 0, // 触摸开始位置
    touchEndX: 0 // 触摸结束位置
  },

  onLoad: function() {
    // 准备分类名称数组
    const categoryNames = this.data.categories.map(item => item.name);
    this.setData({
      categoryNames
    });
  },

  onShow: function() {
    // 每次页面显示时获取最新的冰箱数据
    this.loadFridgeData();
  },

  // 加载冰箱数据
  loadFridgeData: function() {
    const app = getApp();
    let fridgeItems = app.globalData.fridgeItems;
    
    // 处理食材数据，添加额外信息
    fridgeItems = fridgeItems.map(item => {
      // 计算剩余天数
      let remainingDays = 0;
      let freshness = 'normal';
      
      if (item.expiryDate) {
        remainingDays = util.calculateRemainingDays(item.expiryDate);
        freshness = util.getFreshnessStatus(remainingDays);
      }
      
      return {
        ...item,
        remainingDays,
        freshness
      };
    });
    
    this.setData({
      fridgeItems
    });
    
    // 应用当前的分类和搜索过滤
    this.filterFoodItems(fridgeItems);
  },

  // 根据分类和搜索关键词过滤食材
  filterFoodItems: function(allItems) {
    const { currentCategory, searchKeyword } = this.data;
    
    // 先复制一份allItems，避免修改原始数据
    const items = [...allItems];
    
    // 从所有食材中提取出即将过期和已过期的食材，并按剩余天数升序排序
    let expiringItems = items.filter(item => 
      item.freshness === 'warning' || item.freshness === 'expired'
    ).sort((a, b) => a.remainingDays - b.remainingDays);
    
    // 获取正常食材（非临期和过期）
    let normalItems = items.filter(item => item.freshness === 'normal');
    
    // 如果不是"全部"分类，按分类过滤所有食材
    if (currentCategory !== 'all') {
      normalItems = normalItems.filter(item => item.category === currentCategory);
      expiringItems = expiringItems.filter(item => item.category === currentCategory);
    }
    
    // 如果有搜索关键词，对所有食材进行过滤
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      normalItems = normalItems.filter(item => 
        item.name.toLowerCase().includes(keyword)
      );
      
      expiringItems = expiringItems.filter(item => 
        item.name.toLowerCase().includes(keyword)
      );
    }
    
    // 设置空状态文本
    let emptyStateText = '冰箱里还没有食材，点击添加';
    if (allItems.length > 0) {
      if (currentCategory !== 'all') {
        emptyStateText = '该分类下没有食材';
      }
      if (searchKeyword) {
        emptyStateText = '没有找到匹配的食材';
      }
    }
    
    // 设置数据到页面
    this.setData({
      filteredFoodItems: normalItems,
      expiringItems: expiringItems,
      emptyStateText
    });
  },

  // 切换分类
  switchCategory: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
    
    // 重新过滤食材
    this.filterFoodItems(this.data.fridgeItems);
  },

  // 搜索输入
  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    
    // 重新过滤食材
    this.filterFoodItems(this.data.fridgeItems);
  },

  // 搜索确认
  onSearchConfirm: function() {
    // 可以添加额外的搜索逻辑
  },

  // 清除搜索
  clearSearch: function() {
    this.setData({
      searchKeyword: ''
    });
    
    // 重新过滤食材
    this.filterFoodItems(this.data.fridgeItems);
  },

  // 显示添加食材弹窗
  showAddFoodModal: function() {
    // 重置表单
    this.setData({
      showAddModal: true,
      editingFood: null,
      newFood: {
        name: '',
        category: 'vegetable',
        quantity: '',
        unit: '',
        expiryDate: '',
        note: ''
      },
      categoryIndex: 1 // 默认选中蔬菜类
    });
  },

  // 隐藏添加食材弹窗
  hideAddFoodModal: function() {
    this.setData({
      showAddModal: false
    });
  },

  // 显示食材详情弹窗
  showFoodDetail: function(e) {
    const foodId = e.currentTarget.dataset.id;
    const food = this.data.fridgeItems.find(item => item.id === foodId);
    
    if (food) {
      // 获取分类名称
      const category = this.data.categories.find(cat => cat.id === food.category);
      const categoryName = category ? category.name : '未分类';
      
      this.setData({
        showDetailModal: true,
        currentFood: food,
        currentFoodCategory: categoryName
      });
    }
  },

  // 隐藏食材详情弹窗
  hideDetailModal: function() {
    this.setData({
      showDetailModal: false
    });
  },

  // 编辑食材
  editFood: function(e) {
    const foodId = e.currentTarget.dataset.id;
    const food = this.data.fridgeItems.find(item => item.id === foodId);
    
    if (food) {
      // 找到分类索引
      const categoryIndex = this.data.categories.findIndex(cat => cat.id === food.category);
      
      this.setData({
        showAddModal: true,
        showDetailModal: false, // 如果从详情页进入编辑，需要关闭详情弹窗
        editingFood: foodId,
        newFood: {
          name: food.name,
          category: food.category,
          quantity: food.quantity,
          unit: food.unit,
          expiryDate: food.expiryDate || '',
          note: food.note || ''
        },
        categoryIndex: categoryIndex !== -1 ? categoryIndex : 0
      });
    }
  },

  // 删除食材
  deleteFood: function(e) {
    const foodId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个食材吗？',
      success: res => {
        if (res.confirm) {
          const app = getApp();
          app.removeFridgeItem(foodId);
          
          // 重新加载数据
          this.loadFridgeData();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
          // this.onload();
        }
      }
    });
  },

  // 保存食材
  saveFood: function() {
    const { newFood, editingFood } = this.data;
    
    // 表单验证
    if (!newFood.name) {
      wx.showToast({
        title: '请输入食材名称',
        icon: 'none'
      });
      return;
    }
    
    // if (!newFood.quantity) {
    //   wx.showToast({
    //     title: '请输入食材数量',
    //     icon: 'none'
    //   });
    //   return;
    // }
    
    const app = getApp();
    
    if (editingFood) {
      // 更新现有食材
      const updatedFood = {
        id: editingFood,
        name: newFood.name,
        category: newFood.category,
        quantity: newFood.quantity,
        unit: newFood.unit || '',
        expiryDate: newFood.expiryDate || '',
        note: newFood.note || '',
        updateDate: util.formatTime(new Date())
      };
      
      app.updateFridgeItem(updatedFood);
      
      wx.showToast({
        title: '更新成功',
        icon: 'success'
      });
    } else {
      // 添加新食材
      const newFoodItem = {
        id: util.generateUniqueId(),
        name: newFood.name,
        category: newFood.category,
        quantity: newFood.quantity,
        unit: newFood.unit || '',
        expiryDate: newFood.expiryDate || '',
        note: newFood.note || '',
        addDate: util.formatTime(new Date())
      };
      
      app.addFridgeItem(newFoodItem);
      
      wx.showToast({
        title: '添加成功',
        icon: 'success'
      });
    }
    
    // 关闭弹窗并重新加载数据
    this.hideAddFoodModal();
    this.loadFridgeData();
  },

  // 输入食材名称
  inputFoodName: function(e) {
    this.setData({
      'newFood.name': e.detail.value
    });
  },

  // 选择食材分类
  selectCategory: function(e) {
    const categoryId = e.currentTarget.dataset.category;
    
    // 找到对应的索引（为了保持其他功能不变）
    const index = this.data.categories.findIndex(cat => cat.id === categoryId);
    
    this.setData({
      categoryIndex: index !== -1 ? index : 0,
      'newFood.category': categoryId
    });
  },

  // 输入食材数量
  inputFoodQuantity: function(e) {
    this.setData({
      'newFood.quantity': e.detail.value
    });
  },

  // 输入食材单位
  inputFoodUnit: function(e) {
    this.setData({
      'newFood.unit': e.detail.value
    });
  },

  // 选择保质期
  selectExpiryDate: function(e) {
    this.setData({
      'newFood.expiryDate': e.detail.value
    });
  },

  // 输入备注
  inputFoodNote: function(e) {
    this.setData({
      'newFood.note': e.detail.value
    });
  },

  // 触摸开始
  touchStart: function(e) {
    this.setData({
      touchStartX: e.changedTouches[0].clientX
    });
  },

  // 触摸结束
  touchEnd: function(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - this.data.touchStartX;
    
    // 左滑显示操作按钮（可以在这里添加滑动操作逻辑）
    if (diff < -50) {
      // 左滑操作
    }
  },



});