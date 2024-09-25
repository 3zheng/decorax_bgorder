import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userid: 1,
  },
  getters: {
    getUserID(state) {
      return state.userid;
    },
  },
  mutations: {
    updateUserID(state, userid) {
      state.userid = userid;
    },
  },
  actions: {
    async asyncUserID(context, userid) {
      context.commit('updateUserID', userid);
    },
  },
  modules: {
  }
})
