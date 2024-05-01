<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { ref, computed } from 'vue'
import axios from 'axios';

const router = useRouter();
const isMenuOpen = ref(false);
const store = useStore();
const jwt = computed(() => store.state.jwt);

const cartCount = computed(() => store.state.cartCount);

const showEmployeeLink = computed(() => {
    const user = store.state.user; // Directly accessing user from the state
    if (!user) return false; // Check if user is null
    return user.isAdministrator || user.isModerator || user.isDeveloper;
});

function logout() {
    console.log("logout");
    localStorage.removeItem('token');
    if (store) {
        store.dispatch('logout');
    }
    router.push('/logout');
}


const fetchCartCount = async () => {
    try {
        const response = await axios.get('/api/self/cart/count', {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${jwt.value}`
            }
        });
        store.dispatch('updateCartCount', response.data.count);
    } catch (error) {
        console.error('Failed to fetch cart count:', error);
    }
};
defineExpose({ fetchCartCount });

</script>

<template>
    <nav class="bg-red-800 text-white">
        <div class="max-w-6xl mx-auto px-4">
            <div class="flex justify-between">
                <div class="flex space-x-4">
                    <!-- Logo or Brand Name -->
                    <div>
                        <a href="." class="flex items-center py-3 px-2 text-white">
                            <img src="/images/red_cross.png" alt="Logo" class="h-6 w-6 mr-3">
                            <span class="font-bold">Dashboard</span>
                        </a>
                    </div>
            
                    <!-- Primary Navbar items -->
                    <div class="hidden md:flex items-center space-x-1"> | 
                        <a href="./dienste" class="py-3 px-3 text-white hover:text-white">Dienste</a> | 
                        <a href="./produkte" class="py-3 px-3 text-white hover:text-white">Produkte</a> |
                        <a href="./bestellungen" class="py-3 px-3 text-white hover:text-white">Bestellungen</a> | 
                        <a href="./mitarbeiter" class="py-3 px-3 text-white hover:text-white">Mitarbeiter</a><span v-if="showEmployeeLink"> | </span> 
                        <span v-if="showEmployeeLink"><a href="./administration" class="py-3 px-3 text-white hover:text-white"><i class="fa-solid fa-user-shield"></i></a> </span>
                    </div>
                </div>
        
                <!-- Secondary Navbar items -->
                <div class="hidden md:flex items-center space-x-3 relative">
                    <a href="./cart" class="flex items-center py-3 px-3 text-white hover:text-white relative">
                        <i class="fa-solid fa-cart-shopping relative"></i>
                        <span class=" bg-red-800 border border-white font-semibold text-gray-200 text-xs rounded-full px-1.5 ml-1 absolute shadow-lg ring-2 ring-red-800" style="transform: translate(50%, -50%);"> {{ cartCount }} </span>
                    </a>
                    <a href="#" class="py-3 px-3 text-white hover:text-white" @click="logout">
                        <i class="fa-solid fa-sign-out-alt"></i>
                    </a>
                </div>
        
                <!-- Mobile menu button -->
                <div class="md:hidden flex items-center">
                <button @click="isMenuOpen = !isMenuOpen" class="mobile-menu-button">
                    <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                </div>
            </div>
        </div>
    
        <!-- Mobile menu -->
        <div class="md:hidden py-2" v-show="isMenuOpen">
            <a href="./dienste" class="block py-2 px-4 text-sm text-white hover:text-white"><i class="fa-solid fa-truck-medical"></i> &nbsp;Dienste</a>
            <a href="./produkte" class="block py-2 px-4 text-sm text-white hover:text-white"><i class="fa-solid fa-store"></i> &nbsp;Produkte</a>
            <a href="./mitarbeiter" class="block py-2 px-4 text-sm text-white hover:text-white"><i class="fa-solid fa-users"></i> &nbsp;Mitarbeiter</a>
            <a href="./bestellungen" class="block py-2 px-4 text-sm text-white hover:text-white"><i class="fa-solid fa-bags-shopping"></i> &nbsp;Bestellungen</a>
            <a href="./administration" v-if="showEmployeeLink" class="block py-2 px-4 text-sm text-white hover:text-white"><i class="fa-solid fa-user-shield"></i> &nbsp;Administration</a>
            <a href="./cart" class="py-2 px-4 text-sm text-white hover:text-white block items-center"><i class="fa-solid fa-cart-shopping"></i> &nbsp;Warenkorb
                <span class=" bg-red-800 border border-white font-semibold text-gray-200 text-xs rounded-full px-1.5 ml-1 mr-0.5 shadow-lg ring-2 ring-red-800"> {{ cartCount }} </span> 
                
            </a>
            <a href="#" class="block py-2 px-4 text-sm text-white hover:text-white" @click="logout"><i class="fa-solid fa-sign-out-alt"></i> &nbsp;Abmelden</a>
        </div>
    </nav>
</template>