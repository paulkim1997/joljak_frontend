<template>
  <v-container fluid grid-list-xl class="pa-0">
    <v-layout row wrap>
      <v-flex>
        <!-- 조회 섹션 START -->
        <v-card class="mb-3">
          <v-toolbar flat dense>
            <v-toolbar-title>비밀번호 변경하기</v-toolbar-title>
            <v-spacer></v-spacer>
          </v-toolbar>
          <v-toolbar-items>

          </v-toolbar-items>
        </v-card>
        <!-- 조회 섹션 END -->
        <!-- editDialog -->
        <v-dialog v-model="editDialog" persistent max-width="800px">
          <v-card>
            <v-card-title>
              <span class="headline">보안을 위해 비밀번호를 다시 입력해주세요</span>
            </v-card-title>
            <v-form ref="inputForm" lazy-validation>
              <v-card-text>
                <v-form ref="loginForm" lazy-validation>
                  <v-text-field :rules="rules.requireRules" v-model="loginPw" label="비밀번호" ref="password"
                                prepend-icon="lock" type="password" @keyup.enter="checkPw"></v-text-field>
                </v-form>
              </v-card-text>
            </v-form>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="warning" outlined @click.native="dialogClose()">닫기</v-btn>
              <v-btn color="primary" outlined @click.native="checkPw()">확인</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>


        <v-dialog v-model="editDialog2" persistent max-width="800px">
          <v-card>
            <v-card-title>
              <span class="headline">비밀번호 변경하기</span>
            </v-card-title>
            <v-form ref="inputForm" lazy-validation>
              <v-card-text>
                <v-form ref="passwordForm" lazy-validation>
                  <v-text-field required :rules="passwordRules" v-model="password" label="비밀번호(영문 숫자 특수문자포함 8~12자)"
                                ref="password" prepend-icon="lock" type="password" :disabled="isValid"></v-text-field>
                  <v-text-field required :rules="checkPasswordRules" v-model="checkPassword" label="비밀번호 확인"
                                ref="checkPassword" prepend-icon="lock" type="password"  @keyup.enter="changePassword"
                                :disabled="isValid"></v-text-field>
                </v-form>
              </v-card-text>
            </v-form>
            <v-card-actions>

              <v-spacer></v-spacer>
              <v-btn color="warning" outlined @click.native="dialogClose2()">닫기</v-btn>
              <v-btn color="primary" outlined @click.native="changePassword()">확인</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>


      </v-flex>
      <v-snackbar v-model="snackbarItem" top color="error">
        {{ snackbarText }}
        <v-btn color="" outlined @click="snackbarItem = false">닫기</v-btn>
      </v-snackbar>
    </v-layout>
  </v-container>
</template>

<script>
import common from "../../plugins/common"
import rules from "../../plugins/rules"
import router from "../../router"
import {mask} from 'vue-the-mask'
import {Money} from 'v-money'

export default {
  data() {
    return {
      common,
      rules,
      loginPw: '',
      passwordRules: [
        v => !!v || '비밀번호를 입력해주세요.',
        v => /^.*(?=^.{8,12}$)(?=.*\d)(?=.*[a-zA-Z])(?=.*[!@#$%^&+=]).*$/.test(v) ||
          '비밀번호는 영어,숫자,특수문자 포함 8~12자로 설정해주세요.'
      ],
      checkPasswordRules: [
        v => !!v || '비밀번호 확인을 위해 한번더 입력해주세요.',
        v => this.password === this.checkPassword || '비밀번호가 일치하지 않습니다.'
      ],
      password: '',
      checkPassword: '',
      isValid: false,

      loader: true,
      editDialog: false,
      editDialog2: false,

      insertYn: '',

      picker: {
        date1: false,
        date2: false,
      },

      search: {
        roomNo: 1,
        roomNm: null,
      },

      headers: [
      ],

      items: [],


      selectPagePerCount: [{text: '10', value: 10}, {text: '20', value: 20}, {text: '30', value: 30}, {
        text: '50',
        value: 50
      }],

      // 원래 배열 저장하기 위한 변수들
      originItem: {},

      editItem: null,
      // 최초 초기화
      defaultItem: {
        joinDate: this.$moment(new Date()).format('YYYY-MM-DD'),
        retireDate: null,
        initUrl: '/code',
        listCnt: 15,
        compCd: 'SAB',
        status: null,
        verNo: 1,
        lockYn: null,
        chkStatus: null,
      },
      snackbarItem: false,
      snackbarText: '',
    }
  },

  beforeMount() {
    // form 쪽 초기화
    this.editItem = Object.assign({}, this.defaultItem)
    this.getInitData()
  },

  mounted() {
    this.getTablesData()
  },

  beforeUpdate() {
  },

  updated() {

  },

  methods: {
    // 코드 데이터 조회
    async getInitData() {
      this.editDialog = true
      //this.detailCodeName = await common.getDetailCodeName()
      //let groupCode = await common.getCodeGroupList(['DIV1', 'POSITION'])
      //this.selectListDiv1 = groupCode['DIV1'].detailList
      //this.selectListStatus = await common.getGroupDetailList('EMP_STATUS', 'Y')
      // VAL1~3 의 값에 따라 필터링할 경우 별도로 호출한다. 참고 : common.js: 97, getGroupDetailList (key, val1, val2, val3)
      // this.divSelectList.unshift({ dtlCd: null, dtlCdNm: '전체' })
      // '전체선택' 은 화면과 컨트롤에 따라 같은 코드그룹이라도 있을수도, 없을수도 있을것 같아서 필요하면 직접 넣도록 해본다.

      // 데이터 테이블 리스트 조회
      //const routeChildren = router.options.routes[0].children
      //for (const item of routeChildren) {
      //  this.selectInitUrl.push({ text: item.name, value: item.path })
      //}

      //let empUser = document.querySelector('.empUser');
      //empUser.style.display ='none'
      //this.getTablesData()
    },

    // 테이블 리스트 조회
    async getTablesData() {
      this.loader = true
      //this.search.compCd = localStorage.compCd
      let sendSearchItem = this.search
      const response = await this.$http.get('room/selRoomInf', {params: sendSearchItem})
      const articleList = response.data.articleList
      console.log(articleList)
      this.items = articleList
      this.loader = false
    },


    newDialog() {
      this.insertYnUpdate('INSERT')
      this.editDialog = true
      this.editItem = Object.assign({}, this.defaultItem)

      if (this.$refs.inputForm) {
        this.$refs.inputForm.resetValidation()
      }
    },

    newDialog2() {
      this.insertYnUpdate('INSERT')
      this.editDialog2 = true
      this.editItem = Object.assign({}, this.defaultItem)

      if (this.$refs.inputForm) {
        this.$refs.inputForm.resetValidation()
      }
    },

    //비밀번호 검증
    async checkPw() {
      if(this.loginPw === localStorage.loginPw) {
        this.dialogClose()
        this.newDialog2()
      } else {
        alert("비밀번호가 올바르지 않습니다. 다시 확인해주세요")
      }
    },

    //비밀번호 변경하기
    async changePassword() {
      let sendItem = {}
      //where절에 들어갈 key값
      sendItem.empId = localStorage.loginId
      sendItem.verNo = this.originItem.verNo
      sendItem.chkStatus = this.originItem.status
      sendItem.pwd = this.password
      const response = await this.$http.post("/user/changePw", sendItem).catch(err => {
        return 'ERR' // axios 요청의 .catch에서 return 을 하면 updateItem 의 return 이 아니라 await this.$http.post 의 리턴값이라는것에 유의 response 에 "ERR" 이 들어간다.
      })
      if(response.data.message == "성공")  {
        alert("변경 성공!")
        this.$router.push('/eachRoom')
        localStorage.loginPw = this.password

      } else {
        alert("변경 실패!")
      }
      return response
    },

    // async changePassword() {
    //   if (!this.$refs.passwordForm.validate()) return;
    //   this.$http.defaults.headers["Authorization"] = this.expireJwt;
    //   const response = await this.$http.post("/auth/changePassword", {
    //     userId: this.userId,
    //     pwd: this.password,
    //     jwt: this.expireJwt
    //   })
    //   console.log("response.data", response.data)
    //   if (response.data.result) {
    //     alert("비밀번호가 성공적으로 변경되었습니다.");
    //     this.reset();
    //   } else {
    //     alert(response.data.message);
    //   }
    // },
    // reset() {
    //   this.$refs.passwordForm.reset();
    // },
    //
    // nextField() {
    //   this.$refs.checkPassword.focus()
    // },

    // 모달 창 닫기
    dialogClose() {
      this.editDialog = false
      this.editItem = Object.assign({}, this.defaultItem)
    },
    dialogClose2() {
      this.editDialog2 = false
      this.editItem = Object.assign({}, this.defaultItem)
    },

    // 등록 & 수정 START
    async save() {
      if (!this.$refs.inputForm.validate()) {
        this.showSnackbar('필수 항목을 입력해 주세요.')
        return
      }
      if (this.editItem.compMap != null) {
        this.editItem.compCd = this.editItem.compMap.cd
      }
      // 등록
      if (this.insertYn === 'INSERT') {
        let result = await this.insertItem(this.editItem)
        if (result === 'ERR') {
          alert('에러가 발생하였습니다. 잠시 후 시도해 주세요')
        } else {
          let data = result.data
          if (!data.result) {
            if (data.message === 'DUPLICATE CODE') {
              alert("아이디 중복입니다. 다른 아이디를 입력해 주세요.")
            }
          } else if (data.result) {
            if (data.message === 'SUCCESS') {
              alert('등록되었습니다.')
              this.editDialog = false
            }
          }
        }
      } else {
        // 수정
        let result = await this.updateItem(this.editItem)
        //if (result === 'ERR') {
        if (result.data.code != null) {
          alert(result.data.message)
        } else {
          let data = result.data
          if (data.result && data.message === 'SUCCESS') {
            alert("수정이 완료 되었습니다.")
            this.editDialog = false
          }
        }
      }
      this.getTablesData() // 테이블 데이터 재조회
      this.dialogClose()   // 모달 닫기
    },

    // 등록
    async insertItem(newItem) {
      const response = await this.$http.post("/user/insEmp", newItem).catch(err => {
        return 'ERR' // insertItem 이 'ERR'을 리턴하는게 아니라 const response 로 'ERR' 이 리턴됨
      })
      return response
    },

    // 수정
    async updateItem(updateItem) {
      console.log('수정 시작')
      console.log(updateItem)
      console.log(this.originItem)
      let sendItem = {}
      // 현재 수정 form 에 있는 값과, 기존에 있던 값이 같지 않으면 현재 있는 값으로 변경.
      // let keys = Object.keys(updateItem)
      for (let key in updateItem) {
        if (updateItem[key] != this.originItem[key]) {
          sendItem[key] = updateItem[key]
        }
      }
      if (common.isEmpty(sendItem)) {
        this.showSnackbar('수정된 내용이 없습니다.')
        return
      }
      //where절에 들어갈 key값
      sendItem.empId = this.originItem.empId
      sendItem.verNo = this.originItem.verNo
      sendItem.chkStatus = this.originItem.status
      console.log(sendItem)
      const response = await this.$http.post("/user/updEmp", sendItem).catch(err => {
        return 'ERR' // axios 요청의 .catch에서 return 을 하면 updateItem 의 return 이 아니라 await this.$http.post 의 리턴값이라는것에 유의 response 에 "ERR" 이 들어간다.
      })
      return response
    },
    //등록 & 수정 END

    //상세조회
    selectDetail(item) {
      this.editDialog = true
      this.editItem = Object.assign({}, item)
      this.originItem = Object.assign({}, item) // 변경 전 원 데이터 저장
      console.log(item)
      this.insertYnUpdate('UPDATE') // 수정으로 상태변경
      if (this.$refs.inputForm) {
        this.$refs.inputForm.resetValidation()
      }
    },

    insertYnUpdate(yn) {
      console.log("ynupdate=", yn)
      this.insertYn = yn
    },

    //삭제
    async deleteContents() {
      let sendItem = {}
      sendItem.empId = this.originItem.empId
      sendItem.verNo = this.originItem.verNo
      sendItem.chkStatus = this.originItem.status

      let result = await this.deleteItem(sendItem)
      if (result === "ERR") {
        alert("삭제 중 에러가 발생하였습니다. 잠시 후 시도해 주세요")
      } else {
        let data = result.data
        if (data.result && data.message === 'SUCCESS') {
          alert("삭제가 완료 되었습니다.")
          this.editDialog = false
        }
      }
      this.getTablesData() // 테이블 데이터 재조회
    },

    // 삭제 실제 요청 method
    async deleteItem(sendItem) {
      const response = await this.$http.post("/user/delEmp", sendItem).catch(err => {
        return 'ERR'
      })
      return response
    },

    compareDiv(selectVal, divList) {
      console.log('CompareDiv Start')
      console.log(selectVal)
      console.log(divList)
      let result = []
      for (let i in divList) {
        let val1 = divList[i].val1
        if (val1 != null && val1 != undefined) {
          if (selectVal == val1) {
            result.push(divList[i])
          }
        }
      }
      console.log(result)
      return result
    },

    showSnackbar(text) {
      this.snackbarText = text
      this.snackbarItem = true
    },

  },

  computed: {
    isReadonly: function () {
      if (this.insertYn == 'INSERT') {
        return false
      } else {
        return true
      }
    }
  },

  watch: {
    /*
    'search.div1' (to) {
      this.selectListDiv2 = this.originSelectListDiv2
      let temp =  this.compareDiv(to, this.selectListDiv2)
      this.selectListDiv2 = temp
    },
    'editItem.joinDate' (date){
      if(date > this.editItem.retireDate && date !=''){
        alert("입사일이 퇴사일 보다 뒤일 수 없습니다.");
        this.editItem.joinDate = '';
      }
    },
    'editItem.retireDate' (date) {
      if( date < this.editItem.joinDate && date != '' ){
        alert("퇴사일이 입사일보다 먼저일 수 없습니다.");
        this.editItem.retireDate = '';
      }
      if( this.editItem.retireDate != null && this.editItem.retireDate != '' ){
        this.editItem.status = 'EMPS003'; // 퇴사일 입력시 상태값 퇴사
      }
    },
    */
  }
}
</script>
