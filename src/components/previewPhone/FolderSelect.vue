<template>
  <div>
    <Dialog
        :show="dialogConfig.show"
        :title="dialogConfig.title"
        :buttons="dialogConfig.buttons"
        width="100%"
        :showCancel="true"
        @close="close"
    >
      <div class="navigation-panel">
        <Navigation
            ref="navigationRef"
            @navChange="navChange"
            :watchPath="false"
        ></Navigation>
      </div>
      <div class="folder-list" v-if="folderList.length > 0">
        <div
            class="folder-item"
            v-for="item in folderList"
            @click="selectFolder(item)"
        >
          <icon :fileType="0"></icon>
          <span class="file-name">{{ item.fileName }}</span>
        </div>
      </div>
      <div v-else class="tips">
        移动到 <span>{{ currentFolder.fileName }}</span> 文件夹
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
const { proxy } = getCurrentInstance();
const router = useRouter();
const route = useRoute();

const api = {
  loadAllFolder: "/file/loadAllFolder",
};

const dialogConfig = ref({
  show: false,
  title: "移动到",
  buttons: [
    {
      type: "primary",
      click: () => {
        folderSelect();
      },
      text: "移动到此",
    },
  ],
});

//父级ID
const filePid = ref("0");
const folderList = ref([]);
const loadAllFolder = async () => {
  let result = await proxy.Request({
    url: api.loadAllFolder,
    params: {
      filePid: filePid.value,
      currentFileIds: currentFileIds.value,
    },
  });
  if (!result) {
    return;
  }
  folderList.value = result.data;
};

const close = () => {
  dialogConfig.value.show = false;
};

//当前目录，传入后 获取目录需要排除该目录
const currentFileIds = ref({});
//展示弹出框对外的方法
const showFolderDialog = (curFileIds) => {
  dialogConfig.value.show = true;
  currentFileIds.value = curFileIds;
  filePid.value = "0";
  nextTick(() => {
    navigationRef.value.init();
  });
};

defineExpose({
  showFolderDialog,
  close,
});
//选择目录
const navigationRef = ref();
const selectFolder = (data) => {
  navigationRef.value.openFolder(data);
};

//当前的目录
const currentFolder = ref({});
//导航改变回调
const navChange = (data) => {
  const { curFolder } = data;
  currentFolder.value = curFolder;
  filePid.value = curFolder.fileId;
  loadAllFolder();
};

const emit = defineEmits(["folderSelect"]);

const folderSelect = () => {
  emit("folderSelect", filePid.value);
};
</script>

<style lang="scss" scoped>
.navigation-panel {
  padding: 10px;
  background: #f1f1f1;
  overflow-x: auto;
  white-space: nowrap;
}

.folder-list {
  max-height: calc(100vh - 200px);
  min-height: 200px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  .folder-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 15px 10px;
    border-bottom: 1px solid #f0f0f0;

    .file-name {
      display: inline-block;
      margin-left: 10px;
      font-size: 16px;
    }

    &:active {
      background: #f8f8f8;
    }
  }
}

.tips {
  text-align: center;
  padding: 20px;
  font-size: 16px;

  span {
    color: #06a7ff;
    font-weight: bold;
  }
}

// Mobile-specific styles
@media (max-width: 768px) {
  .navigation-panel {
    padding: 5px;
  }

  .folder-list {
    max-height: calc(100vh - 150px);
    min-height: 150px;

    .folder-item {
      padding: 12px 8px;

      .file-name {
        font-size: 14px;
      }
    }
  }

  .tips {
    padding: 15px;
    font-size: 14px;
  }
}
</style>