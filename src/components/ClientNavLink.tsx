'use client'
import Link from "next/link";
import { useCommonContext } from "~/context/common-context";

interface ClientNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const ClientNavLink = ({ href, children, className }: ClientNavLinkProps) => {
  const { setShowLoadingModal } = useCommonContext();

  return (
    <Link
      href={href}
      onClick={() => setShowLoadingModal(true)}
      className={className}>
      {children}
    </Link>
  );
};

export default ClientNavLink;