<template>
  <v-container fluid grid-list-xl class="pa-0">
    <v-layout row wrap>
      <v-flex>
        <v-card class="mb-3">
          <v-toolbar flat dense>
            <v-toolbar-title>공지사항 관리</v-toolbar-title>
            <v-spacer></v-spacer>
            <label class="mx-4"> 건수 : {{ items.length }}</label>
            <v-btn outlined @click="newDialog()" class="mx-4">
              <v-icon>note_add</v-icon>
              공지사항 추가
            </v-btn>
            <v-btn outlined :loading="loader" @click="getTablesData()">
              <v-icon>search</v-icon>
              조회하기
            </v-btn>
          </v-toolbar>
          <v-toolbar-items>
            <v-row dense class="pl-4 pr-4">
              <v-col md="2" sm="2">
                <v-text-field dense prepend-icon="person" v-model="search.drvNm" label="기사명검색" clearable></v-text-field>
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
            <template v-slot:item.drvMobile="{ value }">
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
                    <v-text-field v-model="editItem.drvMobile" label="*핸드폰번호" required :rules="rules.requireRules"
                                  clearable v-bind:disabled="is_readonly"></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.drvNm" label="*이름" :rules="rules.requireRules"
                                  clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.drvPwd" label="*비밀번호" requird type="password"
                                  :rules="rules.requireRules" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.licenseNo" label="*자격번호" required :rules="rules.requireRules"
                                  clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-select v-model="editItem.compCd" :items="agentSelectList" label="소속"></v-select>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.ifNo" label="외부연동번호" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-select v-model="editItem.os" :items="osSelectList" label="모바일OS"></v-select>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.osVer" label="OS버젼" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.registrationId " label="핸드폰고유등록번호" clearable></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.residence" label="거주지" clearable></v-text-field>
                  </v-flex>

                  <v-flex md12>
                    <h2>언어정보</h2>
                  </v-flex>
                  <v-flex md4>
                    <v-select dense v-model="editItem.engLevel" :items="levelSelectList" label="영어등급"></v-select>
                  </v-flex>
                  <v-flex md4>
                    <v-select dense v-model="editItem.jpnLevel" :items="levelSelectList" label="일어등급"></v-select>
                  </v-flex>
                  <v-flex md4>
                    <v-select dense v-model="editItem.chnLevel" :items="levelSelectList" label="중국어등급"></v-select>
                  </v-flex>
                  <v-flex md12>
                    <h2>메모</h2>
                  </v-flex>
                  <v-flex md12>
                    <v-textarea v-model="editItem.remark" outlined label="내용" rows="3" row-height="30"></v-textarea>
                  </v-flex>
                  <v-flex md4>
                    <v-select v-model="editItem.callStatus" :items="selectListBoolean" label="콜대기상태"></v-select>
                  </v-flex>
                  <v-flex md4>
                    <v-select v-model="editItem.commuteStatus" :items="selectListBoolean" label="출근상태"></v-select>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editItem.carId" label="차량ID" clearable></v-text-field>
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
      is_readonly: false,

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
        // expDate: new Date().toISOString().substr(0, 10),
      },
      search: {
        drvMobile: null,
        drvNm: null,
        compCd: null,
        status: '정상'
      },

      headers: [
        {text: '이름', value: 'drvNm', align: 'center', sortable: false},
        {text: '휴대폰번호', value: 'drvMobile', align: 'center', sortable: false},
        {text: '자격번호', value: 'licenseNo', align: 'center', sortable: false},
        {text: '소속', value: 'compCd', align: 'center'},
        {text: '거주지', value: 'residence', align: 'center'},
        {text: '모바일OS', value: 'os', align: 'center'},
        {text: 'OS버젼', value: 'osVer', align: 'center'},
        {text: '콜대기상태', value: 'callStatus', align: 'center'},
        {text: '출근상태', value: 'commuteStatus', align: 'center'},
        {text: '인수반납', value: 'carStatus', align: 'center'},
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
      //carStatusSelectList:[{ text: '인수필요', value: '인수필요' }, { text: '일반', value: '' }, { text: '반납필요', value: '반납필요' }],

      divSelectList: [],
      driverList: [],
      tempList: [],

      editDialog: false,

      editItem: null,
      // 최초 초기화
      defaultItem: {
        drvId: null,
        drvMobile: null,
        drvPwd: null,
        drvNm: null,
        licenseNo: null,
        language: null,
        residence: null,
        memo: null,
        ifNo: null,
        os: null,
        token: null,
        osVer: null,
        compCd: null,
        registrationId: null,
        callStatus: null,
        commuteStatus: null,
        carStatus: null,
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
    this.$router.push({path: 'notice', query: queryObj})

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
      this.getTablesData()
    },

    // 테이블 리스트 조회
    async getTablesData() {
      this.loader = true
      //this.search.compCd = localStorage.compCd
      let sendSearchItem = this.search
      const response = await this.$http.get('driver/selDriverList', {params: sendSearchItem})
      const articleList = response.data.articleList
      console.log(articleList)
      this.items = articleList
      this.loader = false
    },

    newDialog() {
      this.insertYnUpdate('INSERT')
      this.editDialog = true
      this.editItem = Object.assign({}, this.defaultItem)
      this.is_readonly = false

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
      const response = await this.$http.post("/driver/insDriver", newItem).catch(err => {
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
      sendItem.drvMobile = this.originItem.drvMobile
      sendItem.verNo = this.originItem.verNo
      sendItem.chkStatus = this.originItem.status
      console.log(sendItem)
      const response = await this.$http.post("/driver/updDriver", sendItem).catch(err => {
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
      this.is_readonly = true
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
      sendItem.drvMobile = this.originItem.drvMobile
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
      const response = await this.$http.post("/driver/delDriver", sendItem).catch(err => {
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
        this.$router.push({path: 'notice', query: queryObj})
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
      return this.divTitle == 'C' ? '기사 등록' : '기사 수정'
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

