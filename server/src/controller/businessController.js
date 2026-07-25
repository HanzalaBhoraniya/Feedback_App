import { pool } from "../db/index.js";
import stream from "stream";
import cloudinary from "../config/cloudinary.js";

// this is not an specific controller this is just a helper function.
const uploadToCloudinary = (buffer) => {
  return new Promise((resove, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "business_logos",
        format: "webp",
        transformation: [
          { width: 300, height: 300, crop: "fill", gravity: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        resove(result);
      },
    );
    stream.Readable.from(buffer).pipe(uploadStream);
  });
};

const validateBusinessName = (value) => {
  const cleanedValue = value?.trim() || "";
  const words = cleanedValue ? cleanedValue.split(/\s+/) : [];
  const MAX_BUSINESS_NAME_LENGTH = 50;
  const hasGiantWords = words.some((word) => word.length >= 20);
  const isOnlyNumbers =
    /^[\d\s\W]+$/.test(cleanedValue) && cleanedValue.length > 0;
  const hasDigits = /\d/.test(cleanedValue);
  const hasSpamRepetition = /(.)\1{9,}/.test(cleanedValue);
  const isLengthValid = cleanedValue.length <= MAX_BUSINESS_NAME_LENGTH;

  return (
    cleanedValue.length > 0 &&
    !hasGiantWords &&
    !isOnlyNumbers &&
    !hasDigits &&
    !hasSpamRepetition &&
    isLengthValid &&
    /^[\p{L}\s'-]+$/u.test(cleanedValue)
  );
};

const setProfile = async (req, res, next) => {
  try {
    const { name } = req.body; // accessing the name
    const cleanedName = name?.trim();
    if (!validateBusinessName(cleanedName)) {
      return res.status(400).json({
        message:
          "Enter a valid business name using only letters, spaces, apostrophes, or hyphens, and keep it under 50 characters.",
      });
    }
    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a logo image." });
    }
    if (!allowedImageTypes.includes(req.file.mimetype)) {
      return res
        .status(400)
        .json({ message: "Please upload a valid JPG or PNG logo." });
    }
    let logoUrl = null;
    if (req.file) {
      // checking if the file exsist if yes then start the process to upload in cloudinary.
      const result = await uploadToCloudinary(req.file.buffer);
      logoUrl = result.secure_url; // this is the url that the cloudinary returned of that uploaded logo.
    }
    // this means we got all the things name, prompt, and that logo url which is live.
    const dbResult = await pool.query(
      "INSERT INTO businesses (owner_id, name, logo_url) VALUES ($1, $2, $3)",
      [req.user.id, cleanedName, logoUrl],
    );
    if (dbResult.rowCount === 1) {
      // if got successfully saved then send this back.
      return res.status(200).json({
        message: "Profile data saved sucessfully",
      });
    } else {
      // if failed due to some reason then execute this.
      return res.status(500).json({
        message: "Failed to save profile data in DB.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to save profile data in DB.",
    });
  }
};
const updateProfile = async (req, res, next) => {
  try {
    const { updatedName } = req.body; // accessing updated from name from the req.body.
    const cleanedName = updatedName?.trim(); // removing extra spaces
    if (!validateBusinessName(cleanedName)) { // checking that does business name is valid.
      return res.status(400).json({
        message:
          "Enter a valid business name using only letters, spaces, apostrophes, or hyphens, and keep it under 50 characters.",
      });
    }

    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (req.file && !allowedImageTypes.includes(req.file.mimetype)) { // checking does uploaded image has valid file type.
      return res
        .status(400)
        .json({ message: "Please upload a valid JPG or PNG logo." });
    }

    let result;
    if (req.file) { // they also uploaded new logo then update both logo and the name.
      const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      const newLogoUrl = cloudinaryResult.secure_url;
      result = await pool.query(
        `UPDATE businesses SET name = $1, logo_url = $2 WHERE owner_id = $3`,
        [cleanedName, newLogoUrl, req.user.id],
      );
    } else { // else just update the name.
      result = await pool.query(
        `UPDATE businesses SET name = $1 WHERE owner_id = $2`,
        [cleanedName, req.user.id],
      );
    }

    if (result.rowCount === 1) {
      return res.status(200).json({
        message: "Profile data updated sucessfully",
      });
    }
    return res.status(404).json({
      message: "No business profile found to update.",
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Failed to update profile data in DB.",
    });
  }
};
const verifyProfile = async (req, res, next) => {
  const result = await pool.query(
    `SELECT * FROM businesses WHERE owner_id = $1 LIMIT 1`,
    [req.user.id],
  );
  if (result.rows.length === 1) {
    res.status(200).json({ message: `User already has the profile.` });
  } else {
    res.status(401).json({ message: "Redirect to setup form" });
  }
};

export { setProfile, verifyProfile, updateProfile };
