<template>
  <div v-html="excelContent" class="table-info"></div>
</template>

<script setup>
import * as XLSX from "xlsx";
import { ref, reactive, getCurrentInstance, onMounted } from "vue";
const { proxy } = getCurrentInstance();

const props = defineProps({
  url: {
    type: String,
  },
});

const excelContent = ref();
const initExcel = async () => {
  let result = await proxy.Request({
    url: props.url,
    responseType: "arraybuffer",
  });
  if (!result) {
    return;
  }
  let workbook = XLSX.read(new Uint8Array(result), { type: "array" });
  var worksheet = workbook.Sheets[workbook.SheetNames[0]];
  excelContent.value = XLSX.utils.sheet_to_html(worksheet);
};
onMounted(() => {
  initExcel();
});
</script>

<style lang="scss" scoped>
.table-info {
  width: 100%;
  padding: 10px;
  overflow-x: auto;

  :deep table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;

    td {
      border: 1px solid #ddd;
      border-collapse: collapse;
      padding: 8px;
      height: auto;
      min-width: 80px;
      white-space: nowrap;
    }

    th {
      background-color: #f2f2f2;
      font-weight: bold;
      text-align: left;
      padding: 10px 8px;
      position: sticky;
      top: 0;
      z-index: 1;
    }
  }
}
</style>