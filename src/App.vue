<script setup lang="ts">
import axios from 'axios';
import { ref, onMounted, ComponentPublicInstance   } from 'vue'
import { useStore } from 'vuex'

import Navbar from "./components/Navbar.vue";
import NotificationManager from './components/NotificationManager.vue';

const store = useStore();


interface NavbarMethods {
  fetchCartCount: () => Promise<void>;
}
const navbarRef = ref<ComponentPublicInstance<NavbarMethods> | null>(null);

var LOGGED_IN = ref(false);
var READING_TOKEN = ref(true);

onMounted(() => {
  processToken();
});

// Set JWT Token
const setJwt = (jwt: string | null) => {
  store.dispatch('login', jwt);
};

// Set User
const setUser = (user: any | null) => {
  store.dispatch('saveUser', user);
};

const processToken = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    const storedToken = localStorage.getItem('token');
    if (token === storedToken) {
      return;
    }
    localStorage.setItem('token', token);
    window.location.href = 'https://intern.rkhl.at';
  } else {
    const localToken = localStorage.getItem('token');
    if (localToken) {
      try {
        const response = await axios.get("api/self/user-profile", { 
          headers: { 
            Accepts: "application:json", 
            Authorization: "Bearer " + localToken 
          } 
        });

        setJwt(localToken);
        LOGGED_IN.value = true;
        READING_TOKEN.value = false;
        localStorage.setItem('remoteId', response.data.data.remoteId);
        setUser(response.data.data);
        navbarRef.value?.fetchCartCount();
      } catch (error) {
        READING_TOKEN.value = false;
        console.log(error);
        setJwt(null);
      }
    } else {
      LOGGED_IN.value = false;
      READING_TOKEN.value = false;
    }
  }
};
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <div>
      <Navbar ref="navbarRef"/>
      <NotificationManager />
      <router-view v-if="LOGGED_IN"/>
      <div class="blackoutPage" v-if="!LOGGED_IN"></div>
      <div class="popout" v-if="!LOGGED_IN && READING_TOKEN">
        <div class="text-center font-bold mb-2 text-base text-red-800">Anmeldung wird überprüft</div>
        <div class="text-gray-500 mb-2">Bitte warte einen Moment, bis die Session erzeugt wurde.</div>
      </div>
      <div class="popout" v-if="!LOGGED_IN && !READING_TOKEN">
        <div class="text-center font-bold mb-2 text-base text-red-800">Du bist nicht angemeldet</div>
        <div class="text-gray-500 mb-6">Bitte benutze den RKNOE Login über den nachfolgenden Button.</div>
        <div class="flex justify-center items-center">
          <a class="bg-red-700 text-white text-base font-semibold py-1.5 px-2.5 rounded shadow hover:bg-red-800 hover:shadow-lg transition duration-150 ease-in-out" href="https://intern.rkhl.at/saml2/2209a842-3461-4241-968a-2d950ea35237/login" role="button">Zur Anmeldung</a>
        </div>
      </div>
    </div>
    <footer class="mt-auto bg-gray-800 text-white text-center p-4">
      <div>
        <p>Dieses Intranetportal wird betrieben von der Bezirksstelle Hollabrunn des Roten Kreuzes.</p>
        <a href="/team" class="text-red-400 hover:text-red-200 transition duration-150 ease-in-out">Unser Intranet-Team</a> |
        <a href="/faq" class="text-red-400 hover:text-red-200 transition duration-150 ease-in-out">Häufig gestellte Fragen (FAQ)</a> | 
        <a href="/statistik" class="text-red-400 hover:text-red-200 transition duration-150 ease-in-out">Statistik</a> |
        <a href="/dienstfuehrer" class="text-red-400 hover:text-red-200 transition duration-150 ease-in-out">Dienstführer Tools</a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.blackoutPage{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 9998;
}
.popout {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  width: 400px;
  max-width: 90%;
  padding: 20px;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.mainnav {
  padding: 30px;
  background-color: #b70e0c;
}

.mainnav a {
  color: #ffffff;
}
.mainnav a:hover {
  color: #ffffff;
}

.mainnav a.router-link-exact-active {
  font-weight: bold;
  color: #ffffff;
  text-decoration: underline;
}
</style>
