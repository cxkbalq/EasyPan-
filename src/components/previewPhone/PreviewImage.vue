<template>
  <div class="mobile-image-viewer">
    <el-image-viewer
        :initial-index="previewImgIndex"
        hide-on-click-modal
        :url-list="imageList"
        @close="closeImgViewer"
        v-if="previewImgIndex != null"
    >
    </el-image-viewer>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { ElImageViewer } from 'element-plus';

const props = defineProps({
  imageList: {
    type: Array,
    required: true,
  },
});

const previewImgIndex = ref(null);

const show = (index) => {
  stopScroll();
  previewImgIndex.value = index;
};

defineExpose({ show });

const closeImgViewer = () => {
  startScroll();
  previewImgIndex.value = null;
};

const stopScroll = () => {
  document.body.style.overflow = "hidden";
};

const startScroll = () => {
  document.body.style.overflow = "auto";
};
</script>

<style lang="scss" scoped>
.mobile-image-viewer {
  :deep(.el-image-viewer__mask) {
    opacity: 0.9;
  }

  :deep(.el-image-viewer__btn) {
    width: 36px;
    height: 36px;
    font-size: 20px;
  }

  :deep(.el-image-viewer__actions) {
    opacity: 0.9;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
  }

  :deep(.el-image-viewer__canvas) {
    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  }

  :deep(.el-image-viewer__close) {
    top: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    font-size: 24px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
  }
}
</style>