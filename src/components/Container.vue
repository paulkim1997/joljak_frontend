<template>
  <div>
    <v-navigation-drawer v-model="drawer" app>
      <v-list dense>
        <template v-for="item in items">
          <v-row v-if="item.heading" :key="item.heading" align="center">
            <v-col cols="6">
              <v-subheader v-if="item.heading">{{ item.heading }}</v-subheader>
            </v-col>
          </v-row>
          <v-list-group v-if="item.children" :key="item.text" v-model="item.model"
                        :prepend-icon="item.model ? item.icon : item['icon-alt']" append-icon no-action>
            <template v-slot:activator>
              <v-list-item-title>{{ item.text }}</v-list-item-title>
            </template>
            <v-list-item v-for="(child, i) in item.children" :key="i" link :to="child.toRoute">
              <v-list-item-icon v-if="child.icon">
                <v-icon>{{ child.icon }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ child.text }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item v-else :key="item.text" :to="item.toRoute">
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>2021 졸업 작품 스마트 홈</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn small color="error" ripple @click.native="logoutAction">
        <v-icon>exit_to_app</v-icon>
        logout
      </v-btn>
    </v-app-bar>
    <v-content>
      <v-container fluid class="fill-height">
        <router-view></router-view>
      </v-container>
    </v-content>
    <v-footer app>
      <span>&copy; 2021 졸업 작품 </span>
    </v-footer>
  </div>
</template>

<script>
import common from "../plugins/common"

export default {
  data() {
    return {

      drawer: null,
      loading: true,
      items: [],
    }
  },
  components: {},
  props: {},
  async created() {
    await this.tokenRefresh()
  },

  beforeMount() {
    console.log('<<< beforeMount >>>')
    localStorage.fromThisMonthDate = this.$moment([new Date().getFullYear(), new Date().getMonth()]).add(0, 'days').format('YYYY-MM-DD')
    localStorage.fromDate = this.$moment().format("YYYY-MM-DD")
    localStorage.toDate = this.$moment().format("YYYY-MM-DD")
    //초기 데이터 조회
    this.getMenu()
  },

  mounted() {
    this.loading = false
  },

  methods: {
    async tokenRefresh() {
      if (localStorage.refreshToken) {
        this.$http.defaults.headers['Authorization'] = localStorage.refreshToken
        const response = await this.$http.post('auth/tokenRefresh', {token: localStorage.token})
        let initUrl = response.data.data.initUrl
        if (!initUrl) {
          initUrl = '/code'
        }
        const token = "Bearer " + response.data.data.token
        localStorage.token = token
        localStorage.initUrl = initUrl
        let compCd = response.data.data.compCd
        localStorage.compCd = compCd
        localStorage.listCnt = response.data.data.listCnt
        common.setPagePerListCount(response.data.data.listCnt)
        this.$http.defaults.headers['Authorization'] = token
        if (this.$route.fullPath == '/') {
          this.$router.replace(initUrl)
        }
      } else {
        this.$router.replace("/login")
      }
    },

    // 메뉴조회
    async getMenu() {
      //alert(localStorage.compCd)
      if (localStorage.compCd != 'SAB') {
        this.items = [
          {
            icon: 'keyboard_arrow_down',
            'icon-alt': 'watch',
            text: '집 환경 확인',
            model: true,
            children: [
              {icon: 'sensor_door', text: '방별 조회', toRoute: '/eachRoom'},
              {icon: 'home', text: '전체 조회', toRoute: '/allRoom'},
              //{icon: 'schedule', text: '***', toRoute: ''},
            ],
          },
          {
            icon: 'keyboard_arrow_down',
            'icon-alt': 'directions_car',
            text: 'IoT 디바이스 원격 조종',
            model: true,
            children: [
              {icon: 'monitor', text: '***', toRoute: ''},
            ],
          },
          {
            icon: 'keyboard_arrow_down',
            'icon-alt': 'videocam',
            text: '원격 CCTV 확인',
            model: true,
            children: [
              {icon: 'videocam', text: 'CCTV 보기', toRoute: '/cctv'},
            ],
          },
          {
            icon: 'keyboard_arrow_down',
            'icon-alt': 'home',
            text: '관리자 옵션',
            model: true,
            children: [
              // {icon: 'accessibility', text: '임직원', toRoute: '/emp'},
              {icon: 'vpn_key', text: '비밀번호 변경하기', toRoute: '/changePwd'},
            ],
          },
        ]
      } else {

      }
    },

    logoutAction() {
      delete localStorage.token
      delete localStorage.fromDate
      delete localStorage.toDate
      delete localStorage.refreshToken
      this.$router.replace('/login')
    },
  },

  watch: {}
}
</script>
<style>
.dialogScrollHeight {
  height: calc(100vh - 232px);
}
</style>
