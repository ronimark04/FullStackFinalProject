import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Avatar, Tooltip, Card, Spinner, Button } from "@heroui/react";
import { useLanguage } from '@/context/languageContext';
import { motion } from "framer-motion";

const AreaPage = () => {
    const { areaId } = useParams();
    const navigate = useNavigate();
    const [artists, setArtists] = useState([]);
    const [area, setArea] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { language } = useLanguage();

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

    useEffect(() => {
        measureLineWidths();
        window.addEventListener('resize', measureLineWidths);
        return () => window.removeEventListener('resize', measureLineWidths);
    }, [artists, area]);

    // --- End dynamic line width logic ---

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

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">
                {getLocalizedText(area?.name, language === 'heb' ? 'לא ידוע' : 'Unknown')} Artists
            </h1>
            <div className="flex justify-center items-start gap-72 relative">
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
                        const showLocation = areaId !== 'area_11_telAviv';
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
                                        zIndex: 2,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {yearDisplay}
                                </div>
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
                                        }}
                                    >
                                        {artistName}
                                    </span>
                                    <Avatar
                                        src={artist.image?.url}
                                        className="w-44 h-44 [&>img]:object-top"
                                        fallback={fallbackInitial}
                                        radius="lg"
                                        isBordered
                                        color="danger"
                                    />
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
                                            `
                                        }}
                                    >
                                        {showLocation && <div>{location}</div>}
                                    </span>
                                    {/* BornElsewhere (further below) */}
                                    {bornElsewhere && (
                                        <span
                                            className="absolute left-0 right-0 z-10 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                            style={{
                                                bottom: '-27px',
                                                color: "#ffab40",
                                                fontWeight: 400,
                                                fontSize: "1.1rem",
                                                fontFamily: 'adobe-hebrew',
                                                fontStyle: 'italic',
                                                textShadow: `
                                                    0.7px 0 #b71c1c,
                                                    -0.7px 0 #b71c1c,
                                                    0 0.5px #b71c1c,
                                                    0 -0.5px #b71c1c,
                                                    0.5px 0.5px #b71c1c,
                                                    -0.5px -0.5px #b71c1c,
                                                    0.5px -0.5px #b71c1c,
                                                    -0.5px 0.5px #b71c1c,
                                                    0 0 8px rgba(183,28,28,0.5),
                                                    0 0 8px rgba(183,28,28,0.5)
                                                `
                                            }}
                                        >
                                            {language === 'heb' ? `נולד/ה ב${bornElsewhere}` : `Born in ${bornElsewhere}`}
                                        </span>
                                    )}
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
                {/* Right column */}
                <div className="flex flex-col relative mt-24">
                    {rightColumnArtists.map((artist, idx) => {
                        const artistNameRaw = getLocalizedText(artist.name, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const artistName = stripParentheses(artistNameRaw);
                        const fallbackInitial = artistName.charAt(0) || (language === 'heb' ? 'ל' : 'U');
                        const location = getLocalizedText(artist.location, language === 'heb' ? 'לא ידוע' : 'Unknown');
                        const bornElsewhere = getLocalizedText(artist.bornElsewhere);
                        const yearDisplay = artist.yearRange
                            ? `${artist.yearRange.first} - ${artist.yearRange.last}`
                            : artist.birthYear;
                        const showLocation = areaId !== 'area_11_telAviv';
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
                                            height: '5px',
                                            background: '#a1130a',
                                            transform: 'translateY(-50%)',
                                        }}
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
                                        zIndex: 2,
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {yearDisplay}
                                </div>
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
                                        }}
                                    >
                                        {artistName}
                                    </span>
                                    <Avatar
                                        src={artist.image?.url}
                                        className="w-44 h-44 [&>img]:object-top"
                                        fallback={fallbackInitial}
                                        radius="lg"
                                        isBordered
                                        color="danger"
                                    />
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
                                            `
                                        }}
                                    >
                                        {showLocation && <div>{location}</div>}
                                    </span>
                                    {/* BornElsewhere (further below) */}
                                    {bornElsewhere && (
                                        <span
                                            className="absolute left-0 right-0 z-10 text-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                            style={{
                                                bottom: '-27px',
                                                color: "#ffab40",
                                                fontWeight: 400,
                                                fontSize: "1.1rem",
                                                fontFamily: 'adobe-hebrew',
                                                fontStyle: 'italic',
                                                textShadow: `
                                                    0.7px 0 #b71c1c,
                                                    -0.7px 0 #b71c1c,
                                                    0 0.5px #b71c1c,
                                                    0 -0.5px #b71c1c,
                                                    0.5px 0.5px #b71c1c,
                                                    -0.5px -0.5px #b71c1c,
                                                    0.5px -0.5px #b71c1c,
                                                    -0.5px 0.5px #b71c1c,
                                                    0 0 8px rgba(183,28,28,0.5),
                                                    0 0 8px rgba(183,28,28,0.5)
                                                `
                                            }}
                                        >
                                            {language === 'heb' ? `נולד/ה ב${bornElsewhere}` : `Born in ${bornElsewhere}`}
                                        </span>
                                    )}
                                </motion.div>
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
                        bottom: '-60px',
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
                    />
                    {/* The vertical line */}
                    <div
                        style={{
                            flex: 1,
                            width: '16px',
                            background: '#a1130a',
                            minHeight: '200px', // ensures line is visible even with few avatars
                        }}
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
                    />
                </div>
            </div>
        </div>
    );
};

export default AreaPage; 