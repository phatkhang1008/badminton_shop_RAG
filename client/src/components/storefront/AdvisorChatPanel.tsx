import { RobotOutlined, SendOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import { useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { StorefrontProduct } from "../../api/storefront/products.api";
import { paths } from "../../routes/paths";
import { formatCurrency, getStartingPrice } from "./productPresentation";
import { advisorPrompts, createAdvisorReply, findAdvisorProducts } from "./advisorPrompts";

type MessageRole = "assistant" | "user";

interface AdvisorMessage {
  id: number;
  role: MessageRole;
  text: string;
  products?: StorefrontProduct[];
}

interface AdvisorChatPanelProps {
  products: StorefrontProduct[];
  catalogState: "loading" | "ready" | "unavailable";
}

const welcomeMessage: AdvisorMessage = {
  id: 0,
  role: "assistant",
  text: "Chào bạn! Mình có thể gợi ý cách chọn vợt, giày và phụ kiện theo nhu cầu chơi của bạn.",
};

export function AdvisorChatPanel({ products, catalogState }: AdvisorChatPanelProps) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([welcomeMessage]);
  const [question, setQuestion] = useState("");
  const nextMessageId = useRef(1);

  const askQuestion = (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;
    const nextId = nextMessageId.current;
    nextMessageId.current += 2;
    setMessages((current) => [
      ...current,
      { id: nextId, role: "user", text: trimmedValue },
      {
        id: nextId + 1,
        role: "assistant",
        text: createAdvisorReply(trimmedValue),
        products: catalogState === "ready" ? findAdvisorProducts(trimmedValue, products) : undefined,
      },
    ]);
    setQuestion("");
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    askQuestion(question);
  };

  return (
    <div className="store-advisor-chat">
      <div className="store-advisor-chat-head">
        <span><RobotOutlined /></span>
        <div>
          <strong>BSport Advisor</strong>
          <small>{catalogState === "loading" ? "Đang tải catalog sản phẩm" : catalogState === "ready" ? "Gợi ý từ catalog hiện có" : "Gợi ý trang bị cầu lông"}</small>
        </div>
        <i>Beta</i>
      </div>
      <div className="store-advisor-messages" aria-live="polite">
        {messages.map((message) => (
          <div className={`store-advisor-message ${message.role}`} key={message.id}>
            <span>{message.role === "assistant" ? <RobotOutlined /> : <UserOutlined />}</span>
            <div className="store-advisor-message-content">
              <p>{message.text}</p>
              {message.products && message.products.length > 0 && (
                <div className="store-advisor-product-links">
                  <small>Sản phẩm đang có để bạn tham khảo</small>
                  {message.products.map((product) => (
                    <Link to={paths.productDetail(product.slug)} key={product.id}>
                      <strong>{product.name}</strong>
                      <span>{formatCurrency(getStartingPrice(product))}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="store-advisor-suggestions">
        <span>Gợi ý nhanh</span>
        <div>{advisorPrompts.map((prompt) => <button type="button" key={prompt} onClick={() => askQuestion(prompt)}>{prompt}</button>)}</div>
      </div>
      <form className="store-advisor-form" onSubmit={submit}>
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 3 }}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Nhập nhu cầu chơi của bạn..."
          aria-label="Câu hỏi cho trợ lý tư vấn"
        />
        <Button type="primary" htmlType="submit" icon={<SendOutlined />} aria-label="Gửi câu hỏi" />
      </form>
    </div>
  );
}
