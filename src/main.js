import Vue from 'vue'
import axiosInstance from './plugins/axios'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import moment from 'moment'
import VueMomentJS from 'vue-momentjs'
import {firestorePlugin} from 'vuefire'

Vue.use(firestorePlugin)

Vue.config.productionTip = false

axiosInstance.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    if (error.response.status == 401) { // 401 은 토큰이 없는 상태, 혹은 토큰 만료,
      refreshToken();
      location.reload();
    } else if (error.response.status == 403) {  //403은 리프레시토큰도 만료되어 재로그인이 필요한 경우
      location.replace('/#/login')
    } else if (error.response.status == 400) {
      alert(`[${error.response.status}]\n[${error.response.data.message}]\n입력 항목을 확인해주세요.`)
    } else {
      alert(`[${error.response.status}]\n관리자에게 문의해주세요.`)
    }
    return Promise.reject(error)
  }
)
Vue.prototype.$http = axiosInstance
moment.locale(navigator.language)

async function refreshToken() {
  if (localStorage.refreshToken) {
    this.$http.defaults.headers['Authorization'] = localStorage.refreshToken
    const response = await this.$http.post('auth/tokenRefresh')
    const token = "Bearer " + response.data.data.token
    localStorage.token = token
    this.$http.defaults.headers['Authorization'] = token
  } else {
    location.replace('/#/login')
  }
}

Vue.use(VueMomentJS, moment)
new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')


