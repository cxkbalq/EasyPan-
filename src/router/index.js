import { createRouter, createWebHistory } from 'vue-router'
import VueCookies from 'vue-cookies'
import {onMounted} from "vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: '登录',
      component: () => import("@/views/Login.vue")
    },
    {
      path: "/",
      component: () => import("@/views/Framework.vue"),
      children: [
        {
          path: '/',
          redirect: "/main/all"
        },
        {
          path: '/main/:category',
          name: '首页',
          meta: {
            needLogin: true,
            menuCode: "main"
          },
          component: () => import("@/views/main/Main.vue")
        },
        {
          path: '/myshare',
          name: '我的分享',
          meta: {
            needLogin: true,
            menuCode: "share"
          },
          component: () => import("@/views/share/Share.vue")
        },
        {
          path: '/recycle',
          name: '回收站',
          meta: {
            needLogin: true,
            menuCode: "recycle"
          },
          component: () => import("@/views/recycle/Recycle.vue")
        },
        // {
        //   path: '/settings/sysSetting',
        //   name: '系统设置',
        //   meta: {
        //     needLogin: true,
        //     menuCode: "settings"
        //   },
        //   component: () => import("@/views/admin/SysSettings.vue")
        // },
        {
          path: '/settings/userList',
          name: '用户管理',
          meta: {
            needLogin: true,
            menuCode: "settings"
          },
          component: () => import("@/views/admin/UserList.vue")
        },
        {
          path: '/settings/fileList',
          name: '用户文件',
          meta: {
            needLogin: true,
            menuCode: "settings"
          },
          component: () => import("@/views/admin/FileList.vue")
        },
      ]
    },
    {
      path: '/shareCheck/:shareId',
      name: '分享校验',
      component: () => import("@/views/GongGongShareCheak.vue")
    },
    {
      path: '/share/:shareId',
      name: '分享',
      component: () => import("@/views/GongGongShare.vue")
    },
    {
      path: '/qqlogincalback',
      name: "qq登录回调",
      component: () => import('@/views/QqLoginCallback.vue'),
    },
    {
      path: '/phone/Login',
      name: '手机登录',
      component: () => import("@/views/phone/Login.vue")
    },
    {
      path: '/phone/main',
      name: '手机登录1',
      component: () => import("@/views/phone/zhujian/main.vue")
    },
    // {
    //   path: '/phone/shareCheck/:shareId',
    //   name: '手机分享校验',
    //   component: () => import("@/views/phone/zhujian/webshare/ShareCheck.vue")
    // },
    // {
    //   path: '/phone/share/:shareId',
    //   name: '手机分享',
    //   component: () => import("@/views/phone/zhujian/webshare/Share.vue")
    // },
  ]
})

export default router
