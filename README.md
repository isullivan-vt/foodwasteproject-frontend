# foodwasteproject-frontend
UI component of the Food Waste Project application. 

<h2>Purpose: </h2>
<p>
Uneaten food  is a major source of waste. Up to 40% of food produced in the United States is not eaten, and instead makes its way to landfills, 
both contributing to pollution, as well as costing households hundreds of dollars in wasted food every year. One way that this 
problem could be alleviated is through better household management of food inventory through better tracking of how long ago food was 
purchased, as well as the availability of recipes that can help households make full use of purchased food. This project seeks to build an 
application that will help households track the age of their perishable food inventory, and suggest recipes that will help households use 
purchased food before it expires and needs to be discarded.
<p>

<h2>Architecture Notes</h2>
<p>This is a Vue JS application where all of the UI code lives. Notable packages in this project include the Components, which are the different UI elements that are placed onto the different application pages; Pages, the different application pages; and Entry, the page routing configuration for the application.</p>

<h2>Setup: </h2>
<p>
In order to work with the frontend project, Vue Js will need to be installed. Having Node JS installed is a prerequisite to installing Vue. Node can be downloaded from https://nodejs.org/en/. Once node has been installed, Vue can be installed following the directions provided here: https://cli.vuejs.org/guide/installation.html. The project is built using Vue version 2.7.2. This is the version of Vue that should be installed to run the application locally. Once vue is installed, Vuetify version 2.6.7 can be installed by running the following command in terminal within the directory of the vue project:
npm install vuetify
Once all of the required packages are installed, the project comes with all of the necessary configurations set to run locally. The project is configured to run on port 3000 locally. The project has several configuration files to take note of in the event that changes need to be made:
vue.config.js - contains the setting for the port number where the application will run locally as well as the proxy settings for the services project. It is assumed that the services will run on port 8080 locally and all new endpoints will have a url that starts with /api. If this changes, this config file will need to be updated accordingly.
jsconfig.json - holds the compile configurations for the application
package.json - contains the dependencies needed for the project to run. If additional libraries are installed in future development, this configuration file may need to be updated if it is not automatically done as part of the installation process.
babel.config.js - configuration file for Babel, the Javascript compiler used by the project. This is the default compiler used when a Vue project is created.
.</p>

