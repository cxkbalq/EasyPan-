<template>
  <div class="share">
    <div class="header">
      <div class="header-content">
        <div class="logo" @click="jump">
          <span class="iconfont icon-pan"></span>
          <span class="name">Small云盘</span>
        </div>
      </div>
    </div>
    <div class="share-body">
      <template v-if="Object.keys(shareInfo).length == 0">
        <div
            v-loading="Object.keys(shareInfo).length == 0"
            class="loading"
        ></div>
      </template>
      <template v-else>
        <div class="share-panel">
          <div class="share-user-info">
            <div class="avatar">
              <Avatar
                  :userId="shareInfo.userId"
                  :avatar="shareInfo.avatar"
                  :width="50"
              ></Avatar>
            </div>
            <div class="share-info">
              <div class="user-info">
                <span class="nick-name">{{ shareInfo.nickName }}</span>
                <span class="share-time">分享于 {{ shareInfo.shareTime }}</span>
              </div>
              <div class="file-name">分享文件：{{ shareInfo.fileName }}</div>
            </div>
          </div>
          <div class="share-op-btn">
            <el-button
                type="primary"
                v-if="shareInfo.currentUser"
                @click="cancelShare"
            >
              <span class="iconfont icon-cancel"></span>取消分享
            </el-button>
            <el-button
                v-else
                type="primary"
                :disabled="selectFileIdList.length == 0"
                @click="save2MyPan"
            >
              <span class="iconfont icon-import"></span>保存到我的网盘
            </el-button>
          </div>
        </div>
        <Navigation
            ref="navigationRef"
            @navChange="navChange"
            :shareId="shareId"
        ></Navigation>
        <div class="file-list">
          <div
              v-for="(file, index) in tableData.list"
              :key="file.fileId"
              class="file-item"
              @click="preview(file)"
          >
            <div class="file-icon">
              <template v-if="(file.fileType == 3 || file.fileType == 1) && file.status !== 0">
                <icon :cover="file.fileCover" :user-id="file.userId" :type="true"></icon>
              </template>
              <template v-else>
                <icon v-if="file.folderType == 0" :fileType="file.fileType"></icon>
                <icon v-if="file.folderType == 1" :fileType="0"></icon>
              </template>
            </div>
            <div class="file-info">
              <span class="file-name" :title="file.fileName">{{ file.fileName }}</span>
              <span class="file-size" v-if="file.fileSize">{{ formatFileSize(file.fileSize) }}</span>
            </div>
            <div class="file-actions">
              <el-button v-if="file.folderType == 0" size="small" @click.stop="download(file.fileId)">下载</el-button>
              <el-button v-if="!shareInfo.currentUser" size="small" @click.stop="save2MyPanSingle(file)">保存</el-button>
            </div>
          </div>
        </div>
      </template>
      <el-dialog v-model="showFileMenu" title="文件操作" width="90%">
        <el-menu @select="handleFileAction">
          <el-menu-item index="share" v-if="selectedFile.status === 2">
            <el-icon><Share /></el-icon>
            <span>分享</span>
          </el-menu-item>
          <el-menu-item index="download" v-if="selectedFile.folderType === 0">
            <el-icon><Download /></el-icon>
            <span>下载</span>
          </el-menu-item>
          <el-menu-item index="rename">
            <el-icon><Edit /></el-icon>
            <span>重命名</span>
          </el-menu-item>
          <el-menu-item index="move">
            <el-icon><Right /></el-icon>
            <span>移动</span>
          </el-menu-item>
          <el-menu-item index="delete">
            <el-icon><Delete /></el-icon>
            <span>删除</span>
          </el-menu-item>
        </el-menu>
      </el-dialog>
      <FolderSelect
          ref="folderSelectRef"
          @folderSelect="save2MyPanDone"
      ></FolderSelect>
      <Preview ref="previewRef"></Preview>
      <FileShare ref="shareRef"></FileShare>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Share, Download, Edit, Right, Delete } from '@element-plus/icons-vue'
import Navigation from '/src/components/Navigation.vue'
import Preview from '/src/components/previewPhone/Preview.vue'
import FolderSelect from '/src/components/previewPhone/FolderSelect.vue'
// import FileShare from '/src/views/phone/zhujian/fenXiang/main.vue'
import icon from "@/components/Icon.vue"

const { proxy } = getCurrentInstance()
const router = useRouter()
const route = useRoute()

const api = {
  getShareLoginInfo: "/showShare/getShareLoginInfo",
  loadFileList: "/showShare/loadFileList",
  createDownloadUrl: "/showShare/createDownloadUrl",
  download: "/api/showShare/download",
  cancelShare: "/share/cancelShare",
  saveShare: "/showShare/saveShare",
}

const shareId = route.params.shareId
const shareInfo = ref({})
const tableData = ref({ list: [] })
const selectFileIdList = ref([])
const currentFolder = ref({ fileId: 0 })
const showFileMenu = ref(false)
const selectedFile = ref({})
const navigationRef = ref()
const previewRef = ref()
const shareRef = ref()

const getShareInfo = async () => {
  let result = await proxy.Request({
    url: api.getShareLoginInfo,
    showLoading: false,
    params: {
      shareId,
    },
  });
  if (!result) {
    return;
  }
  if (result.data == null) {
    router.push("/shareCheck/" + shareId);
    return;
  }
  shareInfo.value = result.data;
};

const loadDataList = async () => {
  let params = {
    pageNo: tableData.value.pageNo || "1",
    pageSize: tableData.value.pageSize || "15",
    shareId: shareId,
    filePid: currentFolder.value.fileId,
  };
  let result = await proxy.Request({
    url: api.loadFileList,
    params,
  });
  if (!result) {
    return;
  }
  if(result.info==="验证码错误"){
    router.push("/shareCheck/" + shareId);
    return;
  }
  tableData.value = result.data;
};
//下载文件
const download = async (fileId) => {
  let result = await proxy.Request({
    url: api.createDownloadUrl + "/" + shareId + "/" + fileId,
  });
  if (!result) {
    return;
  }
  window.location.href = api.download + "/" + result.data;
};
const navChange = (data) => {
  const { curFolder } = data
  currentFolder.value = curFolder
  loadDataList()
}
//预览
const preview = (data) => {
  if (data.folderType == 1) {
    navigationRef.value.openFolder(data);
    return;
  }
  data.shareId = shareId;
  previewRef.value.showPreview(data, 2);
};


//取消分享
const cancelShare = () => {
  proxy.Confirm(`你确定要取消分享吗？`, async () => {
    let result = await proxy.Request({
      url: api.cancelShare,
      params: {
        shareIds: shareId,
      },
    });
    if (!result) {
      return;
    }
    proxy.Message.success("取消分享成功");
    router.push("/");
  });
};


//保存到我的网盘
const folderSelectRef = ref();
const save2MyPanFileIdArray = [];
const save2MyPan = () => {
  if (selectFileIdList.value.length == 0) {
    return;
  }
  if (!proxy.VueCookies.get("userInfo")) {
    router.push("/phone/Login?redirectUrl=" + route.path);
    return;
  }
  save2MyPanFileIdArray.values = selectFileIdList.value;
  folderSelectRef.value.showFolderDialog();
};
const save2MyPanSingle = (row) => {
  if (!proxy.VueCookies.get("userInfo")) {
    router.push("/phone/Login?redirectUrl=" + route.path);
    return;
  }
  save2MyPanFileIdArray.values = [row.fileId];
  folderSelectRef.value.showFolderDialog();
};
//执行保存操作
const save2MyPanDone = async (folderId) => {
  let result = await proxy.Request({
    url: api.saveShare,
    params: {
      shareId: shareId,
      shareFileIds: save2MyPanFileIdArray.values.join(","),
      myFolderId: folderId,
    },
  });
  if (!result) {
    return;
  }
  loadDataList();
  proxy.Message.success("保存成功");
  folderSelectRef.value.close();
};

const handleFileAction = (key) => {
  showFileMenu.value = false
  switch (key) {
    case 'share':
      shareRef.value.show(selectedFile.value)
      break
    case 'download':
      download(selectedFile.value.fileId)
      break
    case 'rename':
      // Implement rename logic
      break
    case 'move':
      // Implement move logic
      break
    case 'delete':
      // Implement delete logic
      break
  }
}

const formatFileSize = (size) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB'
  return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

const jump = () => {
  router.push('/')
}

getShareInfo()
loadDataList()
</script>

<style lang="scss" scoped>
.share {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #409eff;
  height: 50px;
  z-index: 1000;

  .header-content {
    padding: 0 1rem;
    color: #fff;
    line-height: 50px;

    .logo {
      display: flex;
      align-items: center;
      cursor: pointer;

      .icon-pan {
        font-size: 24px;
      }

      .name {
        font-weight: bold;
        margin-left: 5px;
        font-size: 18px;
      }
    }
  }
}

.share-body {
  padding-top: 60px;
  padding-bottom: 20px;

  .loading {
    height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .share-panel {
    background-color: #fff;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .share-user-info {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;

      .avatar {
        margin-right: 1rem;
      }

      .share-info {
        .user-info {
          display: flex;
          flex-direction: column;

          .nick-name {
            font-size: 16px;
            font-weight: bold;
          }

          .share-time {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }

        .file-name {
          margin-top: 8px;
          font-size: 14px;
          color: #606266;
        }
      }
    }

    .share-op-btn {
      .el-button {
        width: 100%;
      }
    }
  }

  .file-list {
    background-color: #fff;
    border-radius: 8px;
    padding: 1rem;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .file-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .file-icon {
        margin-right: 1rem;
      }

      .file-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .file-name {
          font-size: 14px;
          color: #303133;
          margin-bottom: 4px;
        }

        .file-size {
          font-size: 12px;
          color: #909399;
        }
      }

      .file-actions {
        .el-button {
          padding: 5px 10px;
          font-size: 12px;
        }
      }
    }
  }
}

.el-dialog {
  .el-menu-item {
    height: 50px;
    line-height: 50px;
  }
}
</style>