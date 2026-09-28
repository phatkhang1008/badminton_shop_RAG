import type { StorefrontProduct } from "../../api/storefront/products.api";

export const advisorPrompts = [
  "Tôi mới chơi, nên chọn vợt nào?",
  "Tôi thích đánh công, cần vợt ra sao?",
  "Chọn giày cầu lông theo tiêu chí nào?",
];

const categoryKeywords = [
  { terms: ["vợt", "racket", "đập", "smash", "công", "thủ"], categoryTerms: ["vợt", "racket"] },
  { terms: ["giày", "chân", "sân"], categoryTerms: ["giày", "shoe"] },
  { terms: ["áo", "quần", "trang phục"], categoryTerms: ["trang phục", "áo", "quần", "apparel"] },
  { terms: ["phụ kiện", "cước", "quấn cán", "băng", "túi"], categoryTerms: ["phụ kiện", "accessory"] },
];

export function findAdvisorProducts(question: string, products: StorefrontProduct[]) {
  const query = question.toLocaleLowerCase("vi-VN");
  const matchedGroup = categoryKeywords.find((group) => group.terms.some((term) => query.includes(term)));
  if (!matchedGroup) return products.slice(0, 3);

  const matches = products.filter((product) => {
    const productText = `${product.name} ${product.category.name}`.toLocaleLowerCase("vi-VN");
    return matchedGroup.categoryTerms.some((term) => productText.includes(term));
  });

  return (matches.length > 0 ? matches : products).slice(0, 3);
}

export function createAdvisorReply(question: string) {
  const query = question.toLocaleLowerCase("vi-VN");
  if (query.includes("công") || query.includes("smash")) {
    return "Với lối đánh thiên công, hãy ưu tiên vợt có thân cứng vừa đến cứng, điểm cân bằng hơi nặng đầu và chọn mức trọng lượng phù hợp lực cổ tay. Bạn có thể mở danh sách sản phẩm để so sánh thông số từng mẫu.";
  }
  if (query.includes("giày") || query.includes("chân")) {
    return "Giày cầu lông nên vừa chân, đế bám tốt và có lớp đệm ổn định ở gót. Nếu thường di chuyển ngang nhanh, hãy ưu tiên thân giày ôm và phần hông được gia cố.";
  }
  if (query.includes("mới") || query.includes("bắt đầu")) {
    return "Người mới nên bắt đầu với vợt cân bằng, thân dẻo hoặc trung bình và trọng lượng vừa phải. Cách này giúp dễ kiểm soát cầu trước khi bạn chọn vợt chuyên công hoặc chuyên thủ.";
  }
  return "Để chọn phù hợp hơn, bạn hãy cho mình biết trình độ chơi, lối đánh yêu thích, ngân sách và sản phẩm bạn đang quan tâm. Tính năng RAG sẽ sớm dùng dữ liệu sản phẩm thực tế để tư vấn chi tiết hơn.";
}
