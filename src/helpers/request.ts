import axios from 'axios'

const request = axios.create({
  baseURL: 'http://mp3.uchin.api/api',
})

request.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data
    return false
  },
  (err) => {
    return false
  }
)

export default request
