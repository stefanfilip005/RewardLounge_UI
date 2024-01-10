<template>
  <div class="demandtype">

    <div class="container text-center">


      
      <div class="row mt-3">
        <div class="col">
            <h2>Multiplikator bei Schichtstart</h2>
            <small>Wenn eine Schicht zwischen 19:00 - 05:59 begonnen hat, dann zählen die Punkte mit dem Faktor 1,5</small>
        </div>
        <!--
        <div class="col text-right">
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#editModal">
                <i class="fas fa-edit"></i> Edit
            </button>
        </div>
        -->
      </div>

      <div class="row mt-3">
        <div class="col">

          <table class="table table-sm">
            <thead class="thead-dark">
              <tr>
                <th scope="col">Stunde</th>
                <th scope="col">00</th>
                <th scope="col">01</th>
                <th scope="col">02</th>
                <th scope="col">03</th>
                <th scope="col">04</th>
                <th scope="col">05</th>
                <th scope="col">06</th>
                <th scope="col">07</th>
                <th scope="col">08</th>
                <th scope="col">09</th>
                <th scope="col">10</th>
                <th scope="col">11</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Faktor</th>
                <td>1.5</td>
                <td>1.5</td>
                <td>1.5</td>
                <td>1.5</td>
                <td>1.5</td>
                <td>1.5</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
              </tr>
            </tbody>
          </table>

          <table class="table table-sm">
            <thead class="thead-dark">
              <tr>
                <th scope="col">Stunde</th>
                <th scope="col">12</th>
                <th scope="col">13</th>
                <th scope="col">14</th>
                <th scope="col">15</th>
                <th scope="col">16</th>
                <th scope="col">17</th>
                <th scope="col">18</th>
                <th scope="col">19</th>
                <th scope="col">20</th>
                <th scope="col">21</th>
                <th scope="col">22</th>
                <th scope="col">23</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Faktor</th>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1.5</td>
                <td>1.5</td>
                <td>1.5</td>
                <td>1.5</td>
                <td>1.5</td>
              </tr>
            </tbody>
          </table>

        </div>
      </div>


      <div class="row" v-for="(table, tableIndex) in tables" :key="tableIndex">
        <div class="col">
          <div class="alert alert-primary mt-5 text-left" role="alert">
            <strong>Dienstart: </strong> {{ table.shiftType }}
          </div>
          <table class="table table-hover table-sm mb-2">
            <thead class="thead-dark">
              <tr>
                <th scope="col">Auto</th>
                <th scope="col">Schlüssel</th>
                <th scope="col">Beschreibung</th>
                <th scope="col">Punkte pro Minute<small class="text-muted"> / pro Stunde</small></th>
                <th scope="col">Punkte pro Dienst</th>
                <th scope="col">Faktor</th>
                <th scope="col" v-if="user.isAdministrator || user.isDeveloper"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in table.demandTypes" :key="index">
                <td>{{ row.carType }}</td>
                <td>{{ row.name }}</td>
                <td>{{ row.description }}</td>
                <td><span v-if="row.pointsPerMinute != '0.00'">{{ row.pointsPerMinute }}<small class="text-muted"> / {{ Math.floor(row.pointsPerMinute*60) }}</small></span></td>
                <td><span v-if="row.pointsPerShift != '0.00'">{{ row.pointsPerShift }}</span></td>
                <td>
                  <span v-if="row.useMultiplicator === 1">
                    <i class="fas fa-check-square"></i>
                  </span>
                </td>
                <td v-if="user.isAdministrator || user.isDeveloper"><button type="button" class="btn btn-secondary" @click="fillModalContent(table,row)" data-toggle="modal" data-target="#modalEdit"><i class="fa-regular fa-edit"></i></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


    </div>

    <!-- Modal -->
    <div class="modal fade" id="modalEdit" ref="modalEdit" tabindex="-1" role="dialog" aria-labelledby="modalAddRowTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title" id="exampleModalLongTitle">
              Dienstart: <strong>[{{ selectedTable.shiftType }}]</strong> / Schlüssel: <strong>[{{ selectedRow.name }}]</strong>
            </div>
            
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <label for="description">Beschreibung</label>
                <input type="text" class="form-control" id="description" v-model="selectedRow.description">
              </div>
              <div class="form-group">
                <label for="pointsPerMinute">Punkte pro Minute</label>
                <input type="text" class="form-control" id="pointsPerMinute" v-model="selectedRow.pointsPerMinute">
              </div>
              <div class="form-group">
                <label for="pointsPerShift">Punkte pro Dienst</label>
                <input type="text" class="form-control" id="pointsPerShift" v-model="selectedRow.pointsPerShift">
              </div>
              <div class="form-group">
                <label for="pointsPerShift">Multiplikator anwenden?</label>
                <input type="text" class="form-control" id="useMultiplicator" v-model="selectedRow.useMultiplicator">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-primary" @click="saveModal" data-dismiss="modal" v-if="user.isAdministrator || user.isDeveloper">Speichern</button>
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

interface ParentTable{
  id: number,
  shiftType: string,
  demandTypes: DemandType[]
}
interface DemandType {
  carType: string,
  id: BigInteger,
  name: string,
  shiftType: string,
  description: string,
  pointsPerMinute: number,
  pointsPerShift: number,
}

export default defineComponent({
  name: "DemandType",
  computed: {
    ...mapGetters(['jwt','user']),
  },
  props: {},
  data() {
    return {
      tables: [] as any[],
      shiftType: "",
      selectedTable: {} as ParentTable,
      selectedRow: {
        id: 0,
        name: '',
        shiftType: '',
        description: '',
        pointsPerMinute: 0.00,
        pointsPerShift: 0.00,
        useMultiplicator: false,
      },
    }
  },
        methods: {
            async getDemandTypes() {
              await axios.get<any>('../api/demandtypes', { headers: { Accepts: "application:json", Authorization: "Bearer " + this.jwt } }).then((response) => {
                this.tables = []; // Reset tables variable


                let temp: ParentTable | null = null; // initiate temp variable
                for(let i = 0; i < response.data.data.length; i++){
                  response.data.data[i].carType = "";
                  if(response.data.data[i].shiftType != this.shiftType){
                    if(temp != null){
                      this.tables.push(temp);
                    }
                    temp = {
                      id: i,
                      shiftType: response.data.data[i].shiftType,
                      demandTypes: []
                    };
                    this.shiftType = response.data.data[i].shiftType;
                  }
                  if(temp != null){
                    if (["FBB"].includes(response.data.data[i].name)) {
                      response.data.data[i].carType = "BKTW";
                    }
                    if (["FNB_NEF", "NEFAZUBI"].includes(response.data.data[i].name)) {
                      response.data.data[i].carType = "NEF";
                    }
                    if (["FRB", "FRC", "SR1", "SR2"].includes(response.data.data[i].name)) {
                      response.data.data[i].carType = "RTW";
                    }
                    if (["FKB", "FKB-B", "FKC", "SK1", "SK2"].includes(response.data.data[i].name)) {
                      response.data.data[i].carType = "KTW";
                    }

                    temp.demandTypes.push(response.data.data[i]);
                  }
                }
                this.tables.push(temp);

                this.tables.forEach(table => {
                  table.demandTypes.sort((a: DemandType, b: DemandType) => {
                    if (a.carType === b.carType) {
                      return a.name.localeCompare(b.name);
                    }
                    return a.carType.localeCompare(b.carType);
                  });
                });

              }).catch((error) => {
                console.log(error);
              });
            },
            fillModalContent(table:any,row:any) {
              this.selectedTable = table;
              this.selectedRow = row;
            },
            saveModal() {
              if(this.user.isAdministrator || this.user.isDeveloper){
                axios.put('../api/demandtypes/'+this.selectedRow.id, this.selectedRow, { headers: { Accepts: "application:json", Authorization: "Bearer " + this.jwt } }).then((response) => {
                  console.log(response);
                }).catch((error) => {
                  console.log(error);
                });
              }
            },

        },
        async mounted() {
            await this.getDemandTypes();
        }
});

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
