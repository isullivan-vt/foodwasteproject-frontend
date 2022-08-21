<!--This components uses a Vuetify timeline component to show recipes a user has selected during the next 7 days-->
<template>
  <v-timeline>
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
    <v-timeline-item
        v-for="(week, i) in weeks"
        :key="i"
        :color="week.color"
        small
    >
      <template v-slot:opposite>
        <span
            :class="`headline font-weight-bold ${week.color}--text`"
            v-text="week.meal_date"
        ></span>
      </template>
      <div class="py-4">
        <h2 :class="`headline font-weight-light mb-4 ${week.color}--text`">
          {{ week.recipe_name }}
        </h2>
        <div>
          {{ week.recipe_content.slice(0,250) }}...<span class="link" @click="showRecipe(week)">MORE</span>
        </div>
      </div>
    </v-timeline-item>
  </v-timeline>
</template>

<script>
import axios from "axios";

export default {
  name: "MealTimeline.vue",
  data: () => ({
    weeks: [],
    dialog: false,
    viewedRecipe: {},
    recipeDetail: [],
  }),
  computed: {
    userid() {
      return localStorage.userid;
    }
  },
  mounted() {
    // Load timeline data when the component loads
    this.loadMealTimeline();
  },
  methods: {
    // Get meal timeline data from the services project and shore in an array
    loadMealTimeline() {
      let self = this
      this.week = []
      axios.get(
          "/api/meal-timeline/" + this.userid,
      ).then(function (response) {
        self.weeks = response.data.map((item) => {
          return {
            meal_date: item.meal_date,
            recipe_id: item.recipe_id,
            recipe_name: item.recipe_name,
            recipe_content: item.recipe_content,
            color: "primary"
          }
        })
      })
    },
    // Get recipe detail data from the services project and store the results in an array
    loadRecipeDetail(id) {
      let self = this
      this.recipeDetail = []
      axios.get(
          "/api/recipe_window/" + id + "/" + this.userid,
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
    // When a user clicks button to show recipe detail, show the dialog window and load the recipe detail for that recipe
    // Only load data for the next week
    showRecipe(week) {
      this.viewedRecipe = Object.assign({}, week);
      this.loadRecipeDetail(this.viewedRecipe.recipe_id);
      this.dialog = true;
    },
    close () {
      this.dialog = false
    },
  }
}
</script>

<style scoped>
.link {
  font-weight: bold;
  color: steelblue;
}
</style>