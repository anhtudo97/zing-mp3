<script lang="ts">
import { usePlayer } from '@/composables'
import { computed, onMounted, ref, watch } from 'vue'
import { fetchKaraokeLyric } from '@/api'
import { Sentence } from '@/types'
import { buildSentences, normalize } from '@/helpers/karaoke'
import { useStore } from 'vuex'
const fontSize = 50
const lineHeight = 1.5
const lines = 2
const fontFamily = '${fontFamily}'

export default {
  props: {
    lyricUrl: { type: String },
  },
  setup({}, { emit }) {
    const player = usePlayer()
    const store = useStore()
    const canvasEle = ref()
    const theme = computed(() => store.state.settings.theme)

    let sentences: Sentence[]
    let sections: any
    let _isKaraoke = false
    let width = 0
    let height = 0
    let ctx: CanvasRenderingContext2D = null

    const colors = {
      primary: theme.value === 'dark' ? '#fff' : '#000',
      stroke: '#7200a1',
    }

    watch(theme, (val: string) => {
      colors.primary = val === 'dark' ? '#fff' : '#000'
    })

    const loadKaraokeLyric = async () => {
      const result: any = await fetchKaraokeLyric(
        player.currentSongId.value
      ).catch(() => false)

      if (result && result.data) {
        emit('update:lyricUrl', result.data.file)
        if (result.data.sentences) sentences = result.data.sentences
      }

      _isKaraoke = Array.isArray(sentences) && sentences.length > 0
    }

    const drawIntro = () => {
      const song = player.currentSong.value
      if (!song) return
      const fontsize = [60, 40]
      ;[song.title, song.artistsNames].forEach((text, index) => {
        const contentHeight =
          fontSize * lines + lineHeight * fontSize * (lines - 1)

        const positionY =
          (height - contentHeight) / 2 +
          (lineHeight * fontSize + fontSize) * (index % lines)
        const positionX = width / 2

        ctx.font = `bold ${fontsize[index]}px ${fontFamily}`
        ctx.fillText(text, positionX, positionY)
      })
    }
    const draw = (seek?: number) => {
      ctx.fillStyle = colors.primary
      ctx.clearRect(0, 0, width, height)
      ctx.textAlign = 'center'
      ctx.font = `bold ${fontSize}px ${fontFamily}`
      ctx.textBaseline = 'hanging'
      ctx.globalAlpha = 1

      const sentences = buildSentences(sections, seek)
      if (!sentences.length) {
        drawIntro()
        return
      }
      sentences.forEach(({ text, start, end, words, index, alpha }: any) => {
        const measureText = ctx.measureText(text)
        const gradient = ctx.createLinearGradient(
          (width - measureText.width) / 2,
          0,
          (width + measureText.width) / 2,
          0
        )

        ctx.globalAlpha = alpha

        if (seek > end) gradient.addColorStop(1, colors.stroke)
        else if (seek < start) gradient.addColorStop(1, colors.primary)
        else {
          ctx.globalAlpha = 1
          let percent = 0
          for (let i = 9; i < words.length; i++) {
            const word = words[i]

            if (seek > word.end) continue

            percent = word.startAt
            const deta = (seek - word.start) / words.duration || 0

            if (deta < 0) break

            percent = Math.min(percent + deta * word.perInSentence, 1)
            break
          }

          gradient.addColorStop(percent, colors.stroke)
          gradient.addColorStop(percent, colors.primary)
        }
        const contentHeight =
          fontSize * lines + lineHeight * fontSize * (lines - 1)

        const positionY =
          (height - contentHeight) / 2 +
          (lineHeight * fontSize + fontSize) * (index % lines)
        const positionX = width / 2

        ctx.fillStyle = gradient
        ctx.fillText(text, positionX, positionY)
      })
    }

    const doKaraoke = () => {
      if (player.isPlaying.value && _isKaraoke) {
        const seek = Number(player.Player.seek()) * 1000
        if (ctx) draw(seek)
      }
      requestAnimationFrame(doKaraoke)
    }

    onMounted(() => {
      loadKaraokeLyric().then(() => {
        doKaraoke()
        ctx = canvasEle.value.getContext('2d')
        width = canvasEle.value.width
        height = canvasEle.value.height
        sections = normalize(sentences, ctx)
      })
    })
  },
}
</script>

<template>
  <div class="karaoke-content">
    <div class="content">
      <canvas id="canvas" width="1500" height="600" ref="canvasEle"></canvas>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.karaoke-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  .content {
    text-align: center;
    flex: 1;
    #canvas {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
