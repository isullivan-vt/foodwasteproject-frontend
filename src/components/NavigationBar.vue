<!--This components uses a Vuetify NavigationBar component and is used as the navigation bar on all application pages-->
<template>
    <v-app-bar app color="green" dark>
      <v-app-bar-nav-icon @click.stop="$emit('toggle-drawer')"> </v-app-bar-nav-icon>
      <v-toolbar-title>Household Food Waste Management
        <v-icon>mdi-recycle</v-icon>
      </v-toolbar-title>
      <ul>
      <v-icon right @click.stop="$emit('toggle-login')">mdi-account</v-icon>
      </ul>
    </v-app-bar>
</template>

<script>
export default {
  name: 'NavigationBar',
  data: () => ({
    drawer: false,
    group: null,
    msg: ''
  }),
}

</script>
<style>
ul {
  right: 0%;
}
</style>