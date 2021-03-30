<template>
  <v-app id="inspire">
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4>
            <v-card class="elevation-12">
              <v-toolbar color="primary" dark flat>
                <v-toolbar-title>비밀번호 변경</v-toolbar-title>
                <v-spacer></v-spacer>
              </v-toolbar>
              <v-card-text>
                <v-form ref="passwordForm" lazy-validation>
                  <v-text-field required :rules="passwordRules" v-model="password" label="비밀번호(영문 숫자 특수문자포함 8~12자)"
                                ref="password" prepend-icon="lock" type="password" :disabled="isValid"></v-text-field>
                  <v-text-field required :rules="checkPasswordRules" v-model="checkPassword" label="비밀번호 확인"
                                ref="checkPassword" prepend-icon="lock" type="password"
                                :disabled="isValid"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="changePassword()">변경하기</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>

export default {
  data() {
    return {
      passwordRules: [
        v => !!v || '비밀번호를 입력해주세요.',
        v => /^.*(?=^.{8,12}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/.test(v) ||
          '비밀번호는 영어,숫자,특수문자 포함 8~12자로 설정해주세요.'
      ],
      checkPasswordRules: [
        v => !!v || '비밀번호 확인을 위해 한번더 입력해주세요.',
        v => this.password === this.checkPassword || '비밀번호가 일치하지 않습니다.'
      ],
      userId: this.$route.params.userId,
      password: '',
      checkPassword: '',
      expireJwt: this.$route.params.jwt,
      isValid: false,
    }
  },

  async beforeMount() {
    this.$http.defaults.headers["Authorization"] = this.expireJwt;
    const response = await this.$http.post("/auth/checkExpiredPage")
    if (!response.data.result) {
      this.isValid = 'disabled';
      alert("잘못된 접근입니다.(요청만료)");
    }
    console.log("1." + this.isValid);
  },

  methods: {
    async changePassword() {
      if (!this.$refs.passwordForm.validate()) return;
      this.$http.defaults.headers["Authorization"] = this.expireJwt;
      const response = await this.$http.post("/auth/changePassword", {
        userId: this.userId,
        pwd: this.password,
        jwt: this.expireJwt
      })
      console.log("response.data", response.data)
      if (response.data.result) {
        alert("비밀번호가 성공적으로 변경되었습니다.");
        this.reset();
      } else {
        alert(response.data.message);
      }
    },
    reset() {
      this.$refs.passwordForm.reset();
    },

    nextField() {
      this.$refs.checkPassword.focus()
    },
  }
}
</script>
