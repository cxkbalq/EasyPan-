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
          :rules="rules"
          ref="formDataRef"
          label-position="top"
          @submit.prevent
      >
        <el-form-item label="新密码" prop="password">
          <el-input
              type="password"
              v-model="formData.password"
              placeholder="请输入密码"
              show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="rePassword">
          <el-input
              type="password"
              v-model="formData.rePassword"
              placeholder="请再次输入密码"
              show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogConfig.show = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
import { Lock } from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance();

const api = {
  updatePassword: "updatePassword",
};

const formData = ref({});
const formDataRef = ref();

const checkRePassword = (rule, value, callback) => {
  if (value !== formData.value.password) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};

const rules = {
  password: [
    { required: true, message: "请输入密码" },
    {
      validator: proxy.Verify.password,
      message: "密码只能是数字，字母，特殊字符 8-18位",
    },
  ],
  rePassword: [
    { required: true, message: "请再次输入密码" },
    {
      validator: checkRePassword,
      message: "两次输入的密码不一致",
    },
  ],
};

const show = () => {
  dialogConfig.value.show = true;
  nextTick(() => {
    formDataRef.value.resetFields();
    formData.value = {};
  });
};

defineExpose({ show });

const dialogConfig = ref({
  show: false,
  title: "修改密码",
});

const submitForm = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let result = await proxy.Request({
      url: api.updatePassword,
      params: {
        password: formData.value.password,
      },
    });
    if (!result) {
      return;
    }
    dialogConfig.value.show = false;
    proxy.message.success("密码修改成功");
  });
};
</script>

<style lang="scss" scoped>
.mobile-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}
</style>