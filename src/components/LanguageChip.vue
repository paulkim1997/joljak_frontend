<template>
  <v-chip color="cyan lighten-5" outlined
          v-if="(driverItem.engLevel && driverItem.engLevel != 'LEVEL004') || (driverItem.jpnLevel && driverItem.jpnLevel != 'LEVEL004') || (driverItem.chnLevel && driverItem.chnLevel != 'LEVEL004')">
    <span v-if="driverItem.engLevel && driverItem.engLevel != 'LEVEL004'"><img class="lanicon" src="images/english.png"> {{ detailCodeName[driverItem.engLevel] }}</span>
    <span v-if="driverItem.jpnLevel && driverItem.jpnLevel != 'LEVEL004'" class="ml-1"><img class="lanicon"
                                                                                            src="images/japanese.png"/> {{ detailCodeName[driverItem.jpnLevel] }}</span>
    <span v-if="driverItem.chnLevel && driverItem.chnLevel != 'LEVEL004'" class="ml-1"><img class="lanicon"
                                                                                            src="images/chinese.png"/> {{ detailCodeName[driverItem.chnLevel] }}</span>
  </v-chip>
</template>

<script>
import common from "../plugins/common";

export default {
  props: [
    "driverItem",
  ],
  data() {
    return {
      detailCodeName: {}
    }
  },
  beforeMount() {
    this.getCodeData()
  },
  methods: {
    async getCodeData() {
      this.detailCodeName = await common.getDetailCodeName()
    }
  },
}
</script>

<style scoped>
.lanicon {
  max-height: 17px;
  margin-right: 5px;
  vertical-align: sub;
}
</style>
