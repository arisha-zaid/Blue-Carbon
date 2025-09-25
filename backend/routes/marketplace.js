const express = require("express");
const router = express.Router();
const { body, validationResult, param, query } = require("express-validator");
const { isAuthenticated } = require("../middleware/auth");
const MarketplaceListing = require("../models/MarketplaceListing");

// Create a new marketplace listing
router.post(
  "/listings",
  isAuthenticated,
  [
    body("title")
      .trim()
      .isLength({ min: 3, max: 120 })
      .withMessage("Title must be 3-120 characters"),
    body("description")
      .optional()
      .isLength({ max: 2000 })
      .withMessage("Description too long"),
    body("credits")
      .isFloat({ min: 1 })
      .withMessage("Credits must be at least 1"),
    body("price")
      .isFloat({ min: 0.01 })
      .withMessage("Price must be at least 0.01"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
          });
      }

      const { title, description, credits, price } = req.body;

      const listing = new MarketplaceListing({
        user: req.user._id,
        title,
        description: description || "",
        credits: Number(credits),
        price: Number(price),
        status: "active",
      });

      await listing.save();
      return res.status(201).json({ success: true, data: listing });
    } catch (err) {
      console.error("Create listing error:", err);
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to create listing",
          error: err.message,
        });
    }
  }
);

// Get active listings with pagination
router.get(
  "/listings",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("status").optional().isIn(["active", "sold", "removed"]),
  ],
  async (req, res) => {
    try {
      const page = parseInt(req.query.page || "1", 10);
      const limit = parseInt(req.query.limit || "20", 10);
      const skip = (page - 1) * limit;
      const status = req.query.status || "active";

      const filter = { status };
      const [items, total] = await Promise.all([
        MarketplaceListing.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        MarketplaceListing.countDocuments(filter),
      ]);

      return res.json({
        success: true,
        data: items,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCount: total,
          hasNext: skip + items.length < total,
          hasPrev: page > 1,
        },
      });
    } catch (err) {
      console.error("List listings error:", err);
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to fetch listings",
          error: err.message,
        });
    }
  }
);

// Get current user's listings
router.get("/listings/mine", isAuthenticated, async (req, res) => {
  try {
    const items = await MarketplaceListing.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error("My listings error:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch your listings",
        error: err.message,
      });
  }
});

// Update listing status (active/sold/removed)
router.patch(
  "/listings/:id/status",
  isAuthenticated,
  [
    param("id").isMongoId().withMessage("Invalid listing id"),
    body("status")
      .isIn(["active", "sold", "removed"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
          });
      }

      const { id } = req.params;
      const { status } = req.body;

      const listing = await MarketplaceListing.findOne({
        _id: id,
        user: req.user._id,
      });
      if (!listing) {
        return res
          .status(404)
          .json({ success: false, message: "Listing not found" });
      }

      listing.status = status;
      await listing.save();
      return res.json({ success: true, data: listing });
    } catch (err) {
      console.error("Update listing status error:", err);
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to update listing",
          error: err.message,
        });
    }
  }
);

// Delete a listing
router.delete(
  "/listings/:id",
  isAuthenticated,
  [param("id").isMongoId().withMessage("Invalid listing id")],
  async (req, res) => {
    try {
      const { id } = req.params;
      const listing = await MarketplaceListing.findOneAndDelete({
        _id: id,
        user: req.user._id,
      });
      if (!listing) {
        return res
          .status(404)
          .json({ success: false, message: "Listing not found" });
      }
      return res.json({ success: true, message: "Listing deleted" });
    } catch (err) {
      console.error("Delete listing error:", err);
      return res
        .status(500)
        .json({
          success: false,
          message: "Failed to delete listing",
          error: err.message,
        });
    }
  }
);

module.exports = router;
