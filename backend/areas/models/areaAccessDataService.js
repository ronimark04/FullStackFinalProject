const Area = require('./mongodb/Area');
const Artist = require('../../artists/models/mongodb/Artist');

const getAreas = async () => {
    try {
        const areas = await Area.find();
        console.log("Found areas in DB:", areas); // Debug log
        return areas;
    } catch (error) {
        console.error("Error in getAreas:", error); // Debug log
        throw error;
    }
};

const getAreaWithArtists = async (areaId) => {
    try {
        console.log("Looking for area with ID:", areaId); // Debug log
        const area = await Area.findById(areaId);
        console.log("Found area:", area); // Debug log

        if (!area) {
            const error = new Error("Area not found");
            error.status = 404;
            throw error;
        }

        const artists = await Artist.find({ area: areaId }).sort({ birthYear: 1 });
        console.log("Found artists:", artists); // Debug log

        return { area, artists };
    } catch (error) {
        console.error("Error in getAreaWithArtists:", error); // Debug log
        throw error;
    }
};

module.exports = {
    getAreas,
    getAreaWithArtists
}; 