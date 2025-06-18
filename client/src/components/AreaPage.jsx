import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Avatar, Tooltip, Card, Spinner, Button } from "@heroui/react";
import { useLanguage } from '@/context/languageContext';
import { useAuth } from '@/context/authContext';
import { motion } from "framer-motion";
import ArtistActions from './ArtistActions';

const AreaPage = () => {
    const { areaName } = useParams();
    const navigate = useNavigate();
    const [artists, setArtists] = useState([]);
    const [area, setArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { language } = useLanguage();
    const { user } = useAuth();

    // --- Dynamic line width logic ---
    // Refs for timeline and avatars
    const timelineRef = useRef(null);
    const leftAvatarRefs = useRef([]);
    const rightAvatarRefs = useRef([]);
    const [leftLineWidths, setLeftLineWidths] = useState([]);
    const [rightLineWidths, setRightLineWidths] = useState([]);

    // Helper to measure and set line widths
    const measureLineWidths = () => {
        if (!timelineRef.current) return;
        const timelineRect = timelineRef.current.getBoundingClientRect();
        // Left column
        const newLeftWidths = leftAvatarRefs.current.map((ref) => {
            if (!ref) return 0;
            const avatarRect = ref.getBoundingClientRect();
            // Distance from avatar center (right edge) to timeline (left edge)
            return timelineRect.left - (avatarRect.left + avatarRect.width / 2);
        });
        setLeftLineWidths(newLeftWidths);
        // Right column
        const newRightWidths = rightAvatarRefs.current.map((ref) => {
            if (!ref) return 0;
            const avatarRect = ref.getBoundingClientRect();
            // Distance from avatar center (left edge) to timeline (right edge)
            return (avatarRect.left + avatarRect.width / 2) - timelineRect.right;
        });
        setRightLineWidths(newRightWidths);
    };

    // Effect for measuring lines after data is loaded
    useEffect(() => {
        if (!loading && artists.length > 0) {
            // Wait for images to load and DOM to be fully rendered
            const timer = setTimeout(() => {
                measureLineWidths();
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [loading, artists]);

    // Separate effect for resize handling
    useEffect(() => {
        let resizeTimer;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                measureLineWidths();
            }, 100);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimer);
        };
    }, []);

    // --- End dynamic line width logic ---

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`/areas/area/${areaName}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`Area not found. Please check the name and try again.`);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
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
    }, [areaName]);

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

    // Helper to get avatar size based on rate
    const getAvatarSize = (rate) => {
        switch (rate) {
            case 1: return 'w-52 h-52'; // 208px
            case 2: return 'w-40 h-40'; // 160px
            case 3: return 'w-36 h-36'; // 144px
            case 4: return 'w-28 h-28'; // 112px
            default: return 'w-52 h-52'; // Default to largest size
        }
    };

    // Helper to get avatar pixel size based on rate
    const getAvatarPixelSize = (rate) => {
        switch (rate) {
            case 1: return 208;
            case 2: return 160;
            case 3: return 144;
            case 4: return 112;
            default: return 208;
        }
    };

    // Helper to normalize area name for comparison
    const normalizeAreaName = (name) => {
        if (!name) return '';
        return name.toLowerCase().trim();
    };

    // Helper to check if area is Tel Aviv
    const isTelAvivArea = (name) => {
        const normalized = normalizeAreaName(name);
        return normalized === 'tel aviv';
    };

    // Helper to remove parentheses and their contents from a string
    function stripParentheses(str) {
        if (!str) return str;
        return str.replace(/\s*\([^)]*\)/g, '').trim();
    }

    // Sort artists by birth year
    const sortedArtists = [...artists].sort((a, b) => {
        const yearA = a.isBand ? a.yearRange?.first : a.birthYear;
        const yearB = b.isBand ? b.yearRange?.first : b.birthYear;

        // Handle cases where year might be undefined
        if (!yearA && !yearB) return 0;
        if (!yearA) return 1;
        if (!yearB) return -1;

        return yearA - yearB;
    });

    // Split sorted artists into two columns
    const leftColumnArtists = sortedArtists.filter((_, i) => i % 2 === 0);
    const rightColumnArtists = sortedArtists.filter((_, i) => i % 2 === 1);

    console.log('Area data:', area);
    console.log('Area name:', area?.name);
    console.log('Normalized area name:', normalizeAreaName(area?.name));
    const showLocation = !isTelAvivArea(area?.name);
    console.log('Show location:', showLocation);

    // Helper to get the correct Hebrew gender form
    const getHebrewGenderText = (gender, bornElsewhere) => {
        if (!bornElsewhere) return '';
        if (gender === 'm') {
            return `נולד ב${bornElsewhere}`;
        } else if (gender === 'f') {
            return `נולדה ב${bornElsewhere}`;
        } else {
            // Fallback to the original form if gender is not set
            return `נולד/ה ב${bornElsewhere}`;
        }
    };

    return (
        <div className="container mx-auto p-6 pt-36 pb-24">
            <div className="flex justify-center items-start gap-96 relative">
                {/* Left column */}
                <div className="flex flex-col relative">
                    {leftColumnArtists.map((artist, idx) => {
                        const artistNameRaw = getLocalizedText(artist.name, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const artistName = stripParentheses(artistNameRaw);
                        const fallbackInitial = artistName.charAt(0) || (language === 'heb' ? 'ל' : 'U');
                        const location = getLocalizedText(artist.location, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const bornElsewhere = getLocalizedText(artist.bornElsewhere);
                        const yearDisplay = artist.yearRange
                            ? `${artist.yearRange.first} - ${artist.yearRange.last}`
                            : artist.birthYear;
                        const showLocation = !isTelAvivArea(area?.name);
                        // Reverse: first avatar is right, second is left, etc.
                        const offset = 60; // px, adjust as needed
                        const isLeft = idx % 2 !== 0;
                        return (
                            <div
                                key={artist._id}
                                className="relative flex flex-col items-center mb-16"
                                style={{
                                    alignItems: isLeft ? 'flex-end' : 'flex-start',
                                    left: isLeft ? `-${offset}px` : `${offset}px`,
                                    transition: 'left 0.3s',
                                }}
                                ref={el => leftAvatarRefs.current[idx] = el}
                            >
                                {/* Dynamic connecting line to timeline */}
                                {leftLineWidths[idx] > 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            width: `${leftLineWidths[idx]}px`,
                                            height: '4px',
                                            background: '#a1130a',
                                            transform: 'translateY(-50%)',
                                        }}
                                        className="shadow-[0_0_3px_0.5px_rgba(161,19,10,0.8)]"
                                    />
                                )}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '45%',
                                        left: '105%',
                                        marginLeft: '8px',
                                        transform: 'translateY(-50%)',
                                        color: "#ffab40",
                                        fontWeight: 400,
                                        fontSize: "1.5rem",
                                        lineHeight: 1.1,
                                        fontFamily: 'adobe-hebrew',
                                        fontStyle: 'normal',
                                        textShadow: `
                                            1px 0 #b71c1c,
                                            -1px 0 #b71c1c,
                                            0 1px #b71c1c,
                                            0 -1px #b71c1c,
                                            0.7px 0.7px #b71c1c,
                                            -0.7px -0.7px #b71c1c,
                                            0.7px -0.7px #b71c1c,
                                            -0.7px 0.7px #b71c1c,
                                            0 0 8px rgba(183,28,28,0.5),
                                            0 0 8px rgba(183,28,28,0.5)
                                        `,
                                        pointerEvents: 'none',
                                        zIndex: 11,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {yearDisplay}
                                </div>
                                <div className="relative flex items-center justify-center w-full h-full">
                                    {/* ArtistActions absolutely positioned to the left */}
                                    {(() => {
                                        const avatarPx = getAvatarPixelSize(artist.rate);
                                        return (
                                            <div style={{
                                                position: 'absolute',
                                                left: `calc(50% - ${avatarPx / 2 + 55}px)`,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                zIndex: 20,
                                            }}>
                                                <ArtistActions
                                                    artistId={artist._id}
                                                    initialComments={3}
                                                    isAuthenticated={!!user}
                                                    userId={user?._id}
                                                    column="left"
                                                />
                                            </div>
                                        );
                                    })()}
                                    {/* Avatar centered */}
                                    <motion.div
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative flex flex-col items-center cursor-pointer group"
                                    >
                                        <span
                                            style={{
                                                color: "#ffab40",
                                                fontWeight: 400,
                                                fontSize: "2.5rem",
                                                lineHeight: 1,
                                                position: "absolute",
                                                top: "-40px",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                textAlign: "center",
                                                zIndex: 10,
                                                pointerEvents: "none",
                                                fontFamily: 'adobe-hebrew',
                                                fontStyle: 'normal',
                                                textShadow: `
                                                    1.5px 0 #b71c1c,
                                                    -1.5px 0 #b71c1c,
                                                    0 1.5px #b71c1c,
                                                    0 -1.5px #b71c1c,
                                                    1px 1px #b71c1c,
                                                    -1px -1px #b71c1c,
                                                    1px -1px #b71c1c,
                                                    -1px 1px #b71c1c,
                                                    0 0 8px rgba(183,28,28,0.5),
                                                    0 0 8px rgba(183,28,28,0.5)
                                                `,
                                                whiteSpace: 'nowrap',
                                                direction: language === 'heb' ? 'rtl' : 'ltr'
                                            }}
                                        >
                                            {artistName}
                                        </span>
                                        <Link to={`/artist/${artist._id}`}>
                                            <div className="shadow-[0_0_8px_0.5px_rgba(161,19,10,0.8)] rounded-2xl">
                                                <Avatar
                                                    src={artist.image?.url}
                                                    className={`${getAvatarSize(artist.rate)} [&>img]:object-top`}
                                                    fallback={fallbackInitial}
                                                    radius="lg"
                                                    isBordered
                                                    color="danger"
                                                />
                                            </div>
                                        </Link>
                                        {/* Year and location (just below avatar) */}
                                        <span
                                            className="absolute left-0 right-0 bottom-0 z-10 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                            style={{
                                                color: "#ffab40",
                                                fontWeight: 400,
                                                fontSize: "1.5rem",
                                                lineHeight: 1.1,
                                                fontFamily: 'adobe-hebrew',
                                                fontStyle: 'normal',
                                                textShadow: `
                                                    1px 0 #b71c1c,
                                                    -1px 0 #b71c1c,
                                                    0 1px #b71c1c,
                                                    0 -1px #b71c1c,
                                                    0.7px 0.7px #b71c1c,
                                                    -0.7px -0.7px #b71c1c,
                                                    0.7px -0.7px #b71c1c,
                                                    -0.7px 0.7px #b71c1c,
                                                    0 0 8px rgba(183,28,28,0.5),
                                                    0 0 8px rgba(183,28,28,0.5)
                                                `,
                                                direction: language === 'heb' ? 'rtl' : 'ltr'
                                            }}
                                        >
                                            {showLocation && (
                                                bornElsewhere ? (
                                                    <>
                                                        <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location}</div>
                                                        <div style={{
                                                            fontSize: '1.1rem',
                                                            fontStyle: 'italic',
                                                            direction: language === 'heb' ? 'rtl' : 'ltr'
                                                        }}>
                                                            {language === 'heb' ? getHebrewGenderText(artist.gender, bornElsewhere) : `Born in ${bornElsewhere}`}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location}</div>
                                                )
                                            )}
                                        </span>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Right column */}
                <div className="flex flex-col relative mt-28">
                    {rightColumnArtists.map((artist, idx) => {
                        const artistNameRaw = getLocalizedText(artist.name, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const artistName = stripParentheses(artistNameRaw);
                        const fallbackInitial = artistName.charAt(0) || (language === 'heb' ? 'ל' : 'U');
                        const location = getLocalizedText(artist.location, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const bornElsewhere = getLocalizedText(artist.bornElsewhere);
                        const yearDisplay = artist.yearRange
                            ? `${artist.yearRange.first} - ${artist.yearRange.last}`
                            : artist.birthYear;
                        const showLocation = !isTelAvivArea(area?.name);
                        // Reverse: first avatar is left, second is right, etc.
                        const offset = 60; // px, adjust as needed
                        const isRight = idx % 2 !== 0;
                        return (
                            <div
                                key={artist._id}
                                className="relative flex flex-col items-center mb-16"
                                style={{
                                    alignItems: isRight ? 'flex-start' : 'flex-end',
                                    left: isRight ? `${offset}px` : `-${offset}px`,
                                    transition: 'left 0.3s',
                                }}
                                ref={el => rightAvatarRefs.current[idx] = el}
                            >
                                {/* Dynamic connecting line to timeline */}
                                {rightLineWidths[idx] > 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: '50%',
                                            width: `${rightLineWidths[idx]}px`,
                                            height: '4px',
                                            background: '#a1130a',
                                            transform: 'translateY(-50%)',
                                        }}
                                        className="shadow-[0_0_3px_0.5px_rgba(161,19,10,0.8)]"
                                    />
                                )}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '45%',
                                        right: '105%',
                                        marginRight: '8px',
                                        transform: 'translateY(-50%)',
                                        color: "#ffab40",
                                        fontWeight: 400,
                                        fontSize: "1.5rem",
                                        lineHeight: 1.1,
                                        fontFamily: 'adobe-hebrew',
                                        fontStyle: 'normal',
                                        textShadow: `
                                            1px 0 #b71c1c,
                                            -1px 0 #b71c1c,
                                            0 1px #b71c1c,
                                            0 -1px #b71c1c,
                                            0.7px 0.7px #b71c1c,
                                            -0.7px -0.7px #b71c1c,
                                            0.7px -0.7px #b71c1c,
                                            -0.7px 0.7px #b71c1c,
                                            0 0 8px rgba(183,28,28,0.5),
                                            0 0 8px rgba(183,28,28,0.5)
                                        `,
                                        pointerEvents: 'none',
                                        zIndex: 11,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {yearDisplay}
                                </div>
                                <div className="relative flex items-center justify-center w-full h-full">
                                    {/* ArtistActions absolutely positioned to the right */}
                                    {(() => {
                                        const avatarPx = getAvatarPixelSize(artist.rate);
                                        return (
                                            <div style={{
                                                position: 'absolute',
                                                right: `calc(50% - ${avatarPx / 2 + 55}px)`,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                zIndex: 20,
                                            }}>
                                                <ArtistActions
                                                    artistId={artist._id}
                                                    initialComments={3}
                                                    isAuthenticated={!!user}
                                                    userId={user?._id}
                                                    column="right"
                                                />
                                            </div>
                                        );
                                    })()}
                                    {/* Avatar centered */}
                                    <motion.div
                                        whileHover={{ scale: 1.08 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="relative flex flex-col items-center cursor-pointer group"
                                    >
                                        <span
                                            style={{
                                                color: "#ffab40",
                                                fontWeight: 400,
                                                fontSize: "2.5rem",
                                                lineHeight: 1,
                                                position: "absolute",
                                                top: "-40px",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                textAlign: "center",
                                                zIndex: 10,
                                                pointerEvents: "none",
                                                fontFamily: 'adobe-hebrew',
                                                fontStyle: 'normal',
                                                textShadow: `
                                                    1.5px 0 #b71c1c,
                                                    -1.5px 0 #b71c1c,
                                                    0 1.5px #b71c1c,
                                                    0 -1.5px #b71c1c,
                                                    1px 1px #b71c1c,
                                                    -1px -1px #b71c1c,
                                                    1px -1px #b71c1c,
                                                    -1px 1px #b71c1c,
                                                    0 0 8px rgba(183,28,28,0.5),
                                                    0 0 8px rgba(183,28,28,0.5)
                                                `,
                                                whiteSpace: 'nowrap',
                                                direction: language === 'heb' ? 'rtl' : 'ltr'
                                            }}
                                        >
                                            {artistName}
                                        </span>
                                        <Link to={`/artist/${artist._id}`}>
                                            <div className="shadow-[0_0_8px_0.5px_rgba(161,19,10,0.8)] rounded-2xl">
                                                <Avatar
                                                    src={artist.image?.url}
                                                    className={`${getAvatarSize(artist.rate)} [&>img]:object-top`}
                                                    fallback={fallbackInitial}
                                                    radius="lg"
                                                    isBordered
                                                    color="danger"
                                                />
                                            </div>
                                        </Link>
                                        {/* Year and location (just below avatar) */}
                                        <span
                                            className="absolute left-0 right-0 bottom-0 z-10 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                            style={{
                                                color: "#ffab40",
                                                fontWeight: 400,
                                                fontSize: "1.5rem",
                                                lineHeight: 1.1,
                                                fontFamily: 'adobe-hebrew',
                                                fontStyle: 'normal',
                                                textShadow: `
                                                    1px 0 #b71c1c,
                                                    -1px 0 #b71c1c,
                                                    0 1px #b71c1c,
                                                    0 -1px #b71c1c,
                                                    0.7px 0.7px #b71c1c,
                                                    -0.7px -0.7px #b71c1c,
                                                    0.7px -0.7px #b71c1c,
                                                    -0.7px 0.7px #b71c1c,
                                                    0 0 8px rgba(183,28,28,0.5),
                                                    0 0 8px rgba(183,28,28,0.5)
                                                `,
                                                direction: language === 'heb' ? 'rtl' : 'ltr'
                                            }}
                                        >
                                            {showLocation && (
                                                bornElsewhere ? (
                                                    <>
                                                        <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location}</div>
                                                        <div style={{
                                                            fontSize: '1.1rem',
                                                            fontStyle: 'italic',
                                                            direction: language === 'heb' ? 'rtl' : 'ltr'
                                                        }}>
                                                            {language === 'heb' ? getHebrewGenderText(artist.gender, bornElsewhere) : `Born in ${bornElsewhere}`}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div style={{ direction: language === 'heb' ? 'rtl' : 'ltr' }}>{location}</div>
                                                )
                                            )}
                                        </span>
                                    </motion.div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {/* Center vertical line with circles */}
                <div
                    ref={timelineRef}
                    className="absolute left-1/2"
                    style={{
                        transform: 'translateX(-50%)',
                        top: '-60px',
                        bottom: '0px',
                        width: '16px',
                        zIndex: 10,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    {/* Top circle */}
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            background: '#a1130a',
                            borderRadius: '50%',
                            marginBottom: '-12px', // overlap with line
                        }}
                        className="shadow-[0_0_6px_0.5px_rgba(161,19,10,0.8)]"
                    />
                    {/* The vertical line */}
                    <div
                        style={{
                            flex: 1,
                            width: '16px',
                            background: '#a1130a',
                            minHeight: '200px', // ensures line is visible even with few avatars
                        }}
                        className="shadow-[0_0_4px_0.5px_rgba(161,19,10,0.8)]"
                    />
                    {/* Bottom circle */}
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            background: '#a1130a',
                            borderRadius: '50%',
                            marginTop: '-12px', // overlap with line
                        }}
                        className="shadow-[0_0_6px_0.5px_rgba(161,19,10,0.8)]"
                    />
                </div>
            </div>
        </div>
    );
};

export default AreaPage; 