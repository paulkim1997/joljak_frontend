<template>
  <v-container fluid grid-list-xl class="pa-0">
    <v-layout v-if="groupCodeList != null">
      <v-flex sm6 xs12>
        <v-card>
          <v-toolbar color="teal" dark>
            <v-toolbar-title>그룹코드 목록</v-toolbar-title>
            <v-divider vertical inset class="mx-4"/>
            <v-text-field v-model="searchGrpCd" flat hide-details prepend-inner-icon="search" color="white"
                          label="그룹코드 또는 코드명 검색"></v-text-field>
            <v-spacer></v-spacer>
            <v-btn icon @click="newGroupCodeDialog()">
              <v-icon>playlist_add</v-icon>
            </v-btn>
          </v-toolbar>
          <v-list two-line style="height:calc(100vh - 192px)" class="overflow-y-auto">
            <template v-for="(item, index) in filteredItems">
              <v-list-item
                :key="item.grpCd"
                @click="selectGroupCode(item)"
                @mouseover="showByGroupIndex = index"
                @mouseleave="showByGroupIndex = null"
              >
                <v-list-item-avatar color="teal darken-3">
                  <span>{{ index + 1 }}</span>
                </v-list-item-avatar>
                <v-list-item-action>
                  <v-icon v-if="selectedGroup === item.grpCd">check</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>[ {{ item.grpCd }} ]</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ item.grpCdNm }}<br>
                    {{ detailCodeName[item.status] }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-btn icon ripple v-if="showByGroupIndex === index" @click="editGroupCodeDialog(item, index)">
                    <v-icon color="grey lighten-1">edit</v-icon>
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
              <v-divider v-if="index < groupCodeList.length - 1" :key="'divider_' + item.grpCd"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-flex>
      <v-flex sm6 xs12>
        <v-card>
          <v-toolbar color="cyan" dark>
            <v-btn v-if="detailCodeList != null" color="cyan darken-2" :dark="false"
                   @click.native="showReorderDialog()">
              <v-icon>reorder</v-icon>
              <v-icon>swap_vert</v-icon>
              Reorder
            </v-btn>
            <v-toolbar-title><span
              v-if="detailCodeList != null">[ {{ selectedGroup }} : {{ selectedGroupName }} ] </span>상세코드 목록
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn v-if="detailCodeList != null" icon @click="newDetailCodeDialog()">
              <v-icon>playlist_add</v-icon>
            </v-btn>
          </v-toolbar>
          <v-list two-line style="height:calc(100vh - 212px)" class="overflow-y-auto">
            <template v-for="(item, index) in detailCodeList">
              <v-list-item :key="item.dtlCd" @click="editDetailCodeDialog(item, index)">
                <v-list-item-avatar color="cyan darken-3">
                  <span>{{ index + 1 }}</span>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>[ {{ item.dtlCd }} ] - {{ item.dtlCdNm }}</v-list-item-title>
                  <v-list-item-subtitle>
                    VAL1: {{ ifNullText(item.val1) }}, VAL2: {{ ifNullText(item.val2) }}, VAL3: {{ ifNullText(item.val3)
                    }}<br>
                    {{ detailCodeName[item.status] }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-divider v-if="index < detailCodeList.length - 1" :key="'divider_' + item.dtlCd"></v-divider>
            </template>
          </v-list>
        </v-card>
      </v-flex>
      <v-dialog persistent v-model="reorderDialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ reorderTitle }} Reorder</span>
            <v-spacer></v-spacer>
            <v-btn fab ripple small outlined color="deep-orange lighten-1" :disabled="selectedReorderIndex == null">
              <v-icon @click="itemOrder(-1)">arrow_upward</v-icon>
            </v-btn>
            <v-btn class="ml-2" fab ripple small outlined color="light-blue lighten-1"
                   :disabled="selectedReorderIndex == null">
              <v-icon @click="itemOrder(1)">arrow_downward</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-list style="height:calc(100vh - 232px)" class="overflow-y-auto">
            <template v-for="(item, index) in reorderList">
              <v-list-item :key="'reorder_tile_' + item.dtlCd" @click="selectReorderItem(index)">
                <v-list-item-avatar :color="selectedReorderIndex === index ? 'cyan darken-3' : ''">
                  <v-icon v-if="selectedReorderIndex === index">check</v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>[ {{ item.dtlCd }} ] - {{ item.dtlCdNm }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider v-if="index < reorderList.length - 1" :key="'reorder_divider_' + item.dtlCd"></v-divider>
            </template>
          </v-list>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn color="primary" outlined @click="reorderClose()">Close</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="warning" outlined @click="reorderSave()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog persistent v-model="editGroupDialog" max-width="650px">
        <v-card>
          <v-card-title>
            <span class="headline">그룹 코드</span>
          </v-card-title>
          <v-form ref="inputForm1" lazy-validation>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex md12>
                    <v-text-field v-model="editGroupCode.newCd" :rules="rules.requireRules" label="Input group code"
                                  :readonly="editedIndex > -1"></v-text-field>
                  </v-flex>
                  <v-flex md12>
                    <v-text-field v-model="editGroupCode.grpCdNm" :rules="rules.requireRules"
                                  label="Input group name"></v-text-field>
                  </v-flex>
                  <v-flex md12>
                    <v-radio-group v-model="editGroupCode.status" :rules="rules.requireRules" color="orange" row>
                      <template v-for="(item, index) in codeStatusList">
                        <v-radio v-if="item.dtlCd" :label="item.dtlCdNm" :value="item.dtlCd"
                                 :key="'statusSelect_' + index"/>
                      </template>
                    </v-radio-group>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-btn color="warning" outlined @click.native="groupCodeDialogClose()">닫기</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" outlined @click.native="saveGroupCode()">저장</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog persistent v-model="editDetailDialog" max-width="650px">
        <v-card>
          <v-card-title>
            <span class="headline">상세 코드</span>
          </v-card-title>
          <v-form ref="inputForm2" lazy-validation>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout wrap>
                  <v-flex md12>
                    <v-text-field v-model="editDetailCode.grpCd" label="Group code" readonly></v-text-field>
                  </v-flex>
                  <v-flex md12>
                    <v-text-field v-model="editDetailCode.newCd" label="Input detail code"
                                  :rules="rules.requireRules"></v-text-field>
                  </v-flex>
                  <v-flex md12>
                    <v-text-field v-model="editDetailCode.dtlCdNm" label="Input detail name"
                                  :rules="rules.requireRules"></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editDetailCode.val1" label="Input VAL 1"></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editDetailCode.val2" label="Input VAL 2"></v-text-field>
                  </v-flex>
                  <v-flex md4>
                    <v-text-field v-model="editDetailCode.val3" label="Input VAL 3"></v-text-field>
                  </v-flex>
                  <v-flex md12>
                    <v-radio-group v-model="editDetailCode.status" :rules="rules.requireRules" color="orange" row>
                      <template v-for="(item, index) in codeStatusList">
                        <v-radio v-if="item.dtlCd" :label="item.dtlCdNm" :value="item.dtlCd"
                                 :key="'statusSelect_' + index"/>
                      </template>
                    </v-radio-group>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
          </v-form>
          <v-card-actions>
            <v-btn color="warning" outlined @click.native="detailCodeDialogClose()">닫기</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" outlined @click.native="saveDetailCode()">저장</v-btn>
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

export default {
  data: () => ({
    rules,

    searchGrpCd: '',
    groupCodeList: null,
    detailCodeList: null,
    codeStatusList: null,
    detailCodeName: common.detailCodeName,

    showByGroupIndex: null,

    selectedGroup: '',
    selectedGroupItem: {},
    selectedGroupName: '',
    selectedCode: '',
    selectedCodeName: '',

    editGroupDialog: false,
    editDetailDialog: false,
    defaultGroupCode: {
      grpCd: '',
      grpCdNm: '',
      newCd: '',
      verNo: 0
    },
    editGroupCode: {},
    defaultDetailCode: {
      grpCd: '',
      dtlCd: '',
      dtlCdNm: '',
      newCd: '',
      val1: '',
      val2: '',
      val3: '',
      dtlOrder: 0,
      verNo: 0
    },
    editDetailCode: {},
    editedIndex: -1,
    originItem: {},

    reorderDialog: false,
    reorderTitle: '',
    reorderList: [],
    selectedReorderIndex: null,

    snackbarItem: false,
    snackbarText: '',
  }),

  beforeCreate() {
    this.editGroupCode = Object.assign({}, this.defaultGroupCode)
  },

  mounted() {
    this.selGroupCodeList()
    this.getStatusCodeList()
  },

  updated() {
  },

  methods: {
    async getStatusCodeList() {
      this.detailCodeName = await common.getDetailCodeName()
      this.codeStatusList = await common.getGroupDetailList('CODE_STATUS')
    },
    async selGroupCodeList() {
      const data = await this.$http.get("/code/selGroupCodeList")
      this.groupCodeList = data.data
    },

    async selDetailCodeList() {
      let grpCd = this.selectedGroup
      const data = await this.$http.get(`/code/selDetailCodeList/${grpCd}`)
      let detailCodeList = data.data
      return detailCodeList
    },

    async selectGroupCode(item) {
      this.selectedGroup = item.grpCd
      this.selectedGroupName = item.grpCdNm
      this.selectedGroupItem = item
      let detailCodeList = item.detailCodeList
      if (detailCodeList == null) {
        let codeList = await this.selDetailCodeList()
        this.detailCodeList = codeList
        item.detailCodeList = codeList
      } else {
        this.detailCodeList = detailCodeList
      }
    },

    newGroupCodeDialog() {
      this.editGroupDialog = true
      this.editedIndex = -1
      this.editGroupCode = Object.assign({}, this.defaultGroupCode)

      if (this.$refs.inputForm1) {
        this.$refs.inputForm1.resetValidation()
      }
    },

    editGroupCodeDialog(item, index) {
      this.editGroupDialog = true
      this.editedIndex = index
      this.editGroupCode = Object.assign({}, item)
      this.editGroupCode.newCd = item.grpCd
      this.originItem = Object.assign({}, item)

      if (this.$refs.inputForm1) {
        this.$refs.inputForm1.resetValidation()
      }
    },

    groupCodeDialogClose() {
      this.editGroupDialog = false
      this.editGroupCode = Object.assign({}, this.defaultGroupCode)
    },

    newDetailCodeDialog() {
      this.editDetailDialog = true
      this.editedIndex = -1
      this.editDetailCode = Object.assign({}, this.defaultDetailCode)
      this.editDetailCode.grpCd = this.selectedGroup
      this.editDetailCode.newCd = this.selectedGroup

      if (this.$refs.inputForm2) {
        this.$refs.inputForm2.resetValidation()
      }
    },

    editDetailCodeDialog(item, index) {
      this.editDetailDialog = true
      this.editedIndex = index
      this.editDetailCode = Object.assign({}, item)
      this.editDetailCode.newCd = item.dtlCd
      this.originItem = Object.assign({}, item)

      if (this.$refs.inputForm2) {
        this.$refs.inputForm2.resetValidation()
      }
    },

    detailCodeDialogClose() {
      this.editDetailDialog = false
      this.editDetailCode = Object.assign({}, this.defaultDetailCode)
    },

    showReorderDialog() {
      this.reorderDialog = true
      this.reorderList = this.detailCodeList
      this.reorderTitleString = `[ ${this.selectedGroup} : ${this.selectedGroupName} ]`
    },

    selectReorderItem(index) {
      this.selectedReorderIndex = index
    },

    itemOrder(value) {
      let index = this.selectedReorderIndex
      let nextIndex = index + value
      let tempList = JSON.parse(JSON.stringify(this.reorderList))
      if (nextIndex >= 0 && nextIndex < tempList.length) {
        let nItem = tempList[nextIndex]
        let mItem = tempList[index]
        tempList[index] = nItem
        tempList[nextIndex] = mItem
        this.reorderList = JSON.parse(JSON.stringify(tempList))
        this.selectedReorderIndex = nextIndex
      }
    },

    async reorderSave() {
      this.detailCodeList = this.reorderList
      let sendOrderingList = []
      for (const i in this.reorderList) {
        const item = this.reorderList[i]
        const order = parseInt(i) + 1
        item.dtlOrder = order
        sendOrderingList.push({grpCd: item.grpCd, dtlCd: item.dtlCd, dtlOrder: order, verNo: item.verNo})
      }
      const data = await this.$http.post("/code/updCodeOrdering", sendOrderingList)
      this.selectedGroupItem.detailCodeList = this.detailCodeList
      this.reorderClose()
    },

    reorderClose() {
      this.selectedReorderIndex = null
      this.reorderDialog = false
    },

    saveGroupCode() {
      if (!this.$refs.inputForm1.validate()) {
        this.showSnackbar('필수 항목을 입력해 주세요.')
        return
      }

      if (this.editedIndex > -1) { // 수정하기
        this.updGroupCode()
      } else { // 등록하기
        this.insGroupCode()
      }
    },

    saveDetailCode() {
      if (!this.$refs.inputForm2.validate()) {
        this.showSnackbar('필수 항목을 입력해 주세요.')
        return
      }

      if (this.editedIndex > -1) { // 수정하기
        this.updDetailCode()
      } else { // 등록하기
        this.insDetailCode()
      }
    },

    ifNullText(text) {
      return text ? text : ' '
    },

    async insGroupCode() {
      const searchCode = this.editGroupCode.newCd
      for (const item of this.groupCodeList) {
        if (item.grpCd == searchCode) {
          alert('이미 등록된 코드입니다.')
          return
        }
      }
      let sendNewItem = this.editGroupCode
      const data = await this.$http.post("/code/insGroupCode", sendNewItem)
      this.selGroupCodeList()
      this.groupCodeDialogClose()
    },

    async updGroupCode() {
      let updateItem = {
        grpCd: this.selectedGroup,
        verNo: this.editGroupCode.verNo
      }
      if (this.originItem.grpCd != this.editGroupCode.newCd && this.editGroupCode.newCd != "") {
        for (const item of this.groupCodeList) {
          if (item.grpCd == this.editGroupCode.newCd) {
            alert('이미 등록된 코드입니다.')
            return
          }
        }
        updateItem.newCd = this.editGroupCode.newCd
      }
      if (this.originItem.grpCdNm != this.editGroupCode.grpCdNm) {
        updateItem.grpCdNm = this.editGroupCode.grpCdNm
      }
      if (this.originItem.status != this.editGroupCode.status) {
        updateItem.status = this.editGroupCode.status
      }

      const data = await this.$http.post("/code/updGroupCode", updateItem)

      this.selGroupCodeList()
      this.groupCodeDialogClose()
    },

    async insDetailCode() {
      const searchCode = this.editDetailCode.newCd
      for (const item of this.detailCodeList) {
        if (item.dtlCd == searchCode) {
          alert('이미 등록된 코드입니다.')
          return
        }
      }
      let sendNewItem = this.editDetailCode
      const data = await this.$http.post("/code/insDetailCode", sendNewItem)
      let codeList = await this.selDetailCodeList()
      this.detailCodeList = codeList
      this.selectedGroupItem.detailCodeList = codeList
      this.detailCodeDialogClose()
    },

    async updDetailCode() {
      let updateItem = {
        grpCd: this.editDetailCode.grpCd,
        dtlCd: this.editDetailCode.dtlCd,
        verNo: this.editDetailCode.verNo
      }
      if (this.originItem.dtlCd != this.editDetailCode.newCd && this.editDetailCode.newCd != "") {
        for (const item of this.detailCodeList) {
          if (item.dtlCd == this.editDetailCode.newCd) {
            alert('이미 등록된 코드입니다.')
            return
          }
        }
        updateItem.newCd = this.editDetailCode.newCd
      }
      if (this.originItem.dtlCdNm != this.editDetailCode.dtlCdNm) {
        updateItem.dtlCdNm = this.editDetailCode.dtlCdNm
      }
      if (this.originItem.val1 != this.editDetailCode.val1) {
        updateItem.val1 = this.editDetailCode.val1
      }
      if (this.originItem.val2 != this.editDetailCode.val2) {
        updateItem.val2 = this.editDetailCode.val2
      }
      if (this.originItem.val3 != this.editDetailCode.val3) {
        updateItem.val3 = this.editDetailCode.val3
      }
      if (this.originItem.status != this.editDetailCode.status) {
        updateItem.status = this.editDetailCode.status
      }

      const data = await this.$http.post("/code/updDetailCode", updateItem)

      let codeList = await this.selDetailCodeList()
      this.detailCodeList = codeList
      this.selectedGroupItem.detailCodeList = codeList
      this.detailCodeDialogClose()
    },

    showSnackbar(text) {
      this.snackbarText = text
      this.snackbarItem = true
    },

  },

  computed: {
    filteredItems() {
      if (this.searchGrpCd) {
        let search = this.searchGrpCd.toUpperCase()
        let fitems = this.groupCodeList.filter((item) => {
          return item.grpCd.indexOf(search) > -1 || item.grpCdNm.indexOf(search) > -1
        })
        return fitems
      } else {
        return this.groupCodeList
      }
    },
  },

  watch: {
    selectedGroup(val) {
      for (const i in this.groupCodeList) {
        const item = this.groupCodeList[i]
        if (item.grpCd === val) {
          this.selectedGroupName = item.grpCdNm
        }
      }
    },

    editGroupDialog(val) {
      val || this.groupCodeDialogClose()
    }
  }
}
</script>
