<template>
  <div class="avatar-upload">
    <div class="avatar-show">
      <template v-if="localFile">
        <img :src="localFile" />
      </template>
      <template v-else>
        <img
            :src="`${modelValue.qqAvatar}`"
            v-if="modelValue && modelValue.qqAvatar"
            alt="User QQ Avatar"
        />
        <img :src="`/api/getAvatar/${modelValue.userId}`" v-else alt="Default Avatar" />
      </template>
    </div>
    <div class="select-btn">
      <el-upload
          name="file"
          :show-file-list="false"
          accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.gif,.GIF,.bmp,.BMP"
          :multiple="false"
          :http-request="uploadImage"
      >
        <el-button type="primary" class="upload-button">选择</el-button>
      </el-upload>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import { useRouter, useRoute } from "vue-router";

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
});

const localFile = ref(null);
const emit = defineEmits();

const uploadImage = async (file) => {
  file = file.file;
  let img = new FileReader();
  img.readAsDataURL(file);
  img.onload = ({ target }) => {
    localFile.value = target.result;
  };
  emit("update:modelValue", file);
};
</script>

<style lang="scss">
.avatar-upload {
  display: flex;
  flex-direction: column; /* 垂直排列以适应移动端 */
  align-items: center; /* 居中对齐 */

  .avatar-show {
    background: rgb(245, 245, 245);
    width: 100%; /* 使宽度适应屏幕 */
    max-width: 150px; /* 最大宽度 */
    height: 150px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    margin-bottom: 10px; /* 添加底部间距 */

    .iconfont {
      font-size: 50px;
      color: #ddd;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover; /* 保持比例填充 */
    }

    .op {
      position: absolute;
      color: #0e8aef;
      top: 80px;
    }
  }

  .select-btn {
    .upload-button {
      width: 100%; /* 使按钮宽度适应 */
      padding: 12px; /* 增加按钮内边距 */
      font-size: 16px; /* 增大字体 */
    }
  }
}
</style>
