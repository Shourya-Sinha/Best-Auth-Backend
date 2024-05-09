const app = require('./App');

const mongoose = require('mongoose');

const dotenv = require('dotenv');

dotenv.config({path: './Config/Config.env'});

const port = process.env.PORT || 3000;

const DB = process.env.MONGODB_URI

process.on("uncaughtException", (err) => {
  console.error(err);
  console.log("UNCAUGHT Exception! Shutting down ...");
  process.exit(1); // Exit the process in case of uncaught exception
});

mongoose.connect(DB).then(() => {
  console.log('MONGODB CONNECTED SUCCESSFULLY');
}).catch((error) => {
  console.error('ERROR CONNECTING WITH MONGODB', error);
  process.exit(1); // Exit the process in case of connection failure
});



  const server = app.listen(port, () => {
    console.log(`SERVER IS RUNNING ON ${port}`);
  });
  
  
  process.on("unhandledRejection", (err) => {
    console.error(err);
    console.log("UNHANDLED REJECTION! Shutting down ...");
    server.close(() => {
      process.exit(1); // Exit the process after closing the server
    });
  });
  






