import { useRef, useState } from "react";
import { uploadFile } from "@/lib/media";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImagePlus, X, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";

export type MediaItem = { url: string; path?: string };

type Props = {
  cover: MediaItem | null;
  onCoverChange: (item: MediaItem | null) => void;
  gallery: MediaItem[];
  onGalleryChange: (items: MediaItem[]) => void;
  maxGallery?: number;
};

export function MediaUploader({
  cover,
  onCoverChange,
  gallery,
  onGalleryChange,
  maxGallery = 10,
}: Props) {
  return (
    <div className="space-y-8">
      <CoverPicker cover={cover} onChange={onCoverChange} />
      <GalleryPicker items={gallery} onChange={onGalleryChange} max={maxGallery} />
    </div>
  );
}

function CoverPicker({
  cover,
  onChange,
}: {
  cover: MediaItem | null;
  onChange: (item: MediaItem | null) => void;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setProgress(0);
    try {
      const item = await uploadFile(file, "cover", { onProgress: setProgress });
      onChange(item);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  };

  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        Cover photo <span className="text-destructive">*</span>
      </label>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handle(e.dataTransfer.files);
        }}
        className="mt-2 relative rounded-2xl border border-dashed border-border bg-card overflow-hidden aspect-[16/10]"
      >
        {cover ? (
          <>
            <img src={cover.url} alt="cover" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute top-3 right-3 rounded-full bg-black/70 text-white p-2 hover:bg-black"
              aria-label="Remove cover"
            >
              <X className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-3 right-3 rounded-full bg-white/90 text-black px-3 py-1.5 text-xs font-medium"
            >
              Replace
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ImagePlus className="size-8" />
            <p className="text-sm font-medium">Tap to upload · or drag & drop</p>
            <p className="text-xs">JPG, PNG · auto-compressed</p>
          </button>
        )}
        {progress !== null && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/40">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handle(e.target.files)}
      />
    </div>
  );
}

function GalleryPicker({
  items,
  onChange,
  max,
}: {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  max: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busyCount, setBusyCount] = useState(0);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handle = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const remaining = max - items.length;
    if (remaining <= 0) {
      toast.error(`Max ${max} photos in gallery`);
      return;
    }
    const list = Array.from(files).slice(0, remaining);
    setBusyCount((n) => n + list.length);
    const uploaded: MediaItem[] = [];
    for (const file of list) {
      try {
        const item = await uploadFile(file, "gallery");
        uploaded.push(item);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusyCount((n) => n - 1);
      }
    }
    if (uploaded.length) onChange([...items, ...uploaded]);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.url === active.id);
    const newIndex = items.findIndex((i) => i.url === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Gallery ({items.length}/{max})
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={items.length >= max}
          className="text-xs font-medium text-primary disabled:opacity-40"
        >
          + Add photos
        </button>
      </div>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handle(e.dataTransfer.files);
        }}
        className="mt-2"
      >
        {items.length === 0 && busyCount === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-2xl border border-dashed border-border bg-card py-10 text-center text-sm text-muted-foreground hover:text-primary transition"
          >
            <ImagePlus className="mx-auto size-6 mb-2" />
            Add up to {max} photos · drag to reorder
          </button>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={items.map((i) => i.url)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {items.map((item) => (
                  <SortablePhoto
                    key={item.url}
                    item={item}
                    onRemove={() => onChange(items.filter((x) => x.url !== item.url))}
                  />
                ))}
                {Array.from({ length: busyCount }).map((_, i) => (
                  <div
                    key={`busy-${i}`}
                    className="aspect-square rounded-xl bg-accent grid place-items-center animate-pulse"
                  >
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function SortablePhoto({ item, onRemove }: { item: MediaItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.url,
  });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : "auto",
      }}
      className="relative aspect-square rounded-xl overflow-hidden bg-accent group"
    >
      <img src={item.url} alt="" className="w-full h-full object-cover" />
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 rounded-full bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 transition"
        aria-label="Drag"
      >
        <GripVertical className="size-3" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 rounded-full bg-black/70 text-white p-1 opacity-0 group-hover:opacity-100 transition"
        aria-label="Remove"
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
