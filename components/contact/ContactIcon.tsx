export type ContactIconName =
  | "website"
  | "growth"
  | "automation"
  | "other"
  | "person"
  | "email"
  | "pencil"
  | "whatsapp"
  | "calendar"
  | "document"
  | "conversation"
  | "bolt";

export function ContactIcon({
  name,
  className = "",
}: {
  name: ContactIconName;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "website" && (
        <>
          <rect x="3" y="3" width="18" height="13" rx="1.5" />
          <path d="M8 21h8m-4-5v5M6 6h12" />
        </>
      )}
      {name === "growth" && (
        <>
          <path d="m3 17 6-6 4 3 7-9m-5 0h5v5" />
        </>
      )}
      {name === "automation" && (
        <>
          <path d="m12 2 10 5-10 5L2 7l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5" />
        </>
      )}
      {name === "other" && (
        <>
          <circle cx="5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
        </>
      )}
      {name === "person" && (
        <>
          <circle cx="12" cy="7" r="3.5" />
          <path d="M4 21v-3a8 8 0 0 1 16 0v3" />
        </>
      )}
      {name === "email" && (
        <>
          <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
          <path d="m3.5 6 8.5 7 8.5-7" />
        </>
      )}
      {name === "pencil" && (
        <>
          <path d="m4 20 1-5L17 3l4 4L9 19l-5 1ZM14 6l4 4M4 20l4-4" />
        </>
      )}
      {name === "whatsapp" && (
        <>
          <path d="m3 21 1.8-5A9 9 0 1 1 8 20L3 21Z" />
          <path d="M8.2 7.5c.6 4 3 6.3 7 7l1.1-2-2-1.3-1 1a7.7 7.7 0 0 1-3.6-3.6l1-1L9.5 5.8l-1.3 1.7Z" />
        </>
      )}
      {name === "calendar" && (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 2v6m10-6v6M3 11h18" />
        </>
      )}
      {name === "document" && (
        <>
          <path d="M5 2h9l5 5v15H5V2Zm9 0v6h5M8 12h8M8 16h8M8 19h5" />
        </>
      )}
      {name === "conversation" && <path d="M4 3h16v13h-8l-5 5v-5H4V3Z" />}
      {name === "bolt" && <path d="m13 2-8 12h6l-1 8 9-13h-6V2Z" />}
    </svg>
  );
}
