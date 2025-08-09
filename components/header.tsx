import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <header className="w-full py-2 px-2">
      <div className="">
        <Link href="/">
          <Image
            src="/logo_iig-white.svg"
            alt="IIG Logo"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
        </Link>
      </div>
    </header>
  );
}
