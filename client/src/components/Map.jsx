import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import baseMap from '../assets/map/israel-map.png';
import { mapPaths } from '../data/mapPaths';
import { regionData } from '../data/regionData';
import { useLanguage } from '@/context/languageContext';
import areasData from '../../../backend/seed_data/areas.json';

export default function Map() {
    const [hoveredRegion, setHoveredRegion] = useState(null);
    const { language } = useLanguage();
    const navigate = useNavigate();

    const getAreaPath = (regionId) => {
        // Extract the area name from the regionId (e.g., "area_11_telAviv" -> "tel aviv")
        const areaName = regionId.split('_').slice(2).join(' ')
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .toLowerCase()
            .trim();
        console.log('Extracted area name:', areaName);

        // Find the matching area in areas.json
        const area = areasData.find(a => {
            const normalizedAreaName = a.name.toLowerCase();
            const normalizedExtractedName = areaName.toLowerCase();
            return normalizedAreaName === normalizedExtractedName;
        });
        console.log('Found area:', area);

        if (area) {
            // Convert the name to URL format (e.g., "tel aviv" -> "tel-aviv")
            const path = `/area/${area.name.toLowerCase().replace(/\s+/g, '-')}`;
            console.log('Generated path:', path);
            return path;
        }
        return null;
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
            <div style={{ position: 'relative', width: '600px' }}>
                <img src={baseMap} alt="Map of Israel" style={{ width: '100%' }} />

                <AnimatePresence>
                    {hoveredRegion && regionData[hoveredRegion] && (
                        <motion.img
                            key={hoveredRegion}
                            src={regionData[hoveredRegion].overlay}
                            alt={`${hoveredRegion} overlay`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                pointerEvents: 'none',
                                zIndex: 2,
                            }}
                        />
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {hoveredRegion && regionData[hoveredRegion]?.label?.heb && (
                        <motion.img
                            key={`label-${hoveredRegion}-${language}`}
                            src={regionData[hoveredRegion].label[language]}
                            alt={`${hoveredRegion} label`}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                position: 'absolute',
                                top: -20,
                                left: 0,
                                width: '100%',
                                pointerEvents: 'none',
                                zIndex: 4,
                            }}
                        />
                    )}
                </AnimatePresence>

                <svg
                    viewBox="0 0 2502.6667 3088"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: 3,
                    }}
                >
                    {mapPaths.map(({ id, d, fill }) => (
                        <path
                            key={id}
                            id={id}
                            d={d}
                            fill={fill}
                            onMouseEnter={() => setHoveredRegion(id)}
                            onMouseLeave={() => setHoveredRegion(null)}
                            onClick={() => {
                                console.log('Clicked region ID:', id);
                                const path = getAreaPath(id);
                                console.log('Navigation path:', path);
                                if (path) {
                                    navigate(path);
                                }
                            }}
                            cursor="pointer"
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}
