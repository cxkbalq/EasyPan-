<template>
  <div class="mobile-login">
    <div class="login-header">
      <h1 class="app-title">Small云盘</h1>
    </div>

    <el-form
        class="login-form"
        :model="formData"
        :rules="rules"
        ref="formDataRef"
    >
      <!-- 邮箱输入 -->
      <el-form-item prop="email">
        <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            maxlength="150"
        >
          <template #prefix>
            <span class="iconfont icon-account"></span>
          </template>
        </el-input>
      </el-form-item>

      <!-- 密码输入 (仅在登录时显示) -->
      <el-form-item v-if="opType === 1" prop="password">
        <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
        >
          <template #prefix>
            <span class="iconfont icon-password"></span>
          </template>
        </el-input>
      </el-form-item>

      <!-- 注册和重置密码表单项 -->
      <template v-if="opType === 0 || opType === 2">
        <el-form-item prop="emailCode">
          <div class="email-code-input">
            <el-input
                v-model="formData.emailCode"
                placeholder="请输入邮箱验证码"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <el-button @click="getEmailCode" type="primary">获取验证码</el-button>
          </div>
        </el-form-item>

        <el-form-item v-if="opType === 0" prop="nickName">
          <el-input
              v-model="formData.nickName"
              placeholder="请输入昵称"
              maxlength="20"
          >
            <template #prefix>
              <span class="iconfont icon-account"></span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="registerPassword">
          <el-input
              v-model="formData.registerPassword"
              type="password"
              placeholder="请输入密码"
              show-password
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item prop="reRegisterPassword">
          <el-input
              v-model="formData.reRegisterPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
          >
            <template #prefix>
              <span class="iconfont icon-password"></span>
            </template>
          </el-input>
        </el-form-item>
      </template>

      <!-- 验证码 -->
      <el-form-item prop="checkCode">
        <div class="check-code-input">
          <el-input
              v-model="formData.checkCode"
              placeholder="请输入验证码"
              @keyup.enter="doSubmit"
          >
            <template #prefix>
              <span class="iconfont icon-checkcode"></span>
            </template>
          </el-input>
          <img
              :src="checkCodeUrl"
              class="check-code"
              @click="changeCheckCode(0)"
              alt="验证码"
          />
        </div>
      </el-form-item>

      <!-- 记住我和其他选项 -->
      <el-form-item v-if="opType === 1">
        <div class="form-options">
          <el-checkbox v-model="formData.rememberMe">记住我</el-checkbox>
          <div class="text-links">
            <a @click="showPanel(2)">忘记密码？</a>
            <a @click="showPanel(0)">没有账号？</a>
          </div>
        </div>
      </el-form-item>

      <!-- 切换到登录的链接 -->
      <el-form-item v-if="opType === 0 || opType === 2">
        <a @click="showPanel(1)" class="login-link">
          {{ opType === 0 ? '已有账号?' : '去登录?' }}
        </a>
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button type="primary" class="submit-btn" @click="doSubmit">
          {{ opType === 0 ? '注册' : opType === 1 ? '登录' : '重置密码' }}
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 发送邮箱验证码对话框 -->
    <el-dialog
        v-model="dialogConfig4SendMailCode.show"
        :title="dialogConfig4SendMailCode.title"
        width="90%"
    >
      <el-form
          :model="formData4SendMailCode"
          :rules="rules"
          ref="formData4SendMailCodeRef"
      >
        <el-form-item label="邮箱">
          {{ formData.email }}
        </el-form-item>
        <el-form-item label="验证码" prop="checkCode">
          <div class="check-code-input">
            <el-input
                v-model="formData4SendMailCode.checkCode"
                placeholder="请输入验证码"
            >
              <template #prefix>
                <span class="iconfont icon-checkcode"></span>
              </template>
            </el-input>
            <img
                :src="checkCodeUrl4SendMailCode"
                class="check-code"
                @click="changeCheckCode(1)"
                alt="验证码"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogConfig4SendMailCode.show = false">取消</el-button>
        <el-button type="primary" @click="sendEmailCode">发送验证码</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import md5 from 'js-md5';

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const api = {
  checkCode: '/api/checkCode',
  sendMailCode: '/sendEmailCode',
  register: '/register',
  login: '/login',
  resetPwd: '/resetPwd',
};

// 0:注册 1:登录 2:重置密码
const opType = ref(1);
const showPanel = (type) => {
  opType.value = type;
  resetForm();
};

onMounted(() => {
  showPanel(1);
});

const checkCodeUrl = ref(api.checkCode);
const checkCodeUrl4SendMailCode = ref(api.checkCode);
const changeCheckCode = (type) => {
  const url = `${api.checkCode}?type=${type}&time=${new Date().getTime()}`;
  if (type === 0) {
    checkCodeUrl.value = url;
  } else {
    checkCodeUrl4SendMailCode.value = url;
  }
};

const formData4SendMailCode = ref({});
const formData4SendMailCodeRef = ref();
const dialogConfig4SendMailCode = reactive({
  show: false,
  title: '发送邮箱验证码',
});

const getEmailCode = () => {
  formDataRef.value.validateField('email', (valid) => {
    if (!valid) {
      return;
    }
    dialogConfig4SendMailCode.show = true;
    nextTick(() => {
      changeCheckCode(1);
      formData4SendMailCodeRef.value.resetFields();
      formData4SendMailCode.value = {
        email: formData.value.email,
      };
    });
  });
};

const sendEmailCode = () => {
  formData4SendMailCodeRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    const params = {
      ...formData4SendMailCode.value,
      type: opType.value === 0 ? 0 : 1,
    };
    const result = await proxy.Request({
      url: api.sendMailCode,
      params,
      errorCallback: () => {
        changeCheckCode(1);
      },
    });
    if (!result) {
      return;
    }
    proxy.Message.success('验证码发送成功，请登录邮箱查看');
    dialogConfig4SendMailCode.show = false;
  });
};

const checkRePassword = (rule, value, callback) => {
  if (value !== formData.value.registerPassword) {
    callback(new Error(rule.message));
  } else {
    callback();
  }
};

const formData = ref({});
const formDataRef = ref();
const rules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { validator: proxy.Verify.email, message: '请输入正确的邮箱' },
  ],
  password: [{ required: true, message: '请输入密码' }],
  emailCode: [{ required: true, message: '请输入邮箱验证码' }],
  nickName: [{ required: true, message: '请输入昵称' }],
  registerPassword: [
    { required: true, message: '请输入密码' },
    {
      validator: proxy.Verify.password,
      message: '密码只能是数字，字母，特殊字符 8-18位',
    },
  ],
  reRegisterPassword: [
    { required: true, message: '请再次输入密码' },
    {
      validator: checkRePassword,
      message: '两次输入的密码不一致',
    },
  ],
  checkCode: [{ required: true, message: '请输入图片验证码' }],
};

const resetForm = () => {
  nextTick(() => {
    changeCheckCode(0);
    formDataRef.value.resetFields();
    formData.value = {};

    if (opType.value === 1) {
      const cookieLoginInfo = proxy.VueCookies.get('loginInfo');
      if (cookieLoginInfo) {
        formData.value = cookieLoginInfo;
      }
    }
  });
};

const doSubmit = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = { ...formData.value };
    if (opType.value === 0 || opType.value === 2) {
      params.password = params.registerPassword;
      delete params.registerPassword;
      delete params.reRegisterPassword;
    }
    if (opType.value === 1) {
      let cookieLoginInfo = proxy.VueCookies.get('loginInfo');
      let cookiePassword = cookieLoginInfo?.password;
      if (params.password !== cookiePassword) {
        params.password = md5(params.password);
      }
    }
    let url = opType.value === 0 ? api.register : opType.value === 1 ? api.login : api.resetPwd;
    let result = await proxy.Request({
      url,
      params,
      errorCallback: () => {
        changeCheckCode(0);
      },
    });
    if (!result) {
      return;
    }
    if (opType.value === 0) {
      proxy.Message.success('注册成功,请登录');
      showPanel(1);
    } else if (opType.value === 1) {
      if (params.rememberMe) {
        const loginInfo = {
          email: params.email,
          password: params.password,
          rememberMe: params.rememberMe,
        };
        proxy.VueCookies.set('loginInfo', loginInfo, '7d');
      } else {
        proxy.VueCookies.remove('loginInfo');
      }
      proxy.Message.success('登录成功');
      proxy.VueCookies.set('userInfo', result.data, 0);
      //重定向到原始页面
      const redirectUrl = route.query.redirectUrl || "/phone/main";
      router.push(redirectUrl);
    } else if (opType.value === 2) {
      proxy.Message.success('重置密码成功,请登录');
      showPanel(1);
    }
  });
};
</script>

<style lang="scss" scoped>
.mobile-login {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  .app-title {
    font-size: 28px;
    color: #ffffff;
    margin: 0;
  }
}

.login-form {
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  .el-form-item {
    margin-bottom: 20px;
  }

  .el-input {
    .el-input__wrapper {
      padding: 0 15px;
    }
  }

  .email-code-input,
  .check-code-input {
    display: flex;
    gap: 10px;

    .el-input {
      flex: 1;
    }

    .el-button,
    .check-code {
      width: 120px;
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;

    .text-links {
      display: flex;
      gap: 15px;

      a {
        color: #409EFF;
        text-decoration: none;
      }
    }
  }

  .login-link {
    display: block;
    text-align: center;
    color:  #409EFF;
    text-decoration: none;
    margin-top: 10px;
  }

  .submit-btn {
    width: 100%;
  }
}

.el-dialog {
  .el-dialog__body {
    padding: 20px;
  }
}
</style>