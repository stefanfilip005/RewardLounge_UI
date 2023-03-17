<template>
  <div class="demandtype">

    <div class="container text-center">
      <div class="row">
        <div class="col">
          

          <div class="row mb-4 mt-5">
            <div class="col">
              <div class="card">
                <div class="card-body">



                </div>
              </div>
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
  name: "Ranking",
  props: {},
  data() {
    return {
      teamEmployees: [{
        remoteId: 0,
        firstname: "",
        lastname: "",
        isDeveloper: false,
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
      await axios.get<any>('../api/teamEmployees?page='+page).then((response) => {
        this.teamEmployees = [];
        let tmp = {};
        for(let i = 0; i < response.data.data.length; i++){
          const row = response.data.data[i];
          if(Math.floor(row.points) > 0){
            const obj = {
              remoteId: row.remoteId,
              firstname: row.firstname,
              lastname: row.lastname,
              isDeveloper: row.isDeveloper,
              isAdministrator: row.isAdministrator,
              isModerator: row.isModerator,
            };
            this.teamEmployees.push(obj);
          }
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
