import { reactive } from 'vue'
import axios from "axios";

export const store = reactive({
    validated: true,
    login: "",
    password: "",
    validate() {
        let self = this
        axios.get("/api/authenticate-user?userEmail=" + this.login + "&password=" + this.password)
            .then(function (response) {
                self.validated = !response.data
            })
            .catch(function (error) {
                console.log(error);
            });
    }
})