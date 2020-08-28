"use strict";

const express = require("express");
const logger = require("./utils/logger");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const exphbs = require("express-handlebars");

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(fileUpload());
app.engine(
  ".hbs",
  exphbs({
    extname: ".hbs",
    defaultLayout: "main",
    //https://stackoverflow.com/questions/41764373/how-to-register-custom-handlebars-helpers
    //https://handlebarsjs.com/guide/builtin-helpers.html#if
    //https://stackabuse.com/guide-to-handlebars-templating-engine-for-node/
    //Custom helper functions being defined to display the status of the goals
    helpers: {
      isOpen: function (status) {
        if (status == "Open") {
          return true
        } else {
          return false;
        }
      },
      isAchieved: function (status) {
        if (status == "Achieved") {
          return true
        } else {
          return false;
        }
      },
      isMissed: function (status) {
        if (status == "Missed") {
          return true
        } else {
          return false;
        }
      },

    }
  })
);
app.set("view engine", ".hbs");

const routes = require("./routes");
app.use("/", routes);

const listener = app.listen(process.env.PORT || 4000, function() {
  logger.info(`Gym Utility App started on port: ${listener.address().port}`);
});


