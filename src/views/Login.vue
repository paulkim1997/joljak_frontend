<template>
  <v-app id="inspire">
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>2021 IoT Smart Home</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form ref="loginForm" lazy-validation>
                  <v-text-field :rules="rules.requireRules" v-model="loginId" label="로그인" ref="login"
                                prepend-icon="person" type="text" @keyup.enter="nextField"></v-text-field>
                  <v-text-field :rules="rules.requireRules" v-model="loginPw" label="비밀번호" ref="password"
                                prepend-icon="lock" type="password" @keyup.enter="loginAction"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="loginAction()">로그인</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import rules from "../plugins/rules"

export default {
  data() {
    return {
      rules,
      loginId: '',
      loginPw: '',
    }
  },

  methods: {
    async loginAction() {
      if (!this.$refs.loginForm.validate()) {
        return
      }
      localStorage.loginPw = this.loginPw
      localStorage.loginId = this.loginId
      const response = await this.$http.post("/auth/empSignIn", {empId: this.loginId, pwd: this.loginPw})
      console.log("response.data", response.data)
      if (response.data.result) {
        const token = "Bearer " + response.data.returnDto.token
        const refreshToken = "Bearer " + response.data.returnDto.refreshToken
        localStorage.token = token
        localStorage.refreshToken = refreshToken
        this.$http.defaults.headers["Authorization"] = token

        let compCd = response.data.compCd
        localStorage.compCd = compCd

        let initUrl = response.data.message
        if (!initUrl) {
          initUrl = '/login'
        }
        localStorage.initUrl = initUrl

        this.$router.replace(initUrl)
      } else {
        alert(response.data.message)
      }
    },

    nextField() {
      this.$refs.password.focus()
    },
  }
}
</script>
