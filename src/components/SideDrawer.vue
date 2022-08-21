<!--This components uses a Vuetify side drawer component and contains links to all pages in the application. It is used on all pages-->
<template>
  <v-navigation-drawer v-model="drawer" app
                       clipped
                       hide-overlay
                       :style="{ top: $vuetify.application.top + 'px',
                       bottom: $vuetify.application.bottom - 'px',
                       zIndex: 4 }">
    <v-list nav dense>
      <v-list-item-group
          active-class="deep-purple--text text--accent-4"
      >

        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-view-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-title><a href="/">Dashboard</a></v-list-item-title>
        </v-list-item>

        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-basket</v-icon>
          </v-list-item-icon>
          <v-list-item-title><a href="/shopping-list">Shopping List</a></v-list-item-title>
        </v-list-item>

        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-fridge</v-icon>
          </v-list-item-icon>
          <v-list-item-title><a href="/pantry">Pantry</a></v-list-item-title>
        </v-list-item>

        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-food-turkey</v-icon>
          </v-list-item-icon>
          <v-list-item-title><a href="meal-planner">Meal Planner</a></v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "SideDrawer",
  data:() => ({
    // if the drawer value is false, the drawer is close, if true it is open
    drawer: false
  })
}
</script>

<style scoped>
a:link {
  color: black;
  text-decoration: none;
}
a:visited {
  color: black;
  text-decoration: none;
}
</style>