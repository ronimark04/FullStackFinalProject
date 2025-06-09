const express = require('express');
const router = express.Router();
const { getAreas, getAreaWithArtists } = require('../models/areaAccessDataService');
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

// get area by id with its artists
router.get("/:areaId", async (req, res) => {
    try {
        const { areaId } = req.params;
        console.log("Requested area ID:", areaId); // Debug log
        const data = await getAreaWithArtists(areaId);
        console.log("Found area data:", data); // Debug log
        res.status(200).send(data);
    } catch (error) {
        console.error("Error fetching area:", error); // Debug log
        handleError(res, error.status || 500, error.message);
    }
});

module.exports = router;