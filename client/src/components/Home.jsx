import Map from "./Map";
import logoHeb from "../assets/logo-heb.png";
import logoEng from "../assets/logo-eng.png";
import { useLanguage } from "../context/languageContext";

function Home() {
    const { language } = useLanguage();
    return (
        <>
            <style>{`
                .responsive-logo-eng {
                    width: 700px;
                    position: relative;
                    top: 70px;
                    left: -20px;
                    z-index: 1000;
                    pointer-events: none;
                }
                .responsive-logo-heb {
                    width: 550px;
                    position: relative;
                    top: 70px;
                    left: -50px;
                    z-index: 1000;
                    pointer-events: none;
                }
                @media (max-width: 768px) {
                    .responsive-logo-eng {
                        width: 370px;
                        top: 0px;
                        left: -400px;
                    }
                    .responsive-logo-heb {
                        width: 300px;
                        top: 0px;
                        left: -350px;
                    }
                }
                @media (max-width: 480px) {
                    .responsive-logo-eng {
                        width: 320px;
                        top: 10px;
                        left: -320px;
                    }
                    .responsive-logo-heb {
                        width: 250px;
                        top: 10px;
                        left: -280px;
                    }
                }
            `}</style>
            <div style={{ display: 'flex', flexDirection: 'row', width: '100vw', minHeight: '100vh' }}>
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    // border: '1px solid black'
                }}>
                    {/* Left container */}
                </div>
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    // border: '1px solid black' 
                }}>
                    <div style={{
                        width: '90%', maxWidth: '600px', minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
                        // border: '1px solid black'
                    }}>
                        <Map />
                    </div>
                </div>
                <div style={{
                    // border: '1px solid black',
                    boxSizing: 'border-box', minWidth: '700px'
                }}>
                    {/* Right container */}
                    {language === 'eng' && (
                        <img src={logoEng} alt="HaMekomon" className="responsive-logo-eng" />
                    )}
                    {language === 'heb' && (
                        <img src={logoHeb} alt="המקומון" className="responsive-logo-heb" />
                    )}
                </div>
            </div>
        </>
    );
}

export default Home;