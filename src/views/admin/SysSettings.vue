<template>
  <div class="sys-setting-panel">
    <el-form
      :model="this.formData"
      :rules="rules"
      ref="formDataRef"
      label-width="150px"
      @submit.prevent
    >
      <!--input输入-->
      <el-form-item label="文件储存路径" prop="registerEmailTitle" id="test">
        <el-input
          clearable
          placeholder="请输入注册邮件验证码邮件标题"
          v-model="formData.filePath"
        >
        </el-input>
        <el-button type="primary" @click="triggerFileInput" id="button">选择路径</el-button>
        <input type="file" ref="fileInput" @change="" style="display: none;" />
      </el-form-item>

      <!--textarea输入-->
      <el-form-item label="文件备份路径" prop="registerEmailContent">
        <el-input
          clearable
          placeholder="请输入注册邮件验证码邮件内容%s占位符为验证码内容"
          v-model="formData.beifenPath"
        ></el-input>
        <el-button type="primary" @click="triggerFileInput" id="button">选择路径</el-button>
      </el-form-item>
      <el-form-item label="初始空间大小" prop="userInitUseSpace">
        <el-input
          clearable
          placeholder="初始空间大小"
          v-model="formData.userInitUseSpace"
        >
          <template #suffix>MB</template>
        </el-input>
      </el-form-item>
      <!-- 单选 -->
      <el-form-item label="" prop="">
        <el-button type="primary" @click="saveSettings">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from "vue";
import { useRouter, useRoute } from "vue-router";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const formData={
  filePath: "wdw",
  beifenPath: "1",
  userInitUseSpace: 4
}


const api = {
  getSysSettings: "/admin/getSysSettings",
  saveSettings: "/admin/saveSysSettings",
};

// const formData = ref({});
const formDataRef = ref();
const rules = {
  // registerEmailTitle: [
  //   { required: true, message: "请输入注册邮件验证码邮件标题" },
  // ],
  // registerEmailContent: [
  //   { required: true, message: "请输入注册邮件验证码邮件内容" },
  // ],
  userInitUseSpace: [
    { required: true, message: "请输入初始化空间大小" },
    {
      validator: proxy.Verify.number,
      message: "空间大小只能是数字",
    },
  ],
};
//const ipcRenderer = require("electron").ipcRenderer

const fileInput = ref(null);

const triggerFileInput = () => {
  //ipcRenderer.send("window-openFile");
  // if (fileInput.value) {
  //   fileInput.value.click();
  // }
};
// 监听文件夹路径
// ipcRenderer.on("getFilePaths", (e, data) => {
//   if (data) {
//     console.log(data[0])
//     //ruleForm.image_path = data[0];
//   }
// });
const handleFileChange = (event) => {
  if (data) {
    ruleForm.image_path = data[0];
  }
};

const getSysSettings = async () => {
  let result = await proxy.Request({
    url: api.getSysSettings,
  });
  if (!result) {
    return;
  }
  formData.value = result.data;
};
getSysSettings();



const saveSettings = async () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) {
      return;
    }
    let params = Object.assign({}, formData.value);
    let result = await proxy.Request({
      url: api.saveSettings,
      params: params,
    });
    if (!result) {
      return;
    }
    proxy.Message.success("保存成功");
  });
};
</script>

<style lang="scss" scoped>
.sys-setting-panel {
  margin-top: 20px;
  width: 600px;
}
#button{
  position: absolute;
  top:0px;
  left: 480px;
}
//#test{
//  display: inline;
//}
</style>