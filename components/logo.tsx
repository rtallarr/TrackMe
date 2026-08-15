import Image from "next/image";

type LogoProps = {
  size?: number;
  containerClassName?: string;
  imageClassName?: string;
};

export default function Logo({
  size = 20,
  containerClassName = "",
  imageClassName = "",
}: LogoProps) {
  return (
    <div
      className={[
        "flex items-center justify-center overflow-hidden rounded-xl bg-foreground/5 ring-1 ring-border",
        containerClassName,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Image
        src="/globe.svg"
        alt="TrackMe logo"
        width={size}
        height={size}
        className={['object-contain', imageClassName].filter(Boolean).join(' ')}
      />
    </div>
  );
}
