import { useState ,useEffect } from "react";




import MobileNavbar from "./navbar/MobileNavbar";
import DesktopNavbar from "./navbar/DesktopNavbar";

function DistributorNavbar() {

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Watch for window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {isMobile ? <MobileNavbar /> : <DesktopNavbar />}
    </>
  );


}

export default DistributorNavbar