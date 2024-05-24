import Files from "./files";
import Navbar from "./navbar";

export default function DashboardPage() {
    return (
        <div>
        <Navbar />
        
        <div className="flex items-center justify-center pt-5">
            <Files />
        </div>
        </div>
    );
    }
    