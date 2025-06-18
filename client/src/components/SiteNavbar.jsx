import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Input,
  useDisclosure,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import LanguageSwitch from "./LanguageSwitch";
import LoginModal from "./LoginModal";
import { useAuth } from "../context/authContext";
import { useLanguage } from "../context/languageContext";
import { useState, useRef, useEffect } from "react";
import homeIcon from "../assets/home-icon.png";

const SearchIcon = ({ size = 24, strokeWidth = 1.5, width, height, ...props }) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height={height || size}
    role="presentation"
    viewBox="0 0 24 24"
    width={width || size}
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    />
  </svg>
);

// Helper function to detect if text is mainly Hebrew
function isMainlyHebrew(text) {
  if (!text) return false;
  const hebrewPattern = /[\u0590-\u05FF]/g;
  const hebrewChars = (text.match(hebrewPattern) || []).length;
  return hebrewChars > text.length * 0.5;
}

// Helper to remove parentheses and their contents from a string
function stripParentheses(str) {
  if (!str) return str;
  return str.replace(/\s*\([^)]*\)/g, '').trim();
}

export default function SiteNavbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const [searchValue, setSearchValue] = useState("");
  const [allArtists, setAllArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
  };

  const profileText = language === "heb" ? "הפרופיל שלי" : "My Profile";
  const searchPlaceholder = language === "heb" ? "חפש אמן/ית..." : "Find Artists...";
  const logoutText = language === "heb" ? "התנתקות" : "Logout";
  const loginText = language === "heb" ? "התחברות" : "Login";
  const signupText = language === "heb" ? "הרשמה" : "Sign Up";

  // Fetch all artists on first focus
  const handleSearchFocus = async () => {
    if (allArtists.length === 0 && !loadingArtists) {
      setLoadingArtists(true);
      try {
        const response = await fetch('/artists');
        if (response.ok) {
          const artists = await response.json();
          setAllArtists(artists);
          setFilteredArtists(artists);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
      } finally {
        setLoadingArtists(false);
      }
    }
    // Don't show dropdown on focus - only when typing
  };

  // Filter artists as user types
  useEffect(() => {
    if (!searchValue) {
      setFilteredArtists(allArtists);
      setShowDropdown(false); // Hide dropdown when no input
      return;
    }
    const query = searchValue.toLowerCase();
    const filtered = allArtists.filter(
      (artist) =>
        artist.name.heb.toLowerCase().includes(query) ||
        artist.name.eng.toLowerCase().includes(query)
    );
    setFilteredArtists(filtered);
    setShowDropdown(true); // Show dropdown when there's input
  }, [searchValue, allArtists]);

  // Handle artist selection
  const handleSelectArtist = (artistId) => {
    setShowDropdown(false);
    setSearchValue("");
    navigate(`/artist/${artistId}`);
  };

  // Handle search (Enter key or search icon click)
  const handleSearch = () => {
    if (!searchValue.trim()) return;

    const exact = allArtists.find(
      (artist) =>
        artist.name.heb === searchValue ||
        artist.name.eng.toLowerCase() === searchValue.toLowerCase()
    );

    if (exact) {
      handleSelectArtist(exact._id);
    } else if (filteredArtists.length > 0) {
      handleSelectArtist(filteredArtists[0]._id);
    }
  };

  // Hide dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <Navbar
        shouldHideOnScroll
        className="w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur shadow"
        isBordered
      >
        <div className="flex w-full items-center justify-between">
          {/* Left: Home logo and Profile */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <img src={homeIcon} alt="Home" style={{ height: 36, width: 36 }} />
            </Link>
            {isAuthenticated && user && (
              <Link href={`/user/${user._id}`}
                className="font-normal text-red-700 hover:text-red-600"
              >
                {profileText}
              </Link>
            )}
          </div>

          {/* Right: Search, Language Switch, and Auth */}
          <div className="flex items-center gap-2">
            {/* Search Bar with Dropdown */}
            <div className="relative">
              <Input
                classNames={{
                  base: "max-w-full sm:max-w-[14rem] h-10",
                  mainWrapper: "h-full",
                  input: "text-small",
                  inputWrapper:
                    "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20 rounded-large",
                }}
                placeholder={searchPlaceholder}
                size="sm"
                startContent={<SearchIcon size={18} />}
                type="search"
                aria-label="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={handleSearchFocus}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                dir={language === 'heb' ? 'rtl' : 'ltr'}
              />

              {/* Dropdown */}
              {showDropdown && filteredArtists.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {filteredArtists.map((artist) => (
                    <div
                      key={artist._id}
                      onClick={() => handleSelectArtist(artist._id)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-light">
                        {stripParentheses(artist.name.heb)} / {stripParentheses(artist.name.eng)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <LanguageSwitch />

            {isAuthenticated ? (
              <Button color="danger" variant="flat" onPress={handleLogout}>
                {logoutText}
              </Button>
            ) : (
              <>
                <div className="hidden lg:flex">
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onOpen}
                    className="!w-auto !min-w-0 !px-4"
                  >
                    {loginText}
                  </Button>
                </div>
                <div className="hidden lg:flex">
                  <Button as={Link} color="primary" href="/signup" variant="flat">
                    {signupText}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </Navbar>

      <LoginModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
