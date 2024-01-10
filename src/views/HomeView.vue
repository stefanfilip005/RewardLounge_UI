<template>
  <div class="home">
    <div class="container text-center">
      <div class="row">
        <div class="col">
      
          <div class="row mb-4 mt-5">
            <div class="col-12 mb-3">
              <div class="card">
                <div class="card-body text-left">
                  <h3 class="card-title text-left">
                    Hallo {{  user.firstname }} {{ user.lastname }}
                  </h3>

                  <div class="text-danger mt-2 mb-4">
                    <strong>
                      Willkommen, liebe Kolleginnen und Kollegen!
                      <br/>
                      Bitte beachten Sie, dass sich unsere Webseite noch in der Testphase befindet. Wir sind aktuell dabei, die angemessene Punkteverteilung für unsere Dienste zu ermitteln.
                      <br/>
                      Beachten Sie bitte auch, dass sich die Punkteberechnung während dieser Testphase noch ändern kann.
                    </strong>
                  </div>



                  <strong>Deine Punkte: {{ Math.floor(user.points) }}</strong><br/>
                  Du bist in der Rangliste auf Platz {{ ranking.place }}<br/>
                  <small class="text-muted">Sammle noch <strong>{{ (ranking.pointsForNext == 1) ? 'einen Punkt' : ranking.pointsForNext + ' Punkte' }}</strong> um einen Platz aufzusteigen.</small><br/>
                </div>
              </div>
            </div>

            <!--
            <div class="col-12 mb-3">
              <div class="card">
                <div class="card-body text-left">
                  <h3 class="card-title text-left mb-5">Rangliste</h3>
                  <div style="width:1000px; margin:0 auto;" v-if="rankingDistribution.length > 1">
                    <div class="leftLegend text-muted">
                      Anzahl der Personen
                    </div>
                    <div :style="computeStyleForBar(row)" style="display:inline-block; margin-left: 5px; margin-right: 5px; border-top-right-radius: 7px;  border-top-left-radius: 7px;" v-for="(row,index) in rankingDistribution" :key="index"></div>
                  </div>
                  <div style="width:1000px; margin:0 auto;">
                    <div class="text-muted" style="display:inline-block; width:50px;margin-left:5px;margin-right:0px; font-size:13px; vertical-align: top;"> Punkte</div>
                    <div class="" :style="computeStyleForBarText(row)" style="height: 50px; line-height:20px; overflow:hidden; display:inline-block; margin-left: 5px; margin-right: 5px; font-size: 11px; text-align:center;" v-for="(row,index) in rankingDistribution" :key="index">
                      <div class="rotateX">
                        {{ row.uiRange }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            -->

            

            <div class="col">
              <div class="card">
                <div class="card-body">
                  <h3 class="card-title text-left">Deine Dienste</h3>

                  <div class="mb-3">
                    <div @click="prevYear" class="d-inline-block">
                      <i class="fa-solid fa-angle-left"
                        :class="{ 'text-muted': year === lowestYear }"
                        v-if="year > lowestYear">
                      </i>
                    </div>
                    &nbsp; {{ year }} &nbsp; 
                    <i class="fa-solid fa-angle-right"
                      :class="{ 'text-muted': year === highestYear }"
                      v-if="year < highestYear"
                      @click="nextYear()">
                    </i>
                  </div>

                  <table class="table table-hover table-sm mt-2 mb-4">
                    <thead class="thead-dark">
                      <tr>
                        <th scope="col">Datum</th>
                        <th scope="col">Start</th>
                        <th scope="col">Ende</th>
                        <th scope="col">Klasse</th>
                        <th scope="col">Dienststelle</th>
                        <th scope="col">Punkte</th>
                      </tr>
                    </thead>
                    <tbody v-if="shifts.length > 0">
                      <tr v-for="(row, index) in shifts" :key="index">
                        <td>{{ row.start.substring(0,10) }}</td>
                        <td>{{ row.start.substring(11,16) }}</td>
                        <td>{{ row.end.substring(11,16) }}</td>
                        <td>{{ row.demandType }}</td>
                        <td>{{ (row.location == 166) ? "Krisenintervention RKNÖ" : (row.location == 38) ? "Hollabrunn" : (row.location == 39) ? "Haugsdorf" : "unbekannt" }}</td>
                        <td>{{ Math.floor(row.points) }}</td>
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

                  {{ shifts }}

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
import { defineComponent } from 'vue';
import { mapGetters } from 'vuex';
import axios from 'axios';

export default defineComponent({
  name: 'MyHome',
  computed: {
    ...mapGetters(['jwt','user']),
  },
  props: {},
  components: {
  },
  data() {
    return {
      shifts: [],
      year: 2024,
      lowestYear: 2023,
      highestYear:2024,
      rankingDistribution: [] as any[],
      page: 1,
      meta: {
        current_page: 1,
        last_page: 1,
      },
      ranking: {
        place: 0,
        points: 0,
        pointsForNext: 0,
      },
    }
  },
  methods: {
    computeStyleForBar(bar:any){
      let maximum = 0;
      for(let i = 0; i < this.rankingDistribution.length; i++){
        maximum = Math.max(maximum,this.rankingDistribution[i].count);
      }
      return {
        'background-color': (bar.colorize) ? '#b70e0c' : 'gray',
        width: ((940 - (this.rankingDistribution.length*10)) / this.rankingDistribution.length) + "px",
        height: 150 / maximum * bar.count + "px"
      }
    },
    computeStyleForBarText(bar:any){
      return {
        width: ((940 - (this.rankingDistribution.length*10)) / this.rankingDistribution.length) + "px",
      }
    },
    async pageFirst(){
      this.page = 1;
      await this.getShifts(this.page);
    },
    async pageLast(){
      this.page = this.meta.last_page;
      await this.getShifts(this.page);
    },
    async pagePrev(){
      this.page = Math.max(1,this.page-1);
      await this.getShifts(this.page);
    },
    async pageNext(){
      this.page = Math.min(this.meta.last_page,this.page+1);
      await this.getShifts(this.page);
    },

    async prevYear() {
      console.log("Previous", this.year, this.lowestYear);
      this.year = Math.max(this.lowestYear, this.year - 1);
      await this.getShifts(this.page);
    },
    async nextYear(){
      this.year = Math.min(this.highestYear,this.year+1);
      await this.getShifts(this.page);
    },

    async getRanking(page:number) {
      await axios.get<any>('../api/self/ranking?page='+page, { headers: { Accepts: "application:json", Authorization: "Bearer " + this.jwt } }).then((response) => {
        this.ranking = response.data.data;
        this.getRankingDistribution();
      }).catch((error) => {
        console.log(error);
      });
    },

    async getRankingDistribution() {
      await axios.get<any>('../api/rankingDistribution', { headers: { Accepts: "application:json", Authorization: "Bearer " + this.jwt } }).then((response) => {
        this.rankingDistribution = response.data.data;
        for(let i = 0; i < this.rankingDistribution.length; i++){
          this.rankingDistribution[i].colorize = false;
          if(i == this.rankingDistribution.length -1){
            this.rankingDistribution[i].uiRange = "> " + this.rankingDistribution[i].limit;
            if(this.ranking.points >= this.rankingDistribution[i].limit){
              this.rankingDistribution[i].colorize = true;
            }
          }else{
            this.rankingDistribution[i].uiRange = this.rankingDistribution[i].limit + " - " + this.rankingDistribution[i+1].limit;
            if(this.ranking.points >= this.rankingDistribution[i].limit && this.ranking.points < this.rankingDistribution[i+1].limit){
              this.rankingDistribution[i].colorize = true;
            }
          }
        }
      }).catch((error) => {
        console.log(error);
      });
    },

    async getShifts(page:number) {
      this.shifts =  [];
      this.page = 1;
      this.meta = {
        current_page: 1,
        last_page: 1,
      };
      await axios.get<any>('../api/self/shifts?year='+this.year+'&page='+page, { headers: { Accepts: "application:json", Authorization: "Bearer " + this.jwt } }).then((response) => {
        this.shifts = response.data.data;
        this.meta = response.data.meta;
      }).catch((error) => {
        console.log(error);
      });
    },
  },
  async mounted() {
    await this.getShifts(this.page);
    await this.getRanking(1);
  }
});
</script>


<style>
.leftLegend {
  transform: translateY(100%) rotate(-90deg);
  width: 170px;
  height: 30px;
  font-size: 13px;
  line-height: 40px;
  text-align: center;
  transform-origin: top left;
  margin-left: 5px;
  margin-right: -120px;
  display: inline-block;
  padding-left: 0px;
}
</style>
