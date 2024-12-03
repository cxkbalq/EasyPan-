<template>
  <div class="share">
    <div class="body-content">
      <div class="logo">
        <span class="iconfont icon-pan"></span>
        <span class="name">Small云盘</span>
      </div>
      <div class="code-panel">
        <div class="file-info">
          <div class="avatar">
            <Avatar
                :userId="shareInfo.userId"
                :avatar="shareInfo.avatar"
                :width="50"
            ></Avatar>
          </div>
          <div class="share-info">
            <div class="user-info">
              <span class="nick-name">{{ shareInfo.nickName }}</span>
              <span class="share-time">分享于 {{ shareInfo.shareTime }}</span>
            </div>
            <div class="file-name">分享文件：{{ shareInfo.fileName }}</div>
          </div>
        </div>
        <div class="code-body">
          <div class="tips">请输入提取码：</div>
          <div class="input-area">
            <el-form
                :model="formData"
                :rules="rules"
                ref="formDataRef"
                @submit.prevent
            >
              <el-form-item prop="code">
                <el-input
                    class="input"
                    v-model="formData.code"
                    maxlength="5"
                    @keyup.enter="checkShare"
                ></el-input>
                <el-button type="primary" @click="checkShare">提取文件</el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, reactive, getCurrentInstance} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
const { proxy } = getCurrentInstance();
const router = useRouter()
const route = useRoute()

const api = {
  getShareInfo: "/showShare/getShareInfo",
  checkShareCode: "/showShare/checkShareCode",
}

const shareId = route.params.shareId
const shareInfo = ref({})
const formData = ref({ code: '' })
const formDataRef = ref()

const rules = {
  code: [
    { required: true, message: "请输入提取码" },
    { min: 5, max: 5, message: "提取码为5位" },
  ],
}

const getShareInfo = async () => {
  let result = await proxy.Request({
    url: api.getShareInfo,
    params: {
      shareId,
    },
  });
  if (!result) {
    return;
  }
  shareInfo.value = result.data;
};

const checkShare = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.checkShareCode,
      params: {
        shareId: shareId,
        code: formData.value.code,
      },
    });
    if (!result) {
      return;
    }
    router.push(`/share/${shareId}`);
  });
};

getShareInfo()
</script>

<style lang="scss" scoped>
.share {
  min-height: 100vh;
  background: linear-gradient(to bottom, #eef2f6, #ffffff);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
}

.body-content {
  width: 100%;
  max-width: 400px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;

  .icon-pan {
    font-size: 2.5rem;
    color: #409eff;
  }

  .name {
    font-weight: bold;
    margin-left: 0.5rem;
    font-size: 1.5rem;
    color: #409eff;
  }
}

.code-panel {
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.file-info {
  padding: 1rem;
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;

  .avatar {
    margin-right: 1rem;
  }

  .share-info {
    .user-info {
      display: flex;
      flex-direction: column;

      .nick-name {
        font-size: 1rem;
        font-weight: bold;
      }

      .share-time {
        font-size: 0.8rem;
        margin-top: 0.25rem;
      }
    }

    .file-name {
      margin-top: 0.5rem;
      font-size: 0.9rem;
    }
  }
}

.code-body {
  padding: 1.5rem 1rem;

  .tips {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .input-area {
    .el-form-item {
      margin-bottom: 0;
    }

    .input {
      margin-bottom: 1rem;
    }

    .el-button {
      width: 100%;
    }
  }
}
</style>