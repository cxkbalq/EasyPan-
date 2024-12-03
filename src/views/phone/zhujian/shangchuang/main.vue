<template>
  <div class="uploader-panel">
    <div class="uploader-header">
      <h2 class="uploader-title">上传任务</h2>
      <span class="uploader-subtitle">（仅展示本次上传任务）</span>
    </div>
    <div class="file-list" v-if="fileList.length > 0">
      <div v-for="(item, index) in fileList" :key="item.uid" class="file-item">
        <div class="file-info">
          <div class="file-name">{{ item.fileName }}</div>
          <div class="file-status">
            <span :class="['status-icon', `icon-${STATUS[item.status].icon}`]"></span>
            <span class="status-text" :style="{ color: STATUS[item.status].color }">
              {{ item.status === 'fail' ? item.errorMsg : STATUS[item.status].desc }}
            </span>
          </div>
        </div>
        <div class="file-progress" v-if="showProgressBar(item.status)">
          <el-progress
              :percentage="item.uploadProgress"
              :status="getProgressStatus(item.status)"
              :show-text="true"
          />
        </div>
        <div class="file-actions">
          <el-button
              v-if="item.status === STATUS.uploading.value"
              :icon="item.pause ? 'el-icon-video-play' : 'el-icon-video-pause'"
              @click="item.pause ? startUpload(item.uid) : pauseUpload(item.uid)"
              size="small"
          >
            {{ item.pause ? '继续' : '暂停' }}
          </el-button>
          <el-button
              v-if="canCancel(item.status)"
              icon="el-icon-close"
              @click="cancelUpload(item.uid, index)"
              size="small"
              type="danger"
          >
            取消
          </el-button>
          <el-button
              v-if="canDelete(item.status)"
              icon="el-icon-delete"
              @click="delUpload(item.uid, index)"
              size="small"
              type="danger"
          >
            {{ item.status === STATUS.upload_finish.value || item.status === STATUS.upload_seconds.value ? '清除' : '删除' }}
          </el-button>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <i class="el-icon-upload"></i>
      <p>暂无上传任务</p>
    </div>
    <van-floating-bubble
        axis="xy"
        icon="plus"
        magnetic="x"
        @click="showActionMenu = true"
        gap="40"
        v-if="xianshi"
    />
    <el-dialog
        v-model="showActionMenu"
        title="选择操作"
        width="90%"
        custom-class="action-menu-dialog"
    >
      <el-menu @select="handleActionSelect">
        <el-upload
            :auto-upload="false"
            :on-change="handleFileUpload"
            :show-file-list="false"
            :multiple="true"
            :accept="fileAccept"
        >
          <el-menu-item index="upload">
            <el-icon><Upload /></el-icon>
            <span>上传文件</span>
          </el-menu-item>
        </el-upload>
        <el-menu-item index="shuaxin">
          <el-icon><FolderAdd /></el-icon>
          <span>刷新</span>
        </el-menu-item>
      </el-menu>
    </el-dialog>
  </div>
</template>

<script setup>
import {ref, reactive, onMounted, watch, getCurrentInstance} from 'vue';
import { ElMessage } from 'element-plus';
import SparkMD5 from 'spark-md5';
import {FolderAdd, Upload} from "@element-plus/icons-vue";

const props = defineProps({
  kkk:{
    type:Boolean,
  }
});

const STATUS = reactive({
  emptyfile: { value: 'emptyfile', desc: '文件为空', color: '#F75000', icon: 'error' },
  fail: { value: 'fail', desc: '上传失败', color: '#F75000', icon: 'error' },
  init: { value: 'init', desc: '解析中', color: '#E6A23C', icon: 'loading' },
  uploading: { value: 'uploading', desc: '上传中', color: '#409EFF', icon: 'upload' },
  upload_finish: { value: 'upload_finish', desc: '上传完成', color: '#67C23A', icon: 'success' },
  upload_seconds: { value: 'upload_seconds', desc: '秒传', color: '#67C23A', icon: 'success' },
});

const xianshi = ref(true);
const chunkSize = 1024 * 1024 * 5;
const fileList = ref([]);
const fileInput = ref(null);
const showActionMenu = ref(false);
const fileAccept = ref('*/*');

const loadFileListFromStorage = () => {
  const storedFileList = localStorage.getItem('uploadFileList');
  if (storedFileList) {
    fileList.value = JSON.parse(storedFileList);
    fileList.value.forEach(item => {
      if (item.status === STATUS.uploading.value) {
        item.pause = true;
      }
    });
  }
};

const change = () => {
  xianshi.value = false;
};

const saveFileListToStorage = () => {
  const serializedFileList = fileList.value.map(item => ({
    ...item,
    file: null
  }));
  localStorage.setItem('uploadFileList', JSON.stringify(serializedFileList));
};

onMounted(() => {
  loadFileListFromStorage();
  window.addEventListener('beforeunload', saveFileListToStorage);
  window.addEventListener('beforeunload', change);
});

watch(fileList, () => {
  saveFileListToStorage();
}, { deep: true });

const addFile = async (file, filePid) => {
  const fileItem = {
    file,
    uid: Date.now().toString(),
    md5Progress: 0,
    md5: null,
    fileName: file.name,
    status: STATUS.init.value,
    uploadSize: 0,
    totalSize: file.size,
    uploadProgress: 0,
    pause: false,
    chunkIndex: 0,
    filePid,
    errorMsg: null,
  };

  fileList.value.unshift(fileItem);
  saveFileListToStorage();

  if (fileItem.totalSize === 0) {
    fileItem.status = STATUS.emptyfile.value;
    return;
  }

  const md5FileUid = await computeMD5(fileItem);
  if (md5FileUid) {
    uploadFile(md5FileUid);
  }
};

const startUpload = (uid) => {
  const currentFile = getFileByUid(uid);
  if (currentFile) {
    currentFile.pause = false;
    uploadFile(uid, currentFile.chunkIndex);
  }
};

const handleActionSelect = (key) => {
  showActionMenu.value = false;
  switch (key) {
    case 'upload':
      showUploadDialog();
      break;
    case 'shuaxin':
      loadFileListFromStorage();
      break;
  }
};

const pauseUpload = (uid) => {
  const currentFile = getFileByUid(uid);
  if (currentFile) {
    currentFile.pause = true;
    saveFileListToStorage();
  }
};

const cancelUpload = (uid, index) => {
  const currentFile = getFileByUid(uid);
  if (currentFile && (currentFile.status === STATUS.init.value || currentFile.status === STATUS.uploading.value)) {
    fileList.value.splice(index, 1);
    saveFileListToStorage();
  }
};

const delUpload = (uid, index) => {
  fileList.value.splice(index, 1);
  saveFileListToStorage();
};

const uploadFile = async (uid, chunkIndex = 0) => {
  let currentFile = getFileByUid(uid);
  if (!currentFile) return;

  currentFile.status = STATUS.uploading.value;
  const file = currentFile.file;
  const fileSize = currentFile.totalSize;
  const chunks = Math.ceil(fileSize / chunkSize);

  for (let i = chunkIndex; i < chunks; i++) {
    if(currentFile.uploadProgress === 100){
      break;
    }
    currentFile = getFileByUid(uid);
    if (!currentFile || currentFile.pause) {
      console.log('Upload paused or file removed');
      return; // Exit the function if paused or file removed
    }

    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, fileSize);
    const chunkFile = file.slice(start, end);

    try {
      const formData = new FormData();
      formData.append('file', chunkFile);
      formData.append('fileName', file.name);
      formData.append('fileMd5', currentFile.md5);
      formData.append('chunkIndex', i.toString());
      formData.append('chunks', chunks.toString());
      formData.append('fileId', currentFile.fileId || '');
      formData.append('filePid', currentFile.filePid || 0);

      const response = await fetch('/api/file/uploadFile', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();

      currentFile.fileId = result.data.fileId;
      currentFile.chunkIndex = i;
      currentFile.uploadSize = (i + 1) * chunkSize;
      currentFile.uploadProgress = Math.floor((currentFile.uploadSize / fileSize) * 100);

      if (result.data.status === STATUS.upload_seconds.value ||
          result.data.status === STATUS.upload_finish.value) {
        currentFile.status = STATUS[result.data.status].value;
        currentFile.uploadProgress = 100;
      }
    } catch (error) {
      currentFile.status = STATUS.fail.value;
      currentFile.errorMsg = error.message;
      break;
    }
    saveFileListToStorage();
  }
};

const computeMD5 = (fileItem) => {
  return new Promise((resolve) => {
    const file = fileItem.file;
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const spark = new SparkMD5.ArrayBuffer();
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      spark.append(e.target.result);
      currentChunk++;

      if (currentChunk < chunks) {
        fileItem.md5Progress = Math.floor((currentChunk / chunks) * 100);
        loadNext();
      } else {
        const md5 = spark.end();
        fileItem.md5Progress = 100;
        fileItem.md5 = md5;
        resolve(fileItem.uid);
      }
    };

    fileReader.onerror = () => {
      fileItem.md5Progress = -1;
      fileItem.status = STATUS.fail.value;
      resolve(null);
    };

    const loadNext = () => {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      fileReader.readAsArrayBuffer(file.slice(start, end));
    };

    loadNext();
  });
};

const getFileByUid = (uid) => fileList.value.find(item => item.uid === uid);

const canCancel = (status) => {
  return status === STATUS.init.value || status === STATUS.uploading.value;
};

const canDelete = (status) => {
  return status !== STATUS.init.value && status !== STATUS.uploading.value;
};

const triggerFileUpload = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const files = event.target.files;
  if (files) {
    Array.from(files).forEach(file => addFile(file));
  }
  event.target.value = null;
};

const showProgressBar = (status) => {
  return status === STATUS.uploading.value || status === STATUS.upload_finish.value || status === STATUS.upload_seconds.value;
};

const getProgressStatus = (status) => {
  switch (status) {
    case STATUS.upload_finish.value:
    case STATUS.upload_seconds.value:
      return 'success';
    case STATUS.fail.value:
      return 'exception';
    default:
      return '';
  }
};

const handleFileUpload = (file) => {
  addFile(file.raw);
  return false; // 阻止 el-upload 默认上传行为
};

defineExpose({ addFile, change });
</script>

<style lang="scss" scoped>
.uploader-panel {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f5f7fa;
  padding: 16px;
  display: flex;
  flex-direction: column;

  .uploader-header {
    margin-bottom: 16px;

    .uploader-title {
      font-size: 20px;
      font-weight: bold;
      margin: 0;
    }

    .uploader-subtitle {
      font-size: 14px;
      color: #909399;
    }
  }

  .file-list {
    flex-grow: 1;
    overflow-y: auto;
    margin-bottom: 16px;

    .file-item {
      background-color: #fff;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      .file-info {
        margin-bottom: 8px;

        .file-name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 4px;
          word-break: break-all;
        }

        .file-status {
          display: flex;
          align-items: center;
          font-size: 14px;

          .status-icon {
            margin-right: 4px;
          }
        }
      }

      .file-progress {
        margin-bottom: 8px;
      }

      .file-actions {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .empty-state {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #909399;

    i {
      font-size: 48px;
      margin-bottom: 16px;
    }

    p  {
      font-size: 16px;
    }
  }

  .upload-button-container {
    position: fixed;
    right: 16px;
    bottom: 16px;
    z-index: 1000;

    .el-button {
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      width: 60px;
      height: 60px;
      border-radius: 50%;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 24px;
      }

      span {
        display: none;
      }
    }
  }
}

// Icon styles
.icon-error::before { content: '❌'; }
.icon-loading::before { content: '⏳'; }
.icon-upload::before { content: '⬆️'; }
.icon-success::before { content: '✅'; }

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.icon-loading::before {
  display: inline-block;
  animation: spin 1s linear infinite;
}
</style>