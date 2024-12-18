import express from "express";
import dotenv from "dotenv";
import { app } from "./app";

dotenv.config();
const port = process.env.PORT || 5000;


app.listen(port, () => {
  console.log(`App is listening to port: ${port}`);
});

module.exports = app
