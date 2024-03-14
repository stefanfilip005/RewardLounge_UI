<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface Notification {
    id: number;
    message: string;
    type: string;
}

const notifications = ref<Notification[]>([]);

const addNotification = (message: string, type: string = 'success') => {
    const id = Date.now();
    notifications.value.push({ id, message, type });

    setTimeout(() => {
    removeNotification(id);
    }, 3000); // Adjusting time to 3000 ms for demonstration
};

const removeNotification = (id: number) => {
    notifications.value = notifications.value.filter(notification => notification.id !== id);
};

const notificationClasses = (notification: Notification) => {
    return {
    'bg-red-300': notification.type === 'error',
    'bg-green-300': notification.type === 'success'
    };
};

const eventHandler = (event: CustomEvent) => {
    const { message, type } = event.detail;
    addNotification(message, type);
};

onMounted(() => {
    window.addEventListener('add-notification', eventHandler as EventListener);
});

onUnmounted(() => {
    window.removeEventListener('add-notification', eventHandler as EventListener);
});
</script>

<template>
    <transition-group name="fade" tag="div" class="fixed top-0 left-0 md:top-0 md:right-0 md:flex md:flex-col md:items-end z-50" style="pointer-events: none;" :class="{'z-50': notifications.length > 0}">
        <div v-for="notification in notifications" :key="notification.id" class="notification mb-2 mx-4 mt-4 rounded shadow-lg font-semibold text-gray-800 px-4 py-2 text-center border border-green-800 text-xs md:text-sm" :class="notificationClasses(notification)" style="pointer-events: auto;">
            {{ notification.message }}
        </div>
    </transition-group>
    
    
</template>

<style scoped>
    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.5s;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
</style>