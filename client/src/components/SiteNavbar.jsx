import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  useDisclosure,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import LanguageSwitch from "./LanguageSwitch";
import LoginModal from "./LoginModal";
import { useAuth } from "../context/authContext";

export const AcmeLogo = () => {
  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export default function SiteNavbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <Navbar shouldHideOnScroll className="w-full px-6">
        {/* Left side: Logo */}
        <NavbarContent justify="start">
          <NavbarBrand>
            <AcmeLogo />
            <p className="font-bold text-inherit">ACME</p>
          </NavbarBrand>
        </NavbarContent>

        {/* Center: Navigation links */}
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link color="foreground" href="#">
              Features
            </Link>
          </NavbarItem>
          <NavbarItem isActive>
            <Link aria-current="page" href="#">
              Customers
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link color="foreground" href="#">
              Integrations
            </Link>
          </NavbarItem>
        </NavbarContent>

        {/* Right side: Language toggle and login/signup */}
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            <LanguageSwitch />
          </NavbarItem>
          {isAuthenticated ? (
            <NavbarItem>
              <Button color="danger" variant="flat" onPress={handleLogout}>
                Logout
              </Button>
            </NavbarItem>
          ) : (
            <>
              <NavbarItem className="hidden lg:flex">
                <Button variant="light" onPress={onOpen}>
                  Login
                </Button>
              </NavbarItem>
              <NavbarItem>
                <Button as={Link} color="primary" href="/signup" variant="flat">
                  Sign Up
                </Button>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>
      <LoginModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
