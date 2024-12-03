<template>
  <div class="share-list">
    <div class="top-bar">
      <el-button
          type="primary"
          :disabled="selectIdList.length === 0"
          @click="cancelShareBatch"
          class="cancel-share-btn"
      >
        <span class="iconfont icon-cancel"></span>取消分享
      </el-button>
    </div>
    <div class="file-list">
      <div v-for="(row, index) in tableData.list" :key="row.fileId" class="file-item">
        <div class="file-info" @click="toggleSelect(row)">
          <div class="file-icon">
            <template v-if="(row.fileType == 3 || row.fileType == 1) && row.status !== 0">
              <icon :cover="row.fileCover"></icon>
            </template>
            <template v-else>
              <icon v-if="row.folderType == 0" :fileType="row.fileType"></icon>
              <icon v-if="row.folderType == 1" :fileType="0"></icon>
            </template>
          </div>
          <div class="file-details">
            <div class="file-name" :title="row.fileName">{{ row.fileName }}</div>
            <div class="file-meta">
              <span>分享时间: {{ row.shareTime }}</span>
              <span>失效时间: {{ row.validType == 3 ? "永久" : row.expireTime }}</span>
              <span>浏览次数: {{ row.browseCount }}</span>
            </div>
          </div>
          <div class="file-select">
            <el-checkbox v-model="row.selected" @change="updateSelection"></el-checkbox>
          </div>
        </div>
        <div class="file-actions">
          <el-button type="text" @click="copy(row)" class="action-btn">
            <span class="iconfont icon-link"></span>复制链接
          </el-button>
          <el-button type="text" @click="cancelShare(row)" class="action-btn">
            <span class="iconfont icon-cancel"></span>取消分享
          </el-button>
        </div>
      </div>
    </div>
    <div class="pagination">
<!--      <el-pagination-->
<!--          layout="prev, pager, next"-->
<!--          :total="tableData.totalCount"-->
<!--          :current-page.sync="tableData.pageNo"-->
<!--          :page-size="tableData.pageSize"-->
<!--          @current-change="handlePageChange"-->
<!--      ></el-pagination>-->
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, computed } from 'vue';
import useClipboard from 'vue-clipboard3';
import { useRouter, useRoute } from 'vue-router';

const { toClipboard } = useClipboard();
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const api = {
  loadDataList: '/share/loadShareList',
  cancelShare: '/share/cancelShare',
};

const shareUrl = ref(document.location.origin + '/share/');

const tableData = reactive({
  list: [],
  pageNo: 1,
  pageSize: 15,
  totalCount: 0,
});

const selectIdList = computed(() => {
  return tableData.list.filter(item => item.selected).map(item => item.shareId);
});

const loadDataList = async () => {
  let params = {
    pageNo: tableData.pageNo,
    pageSize: tableData.pageSize,
  };
  let result = await proxy.Request({
    url: api.loadDataList,
    params,
  });
  if (!result) return;
  tableData.list = result.data.list.map(item => ({ ...item, selected: false }));
  tableData.totalCount = result.data.totalCount;
};

const toggleSelect = (row) => {
  row.selected = !row.selected;
  updateSelection();
};

const updateSelection = () => {
  // This function is called when checkboxes are changed
  // You can perform any necessary actions here
};

const copy = async (data) => {
  await toClipboard(`链接:${shareUrl.value}${data.shareId} 提取码: ${data.code}`);
  proxy.Message.success('复制成功');
};

const cancelShareBatch = () => {
  if (selectIdList.value.length === 0) return;
  cancelShareDone(selectIdList.value);
};

const cancelShare = (row) => {
  cancelShareDone([row.shareId]);
};

const cancelShareDone = async (shareIds) => {
  proxy.Confirm(`你确定要取消分享吗？`, async () => {
    let result = await proxy.Request({
      url: api.cancelShare,
      params: {
        shareIds: shareIds.join(','),
      },
    });
    if (!result) return;
    proxy.Message.success('取消分享成功');
    loadDataList();
  });
};

const handlePageChange = (page) => {
  tableData.pageNo = page;
  loadDataList();
};

// 初始加载
loadDataList();
</script>

<style lang="scss" scoped>
.share-list {
  padding: 16px;
  background-color: #f5f7fa;
}

.top-bar {
  margin-bottom: 16px;
}

.cancel-share-btn {
  width: 100%;
}

.file-list {
  .file-item {
    background-color: #fff;
    border-radius: 8px;
    margin-bottom: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  }

  .file-info {
    display: flex;
    align-items: center;
    padding: 16px;
  }

  .file-icon {
    margin-right: 16px;
  }

  .file-details {
    flex-grow: 1;
  }

  .file-name {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
    word-break: break-all;
  }

  .file-meta {
    font-size: 12px;
    color: #909399;

    span {
      display: block;
      margin-bottom: 4px;
    }
  }

  .file-select {
    padding-left: 16px;
  }

  .file-actions {
    display: flex;
    justify-content: space-around;
    padding: 8px 16px;
    border-top: 1px solid #ebeef5;
  }

  .action-btn {
    font-size: 14px;
  }
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}
</style>