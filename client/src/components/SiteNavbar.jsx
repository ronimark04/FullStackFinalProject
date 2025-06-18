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
import homeIcon from "../assets/home-icon.png";
import { useLanguage } from "../context/languageContext";
import { useState } from "react";

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

export default function SiteNavbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const [searchValue, setSearchValue] = useState("");

  const handleLogout = () => {
    logout();
  };

  const profileText = language === "heb" ? "הפרופיל שלי" : "My Profile";
  const searchPlaceholder = language === "heb" ? "חפש אמן/ית..." : "Find Artists...";
  const logoutText = language === "heb" ? "התנתקות" : "Logout";
  const loginText = language === "heb" ? "התחברות" : "Login";
  const signupText = language === "heb" ? "הרשמה" : "Sign Up";

  // Dynamic direction for search input
  const searchDir = isMainlyHebrew(searchValue) ? "rtl" : "ltr";

  return (
    <>
      <Navbar
        shouldHideOnScroll
        className="w-full px-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur shadow"
        isBordered
      >
        <div className="flex w-full items-center justify-between">
          {/* Left: Home logo and Profile */}
          <div className="flex items-center gap-4">
            <Link href="/">
              <img src={homeIcon} alt="Home" style={{ height: 36, width: 36 }} />
            </Link>
            {isAuthenticated && user && (
              <Link color="danger" href={`/user/${user._id}`}
                className="font-medium text-base">
                {profileText}
              </Link>
            )}
          </div>

          {/* Right: Search input, Language switch and auth buttons */}
          <div className="flex items-center gap-3">
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
              dir={searchDir}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
            />
            <div className="hidden lg:flex">
              <LanguageSwitch />
            </div>
            {isAuthenticated ? (
              <Button color="danger" variant="flat" onPress={handleLogout}>
                {logoutText}
              </Button>
            ) : (
              <>
                <div className="hidden lg:flex">
                  <Button color="danger" variant="light" onPress={onOpen}>
                    {loginText}
                  </Button>
                </div>
                <Button as={Link} color="primary" href="/signup" variant="flat">
                  {signupText}
                </Button>
              </>
            )}
          </div>
        </div>
      </Navbar>
      <LoginModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
