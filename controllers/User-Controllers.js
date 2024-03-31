const HttpError = require("../middleware/http-error");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const fs = require("fs");
const path = require("path");

const generateUniqueId = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let uniqueId = "";
  for (let i = 0; i < 8; i++) {
    uniqueId += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return uniqueId;
};

const inviteUser = async (req, res, next) => {
  const {
    name,
    email,
    phoneNumber,
    alternateEmail,
    orgName,
    orgRole,
    validTill,
  } = req.body;

  // Generate a unique ID
  let uniqueId = generateUniqueId();

  // Check if the generated unique ID already exists in the database
  const existingUniqueId = `SELECT * FROM user_invitee WHERE uniqueId = ?`;
  let existingUId;
  try {
    await db.query(existingUniqueId, [uniqueId], (err, result, fields) => {
      if (err) {
        return console.log(err);
      }
      existingUId = result[0];

      if (existingUId) {
        uniqueId = generateUniqueId();
      } else {
        return uniqueId;
      }
    });
  } catch (err) {
    return next(new HttpError("Database error", 500));
  }

  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Invalid Inputs passed, Please try Again",
      errors: errors.array(),
    });
  }

  // Save invitee details to database
  const insertInviteeQuery = `
        INSERT INTO user_invitee (name, email, phoneNumber, alternateEmail, orgName, orgRole, validTill, uniqueId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
  try {
    await db.query(insertInviteeQuery, [
      name,
      email,
      phoneNumber,
      alternateEmail,
      orgName,
      orgRole,
      validTill,
      uniqueId,
    ]);
    // Respond with unique id for sign up
    res.status(201).json({ uniqueId });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Database error", 500));
  }
};

const signUp = async (req, res, next) => {
  // Extract unique id and password from request body
  const { uniqueId, password } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Update invitee with password
  const updateInviteeQuery = `
      UPDATE user_invitee
      SET password = ?
      WHERE uniqueId = ?
    `;
  try {
    await db.query(updateInviteeQuery, [hashedPassword, uniqueId]);
  } catch (err) {
    console.error(err);
    return next(new HttpError("Database error", 500));
  }

  res.status(200).json({ message: "Sign up successful" });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists
  const getUserQuery = `SELECT * FROM user_invitee WHERE email = ?`;

  let result;
  try {
    [result] = await new Promise((resolve, reject) => {
      db.query(getUserQuery, [email], (err, result, fields) => {
        if (err) {
          return reject(err);
        }
        const user = result[0];
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        resolve(result);
      });
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Database error", 500));
  }

  // Validate password
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, result.password);
  } catch (err) {
    return next(new HttpError("Password verification error", 500));
  }

  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  // Generate JWT token
  let token;
  try {
    token = jwt.sign(
      {
        email: result.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Token generation error", 500));
  }

  res.status(200).json({
    email: result.email,
    token,
  });
};

const logout = async (req, res, next) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

const editUser = async (req, res, next) => {
  // Extract updated user details from request body
  const {
    name,
    email,
    phoneNumber,
    alternateEmail,
    orgName,
    orgRole,
    validTill,
    uniqueId,
    password,
  } = req.body;

  // Check if user exists using uniqueId
  const getUserQuery = `SELECT * FROM user_invitee WHERE uniqueId = ?`;
  let result;
  try {
    [result] = await new Promise((resolve, reject) => {
      db.query(getUserQuery, [uniqueId], (err, result, fields) => {
        if (err) {
          return reject(err);
        }
        const existingUId = result;
        if (!existingUId) {
          return res.status(404).json({ message: "UniqueID does not exist" });
        }

        resolve(result);
        return result;
      });
    });
  } catch (err) {
    console.error(err);
    return next(new HttpError("Database error", 500));
  }
  console.log(result);

  // Update user information in database
  const updateUserQuery = `
      UPDATE user_invitee
      SET name = ?, email = ?, phoneNumber = ?, alternateEmail = ?, orgName = ?, orgRole = ?, validTill = ?, password = ?
      WHERE uniqueId = ?
    `;
  try {
    await db.query(updateUserQuery, [
      (result.name = name ? name : result.name),
      (result.email = email ? email : result.email),
      (result.phoneNumber = phoneNumber ? phoneNumber : result.phoneNumber),
      (result.alternateEmail = alternateEmail
        ? alternateEmail
        : result.alternateEmail),
      (result.orgName = orgName ? orgName : result.orgName),
      (result.orgRole = orgRole ? orgRole : result.orgRole),
      (result.validTill = validTill ? validTill : result.validTill),
      (result.password = password ? password : result.password),
      uniqueId,
    ]);
  } catch (err) {
    console.error(err);
    return next(new HttpError("Database error", 500));
  }

  // Add/change profile picture
  const file = req.file;

  if (file) {
    const fileName = file.filename;

    const updateProfilePictureQuery = `
        UPDATE user_invitee
        SET profilePicture = ?
        WHERE uniqueId = ?
      `;
    try {
      await db.query(updateProfilePictureQuery, [fileName, uniqueId]);
    } catch (err) {
      console.error(err);
      return next(new HttpError("Database error", 500));
    }
  }

  res.status(200).json({ message: "User information updated successfully" });
};

exports.inviteUser = inviteUser;
exports.signUp = signUp;
exports.login = login;
exports.logout = logout;
exports.editUser = editUser;
