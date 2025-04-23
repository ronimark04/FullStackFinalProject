const express = require('express');
const router = express.Router();
const Area = require('../models/mongodb/Area');
const Artist = require('../../artists/models/mongodb/Artist');

// get all areas
router.get("/", async (req, res) => {
    try {
        const areas = await Area.find();
        res.status(200).send(areas);
    } catch (error) {
        handleError(res, 500, error.message);
    }
});

// get area by id
router.get("/:areaId", async (req, res) => {
    try {
        const areaId = req.params.areaId;

        const area = await Area.findById(areaId);
        if (!area) {
            return handleError(res, 404, "Area not found");
        }

        const artists = await Artist.find({ area: areaId }).sort({ birthYear: 1 });

        res.status(200).send({ area, artists });
    } catch (error) {
        handleError(res, 500, error.message);
    }
});



module.exports = router;