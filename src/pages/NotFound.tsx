import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { NotFound as GhostNotFound } from "@/components/ui/ghost-404-page";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return <GhostNotFound />;
};

export default NotFound;
