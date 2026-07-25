import dotenv from 'dotenv'
import { pool } from "../db/index.js";
import { findIP } from "../utils/ipAddress.js";

dotenv.config();

const validateFormData = (FormData) => {
  const isRatingValid = FormData.starRating > 0 && FormData.starRating <= 5;
  let isMessageValid = true;
  if (FormData.feedbackPrompt.trim().length > 0) {
    const wordsArr = FormData.feedbackPrompt.trim().split(/\s+/);
    // Rule A: Kills "asdfghjklqwertyuiopzxcvbnm"
    const hasGiantWords = wordsArr.some((word) => word.length > 25);

    // Rule B: Kills "56723048569347856237845693675378456"
    const isOnlyNumbers =
      /^[\d\s\W]+$/.test(FormData.feedbackPrompt) && FormData.feedbackPrompt.trim().length > 5;

    // Rule C: Kills "fffffffffffff" or "!!!!!!!!!!!"
    const hasSpamRepetition = /(.)\1{9,}/.test(FormData.feedbackPrompt);
    if (hasGiantWords || isOnlyNumbers || hasSpamRepetition) {
      isMessageValid = false;
    }
  }
  // validating name.
  const isNameValid =
    FormData.userName.trim() === "" || /^[\p{L}\s'-]+$/u.test(FormData.userName);
  // validating email.
  const isEmailValid =
    FormData.userEmail.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(FormData.userEmail);
  return    isRatingValid && isMessageValid && isNameValid && isEmailValid;
  
}

// this is that controller from where we will fetch all the data for the feedback feed.
const getFeedbackFeed = async (req, res, next) => {
  const { range } = req.query;
  let timestamp = "";
  console.log(range)
  if (range && range !== "all-time") {
    timestamp = `and feedback.created_at >= now() - interval '${range.replace("-", " ")}'`;
  }
  if (req.user) {
    const result = await pool.query(
      `select feedback.* from feedback
      join businesses on feedback.business_id = businesses.id
      where businesses.owner_id = $1 ${timestamp}
      order by feedback.created_at desc`,
      [req.user.id],
    );
    const feedbacks = result.rows;
    if (feedbacks.length === 0) {
      res.status(200).json({ feedbacks: []});
      return;
    } else {
      res.status(200).json({ feedbacks });
      return;
    }
  }
};

// this is the most biggest/complex/important controller.
const getBusinessData = async (req, res, next) => {
  if (req.user) {
    // basic business details. like logo url and name.
    const result = await pool.query(
      "SELECT * FROM businesses WHERE owner_id = $1 LIMIT 1",
      [req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Redirect to setup form" });
    }
    let businessData = result.rows[0];
    if (req.query.data === "sidebarData") {
      return res.status(200).json({
        businessName: businessData.name,
        logo_url: businessData.logo_url,
      });
    }
    // Collecting data about total feedback, average rating and NPS.
    const feedbackData = await pool.query(
      `
      SELECT 
  COUNT(*) AS total_responses,
  COALESCE(ROUND(AVG(rating), 1), 0) AS average_rating,
  SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS total_promoters,
  SUM(CASE WHEN rating <= 3 THEN 1 ELSE 0 END) AS total_detractors
  FROM feedback 
  WHERE business_id = $1;
  `,
      [businessData.id],
    );
    const trendLineData = await pool.query(
      `
      SELECT
      TO_CHAR(created_at, 'YYYY-MM-DD') AS date,
      ROUND(AVG(rating), 1) AS average_rating
      FROM feedback WHERE business_id = $1
      and created_at >= now() - interval '30 days'
      GROUP by date
      order by date ASC
      `,
      [businessData.id],
    );

    const shortcut = feedbackData.rows[0];
    const totalResponses = shortcut.total_responses;
    const averageRating = shortcut.average_rating;
    // logic for the nps
    const promoters = shortcut.total_promoters;
    const detractors = shortcut.total_detractors;
    let npsScore = 0;
    if (totalResponses > 0) {
      const percentPromoters = (promoters / totalResponses) * 100;
      const percentDetractors = (detractors / totalResponses) * 100;
      npsScore = Math.round(percentPromoters - percentDetractors);
    }
    // now for 5 latest feedback.
    const latestFeedback = await pool.query(
      "SELECT * FROM feedback WHERE business_id = $1 ORDER BY created_at DESC LIMIT 5",
      [businessData.id],
    );
    res.status(200).json({
      businessName: businessData.name,
      logo_url: businessData.logo_url,
      feedbackUrl: `http://${process.env.FRONTEND_URL}/feedbackForm/${businessData.id}`,
      totalResponses,
      averageRating,
      npsScore,
      latestFeedback: latestFeedback.rows,
      trendLineData: trendLineData.rows,
    });
  }
};
// this is used when a random customer scans a qr code and gets the form to to fill. There the business name, logoUrl gets from here.
const getFormData = async (req, res, next) => {
  let { id } = req.params;
  const result = await pool.query(
    "SELECT * FROM businesses WHERE id = $1 LIMIT 1",
    [id],
  );

  if (result.rowCount === 1) {
    res.status(200).json({
      businessName: result.rows[0].name,
      prompt: result.rows[0].prompt_message,
      logo_url: result.rows[0].logo_url,
    });
  } else {
    res.status(200).json({
      message: `Hey, something went wrong.`,
    });
  }
};
// when a random user clicks submit form this gets execute and post form data in db.
const postFormData = async (req, res, next) => {
  let feedbackData = req.body;
  if (!validateFormData(feedbackData)) return res.status(400).json({message: `Invalid Form Data`})
  let result;
  if (feedbackData.isAnonymous) {
    result = await pool.query(
      `INSERT INTO feedback (business_id, rating, message, is_anonymous) VALUES ($1, $2, $3, $4)`,
      [
        feedbackData.business_id,
        feedbackData.starRating,
        feedbackData.feedbackPrompt,
        feedbackData.isAnonymous,
      ],
    );
  } else {
    result = await pool.query(
      `INSERT INTO feedback (business_id, rating, message, is_anonymous, customer_name, customer_email) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        feedbackData.business_id,
        feedbackData.starRating,
        feedbackData.feedbackPrompt,
        feedbackData.isAnonymous,
        feedbackData.userName,
        feedbackData.userEmail,
      ],
    );
  }
  res.status(200).json(`Hey, I recived the data.`);
};

export { getBusinessData, getFormData, postFormData, getFeedbackFeed };
