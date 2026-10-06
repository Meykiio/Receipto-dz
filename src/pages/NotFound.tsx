
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Page not found</p>
        <Button asChild className="bg-brand-blue hover:bg-brand-lightBlue">
          <Link to={user ? "/dashboard" : "/"}>
            Return to {user ? "Dashboard" : "Home"}
          </Link>
        </Button>
      </div>
    </div>
  );
}
