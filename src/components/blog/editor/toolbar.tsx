"use client";

import { useRef, useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Plus,
  Quote,
  Redo2,
  Table2,
  Underline,
  Undo2,
} from "lucide-react";

function Btn({
  label,
  on,
  disabled,
  onClick,
  children,
}: {
  label: string;
  on?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={on}
      disabled={disabled}
      // Keep the selection in the editor when a button is clicked.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        on ? "bg-[var(--color-c-lime)]/15 text-[var(--color-c-lime)]" : "text-[var(--color-c-muted)] hover:bg-white/[0.06] hover:text-[var(--color-c-text)]"
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span aria-hidden className="mx-1 h-5 w-px bg-white/10" />;

export function Toolbar({ editor, onImage }: { editor: Editor; onImage: (file: File) => Promise<string | null> }) {
  const file = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      highlight: e.isActive("highlight"),
      code: e.isActive("code"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      left: e.isActive({ textAlign: "left" }),
      center: e.isActive({ textAlign: "center" }),
      right: e.isActive({ textAlign: "right" }),
      link: e.isActive("link"),
      inTable: e.isActive("table"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const c = () => editor.chain().focus();

  function setLink() {
    const prev = (editor.getAttributes("link").href as string) ?? "";
    const url = window.prompt("Link URL (https://… or /page)", prev);
    if (url === null) return;
    const v = url.trim();
    if (!v) return void c().extendMarkRange("link").unsetLink().run();
    const ok = v.startsWith("/") || /^https?:\/\//i.test(v) || /^mailto:/i.test(v);
    const href = ok ? v : `https://${v}`;
    c().extendMarkRange("link").setLink({ href }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-white/[0.07] px-2.5 py-2">
      <Btn label="Bold" on={s.bold} onClick={() => c().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Btn>
      <Btn label="Italic" on={s.italic} onClick={() => c().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Btn>
      <Btn label="Underline" on={s.underline} onClick={() => c().toggleUnderline().run()}>
        <Underline className="h-4 w-4" />
      </Btn>
      <Btn label="Highlight" on={s.highlight} onClick={() => c().toggleHighlight().run()}>
        <Highlighter className="h-4 w-4" />
      </Btn>
      <Btn label="Inline code" on={s.code} onClick={() => c().toggleCode().run()}>
        <Code className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn label="Heading 1" on={s.h1} onClick={() => c().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="h-4 w-4" />
      </Btn>
      <Btn label="Heading 2" on={s.h2} onClick={() => c().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </Btn>
      <Btn label="Heading 3" on={s.h3} onClick={() => c().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn label="Bullet list" on={s.bullet} onClick={() => c().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Btn>
      <Btn label="Numbered list" on={s.ordered} onClick={() => c().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Btn>
      <Btn label="Quote" on={s.quote} onClick={() => c().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn label="Align left" on={s.left} onClick={() => c().setTextAlign("left").run()}>
        <AlignLeft className="h-4 w-4" />
      </Btn>
      <Btn label="Align center" on={s.center} onClick={() => c().setTextAlign("center").run()}>
        <AlignCenter className="h-4 w-4" />
      </Btn>
      <Btn label="Align right" on={s.right} onClick={() => c().setTextAlign("right").run()}>
        <AlignRight className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn label="Link" on={s.link} onClick={setLink}>
        <Link2 className="h-4 w-4" />
      </Btn>
      <Btn label="Insert image" disabled={uploading} onClick={() => file.current?.click()}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
      </Btn>
      <input
        ref={file}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setUploading(true);
          const url = await onImage(f);
          setUploading(false);
          if (url) c().setImage({ src: url, alt: "" }).run();
        }}
      />
      <Sep />
      <Btn label="Insert table" onClick={() => c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        <Table2 className="h-4 w-4" />
      </Btn>
      <Btn label="Add row below" disabled={!s.inTable} onClick={() => c().addRowAfter().run()}>
        <Plus className="h-4 w-4" />
      </Btn>
      <Btn label="Delete row" disabled={!s.inTable} onClick={() => c().deleteRow().run()}>
        <Minus className="h-4 w-4" />
      </Btn>
      <Sep />
      <Btn label="Undo" disabled={!s.canUndo} onClick={() => c().undo().run()}>
        <Undo2 className="h-4 w-4" />
      </Btn>
      <Btn label="Redo" disabled={!s.canRedo} onClick={() => c().redo().run()}>
        <Redo2 className="h-4 w-4" />
      </Btn>
    </div>
  );
}
