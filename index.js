import * as dotenv from "dotenv"
import express from "express";
import { bootstrap } from "./src/app.controller.js";
dotenv.config({})
const app = express();
app.listen(process.env.PORT, () => {
    console.log("sever is runing successfully in port", process.env.PORT)
})
bootstrap(app, express);
