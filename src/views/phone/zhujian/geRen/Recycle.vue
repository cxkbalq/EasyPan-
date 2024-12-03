<template>
  <el-dialog
      v-model="dialogVisible"
      title="回收站"
      width="90%"
      :fullscreen="isMobile"
      :before-close="handleClose"
  >
    <div class="recycle-bin">
      <div class="top-actions">
        <el-button
            type="success"
            :disabled="selectFileIdList.length === 0"
            @click="revertBatch"
            icon="Refresh"
        >
          还原
        </el-button>
        <el-button
            type="danger"
            :disabled="selectFileIdList.length === 0"
            @click="delBatch"
            icon="Delete"
        >
          删除
        </el-button>
      </div>

      <el-table
          :data="tableData.list"
          style="width: 100%"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="文件" prop="fileName">
          <template #default="{ row }">
            <div class="file-item">
              <el-icon :size="24" class="file-icon">
                <component :is="getFileIcon(row)" />
              </el-icon>
              <span class="file-name" :title="row.fileName">{{ row.fileName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button @click="revert(row)" type="text" size="small" icon="Refresh">
              还原
            </el-button>
            <el-button @click="delFile(row)" type="text" size="small" icon="Delete">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
            v-model:current-page="tableData.pageNo"
            v-model:page-size="tableData.pageSize"
            :page-sizes="[10, 20, 30, 40]"
            :total="tableData.totalCount"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, onMounted } from "vue";
import { ElMessage, ElMessageBox } from 'element-plus';
import { Delete, Refresh, Document, Folder } from '@element-plus/icons-vue';

const { proxy } = getCurrentInstance();

const api = {
  loadDataList: "/recycle/loadRecycleList",
  delFile: "/recycle/delFile",
  recoverFile: "/recycle/recoverFile",
};

const dialogVisible = ref(false);
const isMobile = ref(window.innerWidth <= 768);

const tableData = ref({
  list: [],
  pageNo: 1,
  pageSize: 10,
  totalCount: 0
});

const selectFileIdList = ref([]);

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo,
    pageSize: tableData.value.pageSize,
  };
  let result = await proxy.Request({
    url: api.loadDataList,
    params,
  });
  if (!result) {
    return;
  }
  tableData.value = result.data;
};

const handleSelectionChange = (rows) => {
  selectFileIdList.value = rows.map(row => row.fileId);
};

const getFileIcon = (row) => {
  if (row.folderType === 1 || row.fileType === 0) {
    return Folder;
  }
  return Document;
};

const revert = (row) => {
  ElMessageBox.confirm(`你确定要还原【${row.fileName}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    let result = await proxy.Request({
      url: api.recoverFile,
      params: {
        fileIds: row.fileId,
      },
    });
    if (!result) {
      return;
    }
    ElMessage.success('文件已还原');
    loadDataList();
  }).catch(() => {});
};

const revertBatch = () => {
  if (selectFileIdList.value.length === 0) {
    return;
  }
  ElMessageBox.confirm('你确定要还原这些文件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    let result = await proxy.Request({
      url: api.recoverFile,
      params: {
        fileIds: selectFileIdList.value.join(","),
      },
    });
    if (!result) {
      return;
    }
    ElMessage.success('文件已还原');
    loadDataList();
  }).catch(() => {});
};

const delFile = (row) => {
  ElMessageBox.confirm(`你确定要删除【${row.fileName}】？此操作不可逆`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {
        fileIds: row.fileId,
      },
    });
    if (!result) {
      return;
    }
    ElMessage.success('文件已删除');
    loadDataList();
  }).catch(() => {});
};

const delBatch = () => {
  if (selectFileIdList.value.length === 0) {
    return;
  }
  ElMessageBox.confirm('你确定要删除选中的文件?删除将无法恢复', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    let result = await proxy.Request({
      url: api.delFile,
      params: {
        fileIds: selectFileIdList.value.join(","),
      },
    });
    if (!result) {
      return;
    }
    ElMessage.success('文件已删除');
    loadDataList();
  }).catch(() => {});
};

const handleSizeChange = (val) => {
  tableData.value.pageSize = val;
  loadDataList();
};

const handleCurrentChange = (val) => {
  tableData.value.pageNo = val;
  loadDataList();
};

const handleClose = (done) => {
  ElMessageBox.confirm('确认关闭？')
      .then(() => {
        done();
      })
      .catch(() => {});
};

const show = () => {
  dialogVisible.value = true;
  loadDataList();
};

defineExpose({ show });

onMounted(() => {
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768;
  });
});
</script>

<style lang="scss" scoped>
.recycle-bin {
  .top-actions {
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;

    .el-button {
      flex: 1;
      margin: 0 4px;
    }
  }

  .file-item {
    display: flex;
    align-items: center;

    .file-icon {
      margin-right: 8px;
    }

    .file-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .recycle-bin {
    .el-table {
      font-size: 14px;
    }

    .el-button {
      padding: 8px 12px;
    }

    .pagination {
      .el-pagination {
        font-size: 12px;
      }
    }
  }
}
</style>