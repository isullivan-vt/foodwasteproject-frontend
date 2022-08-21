<!--This component login modal that opens when a user clicks the person icon on the navigation bar-->
<template>
    <v-dialog v-model = 'login' fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <!--If a user is logged in, inform them and give the option to log out-->
          <v-card v-if="this.userid > 0" class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Household Food Waste App Login</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              You are already logged in.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                  color="primary"
                  @click="logout()">Logout
              </v-btn>
            </v-card-actions>
          </v-card>
          <!--If no user is logged in, show the fields needed to login to the app-->
          <v-card v-else class="elevation-12">
            <v-toolbar dark color="primary">
              <v-toolbar-title>Household Food Waste App Login</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form>
                <v-text-field
                    v-model="email"
                    name="email"
                    label="Email"
                    type="email"
                ></v-text-field>
                <v-text-field
                    v-model="password"
                    name="password"
                    label="Password"
                    type="password"
                ></v-text-field>
                <span>{{ this.errorMessage }}</span>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                  color="primary"
                  @click="validate()">Login
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
      </v-layout>
    </v-dialog>
</template>

<script>

import axios from "axios";

export default {
  data: () =>({
    login: false,
    errorMessage: "",
    email: "",
    password: "",
    user_name: ""
  }),
  computed: {
    userid() {
      return localStorage.userid
    }
  },
  methods:{
    // Calls the authenticate_user stored procedure. If an userid is returned, the login was valid and the userid is set in local storage
    validate() {
      axios.get("/api/authenticate-user?userEmail=" + this.email + "&password=" + this.password)
          .then(function (response) {
            localStorage.userid = response.data;
            if (response.data==null) {
              this.errorMessage = "Invalid username or password."
            } else {
              this.login = false;
            }
          })
          .catch(function (error) {
            console.log(error);
          });
    },
    // Sets userid back to null in localStorage and closes the login modal window
    logout() {
      localStorage.userid = null;
      this.login = false;
    },
  },
};

</script>

<style></style>
