<template>
  <div id="app">
    <v-app>
      <NavigationBar @toggle-drawer="$refs.drawer.drawer = !$refs.drawer.drawer" @toggle-login="$refs.login.login = !$refs.login.login"></NavigationBar>
      <SideDrawer ref="drawer"></SideDrawer>
      <LogIn ref="login"></LogIn>
      <v-container v-if="userid > 0" class="my-5">
      <h1>Shopping List</h1>
      <div align="right">
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
                class="ml-5"
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
                        :error-messages="foodErrors"
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
                        :error-messages="quantityErrors"
                        v-model="quantity"
                        label="Quantity"
                        required
                        type="number"
                        @input="$v.quantity.$touch()"
                        @blur="$v.quantity.$touch()"
                        step=".1"
                        min="0"
                        max="9999"
                    ></v-text-field>
                  </v-col>
                  <v-col
                      cols="12"
                      sm="6"
                      md="4"
                  >
                    <v-autocomplete
                        :error-messages="unitErrors"
                        :items="unitMenuList"
                        v-model="unit"
                        item-text="unit_abbreviation"
                        item-value="unit_id"
                        label="Quantity Unit"
                        required
                    ></v-autocomplete>
                  </v-col>
                  <v-text-field
                      :error-messages="costErrors"
                      v-model="cost"
                      label="Cost"
                      required
                      type="number"
                      step=".01"
                      min="0"
                      max="9999.99"
                      @input="$v.cost.$touch()"
                      @blur="$v.cost.$touch()"
                      @keypress="onlyForCurrency"
                  ></v-text-field>
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
                  :disabled="disabled"
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
            sm="10"
            class="ml-5"
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
import axios from "axios";
import { validationMixin } from 'vuelidate';
import {required, maxValue, minValue} from 'vuelidate/lib/validators';

export default {
  mixins: [validationMixin],

  validations: {
    quantity: { required, maxValue: maxValue(9999), minValue: minValue(0) },
    cost: { maxValue: maxValue(9999.99), minValue: minValue(0) },
    food: { required },
    unit: { required }
  },
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
      {text: 'Food Inventory Id', value: 'food_inventory_id', align: ' d-none'},
      {text: 'Food Id', value: 'food_id', align: ' d-none'},
      {text: 'Item', value: 'food_description'},
      {text: 'Food Type', value: 'food_type_description'},
      {text: 'Quantity', value: 'food_quantity'},
      {text: 'Unit Id', value: 'food_unit_id', align: ' d-none'},
      {text: 'Quantity Unit', value: 'unit_abbreviation'},
      {text: 'Total Cost', value: 'food_cost'}
    ],
    items: [],
    foodMenuList: [],
    unitMenuList: [],
  }),
  computed: {
    userid() {
      return localStorage.userid;
    },
    // Build errors to display when an input field dows not validate
    foodErrors () {
      const errors = []
      !this.$v.food.required && errors.push('Item is required')
      return errors
    },
    unitErrors () {
      const errors = []
      !this.$v.unit.required && errors.push('Unit is required')
      return errors
    },
    quantityErrors () {
      const errors = []
      if (!this.$v.quantity.$dirty) return errors
      !this.$v.quantity.required && errors.push('Quantity is required.')
      !this.$v.quantity.minValue && errors.push('Quantity must a positive number')
      !this.$v.quantity.maxValue && errors.push('Quantity must be less than 9999')
      return errors
    },
    costErrors () {
      const errors = []
      if (!this.$v.cost.$dirty) return errors
      !this.$v.cost.minValue && errors.push('Cost must a positive number')
      !this.$v.cost.maxValue && errors.push('Cost must be less than 9999.99')
      return errors
    },
    // Enable the save button if all of the input fields validate
    disabled () {
      if (this.costErrors.length === 0 && this.quantityErrors.length === 0 && this.unitErrors.length === 0 && this.foodErrors.length === 0) {
        return false
      } else {
        return true
      }
    }
  },
  mounted() {
    // When this page loads, get the data grid items and the food/unit dropdown items
    this.loadItems()
    this.loadFoodDropdown()
    this.loadUnitDropdown()
  },
  methods: {
    // GET request to load all of a user's shopping list records from the shopping_list_V view
    loadItems() {
      let self = this
      this.items = []
      axios.get(
          "/api/shopping-list/" + this.userid,
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
    // GET request to list all food records to show in dropdown
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
    // GET request to get all the unit records to display in dropdown
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
    // Post request to insert the food inventory item that has been created
    createItem() {
      axios.post("/api/food_inventory", {
        food_id: this.food,
        food_quantity: this.quantity,
        food_unit_id: this.unit,
        food_cost_usd: this.cost,
        food_acquisition_date: '9999-12-31',
        create_user_id: this.userid,
        update_user_id: this.userid,
        record_status: 'L'
      })
    .then(response => {
        console.log(response);
        // Reload grid data after a change
        this.loadItems();
      })
          .catch(function (error) {
            console.log(error);
          });
    },
    // PUT request to update the food inventory record that has been modified
    addToPantry() {
      for (let i = 0; i < this.selected.length; i++)
        axios.put("/api/food_inventory/" + this.selected[i].food_inventory_id, {
          food_inventory_id: this.selected[i].food_inventory_id,
          food_id: this.selected[i].food_id,
          food_quantity: this.selected[i].food_quantity,
          food_unit_id: this.selected[i].unit_id,
          food_cost_usd: this.selected[i].food_cost.replace(/\$/g, ''),
          food_acquisition_date: new Date(),
          create_user_id: this.userid,
          update_user_id: this.userid,
          record_status: 'A'
        }).then(response => {
          console.log(response);
          this.loadItems();
        })
            .catch(function (error) {
              console.log(error);
            });
    },
    onlyForCurrency ($event) {
      // console.log($event.keyCode); //keyCodes value
      let keyCode = ($event.keyCode ? $event.keyCode : $event.which);

      // only allow number and one dot
      if ((keyCode < 48 || keyCode > 57) && (keyCode !== 46 || this.cost.indexOf('.') != -1)) { // 46 is dot
        $event.preventDefault();
      }

      // restrict to 2 decimal places
      if(this.cost!=null && this.cost.indexOf(".")>-1 && (this.cost.split('.')[1].length > 1)){
        $event.preventDefault();
      }
    }
  }
};
</script>

<style lang="scss">
@import "@/styles.scss";
</style>