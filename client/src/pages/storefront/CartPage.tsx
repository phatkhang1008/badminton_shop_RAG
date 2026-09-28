import { DeleteOutlined, MinusOutlined, PlusOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Empty, InputNumber, Popconfirm } from "antd";
import { Link } from "react-router-dom";
import { useCart } from "../../cart/useCart";
import { formatCurrency } from "../../components/storefront/productPresentation";
import { paths } from "../../routes/paths";

export function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  if (!items.length) {
    return (
      <section className="store-cart-page"><div className="store-container store-cart-empty">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Giỏ hàng của bạn đang trống">
          <Link to={paths.products}><Button type="primary" icon={<ShoppingOutlined />}>Khám phá sản phẩm</Button></Link>
        </Empty>
      </div></section>
    );
  }

  return (
    <section className="store-cart-page">
      <div className="store-container">
        <div className="store-cart-heading">
          <div><span className="eyebrow">Giỏ hàng</span><h1>Sản phẩm bạn đã chọn</h1></div>
          <Popconfirm title="Xóa toàn bộ giỏ hàng?" description="Thao tác này không thể hoàn tác." okText="Xóa giỏ hàng" cancelText="Hủy" onConfirm={clearCart}>
            <Button danger type="text" icon={<DeleteOutlined />}>Xóa tất cả</Button>
          </Popconfirm>
        </div>
        <div className="store-cart-layout">
          <div className="store-cart-items">
            {items.map((item) => (
              <Card className="store-cart-item" key={item.key}>
                <div className="store-cart-image">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.imageAlt} /> : <ShoppingOutlined />}
                </div>
                <div className="store-cart-item-info">
                  <Link to={paths.productDetail(item.slug)}>{item.name}</Link>
                  <span>{item.variantName}{item.colorHex && <i style={{ backgroundColor: item.colorHex }} />}</span>
                  <small>SKU: {item.variantSku}</small>
                </div>
                <strong className="store-cart-item-price">{formatCurrency(item.price)}</strong>
                <div className="store-quantity-control">
                  <Button size="small" shape="circle" icon={<MinusOutlined />} aria-label={`Giảm số lượng ${item.name}`} onClick={() => updateQuantity(item.key, item.quantity - 1)} />
                  <InputNumber min={1} max={item.stock} value={item.quantity} controls={false} aria-label={`Số lượng ${item.name}`} onChange={(value) => updateQuantity(item.key, Number(value ?? 1))} />
                  <Button size="small" shape="circle" icon={<PlusOutlined />} disabled={item.quantity >= item.stock} aria-label={`Tăng số lượng ${item.name}`} onClick={() => updateQuantity(item.key, item.quantity + 1)} />
                </div>
                <div className="store-cart-line-total">
                  <strong>{formatCurrency(item.price * item.quantity)}</strong>
                  <Button type="text" danger shape="circle" icon={<DeleteOutlined />} aria-label={`Xóa ${item.name}`} onClick={() => removeItem(item.key)} />
                </div>
              </Card>
            ))}
          </div>
          <aside>
            <Card className="store-cart-summary" title="Tóm tắt đơn hàng">
              <div><span>Tạm tính ({itemCount} sản phẩm)</span><strong>{formatCurrency(subtotal)}</strong></div>
              <div><span>Phí vận chuyển</span><span>Chọn ở bước đặt hàng</span></div>
              <div className="store-cart-total"><span>Tổng cộng</span><strong>{formatCurrency(subtotal)}</strong></div>
              <Alert type="info" showIcon message="Kiểm tra địa chỉ và phương thức thanh toán ở bước tiếp theo." />
              <Link to={paths.checkout}><Button type="primary" size="large" block>Tiến hành đặt hàng</Button></Link>
              <Link to={paths.products} className="store-cart-continue">← Tiếp tục mua sắm</Link>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}
