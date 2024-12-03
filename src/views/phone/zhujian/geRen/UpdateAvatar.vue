<template>
  <div>
    <el-dialog
        v-model="dialogConfig.show"
        :title="dialogConfig.title"
        width="90%"
        :close-on-click-modal="false"
        custom-class="mobile-dialog"
    >
      <el-form
          :model="formData"
          ref="formDataRef"
          label-position="top"
          @submit.prevent
      >
        <el-form-item label="昵称" class="nickname-item">
          <el-input v-model="formData.nickname" disabled></el-input>
        </el-form-item>
        <el-form-item label="头像" class="avatar-item">
          <div class="avatar-upload">
            <el-avatar
                :size="120"
                :src="avatarPreview || (proxy.globalInfo.avatarUrl + formData.userId)"
                @click="triggerFileInput"
            >
              <el-icon><User /></el-icon>
            </el-avatar>
            <input
                type="file"
                ref="fileInput"
                style="display: none"
                accept="image/*"
                @change="handleFileChange"
            />
            <el-button type="primary" @click="triggerFileInput" class="upload-btn">
              <el-icon><Upload /></el-icon>
              更换头像
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogConfig.show = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="isSubmitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from "vue";
import { User, Upload } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance();

const api = {
  updateUserAvatar: "updateUserAvatar",
};

const formData = ref({});
const formDataRef = ref();
const fileInput = ref(null);
const avatarPreview = ref(null);
const isSubmitting = ref(false);

const dialogConfig = ref({
  show: false,
  title: "修改头像",
});

const show = (data) => {
  formData.value = Object.assign({}, data);
  avatarPreview.value = null;
  dialogConfig.value.show = true;
};

defineExpose({ show });

const emit = defineEmits(["updateAvatar"]);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    formData.value.avatar = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const submitForm = async () => {
  if (!(formData.value.avatar instanceof File)) {
    dialogConfig.value.show = false;
    return;
  }
  isSubmitting.value = true;
  try {
    let result = await proxy.Request({
      url: api.updateUserAvatar,
      params: {
        avatar: formData.value.avatar,
      },
    });
    if (!result) {
      throw new Error("Failed to update avatar");
    }
    const cookieUserInfo = proxy.VueCookies.get("userInfo");
    delete cookieUserInfo.avatar;
    proxy.VueCookies.set("userInfo", cookieUserInfo, 0);
    emit("updateAvatar");
    proxy.$message.success("头像更新成功,由于缓存需要一段时间才可以刷新！");
    dialogConfig.value.show = false;
  } catch (error) {
    proxy.$message.error("头像更新失败，请重试");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.mobile-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }

  :deep(.el-dialog__header) {
    padding: 20px 20px 10px;
    margin-right: 0;
    text-align: center;
    border-bottom: 1px solid #e6e6e6;
  }

  :deep(.el-dialog__footer) {
    padding: 10px 20px 20px;
    border-top: 1px solid #e6e6e6;
  }
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.upload-btn {
  width: 100%;
  max-width: 200px;
}

.nickname-item, .avatar-item {
  margin-bottom: 20px;
}

:deep(.el-avatar) {
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;

  .el-button {
    flex: 1;
  }
}
</style>