const express = require('express');
const multer = require('multer');
const axios = require('axios');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');

router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  const fileStream = fs.createReadStream(req.file.path);

  const formData = new FormData();
  formData.append('resume', fileStream, req.file.originalname);

  try {
    const response = await axios.post('http://localhost:3000/match_resume', formData, {
      headers: formData.getHeaders(),
    });
    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error matching resume");
  }
});

module.exports = router;
