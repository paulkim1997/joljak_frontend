import Vue from 'vue'
import VueRouter from 'vue-router'
import Container from './components/Container.vue'

import Login from './views/Login.vue'
import AllRoom from './views/admin/AllRoom.vue'
import EachRoom from './views/admin/EachRoom.vue'
import CodeList from './views/admin/CodeList.vue'
import EmpList from './views/admin/EmpList.vue'
import ChangePwd from './views/admin/ChangePwd.vue'
import SvcUserList from './views/admin/SvcUserList.vue'
import NoticeList from './views/admin/NoticeList.vue'
import FindPwd from "@/views/FindPwd";

Vue.use(VueRouter)
let initUrl = localStorage.initUrl || '/login'

export default new VueRouter({
  routes: [
    {
      path: '/',
      component: Container,
      redirect: initUrl,
      children: [
        {
          path: '/allRoom',
          name: '모든 방 조회',
          component: AllRoom
        },
        {
          path: '/eachRoom',
          name: '방별 조회',
          component: EachRoom
        },
        {
          path: '/changePwd',
          name: '비밀번호 변경',
          component: ChangePwd
        },
        {
          path: '/code',
          name: '코드 관리',
          component: CodeList
        },
        {
          path: '/emp',
          name: '임직원 관리',
          component: EmpList
        },
        {
          path: '/svcUser',
          name: '사용자 관리',
          component: SvcUserList
        },
        {
          path: '/notice',
          name: '공지사항 관리',
          component: NoticeList
        },
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/findPwd/:userId/:jwt',
      name: '비밀번호 변경',
      component: FindPwd
    },
  ]
})
