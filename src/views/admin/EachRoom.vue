<template>
  <v-container fluid grid-list-xl class="pa-0">
    <v-layout row wrap>
      <v-flex>
        <!-- 조회 섹션 START -->
        <v-card class="mb-3">
          <v-toolbar flat dense>
            <v-toolbar-title>각 방 조회</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn outlined :loading="loader" @click="getTablesData()">
              <v-icon>search</v-icon>
              조회하기
            </v-btn>
          </v-toolbar>
          <v-toolbar-items>
            <v-row dense class="pl-4 pr-4">
              <v-col md="2" sm="2">
                <v-text-field prepend-icon="home" v-model="search.roomNo" label="방 번호 검색" ></v-text-field>
              </v-col>
            </v-row>
          </v-toolbar-items>
        </v-card>
        <!-- 조회 섹션 END -->
        <!-- data table List START -->
        <template>
          <v-row>
            <v-col>
              <v-card
                class="mx-auto"
                max-width="500"
              >
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title class="headline">
                      온도
                    </v-list-item-title>
                    <v-list-item-subtitle>측정 시간: {{ information.measureTime }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-card-text>
                  <v-row align="center">
                    <v-col
                      class="display-3"
                      cols="6"
                    >
                      {{ information.temp }}&deg;C
                    </v-col>
                    <v-col cols="6">
                      <v-img
                        :src="common.getImages('temp')"
                        alt="Sunny image"
                        width="92"
                      ></v-img>
                    </v-col>
                  </v-row>
                </v-card-text>


                <v-divider></v-divider>

                <v-card-actions>
                  <v-btn text>
                    이전 기록 보기
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col>
              <v-card
                class="mx-auto"
                max-width="500"
              >
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title class="headline">
                      습도
                    </v-list-item-title>
                    <v-list-item-subtitle>측정 시간: {{ information.measureTime }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-card-text>
                  <v-row align="center">
                    <v-col
                      class="display-3"
                      cols="6"
                    >
                      {{ information.hum }}%
                    </v-col>
                    <v-col cols="6">
                      <v-img
                        :src="common.getImages('hum')"
                        alt="Sunny image"
                        width="92"
                      ></v-img>
                    </v-col>
                  </v-row>
                </v-card-text>


                <v-divider></v-divider>

                <v-card-actions>
                  <v-btn text>
                    이전 기록 보기
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-card
                class="mx-auto"
                max-width="500"
              >
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title class="headline">
                      미세먼지
                    </v-list-item-title>
                    <v-list-item-subtitle>측정 시간: {{ information.measureTime }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-card-text>
                  <v-row align="center">
                    <v-col
                      class="display-2"
                      cols="6"
                    >
                      {{ information.dust }}㎍/m
                    </v-col>
                    <v-col cols="6">
                      <v-img
                        :src="common.getImages('dust')"
                        alt="Sunny image"
                        width="92"
                      ></v-img>
                    </v-col>
                  </v-row>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-btn text>
                    이전 기록 보기
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col>
              <v-card
                class="mx-auto"
                max-width="500"
              >
                <v-list-item two-line>
                  <v-list-item-content>
                    <v-list-item-title class="headline">
                      가스
                    </v-list-item-title>
                    <v-list-item-subtitle>측정 시간: {{ information.measureTime }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
                <v-card-text>
                  <v-row align="center">
                    <v-col
                      class="display-3"
                      cols="6"
                    >
                      {{ information.gas }}
                    </v-col>
                    <v-col cols="6">
                      <v-img
                        :src="common.getImages('gas')"
                        alt="Sunny image"
                        width="92"
                      ></v-img>
                    </v-col>
                  </v-row>
                </v-card-text>

                <v-divider></v-divider>

                <v-card-actions>
                  <v-btn text>
                    이전 기록 보기
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </template>
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
import {db} from '../../firebase/db'

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
        roomNo: 1,
        roomNm: null,
      },

      headers: [
        {text: 'ID', value: 'empId', align: 'center'},
        {text: '이름', value: 'empNm', align: 'center'},
        {text: '핸드폰', value: 'empMobile', align: 'center'},
        {text: '직위', value: 'position', align: 'center'},
        {text: '권한', value: 'authority', align: 'center'},
        {text: '초기 URL', value: 'initUrl', align: 'center'},
        {text: '입사일', value: 'joinDate', align: 'center'},
        {text: '계정잠김', value: 'lockYn', align: 'center'},
        {text: '상태', value: 'status', align: 'center'},
      ],

      information: [],

      items: [],

      selectListStatus: [{text: '정상', value: '정상'}, {text: '삭제', value: '삭제'}], // 상태
      selectListBoolean: [{text: '활성', value: 'Y'}, {text: '잠김', value: 'N'}],
      selectInitUrl: [
        {text: '예약', value: '/call'},
        {text: '배차', value: '/alloc'},
        {text: '사용자', value: '/user'},
        {text: '코드', value: '/code'},
      ],
      selectPagePerCount: [{text: '10', value: 10}, {text: '20', value: 20}, {text: '30', value: 30}, {
        text: '50',
        value: 50
      }],

      // 원래 배열 저장하기 위한 변수들
      originItem: {},

      editItem: null,
      // 최초 초기화
      defaultItem: {
        empId: null,
        empMobile: null,
        empNm: null,
        pwd: null,
        position: null,
        authority: null,
        roomNo:null,
        roomNm:null,
        temp:null,
        hum:null,
        gas:null,
        dust:null,
        light:null,
        measureTime:null,
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
      this.read()
    },

    // 테이블 리스트 조회
    async getTablesData() {
      this.loader = true
      //this.search.compCd = localStorage.compCd
      let sendSearchItem = this.search
      const response = await this.$http.get('room/selRoomInf', {params: sendSearchItem})
      const articleList = response.data.articleList
      //console.log(articleList)
      this.items = articleList
      this.information.measureTime = articleList[0].measureTime
      this.information.temp = articleList[0].temp
      this.information.hum = articleList[0].hum
      this.information.dust = articleList[0].dust
      this.information.gas = articleList[0].gas
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

    read() {
      db.collection('rooms').onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
          let infoChange = change.doc.data()

          if (change.type === 'added') {
            console.log('New information: ', infoChange)
            if(search.roomNo === infoChange.roomNo) {
              this.information = infoChange
            }
          }
          if (change.type === 'modified') {
            console.log('Modified information: ', infoChange)
            this.information = infoChange
          }
          if (change.type === 'removed') {
            console.log('Removed information: ', infoChange)

          }
        })
      })
    }

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
