import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CrownFilled,
  CrownOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { App, Button, Image, Input, Tooltip, Upload } from "antd";
import type { UploadProps } from "antd";
import { useEffect, useRef, useState } from "react";
import { uploadCatalogImage, type ProductImage } from "../../../api/admin/catalog.api";

const MAX_IMAGES = 12;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

function normalizeImages(images: ProductImage[]) {
  const sorted = [...images].sort((left, right) => left.sortOrder - right.sortOrder);
  const primaryIndex = sorted.findIndex((image) => image.isPrimary);
  const selectedPrimary = primaryIndex >= 0 ? primaryIndex : 0;

  return sorted.map((image, index) => ({
    ...image,
    isPrimary: index === selectedPrimary,
    sortOrder: index,
  }));
}

function imageAltFromFilename(filename: string) {
  return filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export function MultiImageUploadField({
  value,
  onChange,
}: {
  value?: ProductImage[];
  onChange?: (images: ProductImage[]) => void;
}) {
  const { message } = App.useApp();
  const images = normalizeImages(value ?? []);
  const imagesRef = useRef<ProductImage[]>(images);
  const uploadsInFlight = useRef(0);
  const [uploadingCount, setUploadingCount] = useState(0);

  useEffect(() => {
    imagesRef.current = normalizeImages(value ?? []);
  }, [value]);

  const commit = (nextImages: ProductImage[]) => {
    const normalized = normalizeImages(nextImages);
    imagesRef.current = normalized;
    onChange?.(normalized);
  };

  const customRequest: UploadProps["customRequest"] = async ({ file, onSuccess, onError }) => {
    if (imagesRef.current.length + uploadsInFlight.current >= MAX_IMAGES) {
      const error = new Error(`Mỗi sản phẩm được tối đa ${MAX_IMAGES} ảnh.`);
      onError?.(error);
      message.warning(error.message);
      return;
    }

    uploadsInFlight.current += 1;
    setUploadingCount(uploadsInFlight.current);
    try {
      const uploaded = await uploadCatalogImage(file as File);
      const current = imagesRef.current;
      commit([
        ...current,
        {
          url: uploaded.url,
          alt: imageAltFromFilename(uploaded.originalName),
          isPrimary: current.length === 0,
          sortOrder: current.length,
        },
      ]);
      onSuccess?.(uploaded);
      message.success(`Đã tải lên ${uploaded.originalName}.`);
    } catch (error) {
      onError?.(error as Error);
      message.error("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      uploadsInFlight.current -= 1;
      setUploadingCount(uploadsInFlight.current);
    }
  };

  const updateImage = (index: number, patch: Partial<ProductImage>) => {
    commit(imagesRef.current.map((image, imageIndex) => imageIndex === index ? { ...image, ...patch } : image));
  };

  const setPrimary = (index: number) => {
    commit(imagesRef.current.map((image, imageIndex) => ({ ...image, isPrimary: imageIndex === index })));
  };

  const moveImage = (index: number, offset: -1 | 1) => {
    const target = index + offset;
    if (target < 0 || target >= imagesRef.current.length) return;
    const next = [...imagesRef.current];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  };

  const removeImage = (index: number) => {
    commit(imagesRef.current.filter((_, imageIndex) => imageIndex !== index));
  };

  return (
    <div className="multi-image-upload">
      <div className="multi-image-upload__toolbar">
        <Upload
          accept="image/jpeg,image/png,image/webp"
          multiple
          maxCount={MAX_IMAGES}
          showUploadList={false}
          customRequest={customRequest}
          beforeUpload={(file) => {
            if (!allowedTypes.includes(file.type)) {
              message.error(`${file.name}: chỉ chấp nhận JPG, PNG hoặc WEBP.`);
              return Upload.LIST_IGNORE;
            }
            if (file.size > MAX_FILE_SIZE) {
              message.error(`${file.name}: ảnh không được vượt quá 5 MB.`);
              return Upload.LIST_IGNORE;
            }
            return true;
          }}
        >
          <Button
            icon={<UploadOutlined />}
            loading={uploadingCount > 0}
            disabled={images.length + uploadingCount >= MAX_IMAGES}
          >
            Chọn nhiều ảnh từ máy
          </Button>
        </Upload>
        <span className="multi-image-upload__hint">
          {images.length}/{MAX_IMAGES} ảnh · JPG, PNG hoặc WEBP · tối đa 5 MB/ảnh
        </span>
      </div>

      {images.length > 0 && (
        <div className="product-gallery-grid">
          {images.map((image, index) => (
            <div
              className={`product-gallery-item${image.isPrimary ? " product-gallery-item--primary" : ""}`}
              key={image.url}
            >
              <div className="product-gallery-item__preview">
                <Image src={image.url} alt={image.alt || `Ảnh sản phẩm ${index + 1}`} preview />
                {image.isPrimary && <span className="product-gallery-item__badge"><CrownFilled /> Đại diện</span>}
              </div>
              <Input
                size="small"
                value={image.alt}
                maxLength={180}
                placeholder="Mô tả ảnh (alt)"
                onChange={(event) => updateImage(index, { alt: event.target.value })}
              />
              <div className="product-gallery-item__actions">
                <Tooltip title={image.isPrimary ? "Ảnh đại diện" : "Đặt làm ảnh đại diện"}>
                  <Button
                    type={image.isPrimary ? "primary" : "text"}
                    size="small"
                    icon={image.isPrimary ? <CrownFilled /> : <CrownOutlined />}
                    onClick={() => setPrimary(index)}
                  />
                </Tooltip>
                <Tooltip title="Di chuyển sang trái">
                  <Button type="text" size="small" icon={<ArrowLeftOutlined />} disabled={index === 0} onClick={() => moveImage(index, -1)} />
                </Tooltip>
                <Tooltip title="Di chuyển sang phải">
                  <Button type="text" size="small" icon={<ArrowRightOutlined />} disabled={index === images.length - 1} onClick={() => moveImage(index, 1)} />
                </Tooltip>
                <Tooltip title="Bỏ ảnh khỏi sản phẩm">
                  <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeImage(index)} />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
