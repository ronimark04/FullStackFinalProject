import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Avatar, Tooltip, Card, Spinner, Button } from "@heroui/react";
import { useLanguage } from '@/context/languageContext';

const AreaPage = () => {
    const { areaId } = useParams();
    const navigate = useNavigate();
    const [artists, setArtists] = useState([]);
    const [area, setArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { language } = useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/areas/${areaId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`Area not found. Please check the ID and try again.`);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Received data:', data);
                setArea(data.area);
                setArtists(data.artists);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [areaId]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="text-danger text-center">
                    <h2 className="text-xl font-bold mb-4">Error Loading Area</h2>
                    <p className="mb-4">{error}</p>
                    <Button
                        color="primary"
                        onClick={() => navigate('/')}
                    >
                        Return to Home
                    </Button>
                </div>
            </div>
        );
    }

    const getLocalizedText = (textObj, defaultValue) => {
        if (!textObj) return defaultValue || null;
        return textObj[language];
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">
                {getLocalizedText(area?.name, language === 'heb' ? 'לא ידוע' : 'Unknown')} Artists
            </h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {artists.map((artist) => {
                    console.log('Processing artist:', artist);

                    const artistName = getLocalizedText(artist.name, language === 'heb' ? 'לא ידוע' : 'Unknown');
                    const fallbackInitial = artistName.charAt(0) || (language === 'heb' ? 'ל' : 'U');
                    const location = getLocalizedText(artist.location, language === 'heb' ? 'לא ידוע' : 'Unknown');
                    const bornElsewhere = getLocalizedText(artist.bornElsewhere);

                    return (
                        <Tooltip
                            key={artist._id}
                            content={
                                <Card className="p-3">
                                    <p className="font-semibold">{artistName}</p>
                                    <p className="text-sm">
                                        {artist.yearRange
                                            ? `${artist.yearRange.start} - ${artist.yearRange.end}`
                                            : artist.birthYear}
                                    </p>
                                    <p className="text-sm">{location}</p>
                                    {bornElsewhere && (
                                        <p className="text-sm italic">
                                            {language === 'heb' ? `נולד/ה ב${bornElsewhere}` : `Born in ${bornElsewhere}`}
                                        </p>
                                    )}
                                </Card>
                            }
                        >
                            <div className="cursor-pointer">
                                <Avatar
                                    src={artist.image?.url}
                                    className="w-24 h-24 [&>img]:object-top"
                                    fallback={fallbackInitial}
                                />
                            </div>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
};

export default AreaPage; 