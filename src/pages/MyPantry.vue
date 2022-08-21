<template>
  <div id="app">
    <v-app>
      <NavigationBar @toggle-drawer="$refs.drawer.drawer = !$refs.drawer.drawer" @toggle-login="$refs.login.login = !$refs.login.login"></NavigationBar>
      <SideDrawer ref="drawer"></SideDrawer>
      <LogIn ref="login"></LogIn>
      <v-container v-if="userid > 0">
      <h1>My Pantry</h1>
      <v-dialog
          v-model="dialog"
          max-width="500px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">Edit Pantry Item</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row>
                <v-col
                    cols="12"
                    sm="6"
                    md="4"
                >
                  <v-text-field
                      v-model="editedItem.food_description"
                      label="Food Description"
                      disabled
                  ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    sm="6"
                    md="4"
                >
                  <v-text-field
                      v-model="editedItem.food_type_description"
                      label="Food Type"
                      disabled
                  ></v-text-field>
                </v-col>
                <v-col
                    cols="12"
                    sm="6"
                    md="4"
                >
                  <v-text-field
                      :error-messages="quantityErrors"
                      v-model="editedItem.food_quantity"
                      label="Food Quantity"
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
                      v-model="editedItem.unit_id"
                      item-text="unit_abbreviation"
                      item-value="unit_id"
                      label="Quantity Unit"
                      required
                  ></v-autocomplete>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                color="blue darken-1"
                text
                @click="close"
            >
              Cancel
            </v-btn>
            <v-btn
                color="blue darken-1"
                text
                @click="save"
                :disabled="disabled"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="dialogDelete" max-width="500px">
        <v-card>
          <v-card-title class="text-h5">Why are you removing this item from your pantry?</v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="closeDelete">Cancel</v-btn>
            <v-btn color="blue darken-1" text @click="confirmDelete">Item Consumed</v-btn>
            <v-btn color="blue darken-1" text @click="addToFoodWasteLog">Item Expired</v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <div>
        <v-data-table
            :headers="headers"
            :items="items"
            :search="search"
            item-key="food_description">
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
                small
                class="mr-2"
                @click="editItem(item)"
            >
              mdi-pencil
            </v-icon>
            <v-icon
                small
                @click="deleteItem(item)"
            >
              mdi-delete
            </v-icon>
          </template>
          <template v-slot:[`item.expiration_date`]="{ item }">
            <v-chip
                :color="getColor(item.expiration_date)"
                dark
            >
              {{ item.expiration_date }}
            </v-chip>
          </template>
        </v-data-table>
      </div>
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
import {validationMixin} from "vuelidate";
import {maxValue, minValue, required} from "vuelidate/lib/validators";

export default {
  components: {
    SideDrawer,
    NavigationBar,
    FooterBar,
    LogIn
  },
  mixins: [validationMixin],

  validations: {
    quantity: { required, maxValue: maxValue(9999), minValue: minValue(0) },
    unit: { required }
  },
  data: () => ({
    search: '',
    dialog: false,
    dialogDelete: false,
    // mapping for data grid
    headers: [
      { text: 'Actions', value: 'actions', sortable: false },
      {text: 'Food Inventory Id', value: 'food_inventory_id', align: ' d-none'},
      {text: 'Food Id', value: 'food_id', align: ' d-none'},
      {text: 'Item', value: 'food_description'},
      {text: 'Food Type', value: 'food_type_description'},
      {text: 'Quantity', value: 'food_quantity'},
      {text: 'Unit Id', value: 'food_unit_id', align: ' d-none'},
      {text: 'Quantity Unit', value: 'unit_abbreviation'},
      {text: 'Total Cost', value: 'food_cost'},
      {text: 'Expiration Date', value: 'expiration_date'},
      {text: 'Food Acquisition Date', value: 'food_acquisition_date', align: ' d-none'}
    ],
    // Store row data when taking an action on a row
    editedItem: {},
    items: [],
    unitMenuList: [],
  }),
  computed: {
    quantity() {
      return this.editedItem.food_quantity
    },
    unit() {
      return this.editedItem.unit_id
    },
    userid() {
      return localStorage.userid;
    },
    // Build error message array for each input field that needs to be validated
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
    // Enable save button in edit UI if all fields validate
    disabled () {
      if (this.quantityErrors.length === 0 && this.unitErrors.length === 0) {
        return false
      } else {
        return true
      }
    }
  },
  mounted() {
    // When page loads, should load grid data items and unit dropdown items
    this.loadItems()
    this.loadUnitDropdown()
  },
  watch: {
    dialog (val) {
      val || this.close()
    },
    dialogDelete (val) {
      val || this.closeDelete()
    },
  },
  methods: {
    // GET request to list all user's pantry data from shopping_list_v view
    loadItems() {
      let self = this
      this.items = []
      axios.get(
          "/api/pantry/" + this.userid,
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
            food_cost: item.food_cost ? '$' + item.food_cost : null,
            expiration_date: item.expiration_date,
            food_acquisition_date: item.food_acquisition_date
          }
        })
      })
    },
    // GET request to load unit values for dropdown
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
    // Open edit item dialog window and set editedItem with data from current row
    editItem (item) {
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    // PUT request to update food inventory record with edits made in UI
    save () {
      axios.put("/api/food_inventory/" + this.editedItem.food_inventory_id, {
        food_inventory_id: this.editedItem.food_inventory_id,
        food_id: this.editedItem.food_id,
        food_quantity: this.editedItem.food_quantity,
        food_unit_id: this.editedItem.unit_id,
        food_cost_usd: this.editedItem.food_cost.replace(/\$/g, ''),
        food_acquisition_date: this.editedItem.food_acquisition_date,
        create_user_id: this.userid,
        update_user_id: this.userid,
        record_status: 'A'
      }).then(response => {
        console.log(response);
        // Reload data grid after change
        this.loadItems();
      })
          .catch(function (error) {
            console.log(error);
          });
      this.close()
    },
    // Insert new record into food waste log table after an item has been deleted due to expiration
    addToFoodWasteLog() {
      axios.post("/api/food_waste_log" , {
        food_id: this.editedItem.food_id,
        food_quantity: this.editedItem.food_quantity,
        food_quantity_unit_id: this.editedItem.unit_id,
        food_cost_usd: this.editedItem.food_cost.replace(/\$/g, ''),
        food_expiration_date: new Date(),
        create_user_id: this.userid,
        update_user_id: this.userid,
        record_status: 'A'
      }).then(response => {
        console.log(response);
        // Reload data grid after change
        this.loadItems();
      })
          .catch(function (error) {
            console.log(error);
          });
      this.confirmDelete();
    },
    // Soft delete record by setting record status to 'X'
    confirmDelete() {
      axios.put("/api/food_inventory/" + this.editedItem.food_inventory_id, {
        food_inventory_id: this.editedItem.food_inventory_id,
        food_id: this.editedItem.food_id,
        food_quantity: this.editedItem.food_quantity,
        food_unit_id: this.editedItem.unit_id,
        food_cost_usd: this.editedItem.food_cost.replace(/\$/g, ''),
        food_acquisition_date: this.editedItem.food_acquisition_date,
        create_user_id: this.userid,
        update_user_id: this.userid,
        record_status: 'X'
      }).then(response => {
            console.log(response);
            // Reload data grid after change
            this.loadItems();
          })
          .catch(function (error) {
            console.log(error);
          });
      this.closeDelete();
    },
    // Color the expiration date chips in data grid based on how soon the expiration date is
    getColor (expirationDate) {
      let today = new Date(),
      daysToExpire = (new Date(expirationDate).getTime() - today.getTime())/ (1000 * 3600 * 24);

      if ( daysToExpire < 3) return 'red'
      else if (daysToExpire < 7) return 'orange'
      else return 'green'
    },
    // Close edit item dialog winow
    close () {
      this.dialog = false
    },
    // Open delete item dialog window and set edited item to that row
    deleteItem (item) {
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    // Close delete item dialog window
    closeDelete () {
      this.dialogDelete = false
    },
  }
};
</script>

<style lang="scss">
@import "@/styles.scss";
</style>