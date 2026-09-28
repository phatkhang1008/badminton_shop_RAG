import { ArrowRightOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import heroDoubles from "../../assets/storefront-hero-doubles-ocean.png";
import heroEquipment from "../../assets/storefront-hero-equipment-ocean.png";
import heroSmash from "../../assets/storefront-hero-smash-ocean.png";
import heroMatch from "../../assets/storefront-hero-ocean.png";
import { paths } from "../../routes/paths";

const slides = [
  {
    image: heroMatch,
    alt: "Các vận động viên cầu lông thi đấu trong nhà",
    eyebrow: "BSPORT BADMINTON",
    heading: "Chơi hết mình.",
    highlight: "Chạm đỉnh đam mê.",
    description: "Trang bị chính hãng dành cho người yêu cầu lông, từ buổi tập đầu tiên đến những trận cầu đỉnh cao.",
    primaryLabel: "Khám phá ngay",
    primaryTo: paths.products,
    secondaryLabel: "Tư vấn chọn vợt",
    secondaryTo: paths.aiAdvisor,
  },
  {
    image: heroSmash,
    alt: "Vận động viên cầu lông thực hiện cú đập cầu trong nhà thi đấu",
    eyebrow: "TỐC ĐỘ VÀ KIỂM SOÁT",
    heading: "Sẵn sàng cho",
    highlight: "mọi pha bứt phá.",
    description: "Chọn vợt, giày và phụ kiện cân bằng giữa cảm giác đánh, sức bền và phong cách thi đấu của bạn.",
    primaryLabel: "Xem sản phẩm",
    primaryTo: paths.products,
    secondaryLabel: "Nhận gợi ý",
    secondaryTo: paths.aiAdvisor,
  },
  {
    image: heroEquipment,
    alt: "Vợt và quả cầu lông trên sân thi đấu ánh sáng xanh",
    eyebrow: "TRANG BỊ CHUẨN SÂN",
    heading: "Tìm đúng dụng cụ,",
    highlight: "tự tin thi đấu.",
    description: "So sánh danh mục, biến thể và mức giá để tìm ra lựa chọn phù hợp với mỗi buổi tập.",
    primaryLabel: "Mua sắm ngay",
    primaryTo: paths.products,
    secondaryLabel: "Xem giỏ hàng",
    secondaryTo: paths.cart,
  },
  {
    image: heroDoubles,
    alt: "Hai người chơi cầu lông đánh đôi trên sân trong nhà",
    eyebrow: "CÙNG ĐỒNG ĐỘI CHINH PHỤC SÂN ĐẤU",
    heading: "Kết nối nhịp đánh,",
    highlight: "nâng tầm cuộc chơi.",
    description: "Dù tập luyện hay thi đấu, hãy chuẩn bị bộ trang bị đáng tin cậy cho từng pha phối hợp.",
    primaryLabel: "Khám phá cửa hàng",
    primaryTo: paths.products,
    secondaryLabel: "Tư vấn AI",
    secondaryTo: paths.aiAdvisor,
  },
];

export function HomeHeroCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="home-hero" aria-roledescription="carousel" aria-label="Banner nổi bật">
      {slides.map((slide, index) => {
        const isActive = index === activeSlide;

        return (
          <div className={`home-hero-slide${isActive ? " active" : ""}`} key={slide.image} aria-hidden={!isActive}>
            <img className="home-hero-background" src={slide.image} alt={slide.alt} />
            <div className="home-hero-overlay" />
            <div className="store-container home-hero-grid">
              <div className="home-hero-copy">
                <span className="home-hero-kicker">{slide.eyebrow}</span>
                <h1>{slide.heading}<br /><em>{slide.highlight}</em></h1>
                <p>{slide.description}</p>
                <div className="home-hero-actions">
                  <Link className="home-primary-cta" to={slide.primaryTo} tabIndex={isActive ? 0 : -1}>
                    {slide.primaryLabel} <ArrowRightOutlined />
                  </Link>
                  <Link className="home-secondary-cta" to={slide.secondaryTo} tabIndex={isActive ? 0 : -1}>
                    {slide.secondaryLabel}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="home-slider-dots" aria-label="Chọn banner">
        {slides.map((slide, index) => (
          <button
            type="button"
            className={index === activeSlide ? "active" : ""}
            key={slide.image}
            aria-label={`Hiển thị banner ${index + 1}`}
            aria-current={index === activeSlide ? "true" : undefined}
            onClick={() => setActiveSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
