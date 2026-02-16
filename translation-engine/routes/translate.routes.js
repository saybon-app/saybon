const express = require("express");

const router = express.Router();

const multer = require("multer");

const upload = multer({
    dest: "storage/"
});

const {
    handleTranslation
} = require("../controllers/translate.controller");

router.post(
    "/translate",
    upload.single("file"),
    handleTranslation
);

module.exports = router;
