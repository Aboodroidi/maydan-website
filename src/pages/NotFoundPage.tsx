import { Link } from "react-router-dom";
import { useLang } from "../lib/i18n";

export default function NotFoundPage() {
  const { ar } = useLang();

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12 sm:p-8">
      <div className="card fade-up w-full max-w-md p-10 text-center sm:p-12">
        <img src="/assets/img/logo_electric_blue.svg" alt="Maydan" className="mx-auto h-12 w-12" />
        <p className="mt-6 text-[52px] font-black leading-none tracking-tight text-electric">404</p>
        <h1 className="mt-3 text-lg font-black tracking-tight">{ar ? "الصفحة غير موجودة" : "Page not found"}</h1>
        <p className="mt-2 text-sm text-muted">
          {ar
            ? "الرابط الذي تبحث عنه غير موجود أو تم نقله."
            : "The page you are looking for does not exist or has moved."}
        </p>
        <div className="mt-6">
          <Link to="/" className="btn btn-primary">
            {ar ? "العودة للرئيسية" : "Back to home"}
          </Link>
        </div>
      </div>
    </div>
  );
}
