<script setup lang="ts">
import { ref } from 'vue';

const loading = ref(false);
</script>

<template>
  <div class="bg-gray-200 pt-4">
    
    <div class="flex flex-col justify-center items-center mb-6">



      <div class="w-full max-w-2xl bg-white rounded-lg shadow-md overflow-hidden md:max-w-3xl lg:max-w-5xl xl:max-w-5xl mx-2 mb-6">
        <div class="px-6 py-4">
          <div class="flex mb-2 border-b border-b-gray-400 pb-1 justify-between">
            <div class="font-bold text-base md:text-xl">Unser Team</div>
          </div>

          <div class="flex w-full my-2 justify-center items-center" v-if="loading">
            <div class="flex items-center mt-4">
              <i class="fas fa-spinner fa-spin text-gray-500 text-lg mr-2"></i>
              <span class="text-gray-500 text-lg">Daten werden geladen</span>
            </div>
          </div>


          



          <div class="flex flex-col" v-if="!loading">


            <!-- Administrators -->
            <div class="mb-8 mt-4 pb-6 border-b border-gray-300">
              <h2 class="text-center text-base font-semibold">Moderatoren</h2>
              <p class="text-center text-xs text-gray-500 mb-4">Nehmen sich Zeit für die Abwicklung eurer Bestellungen.</p>
              <div class="flex justify-center items-center flex-wrap gap-6">
                <!-- Demo Administrator -->
                <div class="px-4 py-3 text-center text-sm">
                  <img src="https://intern.rkhl.at/images/Rein.png" class="mx-auto h-auto max-h-[75px] mb-1"/>
                  <p class="font-semibold">Erich Rein</p>
                  <p class="text-xs">Erich.Rein@n.roteskreuz.at</p>
                </div>
                <div class="px-4 py-3 text-center text-sm">
                  <img src="https://intern.rkhl.at/images/Beer.png" class="mx-auto h-auto max-h-[75px] mb-1"/>
                  <p class="font-semibold">Gerhard Beer</p>
                  <p class="text-xs">Gerhard.Beer@n.roteskreuz.at</p>
                </div>
              </div>
            </div>



            <!-- Administrators -->
            <div class="mb-8 mt-4 pb-6 border-b border-gray-300">
              <h2 class="text-center text-base font-semibold">Administratoren</h2>
              <p class="text-center text-xs text-gray-500 mb-4">Verantwortlich für die Verwaltung der gesamten Webseite.</p>
              <div class="flex justify-center items-center flex-wrap gap-6">
                <!-- Demo Administrator -->
                <div class="px-4 py-3 text-center text-sm">
                  <img src="https://intern.rkhl.at/images/Hafner.png" class="mx-auto h-auto max-h-[75px] mb-1"/>
                  <p class="font-semibold">Christian Hafner</p>
                  <p class="text-xs">Christian.Hafner@n.roteskreuz.at</p>
                </div>
                <div class="px-4 py-3 text-center text-sm">
                  <img src="https://intern.rkhl.at/images/Schachhuber.png" class="mx-auto h-auto max-h-[75px] mb-1"/>
                  <p class="font-semibold">Clemens Schachhuber</p>
                  <p class="text-xs">Clemens.Schachhuber@n.roteskreuz.at</p>
                </div>
              </div>
            </div>
          
            <!-- Moderators -->
            <!--
            <div class="mb-8 pb-6 border-b border-gray-300">
              <h2 class="text-center text-base font-semibold">Moderatoren</h2>
              <p class="text-center text-xs text-gray-500 mb-4">Verantwortlich für die Abarbeitung von Bestellungen.</p>
              <div class="flex justify-center items-center flex-wrap gap-6">
                <div class="px-4 py-3 text-center text-sm">
                  <p class="font-semibold">...</p>
                  <p class="text-xs">...</p>
                </div>
              </div>
            </div>-->
          
            <!-- Developers -->
            <div class="pb-6">
              <h2 class="text-center text-base font-semibold">Entwickler</h2>
              <p class="text-center text-xs text-gray-500 mb-4">Arbeiten an der technischen Entwicklung der Plattform.</p>
              <div class="flex justify-center items-center flex-wrap gap-6">
                <!-- Demo Administrator -->
                <div class="px-4 py-3 text-center text-sm">
                  <img src="https://intern.rkhl.at/images/Filip.png" class="mx-auto h-auto max-h-[75px] mb-1"/>
                  <p class="font-semibold">Stefan Filip</p>
                  <p class="text-xs">Stefan.Filip@n.roteskreuz.at</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>






    </div>
    

  </div>
</template>




<style>

</style>
