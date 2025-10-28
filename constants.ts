import React from 'react';

// Using Heroicons v2 outline style for consistency

// FIX: Refactored all icon components to use React.createElement instead of JSX to be compatible with a .ts file extension.
export const HomeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" })
  )
);

export const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" })
  )
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.562L16.5 21.75l-.398-1.188a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.188-.398a2.25 2.25 0 001.423-1.423L16.5 15.75l.398 1.188a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.188.398a2.25 2.25 0 00-1.423 1.423z" })
    )
);

export const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" })
  )
);

export const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" }),
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" })
  )
);

export const BedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v.001c0 .621.504 1.125 1.125 1.125z" })
  )
);

export const BathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" })
  )
);

export const SqftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 21h19.5m-18-18v18m18-18v18m-16.5-16.5h15m-15 4.5h15m-15 4.5h15m-15 4.5h15" })
  )
);

export const AtSymbolIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" })
  )
);

export const CurrencyDollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.28-.659 2.003-.659.768 0 1.536.219 2.242.659l.879.659" })
  )
);

export const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" })
  )
);

export const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 12.75h.008v.008H12v-.008z" })
  )
);

export const PhoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.211-.99-.55-1.35l-2.457-2.457a1.5 1.5 0 00-2.122 0l-1.158 1.158a15.11 15.11 0 01-7.042-7.042l1.158-1.158a1.5 1.5 0 000-2.122L6.35 3.55a.98.98 0 00-1.35-.55H3.5A2.25 2.25 0 001.25 5.25v1.5z" })
    )
);

export const BuildingOfficeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
      React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" })
    )
);


export const CubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" })
    )
);

export const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" })
    )
);

export const VideoCameraIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" })
    )
);

export const UserCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" })
    )
);

export const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M15.75 19.5L8.25 12l7.5-7.5" })
  )
);

export const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 1.5, stroke: "currentColor", ...props },
    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", d: "M8.25 4.5l7.5 7.5-7.5 7.5" })
  )
);