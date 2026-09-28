import { ArrowRightOutlined, CreditCardOutlined,
  SafetyCertificateOutlined,
  SyncOutlined,
  TruckOutlined,
} from "@ant-design/icons";
import { Col, Row } from "antd";
import { Link } from "react-router-dom";
import { HomeFeaturedProducts } from "../../components/storefront/HomeFeaturedProducts";
import { HomeHeroCarousel } from "../../components/storefront/HomeHeroCarousel";
import { paths } from "../../routes/paths";

const benefits = [
  { icon: <TruckOutlined />, title: "Vận chuyển toàn quốc", text: "Thanh toán khi nhận hàng" },
  { icon: <SafetyCertificateOutlined />, title: "Bảo đảm chất lượng", text: "Cam kết sản phẩm chính hãng" },
  { icon: <CreditCardOutlined />, title: "Thanh toán linh hoạt", text: "Đa dạng phương thức thanh toán" },
  { icon: <SyncOutlined />, title: "Đổi trả dễ dàng", text: "Hỗ trợ đổi mới khi có lỗi" },
];

export function HomePage() {
  return (
    <>
      <HomeHeroCarousel />

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

      <HomeFeaturedProducts />

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
