<template>
  <div id="app">
    <v-app>
    <NavigationBar @toggle-drawer="$refs.drawer.drawer = !$refs.drawer.drawer"></NavigationBar>
      <SideDrawer ref="drawer"></SideDrawer>
      <LogIn></LogIn>
    <div>
      <h1>Shopping List</h1>
      <div>
        <v-dialog
            v-model="dialog"
            persistent
            max-width="600px"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                dark
                v-bind="attrs"
                v-on="on"
            >
              New Item
            </v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="text-h5">New Shopping List Item</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col
                      cols="12"
                      sm="6"
                      md="4"
                  >
                    <v-autocomplete
                        :items="foodMenuList"
                        v-model="food"
                        item-text="food_description"
                        item-value="food_id"
                        label="Food Item"
                        required
                    ></v-autocomplete>
                  </v-col>
                  <v-col
                      cols="12"
                      sm="6"
                      md="4"
                  >
                    <v-text-field
                        v-model="quantity"
                        label="Quantity"
                        required
                        type="number"
                    ></v-text-field>
                  </v-col>
                  <v-col
                      cols="12"
                      sm="6"
                      md="4"
                  >
                    <v-autocomplete
                        :items="unitMenuList"
                        v-model="unit"
                        item-text="unit_abbreviation"
                        item-value="unit_id"
                        label="Quantity Unit"
                        required
                    ></v-autocomplete>
                  </v-col>
                  <vcol>
                  <v-text-field
                      v-model="cost"
                      label="Cost"
                      required
                      type="cost"
                  ></v-text-field>
                  </vcol>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                  color="blue darken-1"
                  text
                  @click="dialog = false"
              >
                Close
              </v-btn>
              <v-btn
                  color="blue darken-1"
                  text
                  @click="dialog = false; createItem()"
              >
                Save
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-btn
            color="primary"
            dark
            @click="addToPantry()"
        >
          Add To Pantry
        </v-btn>
      </div>
      <v-card-title>
        <v-text-field label="Search"
                      v-model="search"
                      single-line
                      hide-details></v-text-field>
      </v-card-title>
      <v-data-table
          v-model="selected"
          :headers="headers"
          :items="items"
          :search="search"
          show-select
          item-key="food_description">
      </v-data-table>
    </div>
      <FooterBar/>
    </v-app>
  </div>
</template>

<script>
import NavigationBar from "@/components/NavigationBar.vue";
import SideDrawer from "@/components/SideDrawer.vue";
import FooterBar from "@/components/FooterBar.vue";
import LogIn from "@/components/LogIn.vue"
import axios from "axios";

export default {
  components: {
    SideDrawer,
    NavigationBar,
    FooterBar,
    LogIn
  },
  data: () => ({
    search: '',
    selected: [],
    dialog: false,
    food: null,
    unit: null,
    cost: null,
    quantity: 0,
    headers: [
      {text: 'Food Inventory Id', value: 'food_inventory_id'},
      {text: 'Food Id', value: 'food_id'},
      {text: 'Item', value: 'food_description'},
      {text: 'Food Type', value: 'food_type_description'},
      {text: 'Quantity', value: 'food_quantity'},
      {text: 'Unit Id', value: 'food_unit_id'},
      {text: 'Quantity Unit', value: 'unit_abbreviation'},
      {text: 'Total Cost', value: 'food_cost'}
    ],
    items: [],
    foodMenuList: [],
    unitMenuList: [],
  }),
  mounted() {
    this.loadItems()
    this.loadFoodDropdown()
    this.loadUnitDropdown()
  },
  methods: {
    loadItems() {
      let self = this
      this.items = []
      axios.get(
          "/api/shopping-list",
      ).then(function (response) {
        self.items = response.data.map((item) => {
          return {
            food_inventory_id: item.food_inventory_id,
            food_id: item.food_id,
            food_description: item.food_description,
            food_type_description: item.food_type_description,
            food_quantity: item.food_quantity,
            unit_id: item.unit_id,
            unit_abbreviation: item.unit_abbreviation,
            food_cost: item.food_cost ? '$' + item.food_cost : null
          }
        })
      })
    },
    loadFoodDropdown() {
      let self = this
      this.foodMenuList = []
      axios.get(
          "/api/food",
      ).then(function (response) {
        self.foodMenuList = response.data.map((item) => {
          return {
            food_id: item.food_id,
            food_description: item.food_description,
            food_type_id: item.food_type_id,
            unit_type_id: item.unit_type_id
          }
        })
      })
    },
    loadUnitDropdown() {
      let self = this
      this.unitMenuList = []
      axios.get(
          "/api/unit",
      ).then(function (response) {
        self.unitMenuList = response.data.map((item) => {
          return {
            unit_id: item.unit_id,
            unit_abbreviation: item.unit_abbreviation,
            unit_type_id: item.unit_type_id
          }
        })
      })
    },
    createItem() {
      axios.post("/api/food_inventory", {
        food_id: this.food,
        food_quantity: this.quantity,
        food_unit_id: this.unit,
        food_cost_usd: this.cost,
        food_acquisition_date: '9999-12-31',
        create_user_id: 1,
        update_user_id: 1,
        record_status: 'L'
      })
    .then(function (response) {
        console.log(response);
      }).then(function() {
        this.loadItems();
      })
          .catch(function (error) {
            console.log(error);
          });
    },
    addToPantry() {
      for (let i = 0; i < this.selected.length; i++)
        axios.put("/api/food_inventory/" + this.selected[i].food_inventory_id, {
          food_inventory_id: this.selected[i].food_inventory_id,
          food_id: this.selected[i].food_id,
          food_quantity: this.selected[i].food_quantity,
          food_unit_id: this.selected[i].unit_id,
          food_cost_usd: this.selected[i].food_cost_usd,
          food_acquisition_date: new Date(),
          create_user_id: 1,
          update_user_id: 1,
          record_status: 'A'
        })
            .then(function (response) {
              console.log(response);
            }).then(function() {
          this.loadItems();
        })
            .catch(function (error) {
              console.log(error);
            });
    },
  }
};
</script>

<style lang="scss">
@import "@/styles.scss";
</style>