import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  DeleteOutlined,
  ItalicOutlined,
  LinkOutlined,
  MenuOutlined,
  OrderedListOutlined,
  PictureOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  TableOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { App, Button, Dropdown, Tooltip } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent, type ReactNode } from "react";
import { uploadCatalogImage } from "../../../api/admin/catalog.api";

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 5 * 1024 * 1024;

function ToolbarButton({
  title,
  active = false,
  disabled = false,
  children,
  onClick,
}: {
  title: string;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  const keepSelection = (event: MouseEvent<HTMLElement>) => event.preventDefault();
  return (
    <Tooltip title={title}>
      <Button
        type={active ? "primary" : "text"}
        size="small"
        disabled={disabled}
        aria-label={title}
        onMouseDown={keepSelection}
        onClick={onClick}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

const emptyToolbarState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  heading2: false,
  heading3: false,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  link: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  alignJustify: false,
  table: false,
};

export function RichTextEditor({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (html: string) => void;
}) {
  const { message } = App.useApp();
  const onChangeRef = useRef(onChange);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          defaultProtocol: "https",
          HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
        },
      }),
      Image.configure({
        allowBase64: false,
        resize: {
          enabled: true,
          directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
          minWidth: 120,
          minHeight: 80,
          alwaysPreserveAspectRatio: true,
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TableKit.configure({ table: { resizable: true } }),
    ],
    content: value || "",
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current?.(currentEditor.isEmpty ? "" : currentEditor.getHTML());
    },
  });

  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => currentEditor ? {
      bold: currentEditor.isActive("bold"),
      italic: currentEditor.isActive("italic"),
      underline: currentEditor.isActive("underline"),
      strike: currentEditor.isActive("strike"),
      heading2: currentEditor.isActive("heading", { level: 2 }),
      heading3: currentEditor.isActive("heading", { level: 3 }),
      bulletList: currentEditor.isActive("bulletList"),
      orderedList: currentEditor.isActive("orderedList"),
      blockquote: currentEditor.isActive("blockquote"),
      link: currentEditor.isActive("link"),
      alignLeft: currentEditor.isActive({ textAlign: "left" }),
      alignCenter: currentEditor.isActive({ textAlign: "center" }),
      alignRight: currentEditor.isActive({ textAlign: "right" }),
      alignJustify: currentEditor.isActive({ textAlign: "justify" }),
      table: currentEditor.isActive("table"),
    } : emptyToolbarState,
  }) ?? emptyToolbarState;

  useEffect(() => {
    if (!editor) return;
    const nextValue = value || "";
    const currentValue = editor.isEmpty ? "" : editor.getHTML();
    if (nextValue !== currentValue) editor.commands.setContent(nextValue, { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return null;

  const editLink = () => {
    const currentUrl = String(editor.getAttributes("link").href ?? "");
    const url = window.prompt("Nhập đường dẫn liên kết (để trống để xóa):", currentUrl);
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const uploadImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    const validFiles = files.filter((file) => {
      if (!allowedImageTypes.includes(file.type)) {
        message.error(`${file.name}: chỉ chấp nhận JPG, PNG hoặc WEBP.`);
        return false;
      }
      if (file.size > maxImageSize) {
        message.error(`${file.name}: ảnh không được vượt quá 5 MB.`);
        return false;
      }
      return true;
    });
    if (!validFiles.length) return;

    setUploadingImage(true);
    let uploadedCount = 0;
    try {
      for (const file of validFiles) {
        const image = await uploadCatalogImage(file);
        const alt = image.originalName.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
        editor.chain().focus().setImage({ src: image.url, alt, title: alt }).run();
        uploadedCount += 1;
      }
      message.success(`Đã chèn ${uploadedCount} ảnh vào mô tả.`);
    } catch {
      message.error("Không thể tải một hoặc nhiều ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
    }
  };

  const tableItems: MenuProps["items"] = [
    { key: "insert", label: "Chèn bảng 3 × 3", icon: <TableOutlined /> },
    { type: "divider" },
    { key: "addRow", label: "Thêm hàng phía dưới", disabled: !toolbarState.table },
    { key: "addColumn", label: "Thêm cột bên phải", disabled: !toolbarState.table },
    { key: "deleteRow", label: "Xóa hàng hiện tại", disabled: !toolbarState.table },
    { key: "deleteColumn", label: "Xóa cột hiện tại", disabled: !toolbarState.table },
    { type: "divider" },
    { key: "deleteTable", label: "Xóa bảng", danger: true, icon: <DeleteOutlined />, disabled: !toolbarState.table },
  ];

  const handleTableAction: MenuProps["onClick"] = ({ key }) => {
    const chain = editor.chain().focus();
    if (key === "insert") chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    if (key === "addRow") chain.addRowAfter().run();
    if (key === "addColumn") chain.addColumnAfter().run();
    if (key === "deleteRow") chain.deleteRow().run();
    if (key === "deleteColumn") chain.deleteColumn().run();
    if (key === "deleteTable") chain.deleteTable().run();
  };

  return (
    <div className="rich-text-editor">
      <div className="rich-text-editor__toolbar">
        <div className="rich-text-editor__group">
          <ToolbarButton title="Hoàn tác" disabled={!editor.can().chain().focus().undo().run()} onClick={() => editor.chain().focus().undo().run()}><UndoOutlined /></ToolbarButton>
          <ToolbarButton title="Làm lại" disabled={!editor.can().chain().focus().redo().run()} onClick={() => editor.chain().focus().redo().run()}><RedoOutlined /></ToolbarButton>
        </div>
        <div className="rich-text-editor__group">
          <ToolbarButton title="In đậm" active={toolbarState.bold} onClick={() => editor.chain().focus().toggleBold().run()}><BoldOutlined /></ToolbarButton>
          <ToolbarButton title="In nghiêng" active={toolbarState.italic} onClick={() => editor.chain().focus().toggleItalic().run()}><ItalicOutlined /></ToolbarButton>
          <ToolbarButton title="Gạch chân" active={toolbarState.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineOutlined /></ToolbarButton>
          <ToolbarButton title="Gạch ngang" active={toolbarState.strike} onClick={() => editor.chain().focus().toggleStrike().run()}><StrikethroughOutlined /></ToolbarButton>
        </div>
        <div className="rich-text-editor__group">
          <ToolbarButton title="Tiêu đề cấp 2" active={toolbarState.heading2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
          <ToolbarButton title="Tiêu đề cấp 3" active={toolbarState.heading3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
          <ToolbarButton title="Đoạn văn" active={!toolbarState.heading2 && !toolbarState.heading3} onClick={() => editor.chain().focus().setParagraph().run()}>P</ToolbarButton>
        </div>
        <div className="rich-text-editor__group">
          <ToolbarButton title="Danh sách dấu chấm" active={toolbarState.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}><UnorderedListOutlined /></ToolbarButton>
          <ToolbarButton title="Danh sách đánh số" active={toolbarState.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}><OrderedListOutlined /></ToolbarButton>
          <ToolbarButton title="Trích dẫn" active={toolbarState.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>❝</ToolbarButton>
        </div>
        <div className="rich-text-editor__group">
          <ToolbarButton title="Căn trái" active={toolbarState.alignLeft} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeftOutlined /></ToolbarButton>
          <ToolbarButton title="Căn giữa" active={toolbarState.alignCenter} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenterOutlined /></ToolbarButton>
          <ToolbarButton title="Căn phải" active={toolbarState.alignRight} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRightOutlined /></ToolbarButton>
          <ToolbarButton title="Căn đều" active={toolbarState.alignJustify} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><MenuOutlined /></ToolbarButton>
        </div>
        <div className="rich-text-editor__group">
          <ToolbarButton title="Thêm hoặc sửa liên kết" active={toolbarState.link} onClick={editLink}><LinkOutlined /></ToolbarButton>
          <ToolbarButton title="Chèn đường phân cách" onClick={() => editor.chain().focus().setHorizontalRule().run()}>―</ToolbarButton>
          <ToolbarButton title="Chèn ảnh từ máy" disabled={uploadingImage} onClick={() => imageInputRef.current?.click()}><PictureOutlined /></ToolbarButton>
          <Dropdown menu={{ items: tableItems, onClick: handleTableAction }} trigger={["click"]}>
            <Button type={toolbarState.table ? "primary" : "text"} size="small" icon={<TableOutlined />}>Bảng</Button>
          </Dropdown>
        </div>
        <input ref={imageInputRef} className="rich-text-editor__file" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadImages} />
      </div>
      <EditorContent editor={editor} />
      <div className="rich-text-editor__hint">Có thể kéo các góc của ảnh để đổi kích thước. Ảnh chèn từ máy được lưu trong MongoDB GridFS.</div>
    </div>
  );
}
