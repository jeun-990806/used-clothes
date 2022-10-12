const express = require("express");
const { swagger_ui, specs } = require("./configs/swagger");
const multer = require("multer");

const session = require("express-session");

const user_router = require("./routers/user");
const clothe_router = require("./routers/clothe");
const clothe_metadata_router = require("./routers/clothe_metadata");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

app.use("/user", user_router);
app.use("/clothe", clothe_router);
app.use("/clothe_metadata", clothe_metadata_router);

app.use("/api-docs", swagger_ui.serve, swagger_ui.setup(specs));

app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
