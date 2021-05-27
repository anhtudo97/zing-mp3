import request from '@/helpers/request'

export const fetchPlaylist = (id: string) => {
  return request({
    url: `/playlist/getDetail?id=${id}`,
  })
}

export const fetchStreaming = (id: string) => {
  return request({
    url: `/song/getStreaming?id=${id}`,
  })
}

export const fetchHome = (page: number = 1) => {
  return request({
    url: `/home?page=${page}`,
  })
}

export const fetchSong = (id: string) => {
  return request({
    url: `/sone/getDetail?id=${id}`,
  })
}

export const fetchKaraokeLyric = (id: string) => {
  return request({
    url: `/lyric?id=${id}`,
  })
}

export const fetchLyric = (link: string) => {
  return request({
    url: link,
  })
}
