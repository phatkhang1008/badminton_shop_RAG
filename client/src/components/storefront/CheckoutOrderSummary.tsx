import { ShoppingOutlined } from "@ant-design/icons";
import { Card } from "antd";
import type { CartItem } from "../../cart/cartContext";
import { formatCurrency } from "./productPresentation";

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
}

export function CheckoutOrderSummary({ items, itemCount, subtotal }: CheckoutOrderSummaryProps) {
  return (
    <aside className="store-checkout-summary-wrap">
      <Card className="store-checkout-summary" title={<><ShoppingOutlined /> Đơn hàng của bạn</>}>
        <div className="store-checkout-summary-items">
          {items.map((item) => (
            <div className="store-checkout-summary-item" key={item.key}>
              <div className="store-checkout-summary-image">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.imageAlt} /> : <ShoppingOutlined />}
              </div>
              <div>
                <strong>{item.name}</strong>
                <span>{item.variantName} × {item.quantity}</span>
              </div>
              <b>{formatCurrency(item.price * item.quantity)}</b>
            </div>
          ))}
        </div>
        <div className="store-checkout-summary-row"><span>Tạm tính ({itemCount} sản phẩm)</span><strong>{formatCurrency(subtotal)}</strong></div>
        <div className="store-checkout-summary-row"><span>Phí vận chuyển</span><span>Thông báo khi xác nhận đơn</span></div>
        <div className="store-checkout-summary-total"><span>Tổng tạm tính</span><strong>{formatCurrency(subtotal)}</strong></div>
      </Card>
    </aside>
  );
}
