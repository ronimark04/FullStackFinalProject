const express = require('express');
const { getArtists, getArtist, getArtistsByArea, createArtist, updateArtist, likeArtist, deleteArtist } = require('../models/artistAccessDataService');
const auth = require('../../auth/authService');
const { handleError } = require('../../utils/handleErrors');

const router = express.Router();

// get all artists
router.get("/", async (req, res) => {
    try {
        let artists = await getArtists();
        res.send(artists);
    }
    catch (err) {
        return handleError(res, err.status || 400, err.message);
    }
});

// get artists by area
router.get("/byArea/:areaId", async (req, res) => {
    try {
        const { areaId } = req.params;
        let artists = await getArtistsByArea(areaId);
        res.send(artists);
    } catch (error) {
        return handleError(res, error.status || 400, error.message);
    }
});

// get artist by id
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        let artist = await getArtist(id);
        res.send(artist);
    } catch (error) {
        return handleError(res, error.status || 400, error.message);
    }
});

// create new artist
router.post("/", auth, async (req, res) => {
    try {
        const userInfo = req.user;
        if (!userInfo.isAdmin) {
            return handleError(res, 403, "Error: Non admin users cannot create new artists");
        }
        const artist = await createArtist(req.body);
        res.status(201).send(artist);
    } catch (error) {
        handleError(res, error.status || 400, error.message);
    }
});


// update artist
router.put("/:id", auth, async (req, res) => {
    try {
        const userInfo = req.user;
        const newArtist = req.body;
        const { id } = req.params;
        const originalArtist = await getArtist(id);
        // const userId = originalArtist.user_id.toString();

        if (!userInfo.isAdmin) {
            return handleError(res, 403, "Authorization Error: Non admin users cannot edit artists");
        }

        let artist = await updateArtist(id, artist);
        res.send(artist);
    }
    catch (err) {
        return handleError(res, 400, err.message);
    }
});

// // like/unlike a card
// router.patch("/:id", auth, async (req, res) => {
//     try {
//         let { id } = req.params;
//         let userId = req.user._id;
//         let card = await likeCard(id, userId);
//         res.send(card);
//     }
//     catch (err) {
//         return handleError(res, 400, err.message);
//     }
// });

// delete artist
router.delete("/:id", auth, async (req, res) => {
    try {
        let { id } = req.params;
        const userInfo = req.user;
        const originalArtist = await getArtist(id);
        // const userId = originalCard.user_id.toString();

        if (!userInfo.isAdmin) {
            return handleError(res, 403, "Authorization Error: Non admin users cannot delete artists");
        }

        await deleteArtist(id);
        res.send({ message: "Artist deleted successfully" });
    }
    catch (err) {
        return handleError(res, 400, err.message);
    }
});

module.exports = router;