import { connectDatabase, disconnectDatabase } from "../config/database.js";
import { BrandModel } from "../modules/brands/brand.model.js";
import { CategoryModel, type CategoryAttribute } from "../modules/categories/category.model.js";

const attribute = (
  key: string,
  label: string,
  scope: CategoryAttribute["scope"],
  options: string[] = [],
  extra: Partial<CategoryAttribute> = {},
): CategoryAttribute => ({
  key,
  label,
  scope,
  dataType: options.length ? "select" : "text",
  options,
  unit: "",
  required: scope === "variant",
  filterable: true,
  sortOrder: 0,
  ...extra,
});

const apparelSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];
const shoeSizes = ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46"];

const categories = [
  {
    name: "Vợt cầu lông",
    slug: "vot-cau-long",
    sortOrder: 10,
    attributes: [
      attribute("weightClass", "Trọng lượng", "variant", ["2U", "3U", "4U", "5U", "6U"]),
      attribute("gripSize", "Cỡ cán", "variant", ["G4", "G5", "G6"]),
      attribute("flex", "Độ cứng thân vợt", "specification", ["Dẻo", "Trung bình", "Cứng", "Rất cứng"]),
      attribute("balance", "Điểm cân bằng", "specification", ["Nhẹ đầu", "Cân bằng", "Nặng đầu"]),
      attribute("maxTension", "Mức căng tối đa", "specification", [], { dataType: "number", unit: "lbs" }),
      attribute("material", "Chất liệu", "specification"),
    ],
  },
  {
    name: "Giày cầu lông",
    slug: "giay-cau-long",
    sortOrder: 20,
    attributes: [
      attribute("size", "Size giày", "variant", shoeSizes),
      attribute("gender", "Đối tượng", "specification", ["Nam", "Nữ", "Unisex", "Trẻ em"]),
      attribute("upperMaterial", "Chất liệu thân giày", "specification"),
      attribute("soleMaterial", "Chất liệu đế", "specification"),
    ],
  },
  {
    name: "Áo cầu lông",
    slug: "ao-cau-long",
    sortOrder: 30,
    attributes: [
      attribute("size", "Size áo", "variant", apparelSizes),
      attribute("gender", "Đối tượng", "specification", ["Nam", "Nữ", "Unisex", "Trẻ em"]),
      attribute("material", "Chất liệu", "specification"),
    ],
  },
  {
    name: "Quần cầu lông",
    slug: "quan-cau-long",
    sortOrder: 40,
    attributes: [
      attribute("size", "Size quần", "variant", apparelSizes),
      attribute("gender", "Đối tượng", "specification", ["Nam", "Nữ", "Unisex", "Trẻ em"]),
      attribute("material", "Chất liệu", "specification"),
    ],
  },
  {
    name: "Váy cầu lông",
    slug: "vay-cau-long",
    sortOrder: 50,
    attributes: [
      attribute("size", "Size váy", "variant", apparelSizes),
      attribute("material", "Chất liệu", "specification"),
    ],
  },
  {
    name: "Túi vợt cầu lông",
    slug: "tui-vot-cau-long",
    sortOrder: 60,
    attributes: [
      attribute("capacity", "Sức chứa", "specification"),
      attribute("compartments", "Số ngăn", "specification", [], { dataType: "number" }),
      attribute("material", "Chất liệu", "specification"),
    ],
  },
  {
    name: "Balo cầu lông",
    slug: "balo-cau-long",
    sortOrder: 70,
    attributes: [
      attribute("capacity", "Sức chứa", "specification"),
      attribute("material", "Chất liệu", "specification"),
    ],
  },
  {
    name: "Phụ kiện cầu lông",
    slug: "phu-kien-cau-long",
    sortOrder: 80,
    attributes: [attribute("accessoryType", "Loại phụ kiện", "specification")],
  },
];

const brands = ["Yonex", "Li-Ning", "Victor", "Mizuno", "Kawasaki", "Apacs", "VS", "Kamito"];

async function seedCatalog() {
  await connectDatabase();
  await CategoryModel.updateMany({ imageUrl: { $exists: false } }, { $set: { imageUrl: "" } });
  await Promise.all(
    categories.map((category) =>
      CategoryModel.findOneAndUpdate(
        { slug: category.slug },
        {
          $set: { ...category, status: "active", deletedAt: null },
          $setOnInsert: { description: "", imageUrl: "" },
        },
        { upsert: true, setDefaultsOnInsert: true },
      ),
    ),
  );
  await Promise.all(
    brands.map((name, index) =>
      BrandModel.findOneAndUpdate(
        { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
        { $set: { name, status: "active", sortOrder: (index + 1) * 10, deletedAt: null } },
        { upsert: true, setDefaultsOnInsert: true },
      ),
    ),
  );
  console.log(`Catalog ready: ${categories.length} categories, ${brands.length} brands.`);
}

seedCatalog()
  .catch((error) => {
    console.error("Unable to seed catalog:", error);
    process.exitCode = 1;
  })
  .finally(disconnectDatabase);
