<template>
  <div class="doc-preview-container">
    <div ref="docRef" class="doc-content"></div>
  </div>
</template>

<script setup>
import * as docx from "docx-preview";
import { ref, getCurrentInstance, onMounted } from "vue";
const { proxy } = getCurrentInstance();

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
});

const docRef = ref();

const initDoc = async () => {
  try {
    let result = await proxy.Request({
      url: props.url,
      responseType: "blob",
    });
    if (!result) {
      console.error("Failed to fetch document");
      return;
    }
    await docx.renderAsync(result, docRef.value, null, {
      ignoreWidth: true,
      ignoreHeight: true,
      ignoreFonts: true,
      breakPages: true,
      ignoreLastRenderedPageBreak: true,
      experimentalEnableVerticalAlign: true,
    });
  } catch (error) {
    console.error("Error rendering document:", error);
  }
};

onMounted(() => {
  initDoc();
});
</script>

<style lang="scss" scoped>
.doc-preview-container {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.doc-content {
  margin: 0 auto;
  padding: 0 10px;

  :deep(.docx-wrapper) {
    background: #fff;
    padding: 10px 0;

    .docx {
      max-width: 100%;
      margin-bottom: 0;

      p, h1, h2, h3, h4, h5, h6, ul, ol {
        max-width: 100%;
        word-wrap: break-word;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      table {
        max-width: 100%;
        display: block;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
    }
  }
}

@media (max-width: 768px) {
  .doc-content {
    :deep(.docx-wrapper) {
      .docx {
        font-size: 14px;

        h1 { font-size: 24px; }
        h2 { font-size: 20px; }
        h3 { font-size: 18px; }
      }
    }
  }
}
</style>