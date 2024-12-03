<template>
  <el-config-provider :locale="locale" :message="config">
    <router-view></router-view>
  </el-config-provider>
</template>

<script setup>
import {reactive, onMounted} from "vue";
import {useRouter} from 'vue-router';
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import VueCookies from 'vue-cookies'
import {createApp} from 'vue';
import {Tabbar, TabbarItem} from 'vant';

const app = createApp();
app.use(Tabbar);
app.use(TabbarItem);
// import { Button } from 'vant';
// // 2. 引入组件样式
// import 'vant/lib/index.css';
// 设置语言和配置
const locale = zhCn;
const config = reactive({
  max: 1,
});

const router = useRouter(); // 使用 useRouter

// 检测设备并重定向
const isMobileDevice = () => {
  return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
};

const checkDeviceAndRedirect = () => {
  const userInfo = VueCookies.get("userInfo");
  console.log('当前路经为：' + window.location.pathname)
  const path = window.location.pathname;
  const pattern = /^\/share\/[a-zA-Z0-9]+$/; // 匹配以 /share/ 开头，后面跟着16个字母和数字的路径
  if (isMobileDevice()) {
    // 手机端打开
    console.log("当前为手机端");
    //为分享页面
    if (pattern.test(path)) {
   //   window.location.href = 'http://127.0.0.1:88'+"/phone/share/"+path.split('/share/')[1];
      router.push("/share/"+path.split('/share/')[1])
    } else {
      if(userInfo!==null){
       // http://127.0.0.1:88/share/jhaQmSF90pRpnWXjDZ9l
        router.push('/phone/main');
        return;
      }
      router.push("/phone/login")
    }
  } else {
    //为分享页面
    if (pattern.test(path)) {
      router.push("/share/"+path.split('/share/')[1])
    } else {
      if(userInfo!==null){
        router.push('/main/all');
        return;
      }
      router.push("/login")

    }
  }
};

// 使用 onMounted 钩子进行设备检查
onMounted(() => {
  checkDeviceAndRedirect();
});
</script>

<style scoped>
</style>
