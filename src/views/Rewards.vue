<template>
  <div class="demandtype">
    <div class="container text-center">
      <div class="row">
        <div class="col">
          <div class="row mb-4 mt-5">
            <div class="col">
              <h3>Belohnungen</h3>
              <button type="button" class="btn btn-secondary" v-if="showAddButton" data-toggle="modal" data-target="#modalEdit">
                <i class="fa-solid fa-plus"></i> Neu
              </button>

              <div class="alert alert-info mt-3" role="alert">
                Nachfolgend werden dir die verfügbaren Belohnungen angezeigt.
              </div>

              <div class="row">
                <div class="col-sm-6">
                  <div class="card " style="">
                    <img class="card-img-top" src="https://placehold.co/600x400" alt="Card image cap">
                    <div class="card-body">
                      <h5 class="card-title">Card title</h5>
                      <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                      <a href="#" class="btn btn-primary">Go somewhere</a>
                    </div>
                  </div>
                </div>
                <div class="col-sm-6">
                  <div class="card" style="">
                    <img class="card-img-top" src="https://placehold.co/600x400" alt="Card image cap">
                    <div class="card-body">
                      <h5 class="card-title">Card title</h5>
                      <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                      <a href="#" class="btn btn-primary">Go somewhere</a>
                    </div>
                  </div>
                </div>
              </div>


              <div class="card mt-4">
                <div class="card-body text-left">
                  <strong>Wie kann ich Punkte sammeln?</strong>
                  <hr/>
                  Du kannst Punkte sammeln, indem du Dienste an der Dienststelle Hollabrunn oder Haugsdorf durchführst.
                  Je nach Art des Dienstes und der Dauer werden unterschiedliche Punkte vergeben.
                  Du kannst dir die Punkteverteilung jederzeit ansehen.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <!-- Modal -->
    <div class="modal fade" id="modalEdit" ref="modalEdit" tabindex="-1" role="dialog" aria-labelledby="modalAddRowTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <div class="modal-title" id="exampleModalLongTitle">
              Belohnung bearbeiten/hinzufügen
            </div>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form>
              <div class="form-group">
                <label for="formGroupTitle">Name</label>
                <input type="text" class="form-control" id="formGroupTitle" placeholder="Belohnungsnamen eingeben">
              </div>
              <div class="form-group">
                <label for="formGroupDescription">Beschreibung</label>
                <textarea class="form-control" id="formGroupDescription"></textarea>
              </div>
              <div class="custom-file mt-3">
                <input type="file" class="custom-file-input" id="customFile">
                <label class="custom-file-label" for="customFile">Bild wählen</label>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-primary" data-dismiss="modal">Speichern</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapGetters } from 'vuex';
import axios from "axios";

export default defineComponent({
  name: "Rewards",
  props: {},
  components: {
  },
  computed: {
    ...mapGetters(['jwt','user']),
    showAddButton: function(){
      if(this.user.isAdministrator || this.user.isModerator || this.user.isDeveloper)
        return true;
      return false
    },
  },
  data() {
    return {
    }
  },
  methods: {
  },
  async mounted() {
  }
});

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
