<template>
    <v-app-bar app color="green" dark>
      <v-app-bar-nav-icon @click.stop="$emit('toggle-drawer')"> </v-app-bar-nav-icon>
      <v-toolbar-title>Household Food Waste Management <v-icon>mdi-recycle</v-icon></v-toolbar-title>
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
  mounted() {
    fetch("/api/food/15")
        .then((response) => response.text())
        .then((data) => {
          this.msg = data;
        });
  }
};
</script>