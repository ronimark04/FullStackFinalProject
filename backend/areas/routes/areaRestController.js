const express = require('express');
const router = express.Router();
const { getAreas, getAreaWithArtists, getAreaWithArtistsByName } = require('../models/areaAccessDataService');
const { handleError } = require('../../utils/handleErrors');

// get all areas
router.get("/", async (req, res) => {
    try {
        const areas = await getAreas();
        console.log("All areas:", areas); // Debug log
        res.status(200).send(areas);
    } catch (error) {
        console.error("Error fetching areas:", error); // Debug log
        handleError(res, error.status || 500, error.message);
    }
});

// get area by name (with hyphens)
router.get('/area/:areaNameUrl', async (req, res) => {
    try {
        const { areaNameUrl } = req.params;
        const data = await getAreaWithArtistsByName(areaNameUrl);
        res.status(200).send(data);
    } catch (error) {
        handleError(res, error.status || 500, error.message);
    }
});

module.exports = router;