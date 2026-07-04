import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useState, useEffect } from 'react';

// ============================================================
// TOOLBAR BUTTON COMPONENT
// ============================================================
const ToolbarButton = ({ onClick, isActive = false, disabled = false, children, title = '' }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`
            p-2 rounded-md text-sm transition-colors
            ${isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
    >
        {children}
    </button>
);

// ============================================================
// MAIN RICH TEXT EDITOR COMPONENT
// ============================================================
export default function RichTextEditor({
    value = '',
    onChange,
    placeholder = 'Write your content here...',
    className = '',
    height = '300px',
    disabled = false,
}) {
    const [isMounted, setIsMounted] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4],
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableCell,
            TableHeader,
        ],
        content: value || '',
        editable: !disabled,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange(html);
        },
        editorProps: {
            attributes: {
                class: `
                    prose prose-sm sm:prose-base lg:prose-lg
                    dark:prose-invert
                    max-w-none
                    focus:outline-none
                    min-h-[200px]
                    p-4
                    bg-white dark:bg-gray-800
                    rounded-b-lg
                `,
                placeholder: placeholder,
            },
        },
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '');
        }
    }, [value, editor]);

    if (!isMounted) {
        return (
            <div className={`border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 ${className}`}>
                <div className="p-4 text-gray-500 dark:text-gray-400">Loading editor...</div>
            </div>
        );
    }

    if (!editor) {
        return null;
    }

    return (
        <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 ${className}`}>
            {/* ===== TOOLBAR ===== */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {/* Headings */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        disabled={disabled}
                        title="Heading 1"
                    >
                        H1
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        disabled={disabled}
                        title="Heading 2"
                    >
                        H2
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        disabled={disabled}
                        title="Heading 3"
                    >
                        H3
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        isActive={editor.isActive('paragraph')}
                        disabled={disabled}
                        title="Paragraph"
                    >
                        P
                    </ToolbarButton>
                </div>

                {/* Text Formatting */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        disabled={disabled}
                        title="Bold"
                    >
                        <strong>B</strong>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        disabled={disabled}
                        title="Italic"
                    >
                        <em>I</em>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        disabled={disabled}
                        title="Strikethrough"
                    >
                        <s>S</s>
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        disabled={disabled}
                        title="Code"
                    >
                        {'</>'}
                    </ToolbarButton>
                </div>

                {/* Lists */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        disabled={disabled}
                        title="Bullet List"
                    >
                        • List
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        disabled={disabled}
                        title="Numbered List"
                    >
                        1. List
                    </ToolbarButton>
                </div>

                {/* Alignment */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        isActive={editor.isActive({ textAlign: 'left' })}
                        disabled={disabled}
                        title="Align Left"
                    >
                        ←
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        isActive={editor.isActive({ textAlign: 'center' })}
                        disabled={disabled}
                        title="Align Center"
                    >
                        ↔
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        isActive={editor.isActive({ textAlign: 'right' })}
                        disabled={disabled}
                        title="Align Right"
                    >
                        →
                    </ToolbarButton>
                </div>

                {/* Tables */}
                <div className="flex items-center gap-0.5 border-r border-gray-200 dark:border-gray-700 pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        disabled={disabled}
                        title="Insert Table"
                    >
                        ⊞
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().addColumnBefore().run()}
                        disabled={!editor.isActive('table') || disabled}
                        title="Add Column Before"
                    >
                        +◀
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().addColumnAfter().run()}
                        disabled={!editor.isActive('table') || disabled}
                        title="Add Column After"
                    >
                        +▶
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().addRowBefore().run()}
                        disabled={!editor.isActive('table') || disabled}
                        title="Add Row Before"
                    >
                        +▲
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                        disabled={!editor.isActive('table') || disabled}
                        title="Add Row After"
                    >
                        +▼
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().deleteTable().run()}
                        disabled={!editor.isActive('table') || disabled}
                        title="Delete Table"
                        className="text-red-500 hover:text-red-700"
                    >
                        ✕
                    </ToolbarButton>
                </div>

                {/* Formatting */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        disabled={disabled}
                        title="Horizontal Line"
                    >
                        ―
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor.chain().focus().clearNodes().run()}
                        disabled={disabled}
                        title="Clear Formatting"
                    >
                        ✕
                    </ToolbarButton>
                </div>
            </div>

            {/* ===== EDITOR CONTENT ===== */}
            <div style={{ minHeight: height, maxHeight: height, overflowY: 'auto' }}>
                <EditorContent editor={editor} />
            </div>

            {/* ===== FOOTER ===== */}
            <div className="flex justify-between items-center p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400">
                <span>
                    {editor.storage.characterCount?.characters?.() || 0} characters
                </span>
                <span>
                    {editor.storage.characterCount?.words?.() || 0} words
                </span>
            </div>
        </div>
    );
}
