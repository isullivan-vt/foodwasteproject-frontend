<template>
  <div id="app">
    <v-app>
      <NavigationBar @toggle-drawer="$refs.drawer.drawer = !$refs.drawer.drawer" @toggle-login="$refs.login.login = !$refs.login.login"></NavigationBar>
      <SideDrawer ref="drawer"></SideDrawer>
      <LogIn ref="login"></LogIn>
      <v-container v-if="userid > 0">
      <h1>Dashboard</h1>
      <v-card color="primary lighten-3" class="py-25">
        <v-row justify="center">
        <v-card
            color="green"
            dark
            max-width="600"
            class="m-5 text-center"
        >
          <v-card-text>
            <v-sheet color="rgba(0, 0, 0, .12)">
              <v-sparkline
                  :value="foodWasteCostByMonth"
                  :labels="months"
                  color="rgba(255, 255, 255, .7)"
                  height="100"
                  padding="24"
                  stroke-linecap="round"
                  smooth
              >
              </v-sparkline>
            </v-sheet>
          </v-card-text>

          <v-card-text>
            <div class="text-h4 font-weight-thin">
              Monthly Food Waste Cost
            </div>
          </v-card-text>
        </v-card>
        </v-row>
      <v-row align="center" justify="center">
      <v-card color="primary" dark class="m-3">
      <v-card-text>
      {{ this.foodWasteWeightLastWeek }} Lbs
      </v-card-text>
        <v-card-text>
          Wasted This Week
        </v-card-text>
      </v-card>
      <v-card color="primary" dark class="m-3">
        <v-card-text>
          {{ this.foodWasteWeightLastYear}} Lbs
        </v-card-text>
        <v-card-text>
          Wasted This Year
        </v-card-text>
      </v-card>
      <v-card color="primary" dark class="m-3">
        <v-card-text>
          ${{ Math.round(this.foodWasteCostLastYear * 100) / 100 }}
        </v-card-text>
        <v-card-text>
          Wasted This Year
        </v-card-text>
      </v-card>
      </v-row>
      </v-card>
      <v-row align="center" justify="center">
      <v-card :color="getExpireBaseColor()" width="75%" justify="center" class="my-15">
        <v-card-text class="text-h5">
          <v-icon
              large
              class="mr-2"
              :color="getExpireIconColor()"
          >
            {{ getExpireIcon() }}
          </v-icon>
          You have {{ this.expireCount }} items that are expiring tomorrow
          <v-btn
              small
              :color="getExpireIconColor()"
              dark
              href="/pantry"
          >View
          </v-btn>
        </v-card-text>

      </v-card>
      </v-row>
        <v-row>
          <span class="text-h5">My Upcoming Meals</span>
          <MealTimeline></MealTimeline>
        </v-row>
      </v-container>
      <v-container v-else>
        <h1>You are not logged in!</h1>
      </v-container>
      <FooterBar/>
    </v-app>
  </div>
</template>

<script>
import NavigationBar from "@/components/NavigationBar.vue";
import SideDrawer from "@/components/SideDrawer.vue";
import FooterBar from "@/components/FooterBar.vue";
import LogIn from "@/components/LogIn.vue";
import MealTimeline from "@/components/MealTimeline.vue";
import axios from "axios";

export default {
  components: {
    SideDrawer,
    NavigationBar,
    FooterBar,
    MealTimeline,
    LogIn
  },
  data: () => ({
    foodWasteLogItems: [],
    pantryItems: [],
    foodWasteCostByMonth: [],
    foodWasteWeightLastWeek: 0,
    foodWasteWeightLastYear: 0,
    foodWasteCostLastYear: 0,
    expireCount: 0,
    // Month labels for sparkline
    months: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sept',
        'Oct',
        'Nov',
        'Dec']
  }),
  computed: {
    userid() {
      return localStorage.userid;
    }
  },
  mounted() {
    // Load food waste log and pantry item data when page loads
    if (this.userid) {
      this.loadFoodWasteLog()
      this.loadPantryItems()
    }
  },
  watch: {
    userid() {
      if (this.userid) {
        this.loadFoodWasteLog()
        this.loadPantryItems()
      }
    },
    foodWasteLogItems() {
      this.calculateFoodWasteWeightAndCostLastYear();
      this.calculateFoodWasteWeightLastWeek();
      this.calculateFoodWasteCostByMonth();
    },
    pantryItems() {
      this.calculateExpiringPantryItemCount();
    }
  },
  methods: {
    // GET request to list all user's data from food_waste_log table
    loadFoodWasteLog() {
      let self = this
      this.foodWasteLogItems = []
      axios.get(
          "/api/food-waste-log-list/" + this.userid,
      ).then(function (response) {
        self.foodWasteLogItems = response.data.map((item) => {
          return {
            food_waste_log_id: item.food_waste_log_id,
            food_quantity: item.food_quantity,
            food_quantity_unit_id: item.food_quantity_unit_id,
            food_expiration_date: item.food_expiration_date,
            food_expiration_month: new Date(item.food_expiration_date).getMonth(),
            food_cost_usd: item.food_cost_usd
          }
        })
      })
    },
    // GET request to load all user's data from the shopping_list_v view that are in user's pantry
    loadPantryItems() {
      let self = this
      this.pantryItems = []
      axios.get(
          "/api/pantry/" + this.userid,
      ).then(function (response) {
        self.pantryItems = response.data.map((item) => {
          return {
            food_inventory_id: item.food_inventory_id,
            expiration_date: item.expiration_date,
          }
        })
      })
    },
    // Sum weight of food that was wasted in the last week
    calculateFoodWasteWeightLastWeek() {
      let today = new Date();

      for (let i = 0; i < this.foodWasteLogItems.length; i++) {
        let date = new Date(this.foodWasteLogItems[i].food_expiration_date)
        if (date.getTime() > today.getTime() - (24 * 60 * 60 * 1000) * 7) {
          this.foodWasteWeightLastWeek += this.foodWasteLogItems[i].food_quantity;
        }
      }
    },
    // Sum weight and cost of food that wasted in the last year
    calculateFoodWasteWeightAndCostLastYear() {
      let today = new Date();

      for (let i = 0; i < this.foodWasteLogItems.length; i++) {
        let date = new Date(this.foodWasteLogItems[i].food_expiration_date)
        if (date.getTime() > today.getTime() - (24 * 60 * 60 * 1000) * 365) {
          this.foodWasteWeightLastYear += this.foodWasteLogItems[i].food_quantity;
          this.foodWasteCostLastYear += this.foodWasteLogItems[i].food_cost_usd;
        }
      }
    },
    // Calculate cost of food wasted each month nad store in an array for use in sparkline
    calculateFoodWasteCostByMonth() {
      this.foodWasteCostByMonth = [];
      for (let m = 1; m <=12; m++) {
        let monthCost = 0.00
        for (let i = 0; i < this.foodWasteLogItems.length; i++) {
          if (this.foodWasteLogItems[i].food_expiration_month == m) {
            monthCost += this.foodWasteLogItems[i].food_cost_usd;
          }
        }
        this.foodWasteCostByMonth.push(monthCost);
      }
    },
    // Determine if item in pantry will expire tomorrow and keep a count of those that will
    calculateExpiringPantryItemCount() {
      let today = new Date();

      for (let i = 0; i < this.pantryItems.length; i++) {
        let date = new Date(this.pantryItems[i].expiration_date)
        if (date.getTime() <= today.getTime() + (24 * 60 * 60 * 1000) ) {
          this.expireCount++;
        }
      }
    },
    // If 1 or more items will expire tomorrow, card should be red, otherwise make it green
    getExpireBaseColor() {
      if(this.expireCount === 0) {
        return 'green lighten-3';
      } else {
        return 'red lighten-3';
      }
    },
    // If 1 or more items will expire tomorrow, icon should be red, otherwise make it green
    getExpireIconColor() {
      if(this.expireCount === 0) {
        return 'green';
      } else {
        return 'red';
      }
    },
    // If 1 or more items will expire tomorrow, icon should be warning, otherwise make it a checkmark
    getExpireIcon() {
      if(this.expireCount === 0) {
        return 'mdi-check-circle';
      } else {
        return 'mdi-alert';
      }
    }
  }
};
</script>

<style lang="scss">
@import "@/styles.scss";
</style>