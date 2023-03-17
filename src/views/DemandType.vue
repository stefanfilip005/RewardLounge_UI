<template>
  <div class="demandtype">

    <div class="container text-center">


      <div class="row" v-for="(table, tableIndex) in tables" :key="tableIndex">
        <div class="col">
          <div class="alert alert-primary mt-5 text-left" role="alert">
            <strong>Dienstart: </strong> {{ table.shiftType }}
          </div>
          <table class="table table-hover table-sm mb-2">
            <thead class="thead-dark">
              <tr>
                <th scope="col">Schlüssel</th>
                <th scope="col">Beschreibung</th>
                <th scope="col">Punkte pro Minute<small class="text-muted"> / pro Stunde</small></th>
                <th scope="col">Punkte pro Dienst</th>
                <th scope="col" v-if="user.isAdministrator || user.isDeveloper"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in table.demandTypes" :key="index">
                <td>{{ row.name }}</td>
                <td>{{ row.description }}</td>
                <td>{{ row.pointsPerMinute }}<small class="text-muted"> / {{ Math.floor(row.pointsPerMinute*60) }}</small></td>
                <td>{{ row.pointsPerShift }}</td>
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
      },
    }
  },
        methods: {
            async getDemandTypes() {
              await axios.get<any>('../api/demandtypes').then((response) => {
                this.tables = []; // Reset tables variable


                let temp: ParentTable | null = null; // initiate temp variable
                for(let i = 0; i < response.data.data.length; i++){
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
                    temp.demandTypes.push(response.data.data[i]);
                  }
                }
                this.tables.push(temp);
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
                axios.put('../api/demandtypes/'+this.selectedRow.id, this.selectedRow).then((response) => {
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
