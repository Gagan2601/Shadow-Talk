import { CircularProgress } from "@mui/material";

const Loading: React.FC = () => {
    return (
        <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black/20 z-50">
            <CircularProgress size="5rem" color="inherit" />
        </div>
    );
};
export default Loading;