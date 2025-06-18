import Map from "./Map";
import logoHeb from "../assets/logo-heb.png";

function Home() {
    return (<>
        <img src={logoHeb} alt="המקומון" style={{ position: 'absolute', width: '550px', top: 120, right: 130, zIndex: 1000, pointerEvents: 'none' }} />
        <Map />
    </>);
}

export default Home;