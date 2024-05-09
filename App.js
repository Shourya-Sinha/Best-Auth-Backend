const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const rateLimiter = require("express-rate-limit");

const session = require("cookie-session");

const bodyParser = require("body-parser");

const sanitize = require("express-mongo-sanitize");

const xss = require("xss");

const morgan = require("morgan");

const cookieParser = require("cookie-parser");

const routes = require('./Routes/AuthRoute');

const productRoutes = require('./Routes/productRoute'); 

const limiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // In one hour
  max: 3000, // limit each IP to 100 requests per windowMs
  message: "Too many Requests from this IP, please try again in an hour!",
});

const app = express();

app.use(helmet());
app.use(cors());
if (process.env.NODE_ENV === "Development") {
  app.use(morgan("dev"));
}
app.use("/myapp", limiter);
app.use(
  session({
    secret: "keyboard cat",
    proxy: true,
    resave: true,
    saveUnintialized: true,
    cookie: {
      secure: false,
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(sanitize());
// app.use((req, res, next) => {
//   // Sanitize request body
//   if (req.body) {
//     req.body = xss(req.body);
//   }
//   // Sanitize request query parameters
//   if (req.query) {
//     req.query = xss(req.query);
//   }
//   next();
// });
app.use(cookieParser());

app.use(routes);

app.use(productRoutes);

module.exports = app;
