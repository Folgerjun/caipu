// 工具函数库

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {String} format 格式字符串，如 'YYYY-MM-DD'
 * @return {String} 格式化后的日期字符串
 */
const formatTime = (date, format = 'YYYY-MM-DD') => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  format = format.replace('YYYY', year);
  format = format.replace('MM', month.toString().padStart(2, '0'));
  format = format.replace('DD', day.toString().padStart(2, '0'));
  format = format.replace('HH', hour.toString().padStart(2, '0'));
  format = format.replace('mm', minute.toString().padStart(2, '0'));
  format = format.replace('ss', second.toString().padStart(2, '0'));

  return format;
};

const showNoneToast = (title, duration) => {
  wx.showToast({
    title: title,
    icon: 'none',
    duration: duration
  })
}

/**
 * 计算食材保质期剩余天数
 * @param {String} expiryDate 过期日期字符串 'YYYY-MM-DD'
 * @return {Number} 剩余天数
 */
const calculateRemainingDays = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * 获取食材新鲜度状态
 * @param {Number} remainingDays 剩余天数
 * @return {String} 状态：'expired', 'warning', 'normal'
 */
const getFreshnessStatus = (remainingDays) => {
  if (remainingDays < 0) {
    return 'expired';
  } else if (remainingDays <= 2) {
    return 'warning';
  } else {
    return 'normal';
  }
};

/**
 * 食材分类
 */
const ingredientCategories = [
  { id: 'meat', name: '肉类' },
  { id: 'vegetable', name: '蔬菜类' },
  { id: 'fruit', name: '水果类' },
  { id: 'seafood', name: '海鲜类' },
  { id: 'dairy', name: '奶制品' },
  { id: 'grain', name: '谷物豆类' },
  { id: 'condiment', name: '调味料' },
  { id: 'other', name: '其他' }
];

/**
 * 菜系分类
 */
const cuisineTypes = [
  { id: 'sichuan', name: '川菜' },
  { id: 'cantonese', name: '粤菜' },
  { id: 'hunan', name: '湘菜' },
  { id: 'dongbei', name: '东北菜' },
  { id: 'jiangsu', name: '苏菜' },
  { id: 'zhejiang', name: '浙菜' },
  { id: 'fujian', name: '闽菜' },
  { id: 'anhui', name: '徽菜' },
  { id: 'shandong', name: '鲁菜' },
  { id: 'western', name: '西餐' },
  { id: 'japanese', name: '日料' },
  { id: 'korean', name: '韩餐' },
  { id: 'other', name: '其他' }
];

// 获取菜系文本
const getCuisineText = (cuisine) => {
  const cuisineMap = {};
  cuisineTypes.forEach(item => {
    cuisineMap[item.id] = item.name;
  });
  return cuisineMap[cuisine] || '其他';
};

/**
 * 烹饪难度级别
 */
const difficultyLevels = [
  { id: 'easy', name: '简单', description: '新手也能轻松完成' },
  { id: 'medium', name: '中等', description: '需要一定烹饪基础' },
  { id: 'hard', name: '困难', description: '需要较丰富的烹饪经验' }
];

/**
 * 生成唯一ID
 * @return {String} 唯一ID
 */
const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

/**
 * 调用API的通用方法
 * @param {String} url API地址
 * @param {Object} data 请求数据
 * @return {Promise} Promise对象
 */
function postRequest(url, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'POST',
      data: data,
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer pat_S2Qu1O8t26gReN6qI39Dwd5Ck2RitWnJjZRsoFiKDTaXZPhXGqdqryoKSsWemhmm'
      },
      success: (res) => {
        console.log('res', res);
        if (res.statusCode === 200) {
          resolve(res.data); // 请求成功返回数据
        } else {
          reject(res); // 非200状态码视为失败
        }
      },
      fail: (err) => {
        reject(err); // 网络错误
      }
    });
  });
};

// 使用示例：
// try {
//   const result = await postSync('https://api.example.com/data', {
//     name: '测试数据',
//     value: 123
//   });
//   console.log('请求成功：', result);
// } catch (error) {
//   console.error('请求失败：', error);
// }

/**
 * 根据食材列表和用户偏好生成菜品推荐
 * @param {Array} ingredients 食材列表
 * @param {Object} preferences 用户偏好
 * @param {Array} dislikedCombinations 不喜欢的组合
 * @return {Array} 推荐菜品列表
 */
const generateRecommendations = async (ingredients, preferences, dislikedCombinations) => {
  // 这里是简化的推荐逻辑，实际项目中可能需要更复杂的算法或调用后端API
  // 示例数据，实际项目中应该从数据库或API获取
  
  // 记录输入参数，便于调试
  console.log('生成推荐，参数：', {
    ingredientsCount: ingredients.length,
    preferences: preferences,
    dislikedCombinationsCount: dislikedCombinations.length
  });

  // 食材名称
  const availableIngredientNames = ingredients.map(item => item.name);
  // 菜系名称
  let cai_xi = '所有菜系'
  if (preferences.cuisines && preferences.cuisines.length > 0) {
    cai_xi = getCuisineText(preferences.cuisines[0])
  }

  // 调用 工作流
  // console.log('availableIngredientNames', availableIngredientNames);
  // console.log('cai_xi', cai_xi);
  // console.log('preferences.dishCount', preferences.dishCount);
  const data = {
    "workflow_id": "7510115889620434978",
    "parameters": {
      "cai_names": availableIngredientNames,
      "cai_xi": cai_xi,
      "cai_num": preferences.dishCount,
      "need_steps": true,  // 添加这个参数来获取做菜步骤
      "format": "json"    // 确保返回 JSON 格式数据
    },
    "is_async": false
  }
  const result = await postRequest('https://api.coze.cn/v1/workflow/run', data);
  
  console.log('result', result);

  // 解析返回的数据
  let recipes = [];
  try {
    // 如果返回的是字符串，尝试解析成 JSON
    let parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
    parsedData = JSON.parse(parsedData.data)

    recipes = parsedData.map(recipe => ({
      id: generateUniqueId(),
      name: recipe.cai_ping_name,
      steps: recipe.cai_pu
    }));
  } catch (error) {
    console.error('解析推荐菜谱数据失败：', error);
    throw new Error('解析推荐菜谱数据失败');
  }

  console.log('recipes', recipes);
  
  return recipes;
};

module.exports = {
  formatTime,
  calculateRemainingDays,
  getFreshnessStatus,
  ingredientCategories,
  cuisineTypes,
  difficultyLevels,
  generateUniqueId,
  generateRecommendations,
  getCuisineText,
  showNoneToast
};