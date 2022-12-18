const express = require("express");
const { swagger_ui, specs } = require("./configs/swagger");
const multer = require("multer");
const fs = require("fs");
const session = require("express-session");
const cors = require("cors");

const user_router = require("./routers/user");
const clothe_router = require("./routers/clothe");
const clothe_metadata_router = require("./routers/clothe_metadata");
const category_router = require("./routers/category");
const location_router = require("./routers/location");
const brand_router = require("./routers/brand");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (!fs.existsSync("./images")) {
  fs.mkdirSync("./images");
}

app.use(express.static("images"));
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
app.use("/category", category_router);
app.use("/location", location_router);
app.use("/brand", brand_router);

app.use("/api-docs", swagger_ui.serve, swagger_ui.setup(specs));

app.listen(port, () => {
  console.log(`server is listening at port ${port}`);
});
