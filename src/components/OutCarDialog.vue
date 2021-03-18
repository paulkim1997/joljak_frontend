<template>
  <v-dialog persistent v-model="outCarDialog" max-width="900px" @keydown.esc="dialogOutcarClose()">
    <v-card>
      <v-card-title>
        <span class="headline">{{ dialogTitle }} </span>
        <v-spacer></v-spacer>
        <v-btn v-if="false" color="primary" outlined @click.native="dialogOutcarClose()">SMS 보내기(준비중)</v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-form v-if="outCarItem" ref="inputForm" lazy-validation>
        <v-card-text class="overflow-y-auto dialogScrollHeight">
          <v-container grid-list-md>
            <v-flex md6>
              <v-select v-if="groupCodeObject.ATTACH_TYPE" v-model="outCarItem.attachType" :rules="rules.requireRules"
                        :items="groupCodeObject.ATTACH_TYPE.detailList" item-text="dtlCdNm" item-value="dtlCd"
                        label="배차유형"/>
            </v-flex>
            <template v-if="dialogType == TYPE.RESV_TO_OCAR"> <!-- 예약->배차인 경우 회원을 선택할 수 있도록 한다. -->
              <v-layout wrap>
                <v-flex md12>
                  <v-textarea filled readonly label="예약정보" :value="reserveInfo()"/>
                </v-flex>
                <v-flex md3>
                  <v-text-field readonly dense label="예약자 선택"
                                :value="`차종: [${detailCodeName[reserveItem.carType] || ''}] - 언어: [${detailCodeName[reserveItem.language] || ''}]`"/>
                </v-flex>
                <v-flex md4>
                  <v-autocomplete :label="`회원을 선택하세요.`" v-model="driverMap" :readonly="dialogType != TYPE.RESV_TO_OCAR"
                                  :rules="rules.requireRules" :items="filteredDriverList" return-object clearable
                                  item-text="drvNmMobileNo" hint="이름, 전화번호 검색가능" @change="getOpSeq">
                    <template v-slot:item="{ item }">
                      <v-list-item-content>
                        <v-list-item-title v-text="item.drvNmMobileNo"></v-list-item-title>
                        <v-list-item-subtitle
                          v-text="(detailCodeName[item.carModel] || '') + ' ' + (item.carNo || '')"></v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <language-chip :driverItem="item"></language-chip>
                      </v-list-item-action>
                    </template>
                  </v-autocomplete>
                </v-flex>
                <v-flex md5 v-if="driverMap">
                  <v-label>
                    <language-chip :driverItem="driverMap"></language-chip>
                    <v-chip color="cyan lighten-5" outlined v-if="driverMap.carModel != '' || driverMap.carNo != ''">{{
                      detailCodeName[driverMap.carModel] }} - {{ driverMap.carNo }}
                    </v-chip>
                  </v-label>
                </v-flex>
              </v-layout>
            </template>
            <template v-else-if="dialogType != TYPE.RESV_TO_OCAR && driverMap">
              <!-- 입차->배차, 배차->배차 상세 인경우 회원을 선택할 수 없다. -->
              <v-layout wrap>
                <v-flex md6>
                  <v-text-field readonly dense
                                :value="`${driverMap.drvNm}, ${common.convertPhoneString(driverMap.mobileNo)}`"/>
                </v-flex>
                <v-flex md6>
                  <v-label>
                    <language-chip :driverItem="driverMap"></language-chip>
                    <v-chip color="cyan lighten-5" outlined v-if="driverMap.carModel != '' || driverMap.carNo != ''">{{
                      detailCodeName[driverMap.carModel] }} - {{ driverMap.carNo }}
                    </v-chip>
                  </v-label>
                </v-flex>
              </v-layout>
            </template>
            <v-layout wrap>
              <v-flex md2 color="grey darken-2">
                <v-text-field :rules="rules.numberRulesIncZero" dense v-model="outCarItem.dspSeq" label="화면회차"
                              type="number" hint="다음번 입차시 화면에 표시될 회차 번호"/>
              </v-flex>
              <v-flex md2>
                <v-text-field dense disabled v-model="outCarItem.opSeq" label="실제회차"/>
              </v-flex>
              <v-flex md2>
                <v-select ref="zone" v-if="groupCodeObject.ZONE" :rules="rules.requireRules" v-model="outCarItem.zone"
                          :items="zoneList" item-text="dtlCdNm" item-value="dtlCd" label="권역"
                          @change="setZoneOfBasicCharge"/>
              </v-flex>
              <v-flex md5>
                <v-btn color="grey darken-2" v-for="item in zoneBtnList" :key="item.value" v-text="item.text"
                       :value="item.value" @click="clickZoneBtnList(item.value)"></v-btn>
              </v-flex>
              <v-flex md1>
                <v-btn color="green" @click="toggleRent()">대절</v-btn>
              </v-flex>
              <template v-if="rentYn"> <!-- 대절클릭시 나옴 -->
                <v-flex md1>
                  <v-btn @click="changeReservingCharge(3)">3시간</v-btn>
                </v-flex>
                <v-flex md1>
                  <v-btn @click="changeReservingCharge(1)">+1시간</v-btn>
                </v-flex>
                <v-flex md2 @click="changeReservingCharge(0)">
                  <v-btn>대절미터</v-btn>
                </v-flex>
                <v-flex md3>
                  <v-text-field dense :rules="rules.numberRulesIncZero" v-model="this.reservingCharge" label="대절요금"
                                type="number"/>
                </v-flex>
                <v-flex md5></v-flex>
              </template>

              <v-flex md3>
                <v-select :rules="rules.requireRules" v-model="outCarItem.departure" :items="departureList" label="출발지"
                          item-value="dtlCd" item-text="dtlCdNm" @change="departureValueChange"/>
              </v-flex>
              <v-flex md3>
                <v-text-field v-if="outCarItem.departure == 'ENTD004'" :rules="rules.requireRules" dense
                              v-model="outCarItem.departureInput" label="출발지 직접입력"/>
              </v-flex>
              <v-flex md3>
                <v-select :rules="rules.requireRules" v-model="outCarItem.dest" :items="destList" label="목적지"
                          item-value="dtlCd" item-text="dtlCdNm" @change="destValueChange"/>
              </v-flex>
              <v-flex md3>
                <v-text-field v-if="outCarItem.dest == 'ENTD004'" :rules="rules.requireRules" dense
                              v-model="outCarItem.destInput" label="목적지"/>
              </v-flex>
              <v-flex md6>
                <v-text-field
                  v-if="dialogType == TYPE.ECAR_TO_OCAR || (dialogType == TYPE.OCAR_IN_OCAR && outCarItem.attachType == 'ATTC001')"
                  dense disabled v-model="outCarItem.entDtDsp" label="입차일시"/>
                <v-text-field v-else dense readonly v-model="outCarItem.opDt" label="예약일시"/>
              </v-flex>
              <v-flex md6>
                <v-menu v-if="dialogType != TYPE.RESV_TO_OCAR && outCarItem.attachType == 'ATTC001'" ref="menu"
                        v-model="timepickerMenu" :close-on-content-click="false" :nudge-right="40"
                        :return-value.sync="outCarItem.dspExitTime" transition="scale-transition" offset-y full-width
                        max-width="290px" min-width="290px">
                  <template v-slot:activator="{ on }">
                    <!-- <v-text-field v-model="outCarItem.dspExitTime" label="출차시간" prepend-icon="access_time" readonly v-on="on" /> -->
                    <v-text-field v-model="outCarItem.dspExitTime" label="출차시간 (시:분)" placeholder="시간을 선택해주세요"
                                  v-mask="mask.timeMask" :rules="rules.timeRules" prepend-icon="access_time"
                                  @click:prepend="timepickerMenu = true" hint="HH:mm (ex: 19:20)"/>
                  </template>
                  <v-time-picker v-if="timepickerMenu" v-model="outCarItem.dspExitTime" full-width format="24hr"
                                 @click:minute="$refs.menu.save(outCarItem.dspExitTime)"/>
                </v-menu>
              </v-flex>
              <v-flex md3>
                <v-select v-if="groupCodeObject.LANGUAGE" v-model="outCarItem.language" :rules="rules.requireRules"
                          :items="groupCodeObject.LANGUAGE.detailList" item-text="dtlCdNm" item-value="dtlCd"
                          label="언어"/>
              </v-flex>
              <v-flex md3>
                <v-select v-if="dialogType == TYPE.RESV_TO_OCAR" v-model="outCarItem.picketSvc"
                          :rules="rules.requireRules" :items="isList" label="피켓여부" @change="picketSvcValueChange"/>
              </v-flex>
              <v-flex md3>
                <v-select v-model="outCarItem.passCnt" :rules="rules.requireRules" :items="carTypeOfPassCnt"
                          label="승객수"/>
              </v-flex>
              <v-flex md3>
                <v-select v-model="outCarItem.bagCnt" :rules="rules.numberRulesIncZero" :items="carTypeOfBagCnt"
                          label="수화물 수"/>
              </v-flex>
              <v-flex md3>
                <v-text-field dense v-model="outCarItem.basicCharge" :rules="rules.numberRulesIncZero" label="기본요금"
                              type="number"/>
              </v-flex>
              <v-flex md3>
                <v-text-field dense v-model="outCarItem.tollCharge" :rules="rules.numberRulesIncZero" label="톨게이트요금"
                              type="number"/>
              </v-flex>
              <v-flex md3>
                <v-text-field dense v-model="outCarItem.picketCharge" :rules="rules.numberRulesIncZero" label="피켓요금"
                              type="number"/>
              </v-flex>
              <v-flex md3>
                <v-text-field dense v-model="outCarItem.parkingCharge" :rules="rules.numberRulesIncZero" label="주차요금"
                              type="number"/>
              </v-flex>
              <v-flex md3>
                <v-text-field dense v-model="outCarItem.etcCharge" :rules="rules.numberRulesIncZero" label="기타요금"
                              type="number"/>
              </v-flex>
              <v-flex md3>
                <v-text-field dense v-model="outCarItem.promotion" :rules="rules.numberRulesIncZero" label="프로모션"
                              type="number"/>
              </v-flex>
              <v-flex md3>
                <v-text-field dense v-model="outCarItem.supportFund" :rules="rules.numberRulesIncZero" label="지원금"
                              type="number"/>
              </v-flex>
              <v-flex md3>
                <v-select v-model="outCarItem.billingYn" :items="isList" label="과금여부"/>
              </v-flex>
              <v-flex md3>
                <v-select v-model="outCarItem.rndTrip" :items="isRndTripList" label="왕복여부" @change="chkRndTrip()"
                          @blur="returnRndTrip()"/>
              </v-flex>
              <v-flex md3>
                <v-autocomplete label="고객" v-model="outCarItem.custId" :items="custList" clearable item-text="custNm"
                                item-value="custId">
                  <template v-slot:item="{ item }">
                    <v-list-item-content>
                      <v-list-item-title v-text="item.custNm"/>
                      <v-list-item-subtitle
                        v-text="(detailCodeName[item.custTp] || '') + ' ' + (detailCodeName[item.position] || '') + ', ' + (item.rateOfComm || '10') + '%'"/>
                    </v-list-item-content>
                  </template>
                </v-autocomplete>
              </v-flex>
              <v-flex md3>
                <v-select v-if="groupCodeObject.CUST_TP && outCarItem.custId > 0" v-model="outCarItem.opType"
                          :items="groupCodeObject.CUST_TP.detailList" item-text="dtlCdNm" item-value="dtlCd"
                          label="고객유형"/>
              </v-flex>
              <v-flex md3>
                <v-text-field v-if="groupCodeObject.CUST_TP && outCarItem.custId > 0" v-model="outCarItem.guide"
                              label="담당자(가이드)"/>
              </v-flex>
              <v-flex md3>
                <v-select v-if="groupCodeObject.PRE_DEFERRED" v-model="outCarItem.preDeferred"
                          :items="groupCodeObject.PRE_DEFERRED.detailList" item-text="dtlCdNm" item-value="dtlCd"
                          label="선후불"/>
              </v-flex>
              <v-flex md3>
                <v-select :disabled='outCarItem.preDeferred=="PREDE002"' v-if="groupCodeObject.PAY_TYPE"
                          v-model="outCarItem.payType" :items="groupCodeObject.PAY_TYPE.detailList" item-text="dtlCdNm"
                          item-value="dtlCd" label="결제수단"/>
              </v-flex>
              <v-flex md12>
                <v-textarea v-model="outCarItem.remark" outlined label="기타 요청사항" rows="3" row-height="30"/>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
      </v-form>
      <v-divider></v-divider>
      <v-card-actions>
        <template v-if="dialogType != TYPE.OCAR_IN_OCAR">
          <v-btn color="warning" outlined @click.native="dialogOutcarClose()">닫기</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" outlined @click.native="saveOutCar()">배차 등록</v-btn>
        </template>
        <template v-else>
          <v-btn color="red lighten-2" outlined @click.native="deleteItem()">삭제</v-btn>
          <v-btn v-if="outCarItem.status != 'OUTS004'" color="warning" outlined @click.native="cancelOutCar()">배차 취소
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="outCarItem.status != 'OUTS004'" color="warning" outlined @click.native="doneOutCar()">운행 종료
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="primary" outlined @click.native="updateOutCar()">배차 수정</v-btn>
          <v-btn color="warning" outlined @click.native="dialogOutcarClose()">닫기</v-btn>
        </template>
      </v-card-actions>
    </v-card>
    <v-dialog v-if="dialogType == TYPE.ECAR_TO_OCAR" v-model="resvListDialog" max-width="90%">
      <v-card>
        <v-card-title>
          <span class="headline">당일예약 목록</span>
        </v-card-title>

        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap>
              <v-flex md12>
                <v-simple-table dark fixed-header>
                  <thead>
                  <tr>
                    <th class="text-left">채널</th>
                    <th class="text-left">사업유형</th>
                    <th class="text-left">메일</th>
                    <th class="text-left">탑승자</th>
                    <th class="text-left">이용일시</th>
                    <th class="text-left">이용시간</th>
                    <th class="text-left">언어</th>
                    <th class="text-left">출발지</th>
                    <th class="text-left">도착지</th>
                    <th class="text-left">차량유형</th>
                    <th class="text-left">피켓</th>
                    <th class="text-left">후불</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="item in todayResvedList" :key="item.drvId" @click="selectReserve(item)">

                    <td>
                      <template>
                        <p class="ma-0"><img style="max-height:20px;vertical-align:sub;"
                                             :src="common.getChannelImageName(item.channel)"/></p>
                      </template>
                    </td>
                    <td>{{ detailCodeName[item.bizType] }}</td>
                    <td>
                      <v-tooltip bottom dark>
                        <template v-slot:activator="{ on }">
                          <p class="ma-0" v-on="on"> {{ common.abbreviateString(item.reservEmail, 10) }}</p>
                        </template>
                        <span>{{ item.reservEmail }} </span>
                      </v-tooltip>
                    </td>

                    <td>
                      <v-tooltip bottom dark>
                        <template v-slot:activator="{ on }">
                          <p class="ma-0" v-on="on"> {{ common.abbreviateString(item.userNm, 10) }}</p>
                        </template>
                        <span>{{ item.userNm }} </span>
                      </v-tooltip>
                    </td>

                    <td>{{ item.useDate }}</td>
                    <td>{{ item.useTime }}</td>
                    <td>
                      <img v-if="item.language != 'LANG004'"
                           style="max-height:20px;vertical-align:sub; text-align: center;"
                           :src="common.getLanguageImageName(item.language)"/>
                    </td>
                    <td>
                      <v-tooltip bottom dark>
                        <template v-slot:activator="{ on }">
                          <p class="ma-0" v-on="on"> {{ common.abbreviateString(item.departureInput, 10) }}</p>
                        </template>
                        <span>{{ item.departureInput }} </span>
                      </v-tooltip>
                    </td>

                    <td>
                      <v-tooltip bottom dark>
                        <template v-slot:activator="{ on }">
                          <p class="ma-0" v-on="on"> {{ common.abbreviateString(item.destInput, 10) }}</p>
                        </template>
                        <span>{{ item.destInput }} </span>
                      </v-tooltip>
                    </td>
                    <td>{{ detailCodeName[item.carType] }}</td>

                    <td>{{ item.picketYn }}</td>
                    <td>{{ detailCodeName[item.preDeferred] }}</td>
                  </tr>
                  </tbody>
                </v-simple-table>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="warning" outlined @click.native="selDialogClose()">닫기</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script>
import common from "../plugins/common"
import rules from "../plugins/rules"
import LanguageChip from "../components/LanguageChip"
import {mask} from 'vue-the-mask'
import _ from 'lodash'
import socket from "../plugins/socket"

const RESV_TO_OCAR = 1
const ECAR_TO_OCAR = 2
const OCAR_IN_OCAR = 3

export default {
  data() {
    return {
      TYPE: {
        RESV_TO_OCAR,
        ECAR_TO_OCAR,
        OCAR_IN_OCAR
      },
      common,
      rules, // 태그 안에 속성에서 사용하려면 data () 에 정의 필요

      timepickerMenu: false,
      mask: {
        dateMask: '####-##-##',
        timeMask: '##:##'
      },
      outCarDialog: false,
      rentYn: false,
      reservingCharge: 0,
      dialogType: 0,

      enterCarItem: null,
      reservedItem: null,
      ecarItem: null,
      outCarItem: null,
      driverMap: null,
      originItem: null,
      resvListDialog: false,
      custList: [],
      zoneBtnList: [
        {text: 'A', value: 'A'},
        {text: 'B', value: 'B'},
        {text: 'C', value: 'C'},
        {text: 'D', value: 'D'},
        {text: 'E', value: 'E'},
      ],

      isRndTripList: [
        {text: 'Y', value: 'Y'},
        {text: 'N', value: 'N'},
        {text: '당일왕복', value: 'TODAY'},
      ],
      isChangeRndTrip: false,

      departureList: [],
      orginZoneList: [],
      destList: [],
      zoneList: [],
      todayResvedList: [],

      isList: [{text: 'Y', value: 'Y'}, {text: 'N', value: 'N'}],
      driverList: null,


      groupCodeObject: {},
      regions: {},
      detailCodeName: {},
      selItem: {},

      outDefaultItem: {
        drvId: '',
        opDate: '',
        opDt: '',
        opSeq: 1,
        dspSeq: 1,
        entId: null,
        cover: '',
        entTime: '',
        exitDt: '',
        attachType: '',
        place: '',
        departure: '',
        departureInput: '',
        dest: '',
        destInput: '',
        zone: '',
        language: 'LANG001',
        passCnt: 1,
        bagCnt: 1,
        picketSvc: 'N',
        dtlPath: '',
        basicCharge: '0',
        commRate: '10',
        tollCharge: '0',
        picketCharge: '0',
        parkingCharge: '0',
        etcCharge: '0',
        promotion: '0',
        supportFund: '0',
        payType: '',
        preDeferred: '',
        rndTrip: 'N',
        custId: null,
        opType: '',
        reservId: null,
        remark: '',
        bizType: '',
        guide: '',
        billingYn: 'Y',
        verNo: 1,
      },
    }
  },
  components: {
    LanguageChip,
  },

  directives: {
    mask,
  },


  created() {
    console.log('OutCarDialog Created ()')
  },

  beforeMount() {
    console.log('OutCarDialog beforeMount ()')
    this.getCodeData()
    this.getCustData()
    this.getDriverData()
  },

  methods: {
    chkRndTrip() {
      if (this.outCarItem.rndTrip == 'TODAY') { // 당일왕복인 경우에만 실행
        if (!this.outCarItem.zone) { //  권역이 없으면 경고창 발생
          alert('권역을 먼저 선택해주세요')
          return;
        } else { // 권역 있는 경우 톨비와 기본요금 *2
          if (!this.isChangeRndTrip) { // 한번 변경됬으면 변경시키지말아야 하므로 불린값 체크
            this.outCarItem.basicCharge *= 2;
            this.outCarItem.tollCharge *= 2;
            this.isChangeRndTrip = true;
          }
        }
      } else { // 당일왕복이 아닌경우 나누기2
        console.log(this.isChangeRndTrip);
        if (this.isChangeRndTrip) { // 그런데 당일왕복 한번 클릭했던 경우에만 /2 해야되므로 불린값 체크 해줌.
          this.outCarItem.basicCharge /= 2;
          this.outCarItem.tollCharge /= 2;
          this.isChangeRndTrip = false;
        }
      }
    },
    returnRndTrip() { // 권역이 당일예약이고, 값이 변경되지 않았을때만 돌린다.
      if (this.outCarItem.rndTrip == 'TODAY' && !this.isChangeRndTrip) this.outCarItem.rndTrip = 'N'
      return;
    },
    reserveInfo() {
      if (this.reserveItem && this.dialogType == this.TYPE.RESV_TO_OCAR) {
        return `출발지 : [${this.reserveItem.departureInput}],\t도착지 : [${this.reserveItem.destInput}]\n예약 일시 : [${this.reserveItem.reservDate}],\t이용 일시 : [${this.reserveItem.useDate}]\n예약 인원 : [${this.reserveItem.passCnt || 0}],\t예약 수화물 갯수 : [${this.reserveItem.bagCnt || 0}]`
      }
      return ''
    },
    async getCodeData() {

      this.detailCodeName = await common.getDetailCodeName()
      this.groupCodeObject = await common.getCodeGroupList(['ENT_DIV', 'LANGUAGE', 'CUST_TP', 'ZONE', 'ATTACH_TYPE', 'CAL_DIV', 'PRE_DEFERRED', 'PAY_TYPE', 'CAR_TYPE']) // <= 여러 개 불러올 때
      this.orginZoneList = await common.getGroupDetailList('ZONE')
      this.zoneList = await common.getGroupDetailList('ZONE')
      this.departureList = await common.getGroupDetailList('ENT_DIV')
      this.destList = await common.getGroupDetailList('ENT_DIV')
    },

    async getCustData() {
      const response = await this.$http.get('user/selSelectCustList') // 조회성 axios 요청에서는 catch 필요가 없다. main.js 에 axios.interceptors.response.use 등록함
      let articleList = response.data
      this.custList = articleList
    },

    async getDriverData() {
      const response = await this.$http.get('user/selSelectDriverList', {params: {status: 'DRVS004'}})
      let articleList = response.data
      articleList.forEach(element => element.drvNmMobileNo = `${element.drvNm}, ${common.convertPhoneString(element.mobileNo)}`)
      this.driverList = articleList
    },

    newOutCarDialog(item) { // 입차 -> 배차하기
      this.dialogType = this.TYPE.ECAR_TO_OCAR
      this.enterCarItem = item
      // this.isChangeRndTrip = false
      this.driverMap = item.driverMap
      this.driverMap.drvNmMobileNo = `${item.driverMap.drvNm}, ${common.convertPhoneString(item.driverMap.mobileNo)}`
      this.outCarDialog = true

      this.outCarItem = Object.assign({}, this.outDefaultItem)
      this.outCarItem.entId = item.entId
      // this.outCarItem.opSeq = item.entSeq // getOpSeq 에서 가져온다. getOpSeq 는 모든 값이 셋팅된 이후 실행한다.
      this.outCarItem.dspSeq = item.entSeq
      this.outCarItem.opDate = this.$moment(new Date()).format('YYYY-MM-DD')
      this.outCarItem.drvId = item.drvId
      this.outCarItem.entDiv = item.entDiv
      this.outCarItem.departure = item.entDiv
      this.outCarItem.departureInput = this.detailCodeName[item.entDiv] // outCarItem.departure 가 watch 에 걸리지 않고, select 의 change 에 걸려있다. 이 경우 outCarItem.departure 의 값을 변경할 때가 아니라 select 에서 항목변경을 할 때 departureValueChange 등이 실행되므로 입차->배차 시 직접 값을 넣어줘야 한다.
      this.outCarItem.dest = 'ENTD004' // 입차 -> 배차인 경우 출발지는 공항이므로 목적지는 직접입력으로 설정한다.
      this.outCarItem.destInput = ''
      this.outCarItem.cover = item.cover
      this.outCarItem.entTime = item.entDt // 서버 등록용
      if (item.entDiv == 'ENTD001') {
        this.outCarItem.place = 'CAL001'
      } else if (item.entDiv == 'ENTD002') {
        this.outCarItem.place = 'CAL002'
      } else if (item.entDiv == 'ENTD003') {
        this.outCarItem.place = 'CAL003'
      }
      this.outCarItem.entDtDsp = this.convertDatetimeToTime(item.entDt) // 화면 표시용
      this.outCarItem.dspExitTime = this.$moment(new Date()).format('HH:mm')
      this.outCarItem.verNo = item.verNo // 입차정보의 상태를 '배차'로 변경하기 위해 필요
      this.outCarItem.picketSvc = 'N' // 피켓서비스는 예약 -> 배차일 경우에만 선택 가능
      this.outCarItem.attachType = 'ATTC001'   // 즉배
      this.outCarItem.preDeferred = 'PREDE001' //선불
      if (this.$refs.inputForm) {
        this.$refs.inputForm.resetValidation()
      }
      this.getOpSeq(item.driverMap)
    },

    newOutCarDialogFromResv(item) { // 예약 -> 배차하기
      this.dialogType = this.TYPE.RESV_TO_OCAR
      this.reserveItem = item


      this.outCarDialog = true

      this.outCarItem = Object.assign({}, this.outDefaultItem)
      this.outCarItem.reservId = item.reservId
      this.outCarItem.opDate = item.useDate
      this.outCarItem.opDt = `${item.useDate} ${item.useTime}`
      this.outCarItem.dspExitTime = item.reservTime
      this.outCarItem.exitDt = `${item.reservDate} ${item.reservTime}`
      this.outCarItem.departure = item.departure
      this.outCarItem.departureInput = item.departureInput
      this.outCarItem.dest = item.dest
      this.outCarItem.destInput = item.destInput
      this.outCarItem.passCnt = item.passCnt
      this.outCarItem.bagCnt = item.bagCnt
      this.outCarItem.language = item.language
      this.outCarItem.picketSvc = item.picketSvc ? 'Y' : 'N'
      this.outCarItem.picketCharge = item.picketSvc ? item.picketCharge : '0'
      this.outCarItem.place = 'CAL004' // 09.28 [?] 예약으로 배차하니까 정산지(데스크)를 예약센터로 하면 맞는지 확인 필요
      this.outCarItem.verNo = item.verNo // 입차정보의 상태를 '배차'로 변경하기 위해 필요
      this.outCarItem.attachType = 'ATTC002'   // 예약배차
      this.outCarItem.preDeferred = 'PREDE001' //선불
      if (`${item.remark2}` == 'undefined') {
        this.outCarItem.remark == ''
      } else {
        this.outCarItem.remark = `${item.remark2}`
      }
      if (this.$refs.inputForm) {
        this.$refs.inputForm.resetValidation()
      }
    },

    modifyOutCarDialog(item) {
      this.dialogType = this.TYPE.OCAR_IN_OCAR
      this.outCarItem = Object.assign({}, item)
      this.originItem = Object.assign({}, item)
      this.driverMap = item.driverMap

      this.reservingCharge = item.reservingCharge
      if (item.reservingCharge) {
        this.rentYn = true;
      } else {
        this.reservingCharge = 0;
      }

      this.outCarDialog = true

      this.outCarItem.entDtDsp = this.convertDatetimeToTime(this.outCarItem.entDt)
      this.outCarItem.dspExitTime = this.$moment(this.outCarItem.exitDt).format('HH:mm:ss')
      if (this.$refs.inputForm) {
        this.$refs.inputForm.resetValidation()
      }
    },

    dialogOutcarClose() {
      this.outCarDialog = false
      this.rentYn = false
      this.driverMap = null
    },

    selDialogClose() {
      this.resvListDialog = false
    },

    async saveOutCar() {
      if (!this.$refs.inputForm.validate()) {
        this.$emit('dialogMessage', '필수 항목을 입력해 주세요.')
        return
      }
      //debugger
      const ocarItem = this.outCarItem

      ocarItem.reservingCharge = this.reservingCharge;

      if (this.dialogType == this.TYPE.RESV_TO_OCAR) { // 예약 -> 배차
        ocarItem.drvId = this.driverMap.drvId
      } else { // 입차 -> 배차
        ocarItem.entDt = this.enterCarItem.entDt
        ocarItem.opDt = null // 서버 등록시간으로 OP_DT 를 설정한다.
        ocarItem.exitDt = null
      }
      ocarItem.preDeferred = ocarItem.preDeferred
      const response = await this.$http.post("/ocar/insOutCar", ocarItem)
      console.log(response.data)
      this.$emit('dialogClose', 'REGIST', response.data.result, response.data.message)
      socket.emit('mainRefresh', {drvId: this.outCarItem.drvId}) // 배차 관련은 대상이 명확하므로 drvId 를 추가한다.

      this.dialogOutcarClose()
    },

    async updateOutCar() {
      if (!this.$refs.inputForm.validate()) {
        this.$emit('dialogMessage', '필수 항목을 입력해 주세요.')
        return
      }
      let updItem = {}
      const ocarItem = this.outCarItem

      let tExitTime = ocarItem.exitDt
      ocarItem.exitDt = `${ocarItem.opDate} ${ocarItem.dspExitTime}`
      const oItem = this.originItem
      for (const key in ocarItem) {
        if (ocarItem[key] != oItem[key]) {
          updItem[key] = ocarItem[key]
        }
      }
      if (!ocarItem.custId) { // updItem 이 아니라 ocarItem으로 비교해야 한다. 고객이 변경되지 않을 경우에도 updItem.custId 가 undefined 이므로
        updItem.custId = -1 // 삭제를 할 때에는 null 이 들어가므로 if 조건에 걸리지 않는다. -1 이 들어갈 경우 CUST_ID 를 null 로 set 하게 된다.
      }
      // 당분간 요금관련은 무조건 넣는다.
      updItem.basicCharge = ocarItem.basicCharge
      updItem.tollCharge = ocarItem.tollCharge
      updItem.picketCharge = ocarItem.picketCharge
      updItem.parkingCharge = ocarItem.parkingCharge
      updItem.etcCharge = ocarItem.etcCharge
      updItem.reservingCharge = this.reservingCharge
      updItem.promotion = ocarItem.promotion
      updItem.supportFund = ocarItem.supportFund
      updItem.commRate = ocarItem.commRate // 아래의 watch 에서 고객을 선택할 때 값이 들어간다.

      updItem.preDeferred = ocarItem.preDeferred
      updItem.opId = ocarItem.opId
      updItem.drvId = ocarItem.drvId
      updItem.opDate = ocarItem.opDate
      updItem.opSeq = ocarItem.opSeq
      updItem.verNo = ocarItem.verNo

      console.log(updItem);


      const data = await this.$http.post("/ocar/updOutCar", updItem).catch(err => {
        ocarItem.exitDt = tExitTime
      })

      this.dialogOutcarClose()
      this.$emit('dialogClose', 'MODIFY', data.data.result)
      socket.emit('mainRefresh', {drvId: this.outCarItem.drvId})
    },

    async cancelOutCar() {
      const confirmFlag = confirm(`배차를 취소하시겠습니까?`)
      if (!confirmFlag) {
        return
      }
      let ocarItem = {
        opId: this.outCarItem.opId,
        verNo: this.outCarItem.verNo,
        entId: this.outCarItem.entId,
        reservId: this.outCarItem.reservId
      }
      const data = await this.$http.post("/ocar/cnlOutCar", ocarItem)

      this.dialogOutcarClose()
      this.$emit('dialogClose', 'CANCEL', data.data.result)
      socket.emit('mainRefresh', {drvId: this.outCarItem.drvId})
    },

    async doneOutCar() {
      const confirmFlag = confirm(`운행종료 하시겠습니까?`)
      if (!confirmFlag) {
        return
      }

      let ocarItem = {
        opId: this.outCarItem.opId,
        verNo: this.outCarItem.verNo,
        entId: this.outCarItem.entId,
        reservId: this.outCarItem.reservId
      }

      // 요금을 추가로 입력한 뒤 운행종료할 수 도 있으므로 운행종료를 하면서 요금도 update 한다.
      const outCarItem = this.outCarItem
      ocarItem.basicCharge = outCarItem.basicCharge
      ocarItem.tollCharge = outCarItem.tollCharge
      ocarItem.picketCharge = outCarItem.picketCharge
      ocarItem.parkingCharge = outCarItem.parkingCharge
      ocarItem.reservingCharge = this.reservingCharge
      ocarItem.etcCharge = outCarItem.etcCharge
      ocarItem.promotion = outCarItem.promotion
      ocarItem.supportFund = outCarItem.supportFund
      ocarItem.commRate = outCarItem.commRate
      ocarItem.zone = outCarItem.zone // 수수료 계산에 쓰이기 때문에 같이 넘겨줘야함.

      // 과금여부, 결제 수단, 선후불도 운행종료하면서 같이 저장
      ocarItem.billingYn = outCarItem.billingYn
      ocarItem.payType = outCarItem.payType
      ocarItem.preDeferred = outCarItem.preDeferred

      const data = await this.$http.post("/ocar/doneOutCar", ocarItem)

      this.dialogOutcarClose()
      this.$emit('dialogClose', 'DONE', data.data.result)
      socket.emit('mainRefresh', {drvId: this.outCarItem.drvId})
    },

    async deleteItem() {
      const confirmFlag = confirm(`배차를 삭제하시겠습니까?`)
      if (!confirmFlag) {
        return
      }
      let ocarItem = {
        opId: this.outCarItem.opId,
        verNo: this.outCarItem.verNo,
        entId: this.outCarItem.entId,
        reservId: this.outCarItem.reservId
      }
      const data = await this.$http.post("/ocar/delOutCar", ocarItem)

      this.dialogOutcarClose()
      this.$emit('dialogClose', 'DELETE', data.data.result)
      socket.emit('mainRefresh', {drvId: this.outCarItem.drvId})
    },

    setZoneOfBasicCharge(value) { // watch 에 outCarItem.zone 을 이용하지 않는다.
      // outCarItem.zone 의 값을 select 에서 선택했을 때 실행해야지 값이 변경되는 것으로 실행되어서는 안된다.
      let carType = ''
      if (this.driverMap) {
        carType = this.driverMap.carType
      } else if (this.reserveItem) {
        carType = this.reserveItem.carType
      }
      const itemLista = this.zoneList
      let item = itemLista.find(o => o.dtlCd === value)
      if (carType != 'CTY00010') {
        this.outCarItem.basicCharge = item.val1

      } else {
        this.outCarItem.basicCharge = item.val5
      }
      this.outCarItem.tollCharge = item.val2
    },

    convertDatetimeToTime(datetimeStr) {
      return this.$moment(datetimeStr).format('MM.DD. HH:mm')
    },

    departureValueChange(val) { // @change 를 이용할 때 변경된 v-model 의 값이 들어온다.
      if (val != 'ENTD004') {
        this.outCarItem.departureInput = this.detailCodeName[val]
        if (this.outCarItem.dest != 'ENTD004') {
          this.outCarItem.destInput = '' // 목적지가 직접입력이 아니었을 경우 값을 초기화 한다. 그렇지 않으면 텍스트 필드에 공항명이 그대로 남게 된다.
        }
        this.outCarItem.dest = 'ENTD004'
      }
      if ((this.outCarItem.departure == 'ENTD001' || this.outCarItem.departure == 'ENTD002') && this.outCarItem.picketSvc == 'Y') {
        this.outCarItem.picketCharge = 15000
      }
      if (this.outCarItem.departure == 'ENTD003' && this.outCarItem.picketSvc == 'Y') {
        this.outCarItem.picketCharge = 10000
      }
      if (this.outCarItem.picketSvc == 'N') {
        this.outCarItem.picketCharge = 0
      }

      switch (val) {
        case "ENTD001": {
          // 인천공항 선택시
          this.zoneList = _.filter(this.orginZoneList, {val4: 'ICN_Y'})
          this.zoneBtnList = [
            {text: 'A', value: 'A'},
            {text: 'B', value: 'B'},
            {text: 'C', value: 'C'},
            {text: 'D', value: 'D'},
            {text: 'E', value: 'E'},
          ]
        }
          break;

        case "ENTD002": {
          // 인천공항2 선택시
          this.zoneList = _.filter(this.orginZoneList, {val4: 'ICN_Y'})
          this.zoneBtnList = [
            {text: 'A', value: 'A'},
            {text: 'B', value: 'B'},
            {text: 'C', value: 'C'},
            {text: 'D', value: 'D'},
            {text: 'E', value: 'E'},
          ]
        }
          break;
        case "ENTD003": {
          // 김포공항 선택시
          this.zoneList = _.filter(this.orginZoneList, {val3: 'KIMPO_Y'})
          this.zoneBtnList = [
            {text: '미터', value: '미터'},
            {text: '단거리', value: '단거리'},
            {text: '말번', value: '말번'},
            {text: '시외', value: '시외'},
            {text: 'A', value: 'A'},
          ]
        }
          break;

        default: // 직접입력 선택시
        {
          this.zoneList = this.orginZoneList;
          this.zoneBtnList = [];
        }
          break;
      }
    },

    destValueChange(val) {
      if (val != 'ENTD004') {
        this.outCarItem.destInput = this.detailCodeName[val]
        if (this.outCarItem.departure != 'ENTD004') {
          this.outCarItem.departureInput = ''
        }
        this.outCarItem.departure = 'ENTD004'
      }
    },

    picketSvcValueChange(val) {
      console.log(`outCarItem.picketSvc : [${val}]`)
      if ((this.outCarItem.departure == 'ENTD001' || this.outCarItem.departure == 'ENTD002') && this.outCarItem.picketSvc == 'Y') {
        this.outCarItem.picketCharge = 15000;
      }
      if (this.outCarItem.departure == 'ENTD003' && this.outCarItem.picketSvc == 'Y') {
        this.outCarItem.picketCharge = 10000;
      }
      if (this.outCarItem.picketSvc == 'N') {
        this.outCarItem.picketCharge = 0;
      }
    },

    async getOpSeq(driver) {
      if (driver) {
        const response = await this.$http.post("/ecar/selNextOpSeq", {
          drvId: driver.drvId,
          entDiv: this.outCarItem.entDiv,
          entDate: this.outCarItem.opDate
        })
        if (response) {
          this.outCarItem.opSeq = response.data.opSeq
          this.outCarItem.dspSeq = response.data.entSeq
        }
      }
    },

    async getResvList(item) {
      console.log('=== GET SONG LIST DATA ===')
      this.resvListDialog = true
      let frUseDate = this.$moment(new Date()).format('YYYY-MM-DD')

      console.log(frUseDate)

      const response = await this.$http.get("/resv/selTodayResvList", {params: {frUseDate: this.$moment(new Date()).format('YYYY-MM-DD')}})
      let articleList = response.data.articleList
      this.todayResvedList = articleList
      this.selItem = Object.assign({}, this.todayResvedList)

      console.log("========== END ==========")
    },

    selectReserve(item) {

      this.outCarItem.reservId = item.reservId
      this.outCarItem.departureInput = item.departureInput
      this.outCarItem.departure = item.departure
      this.outCarItem.destInput = item.destInput
      this.outCarItem.dest = item.dest
      this.outCarItem.language = item.language
      this.outCarItem.passCnt = item.passCnt
      this.outCarItem.bagCnt = item.bagCnt
      this.outCarItem.picketCharge = item.picketCharge
      this.outCarItem.rndTrip = item.rndTrip
      this.outCarItem.preDeferred = item.preDeferred

      this.resvListDialog = false
    },
    clickZoneBtnList(item) { // 버튼 클릭시 권역 셀렉트박스 아이템 값 변경
      console.log(item);
      console.log(this.zoneList);

      let findItem = _.find(this.zoneList, ['dtlCdNm', item]);
      this.outCarItem.zone = findItem.dtlCd;
      this.setZoneOfBasicCharge(findItem.dtlCd);
    },
    toggleRent() {
      this.rentYn ? this.rentYn = false : this.rentYn = true;
    },
    changeReservingCharge(time) {
      if (time == 3) { // 3시간 대절이면
        // "대절 3시간"버튼 클릭시 대절요금 인풋박스에 금액추가(대형,모범 8만원 || 중형 6만원)
        // 다이얼로그를 공통으로 쓰고, 사용 변수가 다르기 때문에 다이얼로그마다 다른 if문을 써야함;;
        switch (this.dialogType) {
          // 예약 -> 배차
          case 1: {
            if (this.reserveItem.carType == 'CTY00030') {
              this.reservingCharge += 60000;
              return
            }
            this.reservingCharge += 80000;
          }

            break;
          // 입차 -> 배차, 배차 수정
          default: {
            if (this.driverMap.carType == 'CTY00030') {
              this.reservingCharge += 60000;
              return
            }
            this.reservingCharge += 80000;
          }
            break;
        }

      } else if (time == 1) { // 1시간 추가인 경우 차종상관없이 2만원 추가
        this.reservingCharge += 20000;
      } else { // 대절미터 버튼은 수기로 금액 입력 - 금액 초기화
        this.reservingCharge = 0;
      }
    }
  },


  computed: {
    dialogTitle() {
      if (this.dialogType == this.TYPE.ECAR_TO_OCAR || this.dialogType == this.TYPE.RESV_TO_OCAR) {
        return '배차 등록'
      } else if (this.dialogType == this.TYPE.OCAR_IN_OCAR) {
        if (this.outCarItem.rndTrip == 'TODAY') { // 수정할 아이템이 당일왕복인 경우에 불린값 true로 변경해주어야 함. 기본이 false이기 때문 ^^
          //this.isChangeRndTrip = true;
        }
        return '배차 정보 수정'
      }
      return ''
    },

    carTypeOfPassCnt() {
      let count = 0
      let array = []
      let carType = ''
      if (this.driverMap) {
        carType = this.driverMap.carType
      } else if (this.reserveItem) {
        carType = this.reserveItem.carType
      }
      if (carType == 'CTY00010') { // 대형택시
        count = 7
      } else if (carType != '') {
        count = 3
      }
      for (let i = 1; i <= count; i++) {
        array.push({text: i, value: i})
      }
      return array
    },

    carTypeOfBagCnt() {
      let count = 0
      let array = []
      let carType = ''
      if (this.driverMap) {
        carType = this.driverMap.carType
      } else if (this.reserveItem) {
        carType = this.reserveItem.carType
      }
      if (carType == 'CTY00010') { // 대형택시
        count = 7
      } else if (carType == 'CTY00020') {
        count = 4
      } else if (carType == 'CTY00030') {
        count = 3
      }
      for (let i = 0; i <= count; i++) {
        array.push({text: i, value: i})
      }
      return array
    },

    filteredDriverList() {
      let driverList = this.driverList
      if (this.reserveItem && driverList) {
        let filteredArray = driverList.filter((item) => {
          let languageFlag = this.reserveItem.language == 'LANG004'
          if (this.reserveItem.language == 'LANG001') {
            languageFlag = item.engLevel != 'LEVEL004'
          }
          if (this.reserveItem.language == 'LANG002') {
            languageFlag = item.chnLevel != 'LEVEL004'
          }
          if (this.reserveItem.language == 'LANG003') {
            languageFlag = item.jpnLevel != 'LEVEL004'
          }
          return item.carType == this.reserveItem.carType && languageFlag
        })
        return filteredArray
        // } else if (this.driverMap && driverList) {
        //   let filteredArray = driverList.filter((item) => {
        //     return item.drvId == this.driverMap.drvId
        //   })
        //   return filteredArray
      }
      return []
    },
  },

  watch: {
    // 배차->배차 로 수정화면 들어올 경우 opType 과 commRate 가 셋팅되어야 하므로 watch 에 있는 것이 적절하다.
    'outCarItem.custId'(val) {
      console.log(`outCarItem.custId : [${val}]`)
      if (val) {
        let custItem = this.custList.find(o => o.custId === val)
        this.outCarItem.opType = custItem.custTp
        this.outCarItem.commRate = custItem.rateOfComm || 10
        this.outCarItem.preDeferred = 'PREDE002' //후불로 선택
      } else {
        this.outCarItem.preDeferred = 'PREDE001' //선불로 선택
      }
    },

    'outCarItem.attachType'(val) {
      console.log(`outCarItem.attachType : [${val}]`)
      if (this.outCarItem.attachType == 'ATTC002') {
        this.getResvList()
      }

    }

    // form 의 item 을 watch 로 쓰게 되면 수정화면으로 들어갈 때 입력된 destInput 이나 deparutreInput 이 '' 로 들어가게 되므로 @change 를 이용한다.
    // 'outCarItem.departure' (val) {
    //   if (val && val != 'ENTD004') {
    //     this.outCarItem.departureInput = this.detailCodeName[val]
    //     this.outCarItem.dest = 'ENTD004'
    //     this.outCarItem.destInput = ''
    //   }
    // },

    // 'outCarItem.dest' (val) {
    //   if (val && val != 'ENTD004') {
    //     this.outCarItem.destInput = this.detailCodeName[val]
    //     this.outCarItem.departure = 'ENTD004'
    //     this.outCarItem.departureInput = ''
    //   }
    // },

  }
}
</script>
