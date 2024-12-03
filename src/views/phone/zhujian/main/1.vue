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
        <div class="file-progress">
          <el-progress
              :percentage="item.uploadProgress"
              :status="getProgressStatus(item.status)"
              :show-text="false"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import SparkMD5 from 'spark-md5';

const STATUS = reactive({
  emptyfile: { value: 'emptyfile', desc: '文件为空', color: '#F75000', icon: 'error' },
  fail: { value: 'fail', desc: '上传失败', color: '#F75000', icon: 'error' },
  init: { value: 'init', desc: '解析中', color: '#E6A23C', icon: 'loading' },
  uploading: { value: 'uploading', desc: '上传中', color: '#409EFF', icon: 'upload' },
  upload_finish: { value: 'upload_finish', desc: '上传完成', color: '#67C23A', icon: 'success' },
  upload_seconds: { value: 'upload_seconds', desc: '秒传', color: '#67C23A', icon: 'success' },
});

const chunkSize = 1024 * 1024 * 5;
const fileList = ref([]);

// 从本地存储加载文件列表
const loadFileListFromStorage = () => {
  const storedFileList = localStorage.getItem('uploadFileList');
  if (storedFileList) {
    fileList.value = JSON.parse(storedFileList);
  }
};

// 保存文件列表到本地存储
const saveFileListToStorage = () => {
  localStorage.setItem('uploadFileList', JSON.stringify(fileList.value));
};

// 组件挂载时加载文件列表
onMounted(() => {
  loadFileListFromStorage();
});

// 监听文件列表变化，保存到本地存储
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

const pauseUpload = (uid) => {
  const currentFile = getFileByUid(uid);
  if (currentFile) {
    currentFile.pause = true;
  }
};

const delUpload = (uid, index) => {
  fileList.value.splice(index, 1);
  saveFileListToStorage();
};

const uploadFile = async (uid, chunkIndex = 0) => {
  let currentFile = getFileByUid(uid);
  if (!currentFile) return;

  const file = currentFile.file;
  const fileSize = currentFile.totalSize;
  const chunks = Math.ceil(fileSize / chunkSize);

  for (let i = chunkIndex; i < chunks; i++) {
    currentFile = getFileByUid(uid);
    if (!currentFile || currentFile.pause) break;

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
      currentFile.status = STATUS[result.data.status].value;
      currentFile.chunkIndex = i;
      currentFile.uploadSize = (i + 1) * chunkSize;
      currentFile.uploadProgress = Math.floor((currentFile.uploadSize / fileSize) * 100);
      saveFileListToStorage();

      if (result.data.status === STATUS.upload_seconds.value ||
          result.data.status === STATUS.upload_finish.value) {
        currentFile.uploadProgress = 100;
        break;
      }
    } catch (error) {
      currentFile.status = STATUS.fail.value;
      currentFile.errorMsg = error.message;
      break;
    }
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
        fileItem.status = STATUS.uploading.value;
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

const canDelete = (status) => {
  return status !== STATUS.init.value;
};

// Expose addFile method
defineExpose({ addFile });
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

    p {
      font-size: 16px;
    }
  }
}

// Icon styles
.icon-error::before { content: '❌'; }
.icon-loading::before { content: '⏳'; }
.icon-upload::before { content: '⬆️'; }
.icon-success::before { content: '✅'; }
</style>