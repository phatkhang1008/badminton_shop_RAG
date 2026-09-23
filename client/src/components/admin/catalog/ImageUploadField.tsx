import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { App, Button, Image, Space, Upload } from "antd";
import type { UploadProps } from "antd";
import { useState } from "react";
import { uploadCatalogImage } from "../../../api/admin/catalog.api";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploadField({
  value,
  onChange,
  shape = "square",
}: {
  value?: string;
  onChange?: (url: string) => void;
  shape?: "square" | "logo";
}) {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);

  const customRequest: UploadProps["customRequest"] = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    try {
      const image = await uploadCatalogImage(file as File);
      onChange?.(image.url);
      onSuccess?.(image);
      message.success("Đã tải ảnh lên.");
    } catch (error) {
      onError?.(error as Error);
      message.error("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Space align="start" size={14} className="image-upload-field">
      <div className={`image-upload-field__preview image-upload-field__preview--${shape}`}>
        {value ? <Image src={value} alt="Ảnh đã chọn" width="100%" height="100%" preview /> : <UploadOutlined />}
      </div>
      <Space direction="vertical" size={8}>
        <Upload
          accept="image/jpeg,image/png,image/webp"
          maxCount={1}
          showUploadList={false}
          customRequest={customRequest}
          beforeUpload={(file) => {
            if (!allowedTypes.includes(file.type)) {
              message.error("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
              return Upload.LIST_IGNORE;
            }
            if (file.size > 5 * 1024 * 1024) {
              message.error("Ảnh không được vượt quá 5 MB.");
              return Upload.LIST_IGNORE;
            }
            return true;
          }}
        >
          <Button icon={<UploadOutlined />} loading={uploading}>Chọn ảnh từ máy</Button>
        </Upload>
        {value && <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => onChange?.("")}>Xóa ảnh</Button>}
        <span className="image-upload-field__hint">JPG, PNG hoặc WEBP · tối đa 5 MB</span>
      </Space>
    </Space>
  );
}
