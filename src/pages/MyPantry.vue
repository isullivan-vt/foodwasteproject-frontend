<template>
  <div id="app">
    <v-app>
      <NavigationBar @toggle-drawer="$refs.drawer.drawer = !$refs.drawer.drawer"></NavigationBar>
      <SideDrawer ref="drawer"></SideDrawer>
      <LogIn></LogIn>
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
                      v-model="editedItem.food_quantity"
                      label="Food Quantity"
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
    search: '',
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: 'Actions', value: 'actions', sortable: false },
      {text: 'Food Inventory Id', value: 'food_inventory_id'},
      {text: 'Food Id', value: 'food_id'},
      {text: 'Item', value: 'food_description'},
      {text: 'Food Type', value: 'food_type_description'},
      {text: 'Quantity', value: 'food_quantity'},
      {text: 'Unit Id', value: 'food_unit_id'},
      {text: 'Quantity Unit', value: 'unit_abbreviation'},
      {text: 'Total Cost', value: 'food_cost'},
      {text: 'Expiration Date', value: 'expiration_date'},
      {text: 'Food Acquisition Date', value: 'food_acquisition_date'}
    ],
    editedItem: {},
    items: [],
    unitMenuList: [],
  }),
  mounted() {
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
    loadItems() {
      let self = this
      this.items = []
      axios.get(
          "/api/pantry",
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
    editItem (item) {
      this.editedItem = Object.assign({}, item)
      this.dialog = true
    },
    save () {
      axios.put("/api/food_inventory/" + this.editedItem.food_inventory_id, {
        food_inventory_id: this.editedItem.food_inventory_id,
        food_id: this.editedItem.food_id,
        food_quantity: this.editedItem.food_quantity,
        food_unit_id: this.editedItem.unit_id,
        food_cost_usd: this.editedItem.food_cost_usd,
        food_acquisition_date: this.editedItem.food_acquisition_date,
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
      this.close()
    },
    addToFoodWasteLog() {
      axios.post("/api/food_waste_log" , {
        food_id: this.editedItem.food_id,
        food_quantity: this.editedItem.food_quantity,
        food_quantity_unit_id: this.editedItem.unit_id,
        food_cost_usd: this.editedItem.food_cost_usd,
        food_expiration_date: new Date(),
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
      this.confirmDelete();
    },
    confirmDelete() {
      axios.put("/api/food_inventory/" + this.editedItem.food_inventory_id, {
        food_inventory_id: this.editedItem.food_inventory_id,
        food_id: this.editedItem.food_id,
        food_quantity: this.editedItem.food_quantity,
        food_unit_id: this.editedItem.unit_id,
        food_cost_usd: this.editedItem.food_cost_usd,
        food_acquisition_date: this.editedItem.food_acquisition_date,
        create_user_id: 1,
        update_user_id: 1,
        record_status: 'X'
      })
          .then(function (response) {
            console.log(response);
          }).then(function() {
        this.loadItems();
      })
          .catch(function (error) {
            console.log(error);
          });
      this.closeDelete();
    },
    close () {
      this.dialog = false
    },
    deleteItem (item) {
      this.editedItem = Object.assign({}, item)
      this.dialogDelete = true
    },
    closeDelete () {
      this.dialogDelete = false
    },
  }
};
</script>

<style lang="scss">
@import "@/styles.scss";
</style>