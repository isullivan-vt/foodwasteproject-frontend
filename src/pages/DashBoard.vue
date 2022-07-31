<template>
  <div id="app">
    <v-app>
      <NavigationBar @toggle-drawer="$refs.drawer.drawer = !$refs.drawer.drawer"></NavigationBar>
      <SideDrawer ref="drawer"></SideDrawer>
      <LogIn></LogIn>
      <h1>Dashboard</h1>
      <v-spacer>
      </v-spacer>
      <div>
        <v-card
            class="mx-auto text-center"
            color="green"
            dark
            max-width="600"
        >
          <v-card-text>
            <v-sheet color="rgba(0, 0, 0, .12)">
              <v-sparkline
                  :value="foodWasteLogItems.food_cost_usd"
                  color="rgba(255, 255, 255, .7)"
                  height="100"
                  padding="24"
                  stroke-linecap="round"
                  smooth
              >
                <template v-slot:label="item">
                  ${{ item.value }}
                </template>
              </v-sparkline>
            </v-sheet>
          </v-card-text>

          <v-card-text>
            <div class="text-h4 font-weight-thin">
              Sparkline Coming Soon
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="justify-center">
            <v-btn
                block
                text
            >
              Go to Report
            </v-btn>
          </v-card-actions>
        </v-card>
      <v-row align="center" justify="center">
      <v-card color="primary" dark>
      <v-card-text>
      {{ this.foodWasteWeightLastWeek }} Lbs
      </v-card-text>
        <v-card-text>
          Wasted This Week
        </v-card-text>
      </v-card>
      <v-card color="primary" dark>
        <v-card-text>
          {{ this.foodWasteWeightLastYear}} Lbs
        </v-card-text>
        <v-card-text>
          Wasted This Year
        </v-card-text>
      </v-card>
      <v-card color="primary" dark>
        <v-card-text>
          ${{ this.foodWasteCostLastYear}}
        </v-card-text>
        <v-card-text>
          Wasted This Year
        </v-card-text>
      </v-card>
      </v-row>
      </div>
      <v-row align="center" justify="center">
      <v-card color="orange" width="75%" justify="center">
        <v-card-text>
          You have {{ this.expireCount }} items that are expiring tomorrow.
        </v-card-text>
        <v-btn
            color="red"
            dark
        >View Pantry
        </v-btn>
      </v-card>
      </v-row>
      <FooterBar/>
    </v-app>
  </div>
</template>

<script>
import NavigationBar from "@/components/NavigationBar.vue";
import SideDrawer from "@/components/SideDrawer.vue";
import FooterBar from "@/components/FooterBar.vue";
import LogIn from "@/components/LogIn.vue";
import axios from "axios";

export default {
  components: {
    SideDrawer,
    NavigationBar,
    FooterBar,
    LogIn
  },
  data: () => ({
    foodWasteLogItems: [],
    pantryItems: [],
    foodWasteWeightLastWeek: 0,
    foodWasteWeightLastYear: 0,
    foodWasteCostLastYear: 0,
    expireCount: 0,
  }),
  mounted() {
    this.loadFoodWasteLog()
    this.loadPantryItems()
  },
  watch: {
    foodWasteLogItems() {
      this.calculateFoodWasteWeightAndCostLastYear();
      this.calculateFoodWasteWeightLastWeek();
    },
    pantryItems() {
      this.calculateExpiringPantryItemCount();
    }
  },
  methods: {
    loadFoodWasteLog() {
      let self = this
      this.foodWasteLogItems = []
      axios.get(
          "/api/food_waste_log",
      ).then(function (response) {
        self.foodWasteLogItems = response.data.map((item) => {
          return {
            food_waste_log_id: item.food_waste_log_id,
            food_quantity: item.food_quantity,
            food_quantity_unit_id: item.food_quantity_unit_id,
            food_expiration_date: item.food_expiration_date,
            food_cost_usd: item.food_cost_usd
          }
        })
      })
    },
    loadPantryItems() {
      let self = this
      this.pantryItems = []
      axios.get(
          "/api/pantry",
      ).then(function (response) {
        self.pantryItems = response.data.map((item) => {
          return {
            food_inventory_id: item.food_inventory_id,
            expiration_date: item.expiration_date,
          }
        })
      })
    },
    calculateFoodWasteWeightLastWeek() {
      let today = new Date();

      for (let i = 0; i < this.foodWasteLogItems.length; i++) {
        let date = new Date(this.foodWasteLogItems[i].food_expiration_date)
        if (date.getTime() > today.getTime() - (24 * 60 * 60 * 1000) * 7) {
          this.foodWasteWeightLastWeek += this.foodWasteLogItems[i].food_quantity;
        }
      }
    },
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
    calculateExpiringPantryItemCount() {
      let today = new Date();

      for (let i = 0; i < this.pantryItems.length; i++) {
        let date = new Date(this.pantryItems[i].expiration_date)
        if (date.getTime() >= today.getTime() - (24 * 60 * 60 * 1000) && date.getTime() <= today.getTime()) {
          this.expireCount++;
        }
      }
    }
  }
};
</script>

<style lang="scss">
@import "@/styles.scss";
</style>