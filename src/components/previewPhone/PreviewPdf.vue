<template>
  <div class="mobile-pdf-viewer">
    <vue-pdf-embed
        ref="pdfRef"
        :source="state.url"
        class="vue-pdf-embed"
        :page="state.pageNum"
        :style="scaleFun"
    />
    <div class="pdf-controls">
      <el-button @click="prevPage" :disabled="state.pageNum <= 1">上一页</el-button>
      <span>{{ state.pageNum }} / {{ state.numPages }}</span>
      <el-button @click="nextPage" :disabled="state.pageNum >= state.numPages">下一页</el-button>
    </div>
  </div>
</template>

<script setup>
import VuePdfEmbed from "vue-pdf-embed";
import { createLoadingTask } from "vue3-pdfjs";
import { ElLoading, ElButton } from "element-plus";
import { ref, reactive, getCurrentInstance, computed } from "vue";

const { proxy } = getCurrentInstance();

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
});

const scaleFun = computed(() => {
  return `transform: scale(${state.scale})`;
});

const state = reactive({
  url: "",
  pageNum: 1,
  numPages: 0,
  scale: 1,
});

const init = () => {
  const url = "/api" + props.url;
  state.url = url;
  const loading = ElLoading.service({
    lock: true,
    text: "加载中......",
    background: "rgba(0, 0, 0, 0.7)",
  });
  const loadingTask = createLoadingTask(state.url);
  loadingTask.promise.then((pdf) => {
    loading.close();
    state.numPages = pdf.numPages;
  });
};

const prevPage = () => {
  if (state.pageNum > 1) {
    state.pageNum--;
  }
};

const nextPage = () => {
  if (state.pageNum < state.numPages) {
    state.pageNum++;
  }
};

init();
</script>

<style lang="scss" scoped>
.mobile-pdf-viewer {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;

  .vue-pdf-embed {
    width: 100%;
    max-width: 100vw;
    height: calc(100vh - 60px);
    overflow-y: auto;
  }

  .pdf-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 10px;
    background-color: #f5f5f5;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    span {
      font-size: 14px;
    }
  }
}
</style>