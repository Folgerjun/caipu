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
    const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
    recipes = parsedData.map(recipe => ({
      id: generateUniqueId(),
      name: recipe.name,
      cuisine: recipe.cuisine || 'other',
      difficulty: recipe.difficulty || 'medium',
      time: recipe.cookingTime || 30,
      ingredients: (recipe.ingredients || []).map(ing => ({
        id: generateUniqueId(),
        name: ing.name || ing,
        amount: ing.amount || '适量'
      })),
      steps: (recipe.steps || []).map((step, index) => ({
        step: index + 1,
        description: typeof step === 'string' ? step : step.description
      })),
      nutrition: recipe.nutrition || {
        calories: '-',
        protein: '-',
        fat: '-',
        carbs: '-'
      }
    }));
  } catch (error) {
    console.error('解析推荐菜谱数据失败：', error);
    throw new Error('解析推荐菜谱数据失败');
  }

  // return recipes;
  console.log('recipes', recipes);
//};
  
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
      ]
    }
  ];
  
  // 筛选出冰箱中有的食材
  const availableIngredientIds = ingredients.map(item => item.id);
  
  console.log('可用食材ID:', availableIngredientIds);
  
  // 根据食材匹配度和用户偏好进行排序
  let recommendedRecipes = mockRecipes
    .map(recipe => {
      // 计算食材匹配度
      const requiredIngredients = recipe.ingredients.map(item => item.id);
      const matchedIngredients = requiredIngredients.filter(id => availableIngredientIds.includes(id));
      const matchRate = matchedIngredients.length / requiredIngredients.length;
      
      // 考虑用户偏好
      let preferenceScore = 0;
      
      // 判断菜系偏好
      const isCuisinePreferred = preferences.cuisines && 
                               preferences.cuisines.length > 0 && 
                               preferences.cuisines.includes(recipe.cuisine);
      
      // 如果有指定菜系且当前菜谱匹配菜系，增加分数
      if (isCuisinePreferred) {
        preferenceScore += 0.3; // 提高菜系匹配的权重
      }
      
      // 难度偏好
      if (preferences.difficulty && preferences.difficulty === recipe.difficulty) {
        preferenceScore += 0.1;
      }
      
      // 总分 = 食材匹配度(70%) + 偏好分数(30%)
      const score = matchRate * 0.7 + preferenceScore;
      
      return {
        ...recipe,
        matchRate,
        preferenceScore,
        score,
        matchedIngredientCount: matchedIngredients.length,
        requiredIngredientCount: requiredIngredients.length
      };
    })
    .filter(recipe => {
      return true;
      // 过滤掉匹配度过低的菜品
      // return recipe.matchRate >= 0.3; // 降低匹配度阈值，让更多菜谱有机会被推荐
    })
    .filter(recipe => {
      // 过滤掉用户不喜欢的组合
      return !dislikedCombinations.includes(recipe.id);
    });
  console.log('recommendedRecipes', recommendedRecipes);
    
  // 如果指定了菜系偏好，优先筛选符合菜系的菜品
  if (preferences.cuisines && preferences.cuisines.length > 0) {
    const cuisineMatches = recommendedRecipes.filter(recipe => 
      preferences.cuisines.includes(recipe.cuisine)
    );
    
    // 如果找到了符合菜系的菜品，优先使用这些菜品
    if (cuisineMatches.length > 0) {
      console.log(`找到${cuisineMatches.length}个符合菜系${preferences.cuisines}的菜品`);
      recommendedRecipes = cuisineMatches;
    } else {
      console.log(`没有找到符合菜系${preferences.cuisines}的菜品，使用所有匹配菜品`);
    }
  }
  
  // 按总分排序
  recommendedRecipes = recommendedRecipes.sort((a, b) => b.score - a.score);
  
  // 记录推荐结果数量
  console.log(`推荐菜品数量: ${recommendedRecipes.length}`);
  if (recommendedRecipes.length > 0) {
    console.log('推荐菜品详情:', recommendedRecipes.map(r => ({
      name: r.name,
      matchRate: r.matchRate,
      preferenceScore: r.preferenceScore,
      score: r.score,
      matchedIngredients: `${r.matchedIngredientCount}/${r.requiredIngredientCount}`
    })));
  }
  
  return recommendedRecipes;
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
  getCuisineText
};