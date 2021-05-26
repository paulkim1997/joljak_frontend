<template>
  <v-container fluid grid-list-xl class="pa-0">
    <v-layout row wrap>
      <v-flex>
        <!-- 조회 섹션 START -->
        <v-card class="mb-3">
          <v-toolbar flat>
            <v-toolbar-title>CCTV확인</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn outlined :loading="loader" @click="getTablesData()">
              <v-icon>search</v-icon>
              새로고침하기
            </v-btn>
          </v-toolbar>

        </v-card>
        <!-- 조회 섹션 END -->
        <!-- 등록 modal dialog START -->
        <!-- 등록 modal dialog END -->
        <!-- data table List START -->
        <v-card height="510px" width="700px">
          <iframe height="510px" width="700px" src="http://203.229.55.130:8000/">

          </iframe>
        </v-card>
        <!-- data table List END -->
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

      loader: true,
      editDialog: false,

      insertYn: '',

      picker: {
        date1: false,
        date2: false,
      },

      search: {
        empId: null,
        empNm: null,
        empMobileNo: null,
        status: '정상'
      },

      headers: [
        {text: '방 번호', value: 'roomNo', align: 'center', width:'100px', divider:true},
        {text: '방 이름', value: 'roomNm', align: 'center', divider:true, sortable: false},
        {text: '온도', value: 'temp', align: 'center', divider:true},
        {text: '습도', value: 'hum', align: 'center', divider:true},
        {text: '미세먼지', value: 'dust', align: 'center', divider:true},
        {text: '가스', value: 'gas', align: 'center', divider:true},
        {text: '측정 시간', value: 'measureTime', align: 'center'},

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
      const response = await this.$http.get('room/selAllRoomInf')
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

    getColor (dust) {
      if (dust > 80) return 'red'
      else if (dust > 30) return 'orange'
      else return 'green'
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
