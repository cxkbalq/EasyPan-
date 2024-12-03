<template>
  <div class="user-center">
    <div class="user-card">
      <div class="user-header" @click="updateAvatar">
        <img
            :src="proxy.globalInfo.avatarUrl + userInfo.userId"
            :alt="userInfo.nickname + '的头像'"
            class="user-avatar"
        />
      </div>
      <div class="user-info">
        <h2 class="user-name">{{ userInfo.nickname }}</h2>
        <div class="space-info">
          <div class="space-item">
            <p class="space-value">{{ proxy.Utils.sizeToStr(useSpaceInfo.useSpace) }}</p>
            <p class="space-label">已使用空间</p>
          </div>
          <div class="space-item">
            <p class="space-value">{{ proxy.Utils.sizeToStr(useSpaceInfo.totalSpace) }}</p>
            <p class="space-label">总空间</p>
          </div>
        </div>
        <div class="space-bar-container">
          <div
              class="space-bar-fill"
              :style="{ width: `${(useSpaceInfo.useSpace / useSpaceInfo.totalSpace) * 100}%` }"
          ></div>
        </div>
        <div class="user-actions">
            <el-button @click="openRecycleBin" class="action-button">
            <el-icon><Delete /></el-icon>
            回收站
          </el-button>
          <el-button @click="updatePassword" class="action-button">
            <el-icon><Lock /></el-icon>
            修改密码
          </el-button>
          <el-button @click="logout" type="danger" class="action-button">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
  <UpdateAvatar
      ref="updateAvatarRef"
      @updateAvatar="reloadAvatar"
  ></UpdateAvatar>
  <UpdatePassword ref="updatePasswordRef"></UpdatePassword>
  <RecycleBin ref="recycleBinRef"></RecycleBin>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue';
import { useRoute, useRouter } from "vue-router";
import UpdatePassword from "/src/views/phone/zhujian/geRen/UpdatePassword.vue";
import UpdateAvatar from "/src/views/phone/zhujian/geRen/UpdateAvatar.vue";
import RecycleBin from "/src/views/phone/zhujian/geRen/Recycle.vue";
import { Delete, Lock, SwitchButton } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance();
const router = useRouter();
const api = {
  getUseSpace: "/getUseSpace",
  logout: "/logout",
};

const userInfo = ref(proxy.VueCookies.get("userInfo"));

const useSpaceInfo = ref({ useSpace: 0, totalSpace: 1 });
const getUseSpace = async () => {
  let result = await proxy.Request({
    url: api.getUseSpace,
    showLoading: false,
  });
  if (!result) {
    return;
  }
  useSpaceInfo.value = result.data;
};
getUseSpace();

const updateAvatarRef = ref();
const updateAvatar = () => {
  updateAvatarRef.value.show(userInfo.value);
};

const updatePasswordRef = ref();
const updatePassword = () => {
  updatePasswordRef.value.show();
};

const recycleBinRef = ref();
const openRecycleBin = () => {
  recycleBinRef.value.show();
};

const logout = () => {
  proxy.Confirm(`你确定要退出吗？`, async () => {
    let result = await proxy.Request({
      url: api.logout,
    });
    if (!result) {
      return;
    }
    proxy.VueCookies.remove("userInfo");
    router.push("/phone/login");
  });
};

const reloadAvatar = () => {
  // Implement the logic to reload the avatar
};
</script>

<style lang="scss" scoped>
.user-center {
  min-height: 100vh;
  background-color: #f0f8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.user-card {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.user-header {
  height: 120px;
  background: linear-gradient(135deg, #4a90e2, #5ca0f2);
  position: relative;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.user-avatar:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
}

.user-info {
  padding: 3.5rem 2rem 2rem;
  text-align: center;
}

.user-name {
  font-size: 1.75rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
}

.space-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.space-item {
  flex: 1;
}

.space-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: #4a90e2;
  margin-bottom: 0.25rem;
}

.space-label {
  font-size: 0.875rem;
  color: #666;
}

.space-bar-container {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.space-bar-fill {
  height: 100%;
  background-color: #4a90e2;
  transition: width 0.5s ease-out;
}
.user-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  text-align: center; /* 中心对齐内容 */
}

.action-button {
  display: inline-block; /* 让按钮成为内联块 */
  margin: 0 10px; /* 为按钮添加间距 */
}
//.user-actions {
//  display: grid;
//  grid-template-columns: repeat(2, 1fr);
//  gap: 1rem;
//  text-align: center; /* 中心对齐内容 */
//}
//
//.action-button {
//  width: 100%;
//  height: 40px;
//  display: flex;
//  align-items: center;
//  justify-content: center;
//  font-size: 0.95rem;
//  border-radius: 20px;
//  transition: all 0.3s ease;
//
//  &:last-child {
//    grid-column: span 2;
//  }
//
//  .el-icon {
//    margin-right: 0.5rem;
//  }
//
//  &:hover {
//    transform: translateY(-2px);
//    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
//  }
//}

@media (max-width: 480px) {
  .user-card {
    border-radius: 0;
    max-width: none;
  }

  .user-info {
    padding: 3.5rem 1.5rem 1.5rem;
  }

  .user-name {
    font-size: 1.5rem;
  }

  .space-value {
    font-size: 1.1rem;
  }

  .user-actions {
    grid-template-columns: 1fr;
  }

  .action-button {
    &:last-child {
      grid-column: span 1;
    }
  }
}
</style>