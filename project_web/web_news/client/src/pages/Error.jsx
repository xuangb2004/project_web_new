import { Link, useRouteError } from "react-router-dom";

const ErrorPage = () => {
  const error = useRouteError();
  const status = error?.status || 500;
  const message =
    error?.statusText ||
    error?.message ||
    "Đã có lỗi xảy ra. Vui lòng thử lại sau.";

  return (
    <section className="error-page">
      <div className="error-card">
        <p className="error-code">{status}</p>
        <h1>Oops! Không tìm thấy trang này</h1>
        <p className="error-message">{message}</p>
        <Link to="/" className="back-home">
          ⟵ Quay lại trang chủ
        </Link>
      </div>
    </section>
  );
};

export default ErrorPage;

