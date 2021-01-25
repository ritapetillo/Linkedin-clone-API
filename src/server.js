const express = require("express");
const server = express();
const cors = require("cors");
const error_handler = require("node-error-handler");
const PORT = process.env.PORT || 3001;
const apiRoutes = require("./services");
const mongoose = require("mongoose");


server.use(express.json());
server.use(cors());

server.use("/api", apiRoutes);

server.use(error_handler({ log: true, debug: true }));

//Connect to DB and server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    server.listen(PORT, () => {
      console.log("server connected at port ", PORT);
    })
  );