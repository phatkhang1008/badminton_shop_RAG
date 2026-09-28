import { CheckCircleFilled, RobotOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Col, Row } from "antd";
import { getStorefrontProducts, type StorefrontProductListParams } from "../../api/storefront/products.api";
import { AdvisorChatPanel } from "../../components/storefront/AdvisorChatPanel";

const capabilities = [
  { icon: <RobotOutlined />, title: "Gợi ý theo lối chơi", text: "Định hướng trang bị theo mục tiêu và kinh nghiệm của bạn." },
  { icon: <CheckCircleFilled />, title: "So sánh dễ hiểu", text: "Diễn giải các thông số kỹ thuật bằng ngôn ngữ đơn giản." },
  { icon: <SafetyCertificateOutlined />, title: "Dữ liệu tin cậy", text: "Sẵn sàng tích hợp RAG với catalog đã được kiểm duyệt." },
];

const advisorCatalogParams: StorefrontProductListParams = {
  page: 1,
  limit: 24,
  search: "",
  category: "all",
  brand: "all",
  sort: "newest",
};

export function AiAdvisorPage() {
  const catalogQuery = useQuery({
    queryKey: ["storefront", "advisor-catalog"],
    queryFn: () => getStorefrontProducts(advisorCatalogParams),
  });
  const catalogState = catalogQuery.isPending ? "loading" : catalogQuery.isError ? "unavailable" : "ready";

  return (
    <section className="store-advisor-page">
      <div className="store-container">
        <header className="store-advisor-heading">
          <span className="eyebrow">Trợ lý mua sắm</span>
          <h1>Tìm trang bị phù hợp <em>theo cách chơi của bạn.</em></h1>
          <p>Hãy mô tả trình độ, lối đánh hoặc điều bạn đang phân vân. Trợ lý sẽ đưa ra điểm bắt đầu phù hợp.</p>
        </header>
        <Row gutter={[28, 28]} align="middle">
          <Col xs={24} lg={15}>
            {catalogQuery.isError && (
              <Alert
                className="store-advisor-catalog-alert"
                type="warning"
                showIcon
                message="Không thể tải catalog lúc này"
                description="Trợ lý vẫn có thể đưa ra gợi ý chung; phần sản phẩm tham khảo sẽ hiển thị khi catalog sẵn sàng."
              />
            )}
            <AdvisorChatPanel products={catalogQuery.data?.products ?? []} catalogState={catalogState} />
          </Col>
          <Col xs={24} lg={9}>
            <div className="store-advisor-side">
              <span>Được thiết kế cho người chơi cầu lông</span>
              {capabilities.map((capability) => (
                <Card className="store-advisor-capability" key={capability.title}>
                  <i>{capability.icon}</i><div><strong>{capability.title}</strong><p>{capability.text}</p></div>
                </Card>
              ))}
              <small>Phiên bản hiện tại phân loại câu hỏi tại trình duyệt và đối chiếu catalog công khai; chưa gửi dữ liệu đến mô hình AI hoặc API RAG.</small>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
