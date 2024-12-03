<template>
  <div class="mobile-file-manager">
    <van-floating-bubble
        axis="xy"
        icon="plus"
        magnetic="x"
        @click="showActionMenu = true"
        gap="40"
        v-if="gongNeng"
    />

    <el-dialog
        v-model="showActionMenu"
        title="选择操作"
        width="90%"
        custom-class="action-menu-dialog"
    >
      <el-menu @select="handleActionSelect">
        <el-menu-item index="newFolder">
          <el-icon><FolderAdd /></el-icon>
          <span>新建文件夹</span>
        </el-menu-item>
        <el-upload
            :http-request="addFile"
            :with-credentials="true"
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

    <div class="top-bar">
      <el-input
          v-model="fileNameFuzzy"
          placeholder="搜索文件"
          clearable
          @keyup.enter="search"
      >
        <template #suffix>
          <el-icon class="el-input__icon" @click="search">
            <search />
          </el-icon>
        </template>
      </el-input>
    </div>

    <el-select v-model="selectedCategory" placeholder="选择文件分类" @change="onCategoryChange" class="category-select">
      <el-option
          v-for="(value, key) in CategoryInfo"
          :key="key"
          :label="value.name"
          :value="key"
      />
    </el-select>

    <Navigation ref="navigationRef" @navChange="navChange"></Navigation>

    <div class="file-list" v-if="tableData.list && tableData.list.length > 0">
      <div
          v-for="(file, index) in tableData.list"
          :key="file.fileId"
          class="file-item"
          @touchstart.prevent="goTouchstart(file)"
          @touchend.prevent="goTouchend(file)"
      >
        <template
            v-if="(file.fileType == 3 || file.fileType == 1) && file.status == 2"
        >
          <icon v-if="file.fengJing==2" :cover="file.fileCover" :width="32" :save-sf="file.saveSf"></icon>
          <icon v-if="file.fengJing==1" :fileType="file.fengJing+10" :width="32"></icon>
        </template>
        <template v-else>
          <icon v-if="file.folderType == 0 &&file.fengJing==2" :fileType="file.fileType"></icon>
          <icon v-if="file.folderType == 0 &&file.fengJing==1" :fileType="file.fengJing+10"></icon>
          <icon v-if="file.folderType == 1 &&file.fengJing==2" :fileType="0"></icon>
          <icon v-if="file.folderType == 1 && file.fengJing==1" :fileType="file.fengJing+10"></icon>
        </template>

        <div class="file-info">
          <span class="file-name" :title="file.fileName">{{ file.fileName }}</span>
          <span class="file-size" v-if="file.fileSize">{{ proxy.Utils.sizeToStr(file.fileSize) }}</span>
        </div>
        <el-tag v-if="file.status === 0" type="warning" size="small">转码中</el-tag>
        <el-tag v-if="file.status === 1" type="danger" size="small">转码失败</el-tag>
      </div>
    </div>

    <div v-else class="empty-state">
      <el-empty description="当前目录为空，上传你的第一个文件吧">
        <el-upload
            :http-request="addFile"
            :with-credentials="true"
            :show-file-list="false"
            :multiple="true"
            :accept="fileAccept"
        >
          <el-button type="primary" @click="showUploadDialog">上传文件</el-button>
        </el-upload>
      </el-empty>
    </div>

    <el-dialog v-model="showFileMenu" title="文件操作" width="90%" @open="test" >
      <el-menu @select="handleFileAction">
        <el-menu-item index="share" v-if="selectedFile.status === 2">
          <el-icon><share /></el-icon>
          <span>分享</span>
        </el-menu-item>
        <el-menu-item index="download" v-if="selectedFile.folderType === 0">
          <el-icon><download /></el-icon>
          <span>下载</span>
        </el-menu-item>
        <el-menu-item index="rename">
          <el-icon><edit /></el-icon>
          <span>重命名</span>
        </el-menu-item>
        <el-menu-item index="move">
          <el-icon><right /></el-icon>
          <span>移动</span>
        </el-menu-item>
        <el-menu-item index="delete">
          <el-icon><delete /></el-icon>
          <span>删除</span>
        </el-menu-item>
      </el-menu>
    </el-dialog>

    <el-dialog v-model="showRename" title="重命名" width="90%">
      <el-input v-model="newFileName" placeholder="输入新文件名"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRename = false">取消</el-button>
          <el-button type="primary" @click="confirmRename">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="makefold" title="新建文件夹" width="90%">
      <el-input v-model="newFileName" placeholder="输入文件名"></el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRename = false">取消</el-button>
          <el-button type="primary" @click="makefoldTrue">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <Preview ref="previewRef" @close="closeCz"></Preview>
    <FolderSelect ref="folderSelectRef" @folderSelect="moveFolderDone"></FolderSelect>
    <FileShare ref="shareRef"></FileShare>
    <UploaderPanel ref="uploaderPanelRef" style="display: none;"/>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, computed, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { Search, View, Share, Download, Edit, Right, Delete, FolderAdd, Upload } from '@element-plus/icons-vue';
import CategoryInfo from "@/js/CategoryInfo.js";
import Navigation from '/src/components/Navigation.vue';
import Preview from '/src/components/previewPhone/Preview.vue';
import FolderSelect from '/src/components/previewPhone/FolderSelect.vue';
import FileShare from './ShareFile.vue';
import icon from "@/components/Icon.vue";
import UploaderPanel from '/src/views/phone/zhujian/shangchuang/main.vue';

const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();
const emit = defineEmits(["addFile","change"]);
const showActionMenu = ref(false);
const api = {
  loadDataList: "/file/loadDataList",
  rename: "/file/rename",
  newFoloder: "/file/newFoloder",
  delFile: "/file/delFile",
  changeFileFolder: "/file/changeFileFolder",
  createDownloadUrl: "/file/createDownloadUrl",
  download: "/api/file/download",
};
const shareRef = ref(false);
const selectedCategory = ref('all');
const uploadCategory = ref('all');

const fileAccept = computed(() => {
  const categoryItem = CategoryInfo[uploadCategory.value];
  return categoryItem ? categoryItem.accept : "*";
});

const category = ref('all');
const currentFolder = ref({ fileId: 0 });
const fileNameFuzzy = ref('');
const tableData = ref({ list: [] });
const showLoading = ref(true);
const showRename = ref(false);
const showFileMenu = ref(false);
const makefold = ref(false);
const selectedFile = ref({});
const newFileName = ref('');
const navigationRef = ref();
const previewRef = ref();
const folderSelectRef = ref();
const uploaderPanelRef = ref(null);
let isRequesting = false;
const gongNeng = ref(true);
const timeOutEvent = ref(0);
const test = () => {
  hareRef.value.show=false;
}
const goTouchstart = (tag) => {
  clearTimeout(timeOutEvent.value);
  timeOutEvent.value = setTimeout(() => {
    showFileActions(tag);
    timeOutEvent.value = 0;
  }, 500);
};

const goTouchend = (tag) => {
  clearTimeout(timeOutEvent.value);
  if (timeOutEvent.value !== 0) {
    selectedFile.value = tag;
   // gongNeng.value = true;
    preview(selectedFile.value);
  }
  timeOutEvent.value = 0;
};
const closeCz = (message) => {
  gongNeng.value = true;
};
const handleActionSelect = (key) => {
  showActionMenu.value = false;
  switch (key) {
    case 'newFolder':
      newFolder();
      break;
    case 'upload':
      showUploadDialog();
      break;
    case 'shuaxin':
      loadDataList();
      break
  }
};

const loadDataList = async () => {
  if (isRequesting) return;
  isRequesting = true;

  let params = {
    pageNo: 1,
    pageSize: 20,
    fileNameFuzzy: fileNameFuzzy.value,
    category: selectedCategory.value || 'all',
    filePid: currentFolder.value.fileId,
  };
  if (params.category !== "all") {
    delete params.filePid;
  }

  let result = await proxy.Request({
    url: api.loadDataList,
    showLoading: true,
    params,
  });

  if (!result) {
    isRequesting = false;
    return;
  }

  tableData.value = result.data;
  isRequesting = false;
};

const callChange = async () => {
  await nextTick(); // 确保 DOM 更新完成
  if (uploaderPanelRef.value) {
    uploaderPanelRef.value.change();
  }
};
callChange()
const addFile = async (fileData) => {
  if (uploaderPanelRef.value) {
    await uploaderPanelRef.value.addFile(fileData.file, currentFolder.value.fileId);
    loadDataList();
  }
};

const newFolder = () => {
  makefold.value = true;
  newFileName.value = "";
};

const makefoldTrue = async () => {
  if (newFileName.value === "" || newFileName.value.indexOf("/") !== -1) {
    proxy.Message.warning("文件名不能为空且不能含有斜杠");
    return;
  }
  let result = await proxy.Request({
    url: api.newFoloder,
    params: {
      filePid: currentFolder.value.fileId,
      fileName: newFileName.value,
      fileId: "",
    },
  });
  if (!result) {
    return;
  }
  if (result.code == 200) {
    makefold.value = false;
    proxy.Message.success("目录创建成功");
    await loadDataList();
  }
};

const navChange = (data) => {
  const { curFolder, categoryId } = data;
  currentFolder.value = curFolder;
  showLoading.value = true;
  category.value = categoryId;
  selectedCategory.value = categoryId;
  loadDataList();
};

const onCategoryChange = () => {
  showLoading.value = true;
  loadDataList();
};

const showFileActions = (file) => {
  if (file.fengJing === 1) {
    proxy.Message.warning("文件违规，已封禁！");
    return;
  }
  selectedFile.value = file;
  showFileMenu.value = true;
};

const handleFileAction = (key) => {
  showFileMenu.value = false;
  switch (key) {
    case 'preview':
      preview(selectedFile.value);
      break;
    case 'share':
      share(selectedFile.value);
      break;
    case 'download':
      download(selectedFile.value);
      break;
    case 'rename':
      showRename.value = true;
      newFileName.value = selectedFile.value.fileName;
      break;
    case 'move':
      moveFolder(selectedFile.value);
      break;
    case 'delete':
      delFile(selectedFile.value);
      break;
  }
};

const preview = (data) => {
  if (data.fengJing === 1) {
    proxy.Message.warning("文件违规，已封禁！");
    return;
  }
  if (data.folderType === 1 && data.fengJing === 2) {
    navigationRef.value.openFolder(data);
    return;
  }
  if (data.status !== 2) {
    proxy.Message.warning("文件正在转码中，无法预览");
    return;
  }
  console.log(JSON.stringify(data));
  gongNeng.value = false;
  previewRef.value.showPreview(data, 0);
};

const share = (row) => {
  shareRef.value.show(row);
};

const download = async (row) => {
  let result = await proxy.Request({
    url: api.createDownloadUrl + "/" + row.fileId,
  });
  if (!result) {
    return;
  }
  window.location.href = api.download + "/" + result.data;
};

const confirmRename = async () => {
  if (newFileName.value === "" || newFileName.value.indexOf("/") !== -1) {
    proxy.Message.warning("文件名不能为空且不能含有斜杠");
    return;
  }
  let result = await proxy.Request({
    url:  api.rename,
    params: {
      fileId: selectedFile.value.fileId,
      fileName: newFileName.value,
    },
  });
  if (!result) {
    return;
  }
  showRename.value = false;
  await loadDataList();
};

const moveFolder = (data) => {
  folderSelectRef.value.showFolderDialog(data.fileId);
};

const moveFolderDone = async (folderId) => {
  if  (selectedFile.value.filePid === folderId || currentFolder.value.fileId === folderId) {
    proxy.Message.warning("文件正在当前目录，无需移动");
    return;
  }
  let result = await proxy.Request({
    url: api.changeFileFolder,
    params: {
      fileIds: selectedFile.value.fileId,
      filePid: folderId,
    },
  });
  if (!result) {
    return;
  }
  folderSelectRef.value.close();
  await loadDataList();
};

const delFile = (row) => {
  proxy.Confirm(
      `你确定要删除【${row.fileName}】吗？删除的文件可在10天内通过回收站还原`,
      async () => {
        let result = await proxy.Request({
          url: api.delFile,
          params: {
            fileIds: row.fileId,
          },
        });
        if (!result) {
          return;
        }
        await loadDataList();
      }
  );
};

const getFileIcon = (file) => {
  console.log(JSON.stringify(file));
  // 这里需要根据文件类型返回相应的图标URL
  // 可以使用一个映射对象或switch语句来处理不同的文件类型
};
</script>

<style lang="scss" scoped>
.mobile-file-manager {
  padding: 10px;

  .top-bar {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 15px;

    .el-button-group {
      display: flex;
      justify-content: space-between;
    }
  }

  .fab {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
  }

  .category-select {
    width: 100%;
    margin-bottom: 15px;
  }

  .file-list {
    .file-item {
      display: flex;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #eee;

      .file-icon {
        width: 40px;
        height: 40px;
        margin-right: 10px;
      }

      .file-info {
        flex: 1;
        display: flex;
        flex-direction: column;

        .file-name {
          font-weight: bold;
          margin-bottom: 5px;
        }

        .file-size {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
  }

  .upload-category-select {
    width: 100%;
    margin-bottom: 15px;
  }
}

:deep(.action-menu-dialog) {
  border-radius: 16px 16px 0 0;
  margin-bottom: 0;

  .el-dialog__header {
    padding-bottom: 10px;
  }

  .el-dialog__body {
    padding-top: 0;
  }

  .el-menu {
    border-right: none;
  }

  .el-menu-item {
    height: 60px;
    line-height: 60px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>