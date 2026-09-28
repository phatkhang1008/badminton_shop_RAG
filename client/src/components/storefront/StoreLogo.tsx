import { Link } from "react-router-dom";
import { paths } from "../../routes/paths";

interface StoreLogoProps {
  variant?: "header" | "footer";
}

export function StoreLogo({ variant = "header" }: StoreLogoProps) {
  const isFooter = variant === "footer";

  return (
    <Link
      className={isFooter ? "store-logo store-logo-footer" : "store-logo"}
      to={paths.home}
      aria-label="Badminton Shop - Trang chủ"
    >
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
      <span>
        <strong>BS<span>PORT</span></strong>
        <small>{isFooter ? "Đồng hành cùng đam mê cầu lông" : "Cầu lông chính hãng"}</small>
      </span>
    </Link>
  );
}
