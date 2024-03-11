import { createStore, Store } from "vuex";

// Define your state type
interface State {
  jwt: string | null;
  user: any | null; // Define the User type based on your user object structure
}

const store = createStore({
  state: {
    jwt: null,
    user: null,
    cartCount: 0
  },
  mutations: {
    setJwt(state, jwt) {
      state.jwt = jwt;
    },
    setUser(state, user) {
      state.user = user;
    },
    clearJwt(state) {
      state.jwt = null; // Clear the JWT token
    },
    clearUser(state) {
      state.user = null; // Clear the user data
    },

    SET_CART_COUNT(state, count) {
      state.cartCount = count;
    },
    INCREMENT_CART_COUNT(state) {
      state.cartCount++;
    }
  },
  actions: {
    login({ commit }, jwt) {
      commit("setJwt", jwt);
    },
    saveUser({ commit }, user) {
      commit("setUser", user);
    },
    logout({ commit }) {
      commit("clearJwt");
      commit("clearUser");
    },
    updateCartCount({ commit }, count) {
      commit("SET_CART_COUNT", count);
    },
    addToCart({ commit }) {
      commit("INCREMENT_CART_COUNT");
    }
  }
});

export type StoreType = Omit<Store<State>, "commit" | "getters">; // Export this type
export default store;
