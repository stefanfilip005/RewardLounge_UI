<template>
  <div class="demandtype">

    <div class="container text-center">
      <div class="row">
        <div class="col">
          

          <div class="row mb-4 mt-5">
            <div class="col">


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


              <div class="card">
                <div class="card-body">
                  <div style="float:right; margin-bottom:15px;">

                    <button type="button" class="btn btn-sm btn-secondary" v-if="sortMode == 0" @click="toggleSortMode">Sortiere nach Punkten</button>
                    <button type="button" class="btn btn-sm btn-secondary" v-if="sortMode == 1" @click="toggleSortMode">Sortiere nach Namen</button>

                    &nbsp;&nbsp;&nbsp;

                    <button type="button" class="btn btn-sm btn-secondary" v-if="!filterOnlyEmployeesWithPoints" @click="toggleFilter">Zeige nur Mitarbeiter mit +Punkten</button>
                    <button type="button" class="btn btn-sm btn-secondary" v-if="filterOnlyEmployeesWithPoints" @click="toggleFilter">Zeige alle Mitarbeiter</button>
                  </div>
                  <table class="table table-hover table-sm mt-2 mb-4">
                    <thead class="thead-dark">
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col">Email</th>
                        <th scope="col">Nachname</th>
                        <th scope="col">Vorname</th>
                        <th scope="col">Admin</th>
                        <th scope="col">Mod</th>
                        <th scope="col">Punkte</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(row, index) in employees" :key="index">
                        <td>{{ row.remoteId }}</td>
                        <td>{{ row.email }}</td>
                        <td>{{ row.lastname }}</td>
                        <td>{{ row.firstname }}</td>
                        <td><i class="fa-solid fa-star" v-if="showAdminStar(row)"></i></td>
                        <td><i class="fa-solid fa-star" v-if="row.isModerator"></i></td>
                        <td>{{ Math.floor(row.points) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>


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
import axios from 'axios';

export default defineComponent({
  name: "Employee",
  props: {},
  data() {
    return {
      filterOnlyEmployeesWithPoints: false,
      sortMode: 0,
      employees: [{
        remoteId: 0,
        email: "",
        firstname: "",
        lastname: "",
        points: 0,
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
    showAdminStar(row:any){
      return row.isAdministrator;
    },
    async toggleFilter(){
      this.page = 1;
      this.filterOnlyEmployeesWithPoints = !this.filterOnlyEmployeesWithPoints;
      await this.getEmployees(this.page);
    },
    async toggleSortMode(){
      this.sortMode = (this.sortMode+1) % 2;
      await this.getEmployees(this.page);
    },
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
      let url = '../api/employees?page='+page+'&sortMode='+this.sortMode;
      if(this.filterOnlyEmployeesWithPoints){
        url = '../api/employees?page='+page+'&hasPoints=1&sortMode='+this.sortMode;
      }
      await axios.get<any>(url).then((response) => {
        this.employees = [];
        let tmp = {};
        for(let i = 0; i < response.data.data.length; i++){
          const row = response.data.data[i];
            const obj = {
              remoteId: row.remoteId,
              email: row.email,
              firstname: row.firstname,
              lastname: row.lastname,
              points: row.points,
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
