<template>
  <v-container fluid grid-list-xl class="pa-0">
    <v-layout row wrap>
      <v-flex>
        <v-card class="mb-3">
          <v-toolbar flat dense>
            <v-toolbar-title>사용자 관리</v-toolbar-title>
            <v-spacer></v-spacer>
            <label class="mx-4"> 건수 : {{ items.length }}</label>
            <v-btn outlined @click="newDialog()" class="mx-4">
              <v-icon>note_add</v-icon>
              사용자 추가
            </v-btn>
            <v-btn outlined :loading="loader" @click="getTablesData()">
              <v-icon>search</v-icon>
              조회하기
            </v-btn>
          </v-toolbar>
          <v-toolbar-items>
            <v-row dense class="pl-4 pr-4">
              <v-col md="2" sm="2">
                <v-text-field dense prepend-icon="person" v-model="search.drvNm" label="사용자명검색"
                              clearable></v-text-field>
              </v-col>
              <v-col md="2" sm="2">
                <v-text-field dense prepend-icon="phone_iphone" v-model="search.drvMobile" label="핸드폰검색"
                              clearable></v-text-field>
              </v-col>
              <v-col md="2" sm="2">
                <v-select dense prepend-icon="business" v-model="search.agent" :items="agentSelectList"
                          label="소속"></v-select>
              </v-col>
            </v-row>
          </v-toolbar-items>
        </v-card>
        <v-card>
          <v-data-table
            :headers="headers"
            :items="items"
            :page.sync="page"
            :items-per-page="itemsPerPage"
            @page-count="pageCount = $event"
            :items-per-page-options='[15,20,50,-1]'
            @click:row="selectDetail"
          >
            <!--
            <template v-slot:item.status="{ value }">
              <v-chip small color="cyan darken-1" v-if="value != null">{{ detailCodeName[value] }}</v-chip>
            </template>
            -->
            <template v-slot:item.language="{ item }">
              <language-chip :driverItem="item"></language-chip>
            </template>
            <template v-slot:item.userMobile="{ value }">
              {{ common.convertPhoneString(value) }}
            </template>
          </v-data-table>
          <div class="text-xs-center pt-2">
            <v-pagination ref="listpage" v-model="page" :length="pageCount" :total-visible="9"></v-pagination>
          </div>
        </v-card>
      </v-flex>
      <v-dialog persistent v-model="editDialog" max-width="46%">
        <v-card>
          <v-card-title>
            <span class="headline">{{ dialogTitle }}</span>
          </v-card-title>

          <v-form ref="inputForm" lazy-validation>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex md12>
                    <h2>기본정보</h2>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.userMobile" label="*핸드폰번호" required :rules="rules.requireRules"
                                  clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.userNm" label="*이름" :rules="rules.requireRules"
                                  clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.pwd" label="*비밀번호" requird type="password"
                                  :rules="rules.requireRules" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.userEmail" label="이메일" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.birthday" label="생년월일" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.gender" label="성별" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-select v-model="editItem.os" :items="osSelectList" label="모바일OS"></v-select>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.osVer" label="OS버젼" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.mobileBrand" label="모바일브랜드" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.mobileModel" label="모바일모델" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.registrationId" label="핸드폰고유등록번호" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-select v-model="editItem.language" :items="languageSelectList" label="선호외국어"></v-select>
                  </v-flex>
                  <v-flex md4>
                    <v-menu v-model="picker.date1" :close-on-content-click="false"
                            transition="scale-transition" offset-y full-width min-width="290px">
                      <template v-slot:activator="{ on }">
                        <v-text-field v-model="editItem.signupDt" prepend-icon="event" readonly v-on="on"
                                      label="가입일"></v-text-field>
                      </template>
                      <v-date-picker v-model="editItem.signupDt" no-title @input="picker.date1 = false"
                                     show-current></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex md4>
                    <v-menu v-model="picker.date2" :close-on-content-click="false"
                            transition="scale-transition" offset-y full-width min-width="290px">
                      <template v-slot:activator="{ on }">
                        <v-text-field v-model="editItem.blockDt" prepend-icon="event" readonly v-on="on"
                                      label="차단일"></v-text-field>
                      </template>
                      <v-date-picker v-model="editItem.blockDt" no-title @input="picker.date2 = false"
                                     show-current></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.blockReason" label="차단사유" clearable></v-text-field>
                  </v-flex>
                  <v-flex md12>
                    <h2>동의정보</h2>
                  </v-flex>
                  <v-flex md3>
                    <v-select v-model="editItem.notiAgree" :items="selectListBoolean" label="알림동의여부"></v-select>
                  </v-flex>
                  <v-flex md3>
                    <v-text-field v-model="editItem.notiAgreeDt" label="알림동의일시" readonly></v-text-field>
                  </v-flex>
                  <v-flex md3>
                    <v-select v-model="editItem.smsAgree" :items="selectListBoolean" label="SMS동의여부"></v-select>
                  </v-flex>
                  <v-flex md3>
                    <v-text-field v-model="editItem.smsAgreeDt" label="문자동의일시" readonly></v-text-field>
                  </v-flex>
                  <v-flex md12>
                    <h2>참고</h2>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.subsId" label="구독자ID" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.compCd" label="법인회사" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.recommMobile" label="추천인핸드폰번호" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.authInfo" label="인증정보" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-menu v-model="picker.date3" :close-on-content-click="false"
                            transition="scale-transition" offset-y full-width min-width="290px">
                      <template v-slot:activator="{ on }">
                        <v-text-field v-model="editItem.leaveDt" prepend-icon="event" readonly v-on="on"
                                      label="탈퇴일"></v-text-field>
                      </template>
                      <v-date-picker v-model="editItem.leaveDt" no-title @input="picker.date3 = false"
                                     show-current></v-date-picker>
                    </v-menu>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.leaveReason" label="탈퇴사유" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-select v-model="editItem.status" :items="statusSelectList" label="상태"></v-select>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-btn v-if="insertYn=='UPDATE'" color="red lighten-2" outlined @click.native="deleteContents()">삭제</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="green" outlined @click.native="resetPassword()">비밀번호 초기화</v-btn>
            <v-btn color="warning" outlined @click.native="dialogClose()">닫기</v-btn>
            <v-btn color="primary" outlined @click.native="save()">저장</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

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
import LanguageChip from "../../components/LanguageChip"
import {mask} from 'vue-the-mask'

const totalObj = {dtlCd: null, dtlCdNm: '전체'}
const selectObj = {dtlCd: null, dtlCdNm: '선택'}

export default {
  data() {
    return {
      common,
      rules,
      loader: true,

      page: 1,
      pageCount: 0,
      itemsPerPage: common.getPagePerListCount(),
      sPhoneNo: '',
      divTitle: '',

      mask: {
        dateMask: '####-##-##',
      },

      picker: {
        datePicker: false,
        datePicker2: false,
        datePicker3: false,
        // expDate: new Date().toISOString().substr(0, 10),
      },
      search: {
        userMobile: null,
        userNm: null,
        userEmail: null,
        compCd: null,
        status: '정상'
      },

      headers: [
        {text: '이름', value: 'userNm', align: 'center', sortable: false},
        {text: '휴대폰번호', value: 'userMobile', align: 'center', sortable: false},
        {text: '이메일', value: 'userEmail', align: 'center', sortable: false},
        {text: '생년월일', value: 'birthday', align: 'center'},
        {text: '가입일', value: 'signupDt', align: 'center'},
        {text: '모바일OS', value: 'os', align: 'center'},
        {text: 'OS버젼', value: 'osVer', align: 'center'},
        {text: '알림수신', value: 'notiAgree', align: 'center'},
        {text: 'SMS수신', value: 'smsAgree', align: 'center'},
        {text: '폰모델', value: 'mobileModel', align: 'center'},
        {text: '상태', value: 'status', align: 'center'},
      ],
      items: [],

      agentSelectList: [{text: '없음', value: ''}, {text: '모시러', value: '모시러'}, {text: '윌앤비젼', value: '윌앤비젼'}],
      levelSelectList: [{text: '없음', value: ''}, {text: 'A', value: 'A'}, {text: 'B', value: 'B'}, {
        text: 'C',
        value: 'C'
      }],
      selectListBoolean: [{text: 'Y', value: 'Y'}, {text: 'N', value: 'N'}],
      statusSelectList: [{text: '정상', value: '정상'}, {text: '삭제', value: '삭제'}],
      osSelectList: [{text: 'Android', value: 'Android'}, {text: 'iOS', value: 'iOS'}],
      languageSelectList: [{text: '없음', value: ''}, {text: '영어', value: '영어'}, {text: '중국어', value: '중국어'}, {
        text: '일어',
        value: '일어'
      }],

      editDialog: false,

      editItem: null,
      // 최초 초기화
      defaultItem: {
        userId: null,
        userMobile: null,
        userNm: null,
        userEmail: null,
        pwd: null,
        birthday: null,
        gender: null,
        authInfo: null,
        signupDt: null,
        leaveDt: null,
        leaveReason: null,
        recommMobile: null,
        os: null,
        token: null,
        osVer: null,
        notiAgree: null,
        notiAgreeDt: null,
        mobileBrand: null,
        mobileModel: null,
        blockDt: null,
        blockReason: null,
        smsAgree: null,
        smsAgreeDt: null,
        subsId: null,
        compCd: null,
        registrationId: null,
        status: null,
        verNo: 1,
        chkStatus: null,
      },
      originItem: {},
      detailCodeName: common.detailCodeName,
      date: this.$moment(new Date()).format('YYYY-MM-DD'),
      menu2: false,

      snackbarItem: false,
      snackbarText: '',

      excelDialog: false,
      excelSearch: {
        drvNm: null,
      },
    }
  },

  components: {
    LanguageChip,
  },

  directives: {
    mask,
  },

  beforeMount() {
    console.log('<<< [Pristin] User-Song List >>>')
    this.editItem = Object.assign({}, this.defaultItem)
    this.getInitData()
    var queryObj = {}
    queryObj.pagenumber = parseInt(this.$route.query.pagenumber) || 1
    this.$router.push({path: 'svcUser', query: queryObj})

  },

  mounted() {
    this.itemsPerPage = parseInt(localStorage.itemsPerPage) || 10
  },

  beforeUpdate() {
    console.log(`beforeUpdate : this.$route.query.pagenumber : [${this.$route.query.pagenumber}], this.page : [${this.page}]`)
  },

  updated() {
    console.log(`updated : this.$route.query.pagenumber : [${this.$route.query.pagenumber}], this.page : [${this.page}]`)
    var queryObj = {}
    const currentPage = parseInt(this.$route.query.pagenumber) || 1
    if (this.page !== currentPage) {
      queryObj.pagenumber = this.page
    }
    if (queryObj.pagenumber) {
      this.$router.push({query: queryObj})
    }
  },

  methods: {
    // 코드 데이터 조회
    async getInitData() {
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
      this.getTablesData()
    },

    // 테이블 리스트 조회
    async getTablesData() {
      this.loader = true
      //this.search.compCd = localStorage.compCd
      let sendSearchItem = this.search
      const response = await this.$http.get('user/selSvcUserList', {params: sendSearchItem})
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

    // 모달 창 닫기
    dialogClose() {
      this.editDialog = false
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

    //등록
    async insertItem(newItem) {
      const response = await this.$http.post("/user/insSvcUser", newItem).catch(err => {
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
      sendItem.userMobile = this.originItem.userMobile
      sendItem.verNo = this.originItem.verNo
      sendItem.status = this.originItem.status
      sendItem.chkStatus = this.originItem.status
      console.log(sendItem)
      const response = await this.$http.post("/user/updSvcUser", sendItem).catch(err => {
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

    // 삭제
    async deleteContents() {
      let sendItem = {}
      sendItem.userMobile = this.originItem.userMobile
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
      const response = await this.$http.post("/user/delSvcUser", sendItem).catch(err => {
        return 'ERR'
      })
      return response
    },

    showSnackbar(text) {
      this.snackbarText = text
      this.snackbarItem = true
    },

    historyUrl() {
      var queryObj = {}
      const currentPage = parseInt(this.$route.query.pagenumber) || 1

      if (this.page > 0) {
        queryObj.pagenumber = this.page
      } else if (this.page == 0 && currentPage == 1) {
        queryObj.pagenumber = currentPage
      }
      if (this.search.drvNm) {
        queryObj.drvNm = this.search.drvNm
      }

      if (queryObj.pagenumber || queryObj.drvNm) {
        this.$router.push({path: 'svcUser', query: queryObj})
      }
    },

    removeDashPhoneNo(num) {
      var newNum
      newNum = num.replace(/[^0-9]/g, '')
      return newNum
    },
  },

  computed: {
    dialogTitle() {
      return this.divTitle == 'C' ? '사용자 등록' : '사용자 수정'
    }
  },

  watch: {
    '$route.query.pagenumber'(to, from) {
      // 경로 변경에 반응하여...
      console.log(`[pagenumber] to : ${to}, from : ${from}`)
      const nextPage = to || 1
      if (parseInt(this.page) !== parseInt(nextPage)) {
        console.log(`watch.pagenumber : [${nextPage}]`)
        this.page = parseInt(nextPage)
      }
    },

    page(to, from) {
      console.log(`[page] to : ${to}, from : ${from}`)
      if (to > 0) {
        this.historyUrl()
      }
    },
  }
}
</script>

