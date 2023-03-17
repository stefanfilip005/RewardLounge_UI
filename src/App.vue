<template>
  <nav class="mainnav" v-if="LOGGED_IN">
    <router-link to="/">Übersicht</router-link> | 
    <span v-if="showEmployeeLink"><router-link to="/employee">Mitarbeiter</router-link> | </span>
    <router-link to="/demandtype">Klassifizierung</router-link> |
    
  </nav>
  <router-view v-if="LOGGED_IN"/>



  
  <div class="blackoutPage" v-if="!LOGGED_IN"></div>
  <div class="popout" v-if="!LOGGED_IN && READING_TOKEN">
    <h3>Anmeldung wird überprüft</h3>
    Bitte warte einen Moment, bis die Session erzeugt wurde.
  </div>
  <div class="popout" v-if="!LOGGED_IN && !READING_TOKEN">
    <h3>Du bist nicht angemeldet</h3>
    Bitte benutze den RKNOE Login über den nachfolgenden Button.
    <br/><br/>
    <a class="btn btn-danger" href="https://intern.rkhl.at/saml2/2209a842-3461-4241-968a-2d950ea35237/login" role="button">Zur Anmeldung</a>
  </div>

  <footer class="footer mt-auto py-3 bg-dark">
    <div class="container">
      <ul class="nav justify-content-center text-muted">
        <li class="nav-item"><router-link to="/team" class="nav-link px-2 text-muted">Unser Team &nbsp;&nbsp;/</router-link></li>
        <li class="nav-item"><router-link to="/faq" class="nav-link px-2 text-muted">FAQ</router-link></li>
      </ul>
    </div>
  </footer>

</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapGetters } from 'vuex';
import axios from "axios";

export default defineComponent({
  name: "MyApp",
  props: {},
  components: {
  },
  computed: {
    ...mapGetters(['jwt','user']),
    showRankingLink: function(){
      if(!this.user.isAdministrator && ! this.user.isModerator)
        return true;
      return true
    },
    showEmployeeLink: function(){
      if(this.user.isAdministrator || this.user.isModerator || this.user.isDeveloper)
        return true;
      return false
    },
  },
  data: function () {
    return {
      READING_TOKEN: true,
      LOGGED_IN: false,
    };
  },
  //created: function () {},
  mounted: function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      const newUrl = window.location.href.replace(`?token=${token}`, '');
      window.location.href = newUrl;
    }else{
      const localToken = localStorage.getItem('token');
      if (localToken) {
        const res = axios.get("api/self/user-profile", { headers: { Accepts: "application:json", Authorization: "Bearer " +localToken } }).then((response) => {
          this.setJwt(localToken);
          this.LOGGED_IN = true;
          this.READING_TOKEN = false;
          this.setUser(response.data.data);
        }).catch(error => {
          this.READING_TOKEN = false;
          console.log(error);
          this.setJwt(null);
        });
      }else{
        this.READING_TOKEN = false;
      }
    }
  },
  methods: {
    ...mapActions(['login','saveUser']),
    setJwt(jwt: string | null) {
      this.login(jwt);
    },
    setUser(user: any | null) {
      this.saveUser(user);
    },
  },
});
</script>

<style>
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
