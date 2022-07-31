<template>
  <div id="app">
    <v-app>
      <NavigationBar @toggle-drawer="$refs.drawer.drawer = !$refs.drawer.drawer"></NavigationBar>
      <SideDrawer ref="drawer"></SideDrawer>
      <LogIn></LogIn>
      <h1>Meal Planner</h1>
      <v-dialog
          v-model="dialog"
          max-width="500px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ viewedRecipe.recipe_name }}</span>
          </v-card-title>
          <v-card-text>
            <div>
            <h2>Ingredients</h2>
              <template v-for="detail in recipeDetail" >
                <li v-if="detail.exists_in_inventory==='y'" text-color="green" :key="detail.recipe_id" style="color:green">            <v-icon
                    small
                    color="green"
                    class="mr-2"
                >
                  mdi-check-bold
                </v-icon> {{detail.food_quantity}} {{detail.unit_description}}  {{detail.food_description}}  (Expires {{detail.expiration_date}})</li>
                <li v-else :key="detail.recipe_id">{{detail.food_quantity}} {{detail.unit_description}}  {{detail.food_description}} </li>
              </template>
            </div>
            <div>
            <h2>Directions</h2>
            <span>{{ viewedRecipe.recipe_content }}</span>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
                color="blue darken-1"
                text
                @click="close"
            >
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog
          v-model="add"
          max-width="500px"
      >
        <v-card>
          <v-card-title>
            <span class="text-h5">Add Recipe to My Meal Plan</span>
          </v-card-title>
          <v-card-text>
          <v-text-field
              v-model="mealDate"
              label="Meal Date"
              type="date"
          ></v-text-field>
            </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              color="blue darken-1"
              text
              @click="add = false"
          >
            Close
          </v-btn>
          <v-btn
              color="blue darken-1"
              text
              @click="add = false; createMealCalendarEntry(viewedRecipe.recipe_id)"
          >
            Add Meal
          </v-btn>
        </v-card-actions>
        </v-card>
      </v-dialog>
      <div>
        <v-data-table
            :headers="headers"
            :items="items"
            :search="search"
            item-key="recipe_id">
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon
                small
                class="mr-2"
                @click="showRecipe(item)"
            >
              mdi-open-in-new
            </v-icon>
            <v-icon
                small
                class="mr-2"
                @click="addRecipe(item)"
            >
              mdi-plus-circle
            </v-icon>
          </template>
        </v-data-table>
      </div>
      <div>

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
    LogIn,
  },
  data: () => ({
    search: '',
    dialog: false,
    add: false,
    recipeDetail: [],
    mealDate: (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10),
    headers: [
      { text: 'Actions', value: 'actions', sortable: false },
      {text: 'Recipe Id', value: 'recipe_id'},
      {text: 'Recipe Name', value: 'recipe_name'},
      {text: '# of Ingredients', value: 'ingredient_count'},
    ],
    items: [],
    viewedRecipe: {},
  }),
  mounted() {
    this.loadItems()
  },
  watch: {
    dialog(val) {
      val || this.close()
    },
  },
  methods: {
    loadItems() {
      let self = this
      this.items = []
      axios.get(
          "/api/meal-planner",
      ).then(function (response) {
        self.items = response.data.map((item) => {
          return {
            recipe_id: item.recipe_id,
            recipe_name: item.recipe_name,
            ingredient_count: item.ingredient_count,
            recipe_content: item.recipe_content,
          }
        })
      })
    },
    loadRecipeDetail(id) {
      let self = this
      this.recipeDetail = []
      axios.get(
          "/api/recipe_window/" + id,
      ).then(function (response) {
        self.recipeDetail = response.data.map((item) => {
          return {
            recipe_id: item.recipe_id,
            food_quantity: item.food_quantity,
            unit_description: item.unit_description,
            food_description: item.food_description,
            exists_in_inventory: item.exists_in_inventory,
            expiration_date: item.expiration_date
          }
        })
      })
    },
    showRecipe(item) {
      this.viewedRecipe = Object.assign({}, item);
      this.loadRecipeDetail(this.viewedRecipe.recipe_id);
      this.dialog = true;
    },
    addRecipe(item) {
      this.viewedRecipe = Object.assign({}, item);
      this.add = true;
    },
    createMealCalendarEntry(id) {
      axios.post("/api/meal-calendar", {
        recipe_id: id,
        meal_date: this.mealDate,
        create_user_id: 1,
        update_user_id: 1,
        record_status: 'A'
      })
    },
    close () {
      this.dialog = false
    },
  }
};
</script>

<style lang="scss">
@import "@/styles.scss";

li {
  list-style-type: none;
}
</style>