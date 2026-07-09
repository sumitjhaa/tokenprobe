import NfIcon from "./NfIcon";

interface Props {
    currentPath: string;
    onNavigate: (path: string) => void;
    onOpenTheme: () => void;
}

const links = [
    { path: "home", label: "Home" },
    { path: "batch", label: "Batch" },
    { path: "config", label: "Config" },
    { path: "docs", label: "Docs" },
    { path: "about", label: "About" },
];

export default function Navbar({ currentPath, onNavigate, onOpenTheme }: Props) {
    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-inner">
                    <a
                        href="#home"
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigate("home");
                        }}
                        className="navbar-brand"
                    >
                        <span className="navbar-brand-marker">T</span>
                        TokenProbe
                    </a>

                    <div className="nav-tabs">
                        {links.map((link) => (
                            <a
                                key={link.path}
                                href={`#${link.path}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    onNavigate(link.path);
                                }}
                                className={`nav-link${currentPath === link.path ? " active" : ""}`}
                            >
                                <span className="nav-slash">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <line x1="4" y1="12" x2="7.5" y2="2" />
                                        <line x1="8.5" y1="12" x2="12" y2="2" />
                                    </svg>
                                </span>
                                {link.label}
                            </a>
                        ))}
                    </div>

                    <div className="nav-actions">
                        <span
                            style={{
                                fontSize: "0.5625rem",
                                fontWeight: 600,
                                color: "var(--text-muted)",
                                border: "1px solid var(--border)",
                                padding: "0.0625rem 0.3125rem",
                                lineHeight: "1.4",
                            }}
                        >
                            v1
                        </span>
                        <button onClick={onOpenTheme} className="nav-theme-btn" aria-label="Change theme">
                            <NfIcon name="paint" size="1em" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
