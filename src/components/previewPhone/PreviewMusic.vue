<template>
  <div class="mobile-music-player">
    <div class="cover">
      <img src="@/assets/music_cover.png" alt="Music Cover" />
    </div>
    <div ref="playerRef" class="music-player"></div>
  </div>
</template>

<script setup>
import APlayer from "APlayer";
import "APlayer/dist/APlayer.min.css";
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
});

const playerRef = ref();
const player = ref();

onMounted(() => {
  player.value = new APlayer({
    container: playerRef.value,
    audio: {
      url: `/api${props.url}`,
      name: props.fileName,
      cover: new URL(`@/assets/music_icon.png`, import.meta.url).href,
      artist: "",
    },
    fixed: false,
    mini: false,
  });
});

onUnmounted(() => {
  if (player.value) {
    player.value.destroy();
  }
});
</script>

<style lang="scss" scoped>
.mobile-music-player {
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .cover {
    width: 80%;
    max-width: 300px;
    aspect-ratio: 1 / 1;
    margin-bottom: 20px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .music-player {
    width: 100%;
    max-width: 350px;

    :deep(.aplayer) {
      margin: 0;
      box-shadow: none;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    :deep(.aplayer-info) {
      padding: 14px 7px 10px;
    }

    :deep(.aplayer-controller) {
      padding: 0 5px 5px;
    }

    :deep(.aplayer-list) {
      margin-bottom: 6px;
    }

    :deep(.aplayer-list-cur) {
      height: 40px;
    }
  }
}
</style>