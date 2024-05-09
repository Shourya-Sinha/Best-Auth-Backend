const User = require("../Models/userModel");

const moment = require("moment");

const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");

const sendMail = require("../Service/Mailer");

const otpGenerator = require("otp-generator");

const crypto = require("crypto");

const { promisify } = require("util");

const dotenv = require("dotenv");

dotenv.config({ path: "./Config/Config.env" });

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

const createResetPasswordToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const localTime = moment();

  const newTime = localTime.add(10, "minutes").format("YYYY-MM-DD HH:mm:ss");
  //const newTime = localTime.format("YYYY-MM-DD HH:mm:ss");
  const passwordResetExpires = newTime;

  return { passwordResetToken, passwordResetExpires };
};

const changePasswordAfter = (passwordChangedAt, JWTTimeStamp) => {
  if (passwordChangedAt) {
    const changedTimeStamp = parseInt(passwordChangedAt.getTime() / 1000, 10);
    return JWTTimeStamp < changedTimeStamp;
  }
  return false;
};

exports.RegisterUser = async (req, res, next) => {
  try {
    const localTime = moment();

    const newTime = localTime.format("YYYY-MM-DD HH:mm:ss");

    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "Passwords do not match",
      });
    }

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      if (existingUser.verified) {
        return res.status(400).json({
          status: "error",
          message:
            "User already exists, please login or try a different email.",
        });
      } else {
        // Update user information if not verified
        await User.findOneAndUpdate(
          { email },
          {
            password: await bcrypt.hash(password, 12),
            firstName,
            lastName,
          },
          {
            new: true,
            validateModifiedOnly: true,
          }
        );
        req.userId = existingUser._id; // Set userId to existing user's ID
        next(); // Move to the next middleware/controller
      }
    } else {
      // Create a new user

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        createdAt: newTime,
      };
      const createdUser = await User.create(newUser);

      req.userId = createdUser._id; // Set userId to newly created user's ID
      next(); // Move to the next middleware/controller

      // res.status(200).json({
      //   status: "success",
      //   message: "User Created Successfully",
      //   createdUser,
      // });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { userId } = req;

    const localTime = moment();

    //const newTime = localTime.format("YYYY-MM-DD HH:mm:ss");

    const new_otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });

    //const otp_expiry_time = newTime + 10 * 60 * 1000;
    const otp_expiry_time = localTime
      .add(10, "minutes")
      .format("YYYY-MM-DD HH:mm:ss");

    const hashedOtp = await bcrypt.hash(new_otp, 12);

    const user = await User.findByIdAndUpdate(userId, {
      otpExpiryTime: otp_expiry_time,
      otp: hashedOtp,
    });

    await user.save({ new: true, validateModifiedOnly: true });

    const emailData = {
      recipient: user.email,
      sender: "shouryasinha.c@gmail.com",
      subject: "Verification Otp",
      text: `Your Otp is ${new_otp}`,
      html: `<p> Your otp is ${new_otp} valid for only 10 Minutes </p>`,
    };

    await sendMail(emailData);

    return res.status(200).json({
      status: "success",
      message: "Otp Sent Successfully",
      otp: new_otp,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const localTime = moment();

    const newTime = localTime.format("YYYY-MM-DD HH:mm:ss");

    const user = await User.findOne({ email, otpExpiryTime: { $gt: newTime } });

    if (!user.email) {
      return res.status(400).json({
        status: "error",
        message: "No user found with this email",
      });
    }

    if (!user.otpExpiryTime) {
      return res.status(400).json({
        status: "error",
        message: "Otp Expired",
      });
    }

    const correctOtp = await bcrypt.compare(otp, user.otp);

    if (!correctOtp) {
      return res.status(400).json({
        status: "error",
        message: "Incorrect Otp",
      });
    }
    const verifiedUser = await User.findByIdAndUpdate(user._id, {
      verified: true,
      otpExpiryTime: null,
      otp: null,
    });

    await verifiedUser.save({ new: true, validateModifiedOnly: true });

    const token = signToken(verifiedUser._id);

    return res.status(200).json({
      status: "success",
      message: "Otp Verified Successfully",
      token,
      user_id: verifiedUser._id,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error" || error.message,
    });
  }
};

exports.LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email: email }).select("+password");

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "No user found with this email",
      });
    }

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      return res.status(400).json({
        status: "error",
        message: "Incorrect Password",
      });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      status: "success",
      message: "Login Successful",
      token,
      user_id: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error" || error.message,
    });
  }
};

exports.ResetPassowrd = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "No user found with this email",
      });
    }

    const { passwordResetExpires, passwordResetToken } =
      createResetPasswordToken();

    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save({ validateBeforeSave: false });
    console.log("Generated Token:", passwordResetToken);
    const resetUrl = `http://localhost:7000/auth/change-password?token=${passwordResetToken}`;

    await sendMail({
      recipient: user.email,
      sender: "shouryasinha.c@gmail.com",
      subject: "Reset Password",
      text: `Please click on the link to reset your password ${resetUrl}`,
      html: `<p> Please click on the link to reset your password ${resetUrl} </p>`,
    });
    return res.status(200).json({
      status: "success",
      message: "Reset Password Link Sent Successfully",
      resetUrl,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.ChangePassword = async (req, res) => {
  try {
    const hashedToken = req.body.token;

    const localTime = moment();

    const newTime = localTime.format("YYYY-MM-DD HH:mm:ss");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: newTime },
    });

    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "No user found with this token or Passowrd Reset Link Expire",
      });
    }

    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: "error",
        message: "Passwords do not match",
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id);

    return res.status(200).json({
      status: "success",
      message: "Password Reset Successfully",
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.Protect = async (req, res, next) => {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Not Authorized Please login to get Access!!",
      });
    }

    // verification
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    console.log(decoded);

    // check user

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        status: "error",
        message:
          "This user belonging to this token does not longer exist, Login Again",
      });
    }
    if (changePasswordAfter(user.passwordChangedAt, decoded.iat)) {
      return res.status(401).json({
        status: "error",
        message: "User Recently change their password,Please Login Again",
      });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
