import {
  ArrowRightOutlined,
  CreditCardOutlined,
  GiftOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  TrophyOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { Card, Col, Row } from "antd";
import { Link } from "react-router-dom";
import heroBanner from "../../assets/storefront-hero-ocean.png";
import { paths } from "../../routes/paths";

const categories = [
  { name: "Vợt cầu lông", description: "Sức mạnh và độ chính xác cho từng cú đánh", icon: <TrophyOutlined /> },
  { name: "Giày thi đấu", description: "Êm chân, bám sân và bảo vệ từng bước", icon: <RocketOutlined /> },
  { name: "Trang phục", description: "Thoải mái bứt phá trong mọi pha cầu", icon: <GiftOutlined /> },
  { name: "Phụ kiện", description: "Hoàn thiện bộ trang bị của bạn", icon: <SafetyCertificateOutlined /> },
];

const benefits = [
  { icon: <TruckOutlined />, title: "Vận chuyển toàn quốc", text: "Thanh toán khi nhận hàng" },
  { icon: <SafetyCertificateOutlined />, title: "Bảo đảm chất lượng", text: "Cam kết sản phẩm chính hãng" },
  { icon: <CreditCardOutlined />, title: "Thanh toán linh hoạt", text: "Đa dạng phương thức thanh toán" },
  { icon: <SyncOutlined />, title: "Đổi trả dễ dàng", text: "Hỗ trợ đổi mới khi có lỗi" },
];

export function HomePage() {
  return (
    <>
      <section className="home-hero">
        <img className="home-hero-background" src={heroBanner} alt="Các vận động viên cầu lông thi đấu trong nhà" />
        <div className="home-hero-overlay" />
        <div className="store-container home-hero-grid">
          <div className="home-hero-copy">
            <span className="home-hero-kicker">BSPORT BADMINTON</span>
            <h1>Chơi hết mình.<br /><em>Chạm đỉnh đam mê.</em></h1>
            <p>Trang bị chính hãng dành cho người yêu cầu lông, từ buổi tập đầu tiên đến những trận cầu đỉnh cao.</p>
            <div className="home-hero-actions">
              <Link className="home-primary-cta" to={paths.products}>Khám phá ngay <ArrowRightOutlined /></Link>
              <Link className="home-secondary-cta" to={paths.aiAdvisor}>Tư vấn chọn vợt</Link>
            </div>
          </div>
        </div>
        <div className="home-slider-dots" aria-label="Slide hiện tại"><i className="active" /><i /><i /></div>
      </section>

      <section className="home-benefit-strip">
        <div className="store-container">
          <Row gutter={[18, 18]}>
            {benefits.map((benefit) => (
              <Col xs={24} sm={12} lg={6} key={benefit.title}>
                <div className="home-benefit-item">
                  <span>{benefit.icon}</span>
                  <div><strong>{benefit.title}</strong><p>{benefit.text}</p></div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="home-section home-featured-section">
        <div className="store-container">
          <div className="home-section-heading">
            <span>Sản phẩm mới</span>
            <h2>Trang bị tốt hơn cho trận cầu hay hơn</h2>
            <p>Chọn nhanh theo nhóm sản phẩm, thương hiệu và phong cách thi đấu của bạn.</p>
          </div>
          <Row gutter={[18, 18]}>
            {categories.map((category) => (
              <Col xs={24} sm={12} lg={6} key={category.name}>
                <Link to={paths.products} className="home-category-link">
                  <Card className="home-category-card" hoverable>
                    <span className="home-category-icon">{category.icon}</span>
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <span className="home-category-arrow">Khám phá <ArrowRightOutlined /></span>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      <section className="home-assurance">
        <div className="store-container">
          <div>
            <span>Chính hãng &amp; đáng tin cậy</span>
            <h2>Đồng hành cùng niềm vui trên từng sân đấu.</h2>
          </div>
          <Link to={paths.products}>Xem tất cả sản phẩm <ArrowRightOutlined /></Link>
        </div>
      </section>
    </>
  );
}
