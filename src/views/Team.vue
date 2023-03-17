<template>
  <div class="demandtype">

    <div class="container text-center">
      <div class="row">
        <div class="col">
          

          <div class="row mb-4 mt-5">
            <div class="col">
              <h3>Unser Intranet-Team</h3>

                  <table class="table table-hover table-sm mt-4 mb-4">
                    <thead class="thead-dark">
                      <tr>
                        <th scope="col">Email</th>
                        <th scope="col">Nachname</th>
                        <th scope="col">Vorname</th>
                        <th scope="col">Administrator</th>
                        <th scope="col">Moderator</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, index) in employees" :key="index">
                        <td>{{ row.email }}</td>
                        <td>{{ row.lastname }}</td>
                        <td>{{ row.firstname }}</td>
                        <td><i class="fa-solid fa-star" v-if="row.isAdministrator"></i></td>
                        <td><i class="fa-solid fa-star" v-if="row.isModerator"></i></td>
                      </tr>
                    </tbody>
                  </table>

                  <nav aria-label="Page navigation example">
                    <ul class="pagination justify-content-center">
                      <li class="page-item" :class="{'disabled': meta.current_page <= 1}">
                        <a class="page-link" href="#" @click="pagePrev">Previous</a>
                      </li>
                      <li class="page-item" v-if="meta.current_page > 1" @click="pageFirst"><a class="page-link" href="#">1</a></li>

                      <li class="page-item disabled" v-if="meta.current_page > 2"><a class="page-link" href="#">...</a></li>
                      <li class="page-item disabled"><a class="page-link" href="#">{{ meta.current_page }}</a></li>
                      <li class="page-item disabled" v-if="meta.current_page < meta.last_page-1"><a class="page-link" href="#">...</a></li>

                      <li class="page-item" v-if="meta.current_page < meta.last_page" @click="pageLast"><a class="page-link" href="#">{{ meta.last_page }}</a></li>

                      <li class="page-item" :class="{'disabled': meta.current_page >= meta.last_page}">
                        <a class="page-link" href="#" @click="pageNext">Next</a>
                      </li>
                    </ul>
                  </nav>

            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters } from 'vuex';
import axios from 'axios';

export default defineComponent({
  name: "Team",
  props: {},
  computed: {
    ...mapGetters(['jwt','user']),
  },
  data() {
    return {
      employees: [{
        email: "",
        firstname: "",
        lastname: "",
        isAdministrator: false,
        isModerator: false,
      }],
      page: 1,
      meta: {
        current_page: 1,
        last_page: 1,
      },
    }
  },
  methods: {
    async pageFirst(){
      this.page = 1;
      await this.getEmployees(this.page);
    },
    async pageLast(){
      this.page = this.meta.last_page;
      await this.getEmployees(this.page);
    },
    async pagePrev(){
      this.page = Math.max(1,this.page-1);
      await this.getEmployees(this.page);
    },
    async pageNext(){
      this.page = Math.min(this.meta.last_page,this.page+1);
      await this.getEmployees(this.page);
    },
    async getEmployees(page:number) {
      await axios.get<any>('../api/teamEmployees?page='+page, { headers: { Accepts: "application:json", Authorization: "Bearer " + this.jwt } }).then((response) => {
        this.employees = [];
        let tmp = {};
        for(let i = 0; i < response.data.data.length; i++){
          const row = response.data.data[i];
            const obj = {
              email: row.email,
              firstname: row.firstname,
              lastname: row.lastname,
              isAdministrator: row.isAdministrator,
              isModerator: row.isModerator,
            };
            this.employees.push(obj);
        }

        this.meta = response.data.meta;
      }).catch((error) => {
        console.log(error);
      });
    },
  },
  async mounted() {
    await this.getEmployees(this.page);
  }
});

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
