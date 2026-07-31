interface MascotAvatarProps {
  className?: string;
}

// Static placeholder for the mentor mascot — the user is designing an
// animated (Clippy-style) version. Kept as its own component precisely so
// that swap is a one-file change instead of hunting down every call site.
const MascotAvatar = ({ className = "h-10 w-9" }: MascotAvatarProps) => (
  <img src="/mascot-book.png" alt="" className={`shrink-0 object-contain ${className}`} />
);

export default MascotAvatar;
