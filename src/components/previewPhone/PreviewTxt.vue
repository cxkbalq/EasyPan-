<template>
  <div class="mobile-text-viewer">
    <div class="top-op">
      <el-select
          placeholder="选择编码"
          v-model="encode"
          @change="changeEncode"
          size="small"
      >
        <el-option value="utf8" label="utf8编码"></el-option>
        <el-option value="gbk" label="gbk编码"></el-option>
      </el-select>
      <el-button type="primary" @click="copy" size="small" style="margin-right: 90px">复制</el-button>
    </div>
    <div class="tips">乱码了？切换编码试试</div>
    <div class="text-content">
      <highlightjs autodetect :code="txtContent" />
    </div>
  </div>
</template>

<script setup>
import useClipboard from "vue-clipboard3";
import { ref, getCurrentInstance, onMounted } from "vue";
import { ElSelect, ElOption, ElButton } from 'element-plus';
import url from "url";

const { toClipboard } = useClipboard();
const { proxy } = getCurrentInstance();

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
});

const txtContent = ref("");
const blobResult = ref();
const encode = ref("utf8");

const readTxt = async () => {
  let result = await proxy.Request({
    url: props.url,
    responseType: "blob",
  });
  console.log(props.url)
  if (!result) {
    return;
  }
  blobResult.value = result;
  showTxt();
};

const changeEncode = () => {
  showTxt();
};

const showTxt = () => {
  const reader = new FileReader();
  reader.onload = () => {
    txtContent.value = reader.result;
  };
  reader.readAsText(blobResult.value, encode.value);
};

onMounted(() => {
  readTxt();
});

const copy = async () => {
  await toClipboard(txtContent.value);
  proxy.Message.success("复制成功");
};
</script>

<style lang="scss" scoped>
.mobile-text-viewer {
  width: 100%;
  padding: 10px;

  .top-op {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .tips {
    font-size: 12px;
    color: #828282;
    margin-bottom: 10px;
  }

  .text-content {
    width: 100%;
    overflow-x: auto;
    background-color: #f5f5f5;
    padding: 10px;
    border-radius: 4px;

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
}
</style>