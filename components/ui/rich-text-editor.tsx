'use client';

import * as React from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extensions';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Undo2,
  Underline,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  /** HTML string. Empty string when the editor has no content. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  /** Maximum number of characters, counted on the stored HTML (markup included). */
  maxLength?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  className,
  ...props
}: Readonly<RichTextEditorProps & React.AriaAttributes>) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        link: {
          openOnClick: false,
          defaultProtocol: 'https',
        },
      }),
      TextAlign.configure({ types: ['paragraph'] }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.isEmpty ? '' : editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'h-40 min-h-24 max-h-[50vh] resize-y overflow-y-auto px-3 py-2 outline-none',
      },
    },
  });

  // Keep the editor in sync if the form value is changed externally (e.g. reset).
  React.useEffect(() => {
    if (!editor) return;
    const editorHtml = editor.isEmpty ? '' : editor.getHTML();
    if (value !== editorHtml) {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      isBold: editor?.isActive('bold') ?? false,
      isItalic: editor?.isActive('italic') ?? false,
      isUnderline: editor?.isActive('underline') ?? false,
      isBulletList: editor?.isActive('bulletList') ?? false,
      isOrderedList: editor?.isActive('orderedList') ?? false,
      isLink: editor?.isActive('link') ?? false,
      isAlignLeft: editor?.isActive({ textAlign: 'left' }) ?? false,
      isAlignCenter: editor?.isActive({ textAlign: 'center' }) ?? false,
      isAlignRight: editor?.isActive({ textAlign: 'right' }) ?? false,
      canUndo: editor?.can().undo() ?? false,
      canRedo: editor?.can().redo() ?? false,
      characters: editor
        ? editor.isEmpty
          ? 0
          : editor.getHTML().length
        : 0,
    }),
  });

  const isOverLimit =
    maxLength !== undefined && (state?.characters ?? 0) > maxLength;

  return (
    <div
      className={cn(
        'border-input rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] md:text-sm',
        'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input px-1 py-1">
        <Toggle
          size="sm"
          aria-label="Bold"
          pressed={state?.isBold ?? false}
          onPressedChange={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Italic"
          pressed={state?.isItalic ?? false}
          onPressedChange={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Underline"
          pressed={state?.isUnderline ?? false}
          onPressedChange={() =>
            editor?.chain().focus().toggleUnderline().run()
          }
        >
          <Underline />
        </Toggle>
        <Separator orientation="vertical" className="mx-1 !h-5" />
        <Toggle
          size="sm"
          aria-label="Bullet list"
          pressed={state?.isBulletList ?? false}
          onPressedChange={() =>
            editor?.chain().focus().toggleBulletList().run()
          }
        >
          <List />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Numbered list"
          pressed={state?.isOrderedList ?? false}
          onPressedChange={() =>
            editor?.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered />
        </Toggle>
        <Separator orientation="vertical" className="mx-1 !h-5" />
        <Toggle
          size="sm"
          aria-label="Align left"
          pressed={state?.isAlignLeft ?? false}
          onPressedChange={() =>
            editor?.chain().focus().setTextAlign('left').run()
          }
        >
          <AlignLeft />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Align centre"
          pressed={state?.isAlignCenter ?? false}
          onPressedChange={() =>
            editor?.chain().focus().setTextAlign('center').run()
          }
        >
          <AlignCenter />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Align right"
          pressed={state?.isAlignRight ?? false}
          onPressedChange={() =>
            editor?.chain().focus().setTextAlign('right').run()
          }
        >
          <AlignRight />
        </Toggle>
        <Separator orientation="vertical" className="mx-1 !h-5" />
        <LinkControl editor={editor} isActive={state?.isLink ?? false} />
        <Separator orientation="vertical" className="mx-1 !h-5" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Undo"
          disabled={!state?.canUndo}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Redo"
          disabled={!state?.canRedo}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 />
        </Button>
      </div>
      <EditorContent editor={editor} className="rich-text-content" />
      {maxLength !== undefined && (
        <div
          className={cn(
            'px-3 pb-1.5 text-right text-xs',
            isOverLimit ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {state?.characters ?? 0}/{maxLength}
        </div>
      )}
    </div>
  );
}

function LinkControl({
  editor,
  isActive,
}: Readonly<{ editor: Editor | null; isActive: boolean }>) {
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState('');

  const openPopover = (nextOpen: boolean) => {
    if (nextOpen) {
      setUrl((editor?.getAttributes('link').href as string | undefined) ?? '');
    }
    setOpen(nextOpen);
  };

  const applyLink = () => {
    if (!editor) return;
    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      const href = /^https?:\/\//i.test(trimmed)
        ? trimmed
        : `https://${trimmed}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setOpen(false);
  };

  const removeLink = () => {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={openPopover}>
      <PopoverTrigger asChild>
        <Toggle size="sm" aria-label="Link" pressed={isActive}>
          <Link2 />
        </Toggle>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="space-y-2">
          <Input
            value={url}
            placeholder="https://example.com"
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
              }
            }}
          />
          <div className="flex justify-end gap-2">
            {isActive && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeLink}
              >
                Remove
              </Button>
            )}
            <Button type="button" size="sm" onClick={applyLink}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
