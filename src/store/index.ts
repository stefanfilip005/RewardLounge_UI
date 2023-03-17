import { createStore } from "vuex";

export default createStore({
  state: {
    jwt: null as string | null,
    user: null as any | null
  },
  getters: {
    jwt: (state) => state.jwt,
    user: (state) => state.user
  },
  mutations: {
    setJwt(state, jwt: string) {
      state.jwt = jwt;
    },
    setUser(state, user: any) {
      state.user = user;
    }
  },
  actions: {
    login({ commit }, jwt: string) {
      commit("setJwt", jwt);
    },
    saveUser({ commit }, user: any) {
      commit("setUser", user);
    }
  },
  modules: {}
});
