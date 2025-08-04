import React from 'react';

// IDE Icon Components using SVGs
const VSCodeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352z" fill="#007ACC"/>
  </svg>
);

const IntelliJIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 0v24h24V0H0z" fill="#000"/>
    <path d="M5.4 20.4h6V18H5.4v2.4zM0 0h4.8v4.8H0V0zm6 0h4.8v4.8H6V0zm6 0h4.8v4.8H12V0zm6 0H24v4.8h-6V0zM0 6h4.8v4.8H0V6zm12 0h12v4.8H12V6zM0 12h4.8v4.8H0V12zm6 0h4.8v4.8H6V12z" fill="#fff"/>
    <path d="M12 12h12v12H12V12z" fill="#FF6B35"/>
  </svg>
);

const VisualStudioIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.583.063a1.5 1.5 0 0 1 1.032.392l4.898 4.898a1.5 1.5 0 0 1 .487 1.096V17.55a1.5 1.5 0 0 1-.487 1.096l-4.898 4.898a1.5 1.5 0 0 1-1.032.392 1.5 1.5 0 0 1-.615-.133l-3.031-1.378a.75.75 0 0 1-.462-.69V2.264a.75.75 0 0 1 .462-.69L16.968.196a1.5 1.5 0 0 1 .615-.133z" fill="#5C2D91"/>
    <path d="M12.5 5.868L5.747 1.114A1.5 1.5 0 0 0 4.5.863a1.5 1.5 0 0 0-1.061.44L.44 4.302A1.5 1.5 0 0 0 0 5.362v13.276a1.5 1.5 0 0 0 .44 1.06l2.999 2.999A1.5 1.5 0 0 0 4.5 23.137a1.5 1.5 0 0 0 1.247-.251l6.753-4.754V5.868z" fill="#5C2D91"/>
  </svg>
);

const EmacsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" fill="#7F5AB6"/>
    <path d="M8 7h8v2H8V7zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" fill="#7F5AB6"/>
  </svg>
);

const NeovimIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.214 4.04s.929-.672 1.715.201c.557.619.557 1.716.557 1.716L8.373 22l1.21-1.05L5.895 5.188S5.8 4.656 6.357 4.1c.557-.557 1.048-.557 1.048-.557L24 20.5V24L9.583 9.583v10.749L2.214 4.04z" fill="#57A143"/>
    <path d="M21.786 19.96s-.929.672-1.715-.201c-.557-.619-.557-1.716-.557-1.716L15.627 2l-1.21 1.05 3.688 15.762s.095.532-.462 1.088c-.557.557-1.048.557-1.048.557L0 3.5V0l14.417 14.417V3.668L21.786 19.96z" fill="#57A143"/>
  </svg>
);

const EclipseIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c1.308 0 2.567-.21 3.745-.597C9.497 22.088 4.5 17.545 4.5 12S9.497 1.912 15.745 0.597A11.936 11.936 0 0 0 12 0z" fill="#2C2255"/>
    <path d="M15.745.597C21.26 2.163 24 6.654 24 12s-2.74 9.837-8.255 11.403c6.248-1.315 11.245-5.858 11.245-11.403S21.993 1.912 15.745.597z" fill="#F7941E"/>
  </svg>
);

const XcodeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z" fill="#147EFB"/>
    <path d="M8.5 6.5L12 10l3.5-3.5L17 8l-5 5-5-5 1.5-1.5z" fill="white"/>
    <path d="M8.5 17.5L12 14l3.5 3.5L17 16l-5-5-5 5 1.5 1.5z" fill="white"/>
  </svg>
);

// Default IDE icon for unknown IDEs
const DefaultIDEIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="#6B7280" strokeWidth="2" fill="none"/>
    <path d="M8 9l3 3-3 3M13 15h5" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Map IDE names to their respective icon components
const ideIconMap: Record<string, React.ComponentType> = {
  vscode: VSCodeIcon,
  intellij: IntelliJIcon,
  visualstudio: VisualStudioIcon,
  emacs: EmacsIcon,
  neovim: NeovimIcon,
  eclipse: EclipseIcon,
  xcode: XcodeIcon,
};

// Function to get the appropriate IDE icon
export const getIDEIcon = (ideName: string): React.ComponentType => {
  const normalizedName = ideName.toLowerCase().trim();
  return ideIconMap[normalizedName] || DefaultIDEIcon;
};

// Function to get a formatted IDE name for display
export const formatIDEName = (ideName: string): string => {
  const formatMap: Record<string, string> = {
    vscode: 'VS Code',
    intellij: 'IntelliJ IDEA',
    visualstudio: 'Visual Studio',
    emacs: 'Emacs',
    neovim: 'Neovim',
    eclipse: 'Eclipse',
    xcode: 'Xcode',
  };
  
  const normalizedName = ideName.toLowerCase().trim();
  return formatMap[normalizedName] || ideName;
};
