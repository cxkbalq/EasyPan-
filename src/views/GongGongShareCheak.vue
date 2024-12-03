<template>
  <div>
    <Share v-if="!isMobile"></Share> <!-- 当 isMobile 为 false 时渲染 Share -->
    <phoneShare v-if="isMobile"></phoneShare> <!-- 当 isMobile 为 true 时渲染 phoneShare -->
  </div>
</template>

<script setup>
import Share from "/src/views/webshare/ShareCheck.vue";
import phoneShare from "/src/views/phone/zhujian/webshare/ShareCheck.vue";
import { ref, onMounted } from "vue";

const isMobile = ref(false); // 创建响应式变量

const isMobileDevice = () => {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

// 使用 onMounted 钩子进行设备检查
onMounted(() => {
  isMobile.value = isMobileDevice(); // 更新 isMobile 变量
  console.log(isMobile.value)
});
</script>

<style scoped lang="scss">
/* 添加你的样式 */
</style>
