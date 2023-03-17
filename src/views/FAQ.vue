<template>
  <div class="demandtype">
    <div class="container text-center">
      <div class="row">
        <div class="col">
          <div class="row mb-4 mt-5">
            <div class="col">
              <h3>Häufig gestellte Fragen</h3>
              <div class="card mt-4">
                <div class="card-body text-left">
                  <strong>Wie kann ich Punkte sammeln?</strong>
                  <hr/>
                  Du kannst Punkte sammeln, indem du Dienste an der Dienststelle Hollabrunn oder Haugsdorf durchführst.
                  Je nach Art des Dienstes und der Dauer werden unterschiedliche Punkte vergeben.
                  Du kannst dir die Punkteverteilung jederzeit ansehen.
                </div>
              </div>
              <div class="card mt-4">
                <div class="card-body text-left">
                  <strong>Wofür kann ich meine gesammelten Punkte verwenden?</strong>
                  <hr/>
                  Die gesammelten Punkte können gegen verschiedene Goodies eingetauscht werden. 
                  Beispielsweise kann es möglich werden, über die Dienststelle HAIX-Schuhe zu bestellen. 
                  Außerdem können die Punkte für die Teilnahme an kostenpflichtigen Fortbildungen an externen Dienststellen verwendet werden, wobei die Kosten von der Dienststelle übernommen werden. 
                  Wenn du Ideen für weitere Goodies hast, dann melde dich bei uns.
                </div>
              </div>
              <div class="card mt-4">
                <div class="card-body text-left">
                  <strong>Warum sind meine Punkte nicht aktuell?</strong>
                  <hr/>
                  Die Punkte werden einmal täglich in der Nacht aktualisiert, wobei der aktuelle Tag nicht berücksichtigt wird. 
                  Wenn du der Meinung bist, dass deine Punkte nicht korrekt sind, kannst du dich gerne an unser Team wenden.
                  Wir werden die Anfrage prüfen und gegebenenfalls eine Aktualisierung deiner Punkte vornehmen.
                </div>
              </div>
              <div class="card mt-4">
                <div class="card-body text-left">
                  <strong>Warum wird mein Name in der Rangliste angezeigt?</strong>
                  <hr/>
                  Standardmäßig wird dein Name in der Rangliste nicht angezeigt. 
                  Wenn du jedoch die Option aktiviert hast, dass dein Name angezeigt werden darf, wird er entsprechend angezeigt. 
                  Du hast jederzeit die Möglichkeit, diese Option wieder zu deaktivieren, damit dein Name nicht mehr in der Rangliste erscheint.
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

export default defineComponent({
  name: "FAQ",
  props: {},
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
