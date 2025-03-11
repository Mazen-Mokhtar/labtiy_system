import { conctionDB } from "./DB/db.connction.js"
import requestController from "./modules/requset/request.controller.js"
import userController from "./modules/user/user.controller.js"

import { globalError, urlError } from "./utils/index.js"
import cors from "cors"

export const bootstrap = (app, express) => {
  app.use(cors({
    origin: '*', // Allow only your frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', "PATCH"], // Specify allowed methods
    allowedHeaders: ['Content-Type'], // Specify allowed headers
  }));

  conctionDB()

  app.use(express.json())
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    console.log(`📌 Received ${req.method} request on ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
  });
  app.use("/request", requestController)
  app.use("/user", userController)
  app.all("*", urlError);
  app.use(globalError)
}