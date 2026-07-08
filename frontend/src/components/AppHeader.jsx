import { HiOutlineInformationCircle } from "react-icons/hi2";

function AppHeader({ onOpenPTAL, onOpenAbout }) {
  return (
    <header className="app-header">
      <div>
        <h1>Shizuoka PTAL Dashboard</h1>
        <p>Public Transport Accessibility Analysis (Community Bus)</p>
      </div>

      <div className="app-header-actions">
        <button onClick={onOpenPTAL} className="header-action">
          <HiOutlineInformationCircle />
          PTAL
        </button>

        <button onClick={onOpenAbout} className="header-action">
          About
        </button>
      </div>
    </header>
  );
}

export default AppHeader;