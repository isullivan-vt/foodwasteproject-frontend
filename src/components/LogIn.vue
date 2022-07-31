<script src="store.js"></script>
<template>
    <v-dialog v-model="store.validated" fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Household Food Waste App Login</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form>
                <v-text-field
                    v-model="store.login"
                    name="login"
                    label="Login"
                    type="text"
                ></v-text-field>
                <v-text-field
                    v-model=store.password
                    name="password"
                    label="Password"
                    type="password"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                  color="primary"
                  @click="store.validate()">Login
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-dialog>
</template>

<script>
import { store } from './store'

export default {
  data() {
    return {
      store
    }
  },

};

</script>

<style></style>
