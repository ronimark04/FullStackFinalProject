import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import baseMap from '../assets/map/israel-map.png';
import { mapPaths } from '../data/mapPaths';
import { regionData } from '../data/regionData';
import { useLanguage } from '@/context/languageContext';

export default function Map() {
    const [hoveredRegion, setHoveredRegion] = useState(null);
    const { language } = useLanguage();
    const navigate = useNavigate();

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
                                console.log('Clicked:', id);
                                // navigate(regionData[id].path);
                            }}
                            cursor="pointer"
                        />
                    ))}
                </svg>
            </div>
        </div>
    );
}
