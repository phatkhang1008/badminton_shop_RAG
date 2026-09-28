import { Readable } from "node:stream";
import mongoose, { type Types } from "mongoose";
import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { BrandModel } from "../modules/brands/brand.model.js";
import { CategoryModel } from "../modules/categories/category.model.js";
import { ProductModel, type ProductSpecification } from "../modules/products/product.model.js";
import { sanitizeRichText } from "../utils/sanitizeRichText.js";

type SeedAttribute = { key: string; label: string; value: string };
type SeedVariant = {
  sku: string;
  colorName: string;
  colorHex?: string;
  attributes: SeedAttribute[];
  price?: number | null;
  salePrice?: number | null;
  stock: number;
  imageIndex?: number;
};
type SeedImage = { sourceUrl: string; alt: string };
type UploadedSeedImage = { url: string; createdId?: Types.ObjectId };
type ProductImage = { url: string; alt: string; isPrimary: boolean; sortOrder: number };
type SeedProduct = {
  name: string;
  slug: string;
  sourcePage: string;
  categorySlug: string;
  brandSlug: string;
  shortDescription: string;
  basePrice: number;
  salePrice?: number | null;
  images: SeedImage[];
  specifications: ProductSpecification[];
  variants: SeedVariant[];
};

const source = (path: string) => `https://shopvnb.com/${path}`;
const image = (url: string, alt: string): SeedImage => ({ sourceUrl: url, alt });
const attr = (key: string, label: string, value: string): SeedAttribute => ({ key, label, value });
const spec = (key: string, label: string, value: string | number, unit = ""): ProductSpecification => ({ key, label, value, unit });

const racketVariant = (sku: string, colorName: string, stock: number, weight = "4U", grip = "G5", colorHex = ""):
  SeedVariant => ({
    sku,
    colorName,
    colorHex,
    stock,
    attributes: [attr("weightClass", "Trọng lượng", weight), attr("gripSize", "Cỡ cán", grip)],
  });

const sizedVariants = (
  skuPrefix: string,
  colorName: string,
  colorHex: string,
  sizes: string[],
  label: string,
  stockStart = 8,
  imageIndex = 0,
): SeedVariant[] => sizes.map((size, index) => ({
  sku: `${skuPrefix}-${size}`,
  colorName,
  colorHex,
  stock: Math.max(2, stockStart - index),
  imageIndex,
  attributes: [attr("size", label, size)],
}));

const simpleVariant = (sku: string, colorName: string, stock: number, colorHex = "", imageIndex = 0): SeedVariant => ({
  sku,
  colorName,
  colorHex,
  stock,
  imageIndex,
  attributes: [],
});

const products: SeedProduct[] = [
  {
    name: "Vợt cầu lông Yonex Astrox 10",
    slug: "vot-cau-long-yonex-astrox-10",
    sourcePage: source("vot-cau-long-yonex-astrox-10.html"),
    categorySlug: "vot-cau-long",
    brandSlug: "yonex",
    shortDescription: "Mẫu vợt Yonex thuộc dòng Astrox, phù hợp người chơi thiên về tấn công và cần trợ lực.",
    basePrice: 939000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/vot-cau-long-yonex-astrox-10_1782097544.webp", "Vợt Yonex Astrox 10")],
    specifications: [spec("balance", "Điểm cân bằng", "Nặng đầu"), spec("material", "Chất liệu", "Graphite")],
    variants: [racketVariant("YX-ASTROX10-4U-G5", "Đen xanh", 12, "4U", "G5", "#1f2937")],
  },
  {
    name: "Vợt cầu lông Yonex Arcsaber 7 Play Limited",
    slug: "vot-cau-long-yonex-arcsaber-7-play-limited-light-beige-chinh-hang",
    sourcePage: source("vot-cau-long-yonex-arcsaber-7-play-limited-light-beige-chinh-hang.html"),
    categorySlug: "vot-cau-long",
    brandSlug: "yonex",
    shortDescription: "Phiên bản Arcsaber phối màu giới hạn, hướng đến lối chơi cân bằng và kiểm soát cầu.",
    basePrice: 1409000,
    salePrice: 1200000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-yonex-arcsaber-7-play-limited-light-beige-chinh-hang_1773947031.webp", "Yonex Arcsaber 7 Play Limited Light Beige")],
    specifications: [spec("flex", "Độ cứng thân vợt", "Trung bình"), spec("balance", "Điểm cân bằng", "Cân bằng"), spec("material", "Chất liệu", "Graphite")],
    variants: [racketVariant("YX-ARC7PL-4U-G5", "Light Beige", 9, "4U", "G5", "#d7c7ad")],
  },
  {
    name: "Vợt cầu lông Victor DriveX 12 O Zheng Siwei",
    slug: "vot-cau-long-victor-drivex-12-o-zheng-siwei",
    sourcePage: source("vot-cau-long-victor-drivex-12-o-zheng-siwei.html"),
    categorySlug: "vot-cau-long",
    brandSlug: "victor",
    shortDescription: "DriveX 12 phiên bản Zheng Siwei dành cho người chơi công thủ toàn diện và yêu cầu độ chính xác cao.",
    basePrice: 3590000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-victor-drivex-12-o-zheng-siwei-chinh-hang-1762198904_1787270866.jpg", "Victor DriveX 12 O Zheng Siwei")],
    specifications: [spec("flex", "Độ cứng thân vợt", "Cứng"), spec("balance", "Điểm cân bằng", "Cân bằng"), spec("material", "Chất liệu", "High Modulus Graphite")],
    variants: [racketVariant("VT-DX12O-4U-G5", "Cam trắng", 7, "4U", "G5", "#f97316")],
  },
  {
    name: "Vợt cầu lông Victor Auraspeed 3200",
    slug: "vot-cau-long-victor-auraspeed-3200",
    sourcePage: source("vot-cau-long-victor-auraspeed-3200.html"),
    categorySlug: "vot-cau-long",
    brandSlug: "victor",
    shortDescription: "Mẫu Auraspeed dễ tiếp cận, linh hoạt trong phản tạt và điều cầu ở tốc độ cao.",
    basePrice: 1250000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/vot-cau-long-victor-auraspeed-3200_1787884904.webp", "Victor Auraspeed 3200")],
    specifications: [spec("flex", "Độ cứng thân vợt", "Trung bình"), spec("balance", "Điểm cân bằng", "Cân bằng"), spec("material", "Chất liệu", "Graphite")],
    variants: [racketVariant("VT-ARS3200-4U-G5", "Đen vàng", 15, "4U", "G5", "#171717")],
  },
  {
    name: "Vợt cầu lông Li-Ning Bladex 880 Shida 2026",
    slug: "vot-cau-long-lining-bladex-880-shida-2026-chinh-hang",
    sourcePage: source("vot-cau-long-lining-bladex-880-shida-2026-chinh-hang.html"),
    categorySlug: "vot-cau-long",
    brandSlug: "li-ning",
    shortDescription: "Bladex 880 phiên bản Shida nổi bật với khả năng xử lý nhanh và phong cách thi đấu tốc độ.",
    basePrice: 4500000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/vot-cau-long-lining-bladex-880-shida-2026-chinh-hang_1778530937.webp", "Li-Ning Bladex 880 Shida 2026")],
    specifications: [spec("flex", "Độ cứng thân vợt", "Cứng"), spec("balance", "Điểm cân bằng", "Nhẹ đầu"), spec("material", "Chất liệu", "Carbon Fiber")],
    variants: [racketVariant("LN-BX880S-4U-G5", "Trắng tím", 6, "4U", "G5", "#e9d5ff")],
  },
  {
    name: "Vợt cầu lông Li-Ning Bladex Assassin",
    slug: "vot-cau-long-lining-bladex-assassin",
    sourcePage: source("vot-cau-long-lining-bladex-assassin.html"),
    categorySlug: "vot-cau-long",
    brandSlug: "li-ning",
    shortDescription: "Dòng Bladex tầm trung dành cho người chơi thích tốc độ vung vợt và phản tạt nhanh.",
    basePrice: 1300000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/vot-cau-long-lining-bladex-assassin_1774060906.webp", "Li-Ning Bladex Assassin")],
    specifications: [spec("flex", "Độ cứng thân vợt", "Trung bình"), spec("balance", "Điểm cân bằng", "Nhẹ đầu"), spec("material", "Chất liệu", "Carbon Fiber")],
    variants: [racketVariant("LN-BXASSASSIN-4U-G5", "Đen đỏ", 10, "4U", "G5", "#991b1b")],
  },
  {
    name: "Vợt cầu lông Mizuno Acrospeed 8",
    slug: "vot-cau-long-mizuno-acrospeed-8",
    sourcePage: source("vot-cau-long-mizuno-acrospeed-8.html"),
    categorySlug: "vot-cau-long",
    brandSlug: "mizuno",
    shortDescription: "Mizuno Acrospeed 8 hướng đến khả năng xoay trở nhanh, phù hợp đánh đôi và phản tạt.",
    basePrice: 3150000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/vot-cau-long-mizuno-acrospeed-8_1745613718.webp", "Mizuno Acrospeed 8")],
    specifications: [spec("flex", "Độ cứng thân vợt", "Cứng"), spec("balance", "Điểm cân bằng", "Cân bằng"), spec("material", "Chất liệu", "High Modulus Graphite")],
    variants: [racketVariant("MZ-AS8-4U-G5", "Xanh đen", 5, "4U", "G5", "#0f4c81")],
  },
  {
    name: "Vợt cầu lông Apacs Pro Commander 6.4 New",
    slug: "vot-cau-long-apacs-pro-commander-6-4-new-chinh-hang",
    sourcePage: source("vot-cau-long-apacs-pro-commander-6-4-new-chinh-hang.html"),
    categorySlug: "vot-cau-long",
    brandSlug: "apacs",
    shortDescription: "Pro Commander 6.4 là lựa chọn tầm trung cân bằng giữa sức mạnh, kiểm soát và độ bền.",
    basePrice: 1879000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/1vot-cau-long-apacs-pro-commander-6-4-new-chinh-hang_1785099311.webp", "Apacs Pro Commander 6.4 New")],
    specifications: [spec("flex", "Độ cứng thân vợt", "Trung bình"), spec("balance", "Điểm cân bằng", "Cân bằng"), spec("material", "Chất liệu", "High Modulus Graphite")],
    variants: [racketVariant("AP-PC64-4U-G5", "Đen bạc", 8, "4U", "G5", "#374151")],
  },
  {
    name: "Giày cầu lông Yonex SHB 65Z VA Women",
    slug: "giay-cau-long-yonex-shb-65z-va-women",
    sourcePage: source("giay-cau-long-yonex-shb-65z-va-women.html"),
    categorySlug: "giay-cau-long",
    brandSlug: "yonex",
    shortDescription: "Phiên bản SHB 65Z VA dành cho nữ, tập trung độ ổn định và hấp thụ chấn khi di chuyển.",
    basePrice: 3189000,
    salePrice: 2950000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/giay-cau-long-yonex-shb-65z-va-women_1788809426.webp", "Yonex SHB 65Z VA Women")],
    specifications: [spec("gender", "Đối tượng", "Nữ"), spec("upperMaterial", "Chất liệu thân giày", "Da tổng hợp và lưới"), spec("soleMaterial", "Chất liệu đế", "Cao su non-marking")],
    variants: sizedVariants("YX-65ZVAW", "Trắng xanh", "#e5f4f8", ["36", "37", "38", "39", "40"], "Size giày", 9),
  },
  {
    name: "Giày cầu lông Yonex Dominant 7",
    slug: "giay-cau-long-yonex-dominant-7",
    sourcePage: source("giay-cau-long-yonex-dominant-7.html"),
    categorySlug: "giay-cau-long",
    brandSlug: "yonex",
    shortDescription: "Mẫu giày Yonex dễ sử dụng cho tập luyện thường xuyên, đế bám sân và form ôm chân.",
    basePrice: 990000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/giay-cau-long-yonex-dominant-7_1787774419.webp", "Yonex Dominant 7")],
    specifications: [spec("gender", "Đối tượng", "Unisex"), spec("upperMaterial", "Chất liệu thân giày", "Da tổng hợp và lưới"), spec("soleMaterial", "Chất liệu đế", "Cao su")],
    variants: sizedVariants("YX-DOM7", "Trắng đen", "#f5f5f4", ["39", "40", "41", "42", "43"], "Size giày", 11),
  },
  {
    name: "Giày cầu lông Li-Ning Blade 2 SE Unisex P-AYTW001-2V",
    slug: "giay-cau-long-lining-blade-2-se-unisex-p-aytw001-2v-chinh-hang",
    sourcePage: source("giay-cau-long-lining-blade-2-se-unisex-p-aytw001-2v-chinh-hang.html"),
    categorySlug: "giay-cau-long",
    brandSlug: "li-ning",
    shortDescription: "Li-Ning Blade 2 SE có thiết kế thể thao hiện đại, phù hợp người chơi cần sự linh hoạt trên sân.",
    basePrice: 1485000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/1giay-cau-long-lining-blade-2-se-unisex-p-aytw001-2v-chinh-hang_1788144496.webp", "Li-Ning Blade 2 SE Unisex")],
    specifications: [spec("gender", "Đối tượng", "Unisex"), spec("upperMaterial", "Chất liệu thân giày", "Vải dệt và da tổng hợp"), spec("soleMaterial", "Chất liệu đế", "Cao su chống trượt")],
    variants: sizedVariants("LN-BLADE2SE", "Trắng tím", "#ede9fe", ["39", "40", "41", "42", "43"], "Size giày", 10),
  },
  {
    name: "Giày cầu lông Li-Ning Bladex Max Shida",
    slug: "giay-cau-long-lining-bladex-max-shida",
    sourcePage: source("giay-cau-long-lining-bladex-max-shida.html"),
    categorySlug: "giay-cau-long",
    brandSlug: "li-ning",
    shortDescription: "Mẫu giày cao cấp Bladex Max phiên bản Shida, hỗ trợ ổn định khi đổi hướng và bật nhảy.",
    basePrice: 3499000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/giay-cau-long-lining-bladex-max_1787861775.webp", "Li-Ning Bladex Max Shida")],
    specifications: [spec("gender", "Đối tượng", "Unisex"), spec("upperMaterial", "Chất liệu thân giày", "Vải dệt cao cấp"), spec("soleMaterial", "Chất liệu đế", "Cao su và đệm đàn hồi")],
    variants: sizedVariants("LN-BXMAXS", "Trắng hồng", "#fce7f3", ["38", "39", "40", "41", "42"], "Size giày", 7),
  },
  {
    name: "Giày cầu lông Victor A970CHP",
    slug: "giay-cau-long-victor-a970chp",
    sourcePage: source("giay-cau-long-victor-a970chp.html"),
    categorySlug: "giay-cau-long",
    brandSlug: "victor",
    shortDescription: "Victor A970CHP thuộc phân khúc thi đấu, chú trọng độ chắc chắn và khả năng hỗ trợ bàn chân.",
    basePrice: 2100000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/giay-cau-long-victor-a970chp_1787187136.webp", "Victor A970CHP")],
    specifications: [spec("gender", "Đối tượng", "Unisex"), spec("upperMaterial", "Chất liệu thân giày", "Da tổng hợp và lưới"), spec("soleMaterial", "Chất liệu đế", "Cao su non-marking")],
    variants: sizedVariants("VT-A970CHP", "Trắng", "#fafafa", ["39", "40", "41", "42", "43"], "Size giày", 8),
  },
  {
    name: "Giày cầu lông Victor C90 II",
    slug: "giay-cau-long-victor-c90-ii",
    sourcePage: source("giay-cau-long-victor-c90-ii.html"),
    categorySlug: "giay-cau-long",
    brandSlug: "victor",
    shortDescription: "Victor C90 II là mẫu giày cao cấp dành cho người chơi cần độ bám và ổn định trong thi đấu.",
    basePrice: 2750000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/giay-cau-long-victor-c90-ii_1787172275.webp", "Victor C90 II")],
    specifications: [spec("gender", "Đối tượng", "Unisex"), spec("upperMaterial", "Chất liệu thân giày", "Da tổng hợp cao cấp"), spec("soleMaterial", "Chất liệu đế", "Cao su chống trượt")],
    variants: sizedVariants("VT-C90II", "Trắng xanh", "#e0f2fe", ["40", "41", "42", "43", "44"], "Size giày", 6),
  },
  {
    name: "Áo cầu lông Yonex TRMYOB26147 Cyber Orange",
    slug: "ao-cau-long-yonex-trmyob26147-cyber-orange-chinh-hang",
    sourcePage: source("ao-cau-long-yonex-trmyob26147-cyber-orange-chinh-hang.html"),
    categorySlug: "ao-cau-long",
    brandSlug: "yonex",
    shortDescription: "Áo thi đấu Yonex màu cam nổi bật, chất liệu nhẹ và phù hợp vận động cường độ cao.",
    basePrice: 239000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/ao-cau-long-yonex-trmyob26147-cyber-orange-chinh-hang-1_1789066231.webp", "Áo Yonex TRMYOB26147 Cyber Orange")],
    specifications: [spec("gender", "Đối tượng", "Unisex"), spec("material", "Chất liệu", "Polyester thể thao")],
    variants: sizedVariants("YX-OB26147-ORG", "Cyber Orange", "#f97316", ["M", "L", "XL", "2XL"], "Size áo", 14),
  },
  {
    name: "Áo cầu lông Yonex TRM3474 ACT35",
    slug: "ao-cau-long-yonex-trm3474-act35",
    sourcePage: source("ao-cau-long-yonex-trm3474-act35-paradise-green-chinh-hang.html"),
    categorySlug: "ao-cau-long",
    brandSlug: "yonex",
    shortDescription: "Áo Yonex TRM3474 form thể thao, có hai lựa chọn màu phù hợp tập luyện và thi đấu.",
    basePrice: 349000,
    images: [
      image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/ao-cau-long-yonex-trm3474-act35-paradise-green-chinh-hang_1784683397.webp", "Áo Yonex TRM3474 Paradise Green"),
      image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/ao-cau-long-yonex-trm3474-act35-navy-peony-chinh-hang_1784683390.webp", "Áo Yonex TRM3474 Navy Peony"),
    ],
    specifications: [spec("gender", "Đối tượng", "Unisex"), spec("material", "Chất liệu", "Polyester thoáng khí")],
    variants: [
      ...sizedVariants("YX-TRM3474-GRN", "Paradise Green", "#16a34a", ["M", "L", "XL"], "Size áo", 10, 0),
      ...sizedVariants("YX-TRM3474-NVY", "Navy Peony", "#1e3a5f", ["M", "L", "XL"], "Size áo", 9, 1),
    ],
  },
  {
    name: "Quần cầu lông Yonex TSM3475 ACT35",
    slug: "quan-cau-long-yonex-tsm3475-act35",
    sourcePage: source("quan-cau-long-yonex-tsm3475-act35-white-chinh-hang.html"),
    categorySlug: "quan-cau-long",
    brandSlug: "yonex",
    shortDescription: "Quần cầu lông Yonex TSM3475 co giãn, nhẹ và có hai màu cơ bản dễ phối áo.",
    basePrice: 369000,
    images: [
      image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/quan-cau-long-yonex-tsm3475-act35-white-chinh-hang_1784683647.webp", "Quần Yonex TSM3475 White"),
      image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/quan-cau-long-yonex-tsm3475-act35-black-chinh-hang_1784683653.webp", "Quần Yonex TSM3475 Black"),
    ],
    specifications: [spec("gender", "Đối tượng", "Unisex"), spec("material", "Chất liệu", "Polyester co giãn")],
    variants: [
      ...sizedVariants("YX-TSM3475-WHT", "White", "#ffffff", ["M", "L", "XL"], "Size quần", 12, 0),
      ...sizedVariants("YX-TSM3475-BLK", "Black", "#111827", ["M", "L", "XL"], "Size quần", 11, 1),
    ],
  },
  {
    name: "Quần cầu lông Yonex TSM3336 ACT35",
    slug: "quan-cau-long-yonex-tsm3336-act35",
    sourcePage: source("quan-cau-long-yonex-tsm3336-act35-mood-indigo-chinh-hang.html"),
    categorySlug: "quan-cau-long",
    brandSlug: "yonex",
    shortDescription: "Quần Yonex TSM3336 thiết kế gọn nhẹ, hỗ trợ di chuyển linh hoạt trên sân.",
    basePrice: 389000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/quan-cau-long-yonex-tsm3336-act35-mood-indigo-chinh-hang_1784678632.webp", "Quần Yonex TSM3336 Mood Indigo")],
    specifications: [spec("gender", "Đối tượng", "Nam"), spec("material", "Chất liệu", "Polyester thể thao")],
    variants: sizedVariants("YX-TSM3336-IND", "Mood Indigo", "#3f4c6b", ["M", "L", "XL", "2XL"], "Size quần", 10),
  },
  {
    name: "Váy cầu lông Yonex TSI3342 ACT35",
    slug: "vay-cau-long-yonex-tsi3342-act35",
    sourcePage: source("vay-cau-long-yonex-tsi3342-act35-black-chinh-hang.html"),
    categorySlug: "vay-cau-long",
    brandSlug: "yonex",
    shortDescription: "Váy thể thao Yonex TSI3342 có phom năng động, chất liệu nhẹ và hai màu dễ phối.",
    basePrice: 329000,
    images: [
      image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/vay-cau-long-yonex-tsi3342-act35-black-chinh-hang_1784679287.webp", "Váy Yonex TSI3342 Black"),
      image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/vay-cau-long-yonex-tsi3342-act35-white-chinh-hang_1784679307.webp", "Váy Yonex TSI3342 White"),
    ],
    specifications: [spec("material", "Chất liệu", "Polyester co giãn")],
    variants: [
      ...sizedVariants("YX-TSI3342-BLK", "Black", "#111827", ["S", "M", "L", "XL"], "Size váy", 9, 0),
      ...sizedVariants("YX-TSI3342-WHT", "White", "#ffffff", ["S", "M", "L", "XL"], "Size váy", 8, 1),
    ],
  },
  {
    name: "Túi cầu lông Li-Ning ABLV081",
    slug: "tui-cau-long-lining-ablv081",
    sourcePage: source("tui-cau-long-lining-ablv081.html"),
    categorySlug: "tui-vot-cau-long",
    brandSlug: "li-ning",
    shortDescription: "Túi Li-Ning ABLV081 có không gian rộng cho vợt, trang phục và phụ kiện tập luyện.",
    basePrice: 1790000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/tui-cau-long-lining-ablv081_1787864484.webp", "Túi cầu lông Li-Ning ABLV081")],
    specifications: [spec("capacity", "Sức chứa", "Nhiều vợt và trang phục"), spec("compartments", "Số ngăn", 3), spec("material", "Chất liệu", "Polyester")],
    variants: [simpleVariant("LN-ABLV081-STD", "Màu tiêu chuẩn", 8)],
  },
  {
    name: "Túi cầu lông Victor BR5672 C026 V",
    slug: "tui-cau-long-victor-br5672-c026-v-chinh-hang",
    sourcePage: source("tui-cau-long-victor-br5672-c026-v-chinh-hang.html"),
    categorySlug: "tui-vot-cau-long",
    brandSlug: "victor",
    shortDescription: "Túi Victor BR5672 phiên bản China Open 2026 với thiết kế nổi bật và nhiều ngăn tiện dụng.",
    basePrice: 1450000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/tui-cau-long-victor-br5672-c026-v-chinh-hang_1787772357.webp", "Túi Victor BR5672 C026")],
    specifications: [spec("capacity", "Sức chứa", "Vợt, giày và trang phục"), spec("compartments", "Số ngăn", 3), spec("material", "Chất liệu", "Polyester")],
    variants: [simpleVariant("VT-BR5672-C026", "Phiên bản C026", 6)],
  },
  {
    name: "Túi cầu lông Victor BR2205",
    slug: "tui-cau-long-victor-br2205",
    sourcePage: source("tui-cau-long-victor-br2205.html"),
    categorySlug: "tui-vot-cau-long",
    brandSlug: "victor",
    shortDescription: "Victor BR2205 có kiểu dáng dài, đủ chỗ cho vợt, giày, quần áo và phụ kiện.",
    basePrice: 1200000,
    salePrice: 1000000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/tui-cau-long-victor-br2205_1783470548.webp", "Túi Victor BR2205")],
    specifications: [spec("capacity", "Sức chứa", "Vợt, giày và trang phục"), spec("compartments", "Số ngăn", 3), spec("material", "Chất liệu", "Polyester")],
    variants: [simpleVariant("VT-BR2205-WHT", "Trắng", 7, "#ffffff"), simpleVariant("VT-BR2205-BLU", "Xanh", 5, "#2563eb")],
  },
  {
    name: "Balo cầu lông Yonex BA92412BEX",
    slug: "balo-cau-long-yonex-ba92412bex",
    sourcePage: source("balo-cau-long-yonex-ba92412bex.html"),
    categorySlug: "balo-cau-long",
    brandSlug: "yonex",
    shortDescription: "Balo Yonex BA92412BEX thuộc phân khúc cao cấp, bố trí ngăn riêng cho vợt và vật dụng cá nhân.",
    basePrice: 2259000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/balo-cau-long-yonex-ba92412bex_1789523562.webp", "Balo Yonex BA92412BEX")],
    specifications: [spec("capacity", "Sức chứa", "Vợt, giày và vật dụng cá nhân"), spec("material", "Chất liệu", "Polyester")],
    variants: [simpleVariant("YX-BA92412BEX-STD", "Màu tiêu chuẩn", 6)],
  },
  {
    name: "Balo cầu lông Li-Ning ABSW235",
    slug: "balo-cau-long-lining-absw235",
    sourcePage: source("balo-cau-long-lining-absw235.html"),
    categorySlug: "balo-cau-long",
    brandSlug: "li-ning",
    shortDescription: "Li-Ning ABSW235 là mẫu balo gọn, phù hợp mang vợt và đồ tập hằng ngày.",
    basePrice: 850000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/san_pham/balo-cau-long-lining-absw235_1787877745.webp", "Balo Li-Ning ABSW235")],
    specifications: [spec("capacity", "Sức chứa", "Một đến hai vợt và phụ kiện"), spec("material", "Chất liệu", "Polyester")],
    variants: [simpleVariant("LN-ABSW235-STD", "Màu tiêu chuẩn", 10)],
  },
  {
    name: "Balo cầu lông Victor BR5072 C026",
    slug: "balo-cau-long-victor-br5072-c026-chinh-hang",
    sourcePage: source("balo-cau-long-victor-br5072-c026-chinh-hang.html"),
    categorySlug: "balo-cau-long",
    brandSlug: "victor",
    shortDescription: "Balo Victor BR5072 C026 có kiểu dáng thể thao và ngăn chứa phù hợp nhu cầu thi đấu.",
    basePrice: 1200000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/balo-cau-long-victor-br5072-c026-chinh-hang_1787772288.webp", "Balo Victor BR5072 C026")],
    specifications: [spec("capacity", "Sức chứa", "Vợt và đồ dùng thi đấu"), spec("material", "Chất liệu", "Polyester")],
    variants: [simpleVariant("VT-BR5072-C026", "Phiên bản C026", 8)],
  },
  {
    name: "Set băng chặn mồ hôi Yonex WBD11524 WB11",
    slug: "set-bang-chan-mo-hoi-yonex-wbd11524-wb11-chinh-hang",
    sourcePage: source("set-bang-chan-mo-hoi-yonex-wbd11524-wb11-chinh-hang.html"),
    categorySlug: "phu-kien-cau-long",
    brandSlug: "yonex",
    shortDescription: "Bộ băng chặn mồ hôi Yonex dùng khi tập luyện và thi đấu, nhỏ gọn và dễ phối trang phục.",
    basePrice: 110000,
    images: [image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/set-bang-chan-mo-hoi-yonex-wbd11524-wb11-chinh-hang_1789784086.webp", "Set băng chặn mồ hôi Yonex WBD11524")],
    specifications: [spec("accessoryType", "Loại phụ kiện", "Băng chặn mồ hôi")],
    variants: [simpleVariant("YX-WBD11524-SET", "Màu tiêu chuẩn", 25)],
  },
  {
    name: "Vớ cầu lông Victor SK190",
    slug: "vo-cau-long-victor-sk190",
    sourcePage: source("vo-cau-long-victor-sk190-a-trang-chinh-hang.html"),
    categorySlug: "phu-kien-cau-long",
    brandSlug: "victor",
    shortDescription: "Vớ Victor SK190 dành cho vận động thể thao, có hai màu cơ bản và chất liệu thấm hút.",
    basePrice: 105000,
    images: [
      image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/vo-cau-long-victor-sk190-a-trang-chinh-hang_1789786557.webp", "Vớ Victor SK190 trắng"),
      image("https://cdn.shopvnb.com/img/300x300/uploads/gallery/vo-cau-long-victor-sk190-c-den-chinh-hang_1789786552.webp", "Vớ Victor SK190 đen"),
    ],
    specifications: [spec("accessoryType", "Loại phụ kiện", "Vớ cầu lông")],
    variants: [simpleVariant("VT-SK190-WHT", "Trắng", 30, "#ffffff", 0), simpleVariant("VT-SK190-BLK", "Đen", 24, "#111827", 1)],
  },
];

function gridFsBucket() {
  const database = mongoose.connection.db;
  if (!database) throw new Error("Database chưa sẵn sàng.");
  return new mongoose.mongo.GridFSBucket(database, { bucketName: "catalogImages" });
}

async function uploadSeedImage(seedImage: SeedImage, seedKey: string): Promise<UploadedSeedImage> {
  const existing = await gridFsBucket().find({ "metadata.sourceUrl": seedImage.sourceUrl }).next();
  if (existing) return { url: `/uploads/catalog/${existing._id.toString()}` };

  const response = await fetch(seedImage.sourceUrl, {
    headers: { "User-Agent": "BadmintonShopRAG-AcademicSeed/1.0", Accept: "image/avif,image/webp,image/png,image/jpeg" },
  });
  if (!response.ok) throw new Error(`Không tải được ảnh (${response.status}): ${seedImage.sourceUrl}`);
  const contentType = response.headers.get("content-type")?.split(";")[0] ?? "application/octet-stream";
  if (!contentType.startsWith("image/")) throw new Error(`Nguồn không phải ảnh: ${seedImage.sourceUrl}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > 5 * 1024 * 1024) throw new Error(`Ảnh vượt quá 5 MB: ${seedImage.sourceUrl}`);
  const extension = contentType === "image/png" ? ".png" : contentType === "image/jpeg" ? ".jpg" : ".webp";
  const upload = gridFsBucket().openUploadStream(`${seedKey}${extension}`, {
    metadata: {
      originalName: `${seedKey}${extension}`,
      contentType,
      usage: "product-seed",
      sourceUrl: seedImage.sourceUrl,
      importedAt: new Date(),
    },
  });
  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer).pipe(upload).on("finish", resolve).on("error", reject);
  });
  return {
    url: `/uploads/catalog/${upload.id.toString()}`,
    createdId: upload.id as Types.ObjectId,
  };
}

function richDescription(product: SeedProduct) {
  return sanitizeRichText(`
    <h2>Giới thiệu ${product.name}</h2>
    <p>${product.shortDescription}</p>
    <ul>
      <li>Thương hiệu chính hãng trong danh mục cầu lông.</li>
      <li>Có SKU và tồn kho riêng cho từng màu sắc, kích cỡ hoặc thông số.</li>
      <li>Giá bán là dữ liệu tham khảo tại thời điểm tạo bộ dữ liệu mẫu.</li>
    </ul>
    <p><a href="${product.sourcePage}" target="_blank" rel="noopener noreferrer">Xem nguồn tham khảo tại ShopVNB</a></p>
  `);
}

async function seedProducts() {
  await connectDatabase();
  const [categories, brands] = await Promise.all([
    CategoryModel.find({ deletedAt: null }).select("_id slug").lean(),
    BrandModel.find({ deletedAt: null }).select("_id slug").lean(),
  ]);
  const categoryIds = new Map(categories.map((item) => [item.slug, item._id as Types.ObjectId]));
  const brandIds = new Map(brands.map((item) => [item.slug, item._id as Types.ObjectId]));
  let inserted = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const product of products) {
    if (await ProductModel.exists({ slug: product.slug })) {
      skipped += 1;
      console.log(`Skip: ${product.name}`);
      continue;
    }
    const category = categoryIds.get(product.categorySlug);
    const brand = brandIds.get(product.brandSlug);
    if (!category || !brand) {
      failures.push(`${product.name}: thiếu danh mục hoặc thương hiệu`);
      continue;
    }

    const uploadedIds: mongoose.Types.ObjectId[] = [];
    try {
      const uploadedImages: ProductImage[] = [];
      for (const [index, seedImage] of product.images.entries()) {
        const uploaded = await uploadSeedImage(seedImage, `${product.slug}-${index + 1}`);
        if (uploaded.createdId) uploadedIds.push(uploaded.createdId);
        uploadedImages.push({
          url: uploaded.url,
          alt: seedImage.alt,
          isPrimary: index === 0,
          sortOrder: index,
        });
      }
      await ProductModel.create({
        name: product.name,
        slug: product.slug,
        category,
        brand,
        shortDescription: product.shortDescription,
        description: richDescription(product),
        status: "active",
        basePrice: product.basePrice,
        salePrice: product.salePrice ?? null,
        images: uploadedImages,
        specifications: product.specifications,
        variants: product.variants.map(({ imageIndex = 0, ...variant }) => ({
          ...variant,
          price: variant.price ?? null,
          salePrice: variant.salePrice ?? null,
          imageUrl: uploadedImages[imageIndex]?.url ?? uploadedImages[0]?.url ?? "",
        })),
        deletedAt: null,
      });
      inserted += 1;
      console.log(`Added: ${product.name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push(`${product.name}: ${message}`);
      for (const imageId of uploadedIds) {
        const stillReferenced = await ProductModel.exists({ "images.url": `/uploads/catalog/${imageId.toString()}` });
        if (!stillReferenced) await gridFsBucket().delete(imageId).catch(() => undefined);
      }
    }
  }

  const total = await ProductModel.countDocuments({ deletedAt: null });
  console.log(`Products ready: ${inserted} added, ${skipped} skipped, ${total} active records in database.`);
  if (failures.length) {
    console.error(`Failed (${failures.length}):\n- ${failures.join("\n- ")}`);
    process.exitCode = 1;
  }
}

seedProducts()
  .catch((error) => {
    console.error("Unable to seed products:", error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
