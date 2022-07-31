import Vue from "vue";
import page from "@/pages/MealPlanner.vue";
import vuetify from '@/plugins/vuetify' // path to vuetify export

new Vue({
    vuetify,
    render: h => h(page),
}).$mount('#app');