<template>
  <div>
    <component :is="currentComponent"></component>
    <van-tabbar v-model="active" @change="onChange">
      <van-tabbar-item icon="home-o">主页</van-tabbar-item>
      <van-tabbar-item icon="search">上传</van-tabbar-item>
      <van-tabbar-item icon="search">分享</van-tabbar-item>
      <van-tabbar-item icon="friends-o">个人</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue';
import zhuYe from '/src/views/phone/zhujian/main/main.vue';
import shangChuang from '/src/views/phone/zhujian/shangchuang/main.vue';
import geRen from '/src/views/phone/zhujian/geRen/main.vue';
import fenXiang from '/src/views/phone/zhujian/fenXiang/main.vue';

const active = ref(parseInt(localStorage.getItem('active'))  ||0);

// 组件映射表
const components = {
  zhuYe,
  shangChuang,
  fenXiang,
  geRen,
};

// 组件名称数组
const componentNames = ['zhuYe', 'shangChuang', 'fenXiang', 'geRen'];

// 读取 localStorage 中的选中项或默认选择
const initialComponent = localStorage.getItem('selectedComponent') || 'zhuYe';
const currentComponent = ref(components[initialComponent]);
const flag=ref(null);
const showToast = (message) => {
  // 这里实现您的提示逻辑，比如使用 Toast 插件
  console.log(message); // 替换为实际的 Toast 实现
};

const setComponent = (index) => {
  active.value=index
 // console.log(index)
  if (index < 0 || index >= componentNames.length) {
    console.error('无效的组件索引:', index);
    showToast('切换失败，组件索引无效');
    return;
  }
  const selectedComponentName = componentNames[index];
  flag.value=selectedComponentName;
  // 更新当前组件
  currentComponent.value = components[selectedComponentName];
  // 将组件名称存储到 localStorage
  localStorage.setItem('selectedComponent', selectedComponentName);
  localStorage.setItem('active', index);
  // 显示切换到的组件名称
  showToast(`切换到 ${selectedComponentName}`);
};

const onChange = (index) => {
  setComponent(index);
};
watch(flag, () => {
  console.log(flag.value)
}, { deep: true });
// 在组件挂载时检查并设置当前组件
onMounted(() => {
  const savedComponent = localStorage.getItem('selectedComponent');
  if (savedComponent && components[savedComponent]) {
    currentComponent.value = components[savedComponent];
  } else {
    currentComponent.value = components['zhuYe']; // 设置默认组件
  }
});
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: white;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
}

.nav-item {
  flex: 1;
  text-align: center;
  cursor: pointer;
  padding: 10px;
  font-size: 16px;
  transition: background 0.3s;
}

.nav-item.active {
  background: #f0f0f0; /* Active item background */
  font-weight: bold; /* Highlight active item */
}
</style>
